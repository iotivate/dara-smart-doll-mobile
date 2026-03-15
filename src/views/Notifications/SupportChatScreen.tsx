/* eslint-disable react-native/no-inline-styles */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native-paper';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import CustomHeader from '@components/CustomHeader';
import CustomLucideIcon from '@components/CustomLucideIcon';
import CustomVectorIcons from '@components/CustomVectorIcons';
import CustomImageComponent from '@components/CustomImageComponent';
import { moderateScale } from 'react-native-size-matters';
import { ApiURL, SOCKET_URL } from '@services/ApiConstants';
import { apiRequest } from '@services/ApiServices';
import CustomTextInput from '@components/CustomTextInput';
import { getData } from '@utils/CustomAsyncStorage';
import { openImage_Picker } from '@utils/PickerServices';

export default function SupportChatScreen(props: any) {
  const { theme } = useTheme();
  const { prevData } = props?.route?.params;
  const ticket_id = prevData?._id;
  console.log('bnfbcbcbzJCBzcz', prevData);

  const flatListRef = useRef<any>(null);
  const socketRef = useRef<any>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileUpload, setfileUpload] = useState('');
  // const [file_Type, setFileType] = useState('text');
  const [imageLoader, setimageLoader] = useState(false);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      getChatListAPI();
    }, [ticket_id]),
  );

  function getChatListAPI() {
    apiRequest(
      `${ApiURL.raisedTicketChatsList}?ticketId=${ticket_id}&page=1&size=50`,
      'GET',
      null,
      true,
    )
      .then((res: any) => {
        console.log('res?.datares?.datares?.datares?.data', res);
        if (!res.error) {
          setMessages(res?.data?.list);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 500);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    const initSocket = async () => {
      try {
        const BearerToken = await getData('token');

        if (!BearerToken) return;

        const socket = io(SOCKET_URL, {
          transports: ['websocket'],
          auth: { token: `Bearer ${BearerToken}` },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 10000,
        });

        console.log('Socket Response', socket);

        socketRef.current = socket;
        // Your existing socket event handlers...
        socket.on('connect', () => {
          console.log('✅ Socket connected:', socket.id);
          socket.emit('join-ticket-room', ticket_id);
        });
        socket.on('disconnect', () => {
          console.log('❌ Socket disconnected');
        });

        const originalOnevent = socket.onevent;

        socket.onevent = (packet: any) => {
          const [eventName, ...args] = packet.data;
          console.log('📡 Socket Event Received:', eventName, args);
          originalOnevent.call(socket, packet);
        };
        socket.on('ticket-message', (msg: any) => {
          getChatListAPI();
        });
      } catch (err) {
        console.log('❌ Error initializing socket:', err);
      }
    };
    initSocket();
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleSend = (file_url = '', file_Type = null) => {
    console.log('file dataaasett', file_url, file_Type);

    console.log('function callled');

    if (!(newMessage?.trim() || file_url)) return;
    console.log('function proceeds');

    const message = {
      id: 'm' + (messages?.length + 1),
      message: file_url ? '' : newMessage.trim(),
      fileUrl: file_url ? file_url : '',
      sentBy: 'Users',
      fileType: file_Type,
      sentAt: Date.now(),
    };

    console.log('Messagess', message);

    setMessages(prev => {
      console.log('prevv', prev);

      return [...prev, message];
    });

    socketRef.current?.emit('send-ticket-message', {
      ticketId: ticket_id,
      message: file_url ? '' : message.message,
      fileUrl: file_url ? file_url : '',
      fileType: file_Type,
      sentBy: 'Users',
    });

    setNewMessage('');
    setfileUpload('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  async function openCameraImage() {
    let imageData: any = await openImage_Picker();
    imageData.module = 'CHATS';
    console.log('dic', imageData);
    // setimageLoader(true);

    apiRequest(ApiURL.fileUpload, 'POST', imageData, true, true)
      .then((res: any) => {
        if (!res.error) {
          setimageLoader(false);

          let imageType = null;
          const ext = imageData?.filename?.split('.').pop().toLowerCase();

          if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) imageType = 'image';
          else if (['mp4', 'mov'].includes(ext)) imageType = 'video';
          else if (['mp3', 'wav'].includes(ext)) imageType = 'audio';
          else if (['pdf'].includes(ext)) imageType = 'pdf';
          else if (['doc', 'docx'].includes(ext)) imageType = 'doc';

          console.log('iMageeee', imageType);

          setfileUpload(res?.data?.fileUrl);
          setTimeout(() => {
            handleSend(res?.data?.fileUrl, imageType);
          }, 1000);
        } else {
          setimageLoader(false);
        }
      })
      .catch(() => setimageLoader(false));
  }

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
    const showListener = Keyboard.addListener('keyboardDidShow', () =>
      flatListRef.current?.scrollToEnd({ animated: true }),
    );
    return () => {
      showListener.remove();
    };
  }, []);

  const renderMessageItem = ({ item }: any) => {
    const isCurrentUser = item.sentBy === 'Users';

    console.log('caaaaaa--=-=-=-=-=-=-', item?.fileType, item?.fileUrl);

    if (isCurrentUser) {
      return (
        <View
          style={{
            marginVertical: 10,
            flexDirection: 'row',
            maxWidth: '90%',
            justifyContent: 'flex-end',
            alignSelf: 'flex-end',
          }}
        >
          <View style={{}}>
            {item?.fileType ? (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  backgroundColor: theme.boxBackground,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  borderBottomLeftRadius: 10,
                }}
              >
                <CustomImageComponent
                  source={item?.fileUrl}
                  height={moderateScale(180)}
                  width={moderateScale(180)}
                  style={{ alignSelf: 'center' }}
                />
              </View>
            ) : (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  backgroundColor: theme.boxBackground,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  borderBottomLeftRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 16,
                    fontFamily: FontFamily.KhulaRegular,
                  }}
                >
                  {item.message}
                </Text>
              </View>
            )}

            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: theme.text,
                  fontFamily: FontFamily.KhulaRegular,
                }}
              >
                {moment(item?.sentAt).format('hh:mm A')}
              </Text>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View
          style={{
            marginVertical: 10,
            flexDirection: 'row',
            maxWidth: '90%',
            justifyContent: 'flex-start',
          }}
        >
          <View style={{ borderRadius: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ alignSelf: 'flex-end' }}>
                {item?.fileType ? (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      backgroundColor: theme.boxBackground,
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                      borderBottomRightRadius: 10,
                    }}
                  >
                    <CustomImageComponent
                      source={item?.fileUrl}
                      height={moderateScale(180)}
                      width={moderateScale(180)}
                      style={{ alignSelf: 'center' }}
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      backgroundColor: theme.boxBackground,
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                      borderBottomRightRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 16,
                        fontFamily: FontFamily.KhulaRegular,
                      }}
                    >
                      {item.message || item.text}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    marginTop: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: theme.text,
                      fontFamily: FontFamily.KhulaRegular,
                    }}
                  >
                    {'Admin'}{' '}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: theme.text,
                      fontFamily: FontFamily.KhulaRegular,
                    }}
                  >
                    {moment(item?.sentAt || item?.timestamp).format('hh:mm A')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        style={{
          flex: 1,
          backgroundColor: theme.background,
          paddingVertical: 0,
        }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVisible ? 0 : -45}
      >
        <CustomHeader
          showBackButton={true}
          backButtonText="Chat Support"
          showNotifications={false}
        />

        <FlatList
          ref={flatListRef}
          // data={messages?.reverse()}
          data={[...messages].reverse()}
          renderItem={renderMessageItem}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingVertical: 10,
            flexGrow: 1,
            backgroundColor: theme.background,
          }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderTopColor: '#ddd',
            borderTopWidth: 1,
            paddingVertical: 15,
          }}
        >
          {/* <View
            style={{
              flex: 1,
              height: 45,
              paddingHorizontal: 12,
              paddingVertical: 0,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: 'gray',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          > */}
          {/* <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type here..."
              placeholderTextColor={theme.gray}
              style={{
                fontSize: 14,
                fontFamily: FontFamily.KhulaRegular,
                width: '90%',
                color: theme.text,
              }}
            /> */}

          <CustomTextInput
            placeholder="David Smith"
            value={newMessage}
            onChangeText={text => setNewMessage(text)}
            returnKeyType="done"
            style={{
              width: '85%',
            }}
            customInputContainerStyle={{
              flex: 1,
              height: moderateScale(45),
              paddingHorizontal: moderateScale(12),
              paddingVertical: 0,
              borderRadius: moderateScale(100),
            }}
            onSubmitEditing={() => Keyboard.dismiss()}
            icon2={
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openCameraImage()}
              >
                {imageLoader ? (
                  <ActivityIndicator size={'small'} color={'gray'} />
                ) : (
                  <CustomLucideIcon name="Paperclip" size={20} color={'gray'} />
                )}
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            onPress={() => handleSend('', null)}
            style={{
              marginLeft: moderateScale(10),
              backgroundColor: theme.background,
              borderRadius: 5,
              justifyContent: 'center',
              alignItems: 'center',
              height: moderateScale(45),
              width: moderateScale(45),
            }}
          >
            <CustomVectorIcons
              name="send"
              iconSet="Ionicons"
              color={theme.themeColor}
              size={25}
            />
          </TouchableOpacity>

          {fileUpload && (
            <View
              style={{
                position: 'absolute',
                bottom: moderateScale(50),
                right: moderateScale(60),
                alignSelf: 'flex-end',
                width: moderateScale(60),
                height: moderateScale(60),
                borderWidth: 1,
                borderColor: theme.black,
                backgroundColor: theme.background,
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {imageLoader ? (
                <ActivityIndicator size={'small'} color={theme.background} />
              ) : (
                <TouchableOpacity
                  onPress={() => setfileUpload('')}
                  activeOpacity={0.7}
                  style={{}}
                >
                  <View
                    style={{
                      position: 'absolute',
                      right: -10,
                      top: -10,
                      backgroundColor: 'red',
                      borderRadius: moderateScale(100),
                      padding: 2,
                    }}
                  >
                    <CustomLucideIcon
                      name="X"
                      size={12}
                      color={theme.background}
                    />
                  </View>

                  <CustomImageComponent
                    source={fileUpload}
                    height={moderateScale(45)}
                    width={moderateScale(45)}
                    style={{ alignSelf: 'center' }}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
