/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import CustomLucideIcon from './CustomLucideIcon';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import { Shadow } from 'react-native-shadow-2';
import FontFamily from '@assets/fonts/FontFamily';
import { useSelector } from 'react-redux';
// import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';
import { startSpeechToText } from 'react-native-voice-to-text';
import IMAGES from '@assets/images';
import { useBluetooth } from './BluetoothContext';

const { width: adjustWidth } = Dimensions.get('window');
const width = adjustWidth;

const ChildBottomBar = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { connectionStatus }: any = useBluetooth();
  const languageData = useSelector((state: any) => state?.data?.languageData);

  const [visible, setVisible] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [listening, setListening] = useState(false);

  const startVoiceRecognition = async () => {
    if (connectionStatus !== 'connected') {
      Alert.alert(
        'Device Not Connected',
        'Please connect the device first before performing this action.',
        [{ text: 'OK', onPress: () => console.log('Alert closed') }],
      );
      return;
    }
    try {
      setVisible(true);
      setListening(true);
      setSpeechText('');

      const audioText: any = await startSpeechToText({
        lang: 'en-US',
      });
      setSpeechText(audioText);
      setListening(false);
    } catch (error) {
      console.log('Voice error:', error);
      setListening(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.svgContainer}>
          <Shadow
            distance={10}
            startColor="rgba(0,0,0,0.10)"
            offset={[0, 8]}
            corners={{
              topStart: true,
              topEnd: true,
              bottomStart: true,
              bottomEnd: true,
            }}
          >
            <Svg
              width={width}
              height={moderateScale(75)}
              viewBox={`0 0 ${width} 60`}
            >
              <Path
                fill={theme.themeColor}
                d={`
                M20,0
                H${(width - 140) / 2}
                C${width / 2 - 16},0 ${width / 2 - 48},45 ${width / 2},48
                C${width / 2 + 48},45 ${width / 2 + 16},0 ${
                  width - (width - 140) / 2
                },0
                H${width - 18}
                A20,20 0 0 1 ${width},20
                V50
                A20,20 0 0 1 ${width - 20},80
                H20
                A20,20 0 0 1 0,50
                V20
                A20,20 0 0 1 20,0
                Z
              `}
              />
            </Svg>
          </Shadow>
        </View>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={startVoiceRecognition}
        >
          <CustomLucideIcon
            name="Mic"
            color={theme.white}
            size={moderateScale(30)}
          />
        </TouchableOpacity>

        <View style={styles.tabContainer}>
          <View style={styles.tabItem}>
            <CustomLucideIcon name="Home" color={theme.white} />
            <Text style={[styles.label, { color: theme.white }]}>
              {languageData?.child_bottom_bar_home || 'Home'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('OurProducts')}
          >
            <CustomLucideIcon name="ShieldUser" color={theme.grayBox} />
            <Text style={styles.label}>
              {languageData?.child_bottom_bar_dara || 'Dara'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 30,
            }}
            onPress={() => navigation.navigate('PlaylistDetailsScreen')}
          >
            <CustomLucideIcon name="ListMusic" color={theme.grayBox} />
            <Text style={styles.label}>
              {languageData?.child_bottom_bar_playlists || 'Playlists'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('ChildProfile')}
          >
            <CustomLucideIcon name="User" color={theme.grayBox} />
            <Text style={styles.label}>
              {languageData?.child_bottom_bar_profile || 'Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalWrapper}>
          <View style={styles.modalContainer}>
            {listening ? (
              <>
                <LottieView
                  source={IMAGES.Search}
                  autoPlay
                  loop
                  style={{ width: 120, height: 120 }}
                />

                <Text style={styles.listeningText}>Listening...</Text>
              </>
            ) : (
              <>
                <Text style={styles.resultText}>{speechText}</Text>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setVisible(false)}
                >
                  <Text style={{ color: 'white' }}>Send</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ChildBottomBar;
const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      bottom: moderateScale(0),
      width,
      height: moderateScale(70),
      alignItems: 'center',
      alignSelf: 'center',
    },

    svgContainer: {
      position: 'absolute',
      bottom: 0,
    },

    floatingButton: {
      position: 'absolute',
      bottom: moderateScale(24),
      backgroundColor: theme.themeColor,
      borderRadius: moderateScale(35),
      width: moderateScale(60),
      height: moderateScale(60),
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      zIndex: 2,
    },

    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width,
      height: moderateScale(80),
      alignItems: 'center',
      paddingHorizontal: moderateScale(20),
    },

    tabItem: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    label: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaBold,
      color: theme.grayBox,
      marginTop: moderateScale(4),
    },

    modalWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },

    modalContainer: {
      width: '80%',
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 25,
      alignItems: 'center',
    },

    listeningText: {
      fontSize: 18,
      marginTop: 10,
      fontWeight: '600',
    },

    resultText: {
      fontSize: 18,
      textAlign: 'center',
      marginVertical: 20,
    },

    closeBtn: {
      backgroundColor: theme.themeColor,
      paddingHorizontal: 30,
      paddingVertical: 10,
      borderRadius: 10,
    },
  });
