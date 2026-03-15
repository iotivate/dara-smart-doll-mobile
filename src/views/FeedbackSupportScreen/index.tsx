/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
  Keyboard,
  TouchableOpacity,
  Modal,
  ScrollView,
  ImageBackground,
  RefreshControl,
  FlatList,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTheme } from '@theme/themeContext';
import CustomLoader from '@utils/CustomLoader';
import FontFamily from '@assets/fonts/FontFamily';
import { moderateScale } from 'react-native-size-matters';
import CustomButton from '@components/CustomButton';
import createBasicStyles from 'styles';
import CustomTextInput from '@components/CustomTextInput';
import CountryCustomTextInput from '@components/CountryCustomTextInput';
import CustomLucideIcon from '@components/CustomLucideIcon';
import SuccessErrorPopup from '@utils/SuccessErrorPopup';

import IMAGES from '@assets/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomImageComponent from '@components/CustomImageComponent';
import { Checkbox } from 'react-native-paper';
import CustomVectorIcons from '@components/CustomVectorIcons';
import CustomHeader from '@components/CustomHeader';
import FastImage from '@d11/react-native-fast-image';
import { TimeAgo } from '@utils/TimeCalculator';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { showSuccessToast } from '@utils/CustomToast';
import { useFocusEffect } from '@react-navigation/native';

// Define dropdown options
const TITLE_OPTIONS = [
  { id: '1', value: 'Technical Issue', label: 'Technical Issue' },
  { id: '2', value: 'Billing/Payment', label: 'Billing/Payment' },
  { id: '3', value: 'Account Problem', label: 'Account Problem' },
  { id: '4', value: 'Feature Request', label: 'Feature Request' },
  { id: '5', value: 'General Feedback', label: 'General Feedback' },
];

const FeedbackSupportScreen = (props: any) => {
  const { navigation } = props;
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme);
  const basicStyles = createBasicStyles(theme);
  const [Loader, setLoader] = useState(false);
  const [successModalState, setsuccessModalState] = useState(false);
  const [successMsg, setsuccessMsg] = useState('');
  const [FailedModalState, setFailedModalState] = useState(false);
  const [errorMessage, seterrorMessage] = useState('');

  const [supportTickets, setSupportTickets] = useState([]);
  const [rating, setRating] = useState(0);

  // Title dropdown state
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const [inputs, setInputs] = useState({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState({
    titleError: '',
    descriptionError: '',
  });

  const titleRef = React.createRef<any>();
  const descriptionRef = React.createRef<any>();

  const handleOnchange = (text: any, input: any) => {
    setInputs(prevState => ({ ...prevState, [input]: text }));
  };

  const handleError = (error: any, input: any) => {
    setErrors(prevState => ({ ...prevState, [input]: error }));
  };

  // Handle title selection from dropdown
  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title);
    setInputs(prevState => ({ ...prevState, title }));
    setShowTitleDropdown(false);
    handleError('', 'titleError');
  };

  // Handle custom title input
  const handleCustomTitleChange = (text: string) => {
    setCustomTitle(text);
    setSelectedTitle('Other');
    setInputs(prevState => ({ ...prevState, title: text }));
    handleError('', 'titleError');
  };

  const handleValidate = () => {
    Keyboard.dismiss();
    let isvalid = true;

    if (!inputs.title || inputs.title.trim() === '') {
      handleError('Please select or enter a title', 'titleError');
      isvalid = false;
    }
    if (!inputs.description) {
      handleError('Describe your issue', 'descriptionError');
      isvalid = false;
    }

    if (isvalid) {
      handleRaiseTicket();
    }
  };

  async function handleRaiseTicket() {
    Keyboard.dismiss();
    setLoader(true);

    const payload = {
      title: inputs?.title,
      description: inputs.description,
    };

    try {
      const res = await apiRequest(ApiURL.raiseTicket, 'POST', payload, true);
      console.log('✅ API Response:', res);
      setLoader(false);

      if (!res?.error) {
        showSuccessToast(res?.message);
        setLoader(false);
        fetchRaisedTickets();
        // Reset form
        setSelectedTitle('');
        setCustomTitle('');
        setInputs({
          title: '',
          description: '',
        });
      } else {
        const errorMsg = res?.message || 'Request failed. Please try again.';
        seterrorMessage(errorMsg);
        setFailedModalState(true);
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoader(false);
      seterrorMessage(error.message || 'Unexpected error occurred');
      setFailedModalState(true);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchRaisedTickets();
    }, []),
  );

  async function fetchRaisedTickets() {
    Keyboard.dismiss();
    setLoader(true);

    try {
      const res = await apiRequest(
        `${ApiURL.getTickets}?keyWord&page=1&size=10`,
        'GET',
        null,
        true,
      );
      console.log('✅ API Response:', res);
      setLoader(false);

      if (!res?.error) {
        setSupportTickets(res?.data?.list);
        setLoader(false);
      } else {
        const errorMsg = res?.message || 'Request failed. Please try again.';
        seterrorMessage(errorMsg);
        setFailedModalState(true);
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoader(false);
      seterrorMessage(error.message || 'Unexpected error occurred');
      setFailedModalState(true);
    }
  }

  return (
    <View
      style={{
        backgroundColor: theme.background,
        flex: 1,
        marginTop: moderateScale(20),
      }}
    >
      <StatusBar
        backgroundColor={theme.transparent}
        barStyle={'light-content'}
      />
      <CustomHeader
        showBackButton={true}
        title="Feedback & Support"
        showNotifications={false}
      />

      <KeyboardAwareScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>categories Options</Text>

          <View style={styles.formSection}>
            {/* Title Dropdown Field */}
            <View style={styles.titleContainer}>
              <Text style={styles.inputTitle}>Title</Text>

              {/* Dropdown Trigger */}
              <TouchableOpacity
                style={[
                  styles.dropdownTrigger,
                  errors.titleError ? styles.dropdownError : null,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowTitleDropdown(!showTitleDropdown);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dropdownTriggerText,
                    !selectedTitle && { color: theme.textSub },
                  ]}
                >
                  {selectedTitle || 'Select a title'}
                </Text>
                <CustomVectorIcons
                  name={showTitleDropdown ? 'chevron-up' : 'chevron-down'}
                  iconSet="Feather"
                  size={20}
                  color={theme.text}
                />
              </TouchableOpacity>

              {errors.titleError ? (
                <Text style={styles.errorText}>{errors.titleError}</Text>
              ) : null}

              {/* Dropdown Modal */}
              <Modal
                visible={showTitleDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowTitleDropdown(false)}
              >
                <TouchableOpacity
                  style={styles.dropdownOverlay}
                  activeOpacity={1}
                  onPress={() => setShowTitleDropdown(false)}
                >
                  <View style={styles.dropdownContainer}>
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      style={styles.dropdownScroll}
                    >
                      {TITLE_OPTIONS.map(option => (
                        <TouchableOpacity
                          key={option.id}
                          style={[
                            styles.dropdownItem,
                            selectedTitle === option.value &&
                              styles.selectedItem,
                          ]}
                          onPress={() => handleTitleSelect(option.value)}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedTitle === option.value &&
                                styles.selectedItemText,
                            ]}
                          >
                            {option.label}
                          </Text>
                          {selectedTitle === option.value && (
                            <CustomVectorIcons
                              name="check"
                              type="Feather"
                              size={18}
                              color={theme.themeColor}
                            />
                          )}
                        </TouchableOpacity>
                      ))}

                      {/* Custom Title Option */}
                      <TouchableOpacity
                        style={[
                          styles.dropdownItem,
                          selectedTitle === 'Other' && styles.selectedItem,
                          {
                            marginTop: moderateScale(10),
                            borderTopWidth: 1,
                            borderTopColor: theme.borderColorDynamic,
                          },
                        ]}
                        onPress={() => {
                          setSelectedTitle('Other');
                          setShowTitleDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            selectedTitle === 'Other' &&
                              styles.selectedItemText,
                          ]}
                        >
                          Other
                        </Text>
                        {selectedTitle === 'Other' && (
                          <CustomVectorIcons
                            name="check"
                            type="Feather"
                            size={18}
                            color={theme.themeColor}
                          />
                        )}
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </TouchableOpacity>
              </Modal>

              {/* Custom Title Input (shown when "Other" is selected) */}
              {selectedTitle === 'Other' && (
                <View style={styles.customTitleContainer}>
                  <CustomTextInput
                    title="Custom Title"
                    placeholder="Enter your custom title"
                    value={customTitle}
                    onChangeText={handleCustomTitleChange}
                    onFocus={() => handleError('', 'titleError')}
                    ref={titleRef}
                    returnKeyType="next"
                    onSubmitEditing={() => descriptionRef.current?.focus()}
                    style={{ marginTop: moderateScale(10) }}
                  />
                </View>
              )}
            </View>

            <CustomTextInput
              title="Your Message"
              placeholder="Please describe your feedback in detail..."
              value={inputs.description}
              onChangeText={text => handleOnchange(text, 'description')}
              errorMessage={errors.descriptionError}
              onFocus={() => handleError('', 'descriptionError')}
              ref={descriptionRef}
              returnKeyType="done"
              style={{
                marginTop: moderateScale(20),
              }}
              customInputContainerStyle={{
                height: moderateScale(90),
                borderRadius: moderateScale(10),
                alignItems: 'flex-start',
                paddingTop: moderateScale(5),
              }}
              inputStyle={{
                textAlignVertical: 'top',
                flex: 1,
                height: moderateScale(90),
                fontSize: moderateScale(14),
                lineHeight: moderateScale(20),
                padding: 0,
              }}
              onSubmitEditing={() => Keyboard.dismiss()}
              multiline={true}
              numberOfLines={5}
            />
          </View>

          <CustomButton
            text={'Raise Ticket'}
            backgroundColor={theme.themeColor}
            onPress={handleValidate}
            height={moderateScale(55)}
            style={styles.submitButton}
          />

          <Text style={styles.sectionTitle}>Support Tickets</Text>

          <FlatList
            data={supportTickets}
            keyExtractor={(item: any) => String(item.id)}
            style={{ paddingBottom: 50 }}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('SupportChat', { prevData: item });
                  }}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: theme.mainBackground,
                    borderWidth: 1,
                    borderColor: theme.borderColorDynamic,
                    borderRadius: moderateScale(8),
                    width: '100%',
                    alignSelf: 'center',
                    marginBottom: moderateScale(20),
                    padding: moderateScale(10),
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: 'gray',
                        fontFamily: FontFamily.KhulaRegular,
                        marginRight: 5,
                      }}
                    >
                      Subject :{' '}
                      <Text style={{ color: theme.text }}>{item?.title}</Text>
                    </Text>

                    <View
                      style={{
                        backgroundColor: theme.boxBackground,
                        borderRadius: 100,
                        paddingHorizontal: 15,
                        paddingVertical: 3,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: theme.text,
                          fontSize: 12,
                          fontFamily: FontFamily.KhulaRegular,
                        }}
                      >
                        {item?.status}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      fontSize: 15,
                      color: 'gray',
                      fontFamily: FontFamily.KhulaRegular,
                      marginRight: 5,
                    }}
                  >
                    Description :{' '}
                    <Text style={{ color: theme.text }}>
                      {item?.description}
                    </Text>
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: 'gray',
                        fontFamily: FontFamily.KhulaRegular,
                        marginRight: 5,
                      }}
                    >
                      {TimeAgo(item?.updatedAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={() => {
              return (
                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    height: 500,
                    justifyContent: 'center',
                  }}
                >
                  <FastImage
                    source={IMAGES.bg_secondary}
                    style={{ height: 150, width: 150, alignSelf: 'center' }}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: FontFamily.KhulaRegular,
                      color: theme.text,
                      marginBottom: 4,
                      marginHorizontal: 20,
                      textAlign: 'center',
                      marginTop: 30,
                      width: '70%',
                      alignSelf: 'center',
                    }}
                  >
                    {`Oops, We haven't find any raised tickets.`}
                  </Text>
                </View>
              );
            }}
          />
        </View>
      </KeyboardAwareScrollView>

      <SuccessErrorPopup
        ok={false}
        popupOpen={successModalState}
        type={'Success'}
        closePopup={() => {
          setsuccessModalState(false);
        }}
        title={'Thank You!'}
        message={successMsg}
      />
      <SuccessErrorPopup
        ok={true}
        btnText={'Continue'}
        popupOpen={FailedModalState}
        type={'Error'}
        closePopup={() => {
          setFailedModalState(false);
        }}
        title={'Oops!'}
        message={errorMessage}
      />

      <CustomLoader visible={Loader} />
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    contentContainer: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
      marginHorizontal: moderateScale(20),
      marginTop: moderateScale(20),
    },
    title: {
      fontSize: moderateScale(24),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      textAlign: 'center',
      marginBottom: moderateScale(8),
    },
    subtitle: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      textAlign: 'center',
      marginBottom: moderateScale(30),
    },
    sectionTitle: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginBottom: moderateScale(20),
    },
    ratingContainer: {
      alignItems: 'center',
      marginBottom: moderateScale(25),
      padding: moderateScale(20),
      backgroundColor: theme.themeLight + '15',
      borderRadius: moderateScale(16),
    },
    ratingLabel: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      marginBottom: moderateScale(15),
    },
    starsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    starButton: {
      padding: moderateScale(4),
    },
    formSection: {
      marginBottom: moderateScale(25),
    },
    submitButton: {
      alignSelf: 'center',
      borderRadius: moderateScale(16),
      marginBottom: moderateScale(30),
    },

    // New styles for dropdown
    titleContainer: {
      marginBottom: moderateScale(10),
    },
    inputTitle: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      marginBottom: moderateScale(8),
    },
    dropdownTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.borderColorDynamic,
      borderRadius: moderateScale(10),
      paddingHorizontal: moderateScale(15),
      paddingVertical: moderateScale(14),
      backgroundColor: theme.mainBackground,
    },
    dropdownTriggerText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
      flex: 1,
    },
    dropdownError: {
      borderColor: theme.red,
    },
    errorText: {
      color: theme.red,
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      marginTop: moderateScale(5),
    },
    dropdownOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: moderateScale(20),
    },
    dropdownContainer: {
      width: '100%',
      maxHeight: moderateScale(300),
      backgroundColor: theme.mainBackground,
      borderRadius: moderateScale(10),
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    dropdownScroll: {
      maxHeight: moderateScale(300),
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: moderateScale(20),
      paddingVertical: moderateScale(15),
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColorDynamic,
    },
    selectedItem: {
      backgroundColor: theme.themeLight + '20',
    },
    dropdownItemText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
      flex: 1,
    },
    selectedItemText: {
      color: theme.themeColor,
      fontFamily: FontFamily.KhulaSemiBold,
    },
    customTitleContainer: {
      marginTop: moderateScale(10),
    },
  });

export default FeedbackSupportScreen;
