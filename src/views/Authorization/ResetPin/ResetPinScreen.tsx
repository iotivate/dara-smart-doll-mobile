/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';

import FontFamily from '@assets/fonts/FontFamily';
import CustomButton from '@components/CustomButton';
import CustomLoader from '@utils/CustomLoader';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { OtpInput } from 'react-native-otp-entry';

import CustomHeader from '@components/CustomHeader';

const ResetPinScreen = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const prevData = props.route?.params?.prevData;
  console.log('prevess', prevData);

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, seterrorMessage] = useState('');
  const [confirmerrorMessage, setconfirmerrorMessage] = useState('');
  // const [FailedModalState, setFailedModalState] = useState(false);

  const validate = () => {
    let valid = true;
    Keyboard.dismiss();

    if (!pin) {
      seterrorMessage('Please enter your PIN');
      valid = false;
    } else if (pin.length < 4) {
      seterrorMessage('PIN must be at least 4 digits');
      valid = false;
    } else {
      seterrorMessage('');
    }

    if (!confirmPin) {
      setconfirmerrorMessage('Please confirm your PIN');
      valid = false;
    } else if (confirmPin !== pin) {
      setconfirmerrorMessage('PINs do not match');
      valid = false;
    } else {
      setconfirmerrorMessage('');
    }
    if (valid) {
      handleSetupPin();
    }
  };

  async function handleSetupPin() {
    setLoading(true);

    const payload = {
      redisToken: prevData?.redisToken,
      newSecurityPin: pin,
    };

    try {
      const res = await apiRequest(
        ApiURL.securityPinReset,
        'POST',
        payload,
        true,
      );
      console.log('✅ API Response:', res);
      setLoading(false);

      if (!res?.error) {
        setLoading(false);

        props.navigation.popToTop();
      } else {
        const errorMsg = res?.message || 'Request failed. Please try again.';
        seterrorMessage(errorMsg);
        // setFailedModalState(true);
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoading(false);
      seterrorMessage(error.message || 'Unexpected error occurred');
      // setFailedModalState(true);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        backgroundColor={'rgba(0,0,0,0.5)'}
        barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'}
      />
      <CustomHeader showBackButton={true} showNotifications={false} />

      <View style={styles.container}>
        <Text style={styles.title}>Setup Security Pin</Text>
        <Text style={styles.subtitle}>
          Secure your account with a PIN. It only takes a few seconds!
        </Text>

        <Text style={styles.inputLabel}>Enter PIN</Text>

        <View style={styles.otpContainer}>
          <OtpInput
            numberOfDigits={4}
            type="numeric"
            blurOnFilled={true}
            focusStickBlinkingDuration={400}
            onTextChange={text => setPin(text)}
            onFocus={() => seterrorMessage('')}
            secureTextEntry={true}
            theme={{
              containerStyle: { marginTop: 10 },
              pinCodeContainerStyle: errorMessage
                ? styles.pinCodeErrorContainer
                : styles.pinCodeContainer,
              pinCodeTextStyle: styles.pinCodeText,
              focusStickStyle: styles.focusStick,
              focusedPinCodeContainerStyle: styles.activePinCodeContainer,
            }}
          />
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        </View>

        <Text style={styles.inputLabel}>Re-Enter PIN</Text>

        <View style={styles.otpContainer}>
          <OtpInput
            numberOfDigits={4}
            type="numeric"
            blurOnFilled={true}
            focusStickBlinkingDuration={400}
            onTextChange={text => setConfirmPin(text)}
            onFocus={() => setconfirmerrorMessage('')}
            secureTextEntry={true}
            theme={{
              containerStyle: { marginTop: moderateScale(10) },
              pinCodeContainerStyle: errorMessage
                ? styles.pinCodeErrorContainer
                : styles.pinCodeContainer,
              pinCodeTextStyle: styles.pinCodeText,
              focusStickStyle: styles.focusStick,
              focusedPinCodeContainerStyle: styles.activePinCodeContainer,
            }}
          />
          {confirmerrorMessage && (
            <Text style={styles.errorText}>{confirmerrorMessage}</Text>
          )}
        </View>

        <CustomButton
          text={'Proceed'}
          backgroundColor={theme.themeColor}
          onPress={() => {
            Keyboard.dismiss();
            validate();
          }}
          height={moderateScale(55)}
          style={{
            alignSelf: 'center',
            borderRadius: moderateScale(12),
            marginTop: moderateScale(30),
          }}
        />
      </View>

      <CustomLoader visible={loading} />
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.mainBackground,
      marginHorizontal: moderateScale(20),
      borderRadius: moderateScale(20),
    },
    title: {
      fontSize: moderateScale(20),
      fontFamily: FontFamily.KhulaExtraBold,
      color: theme.text,
      marginTop: moderateScale(20),
    },
    subtitle: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      marginTop: moderateScale(5),
    },
    inputLabel: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      marginTop: moderateScale(25),
      marginBottom: moderateScale(5),
    },
    otpContainer: {
      width: moderateScale(200),
    },

    resendText: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.textSub,
      textAlign: 'right',
      marginTop: moderateScale(10),
    },

    errorText: {
      color: 'red',
      fontSize: moderateScale(12),
      marginTop: moderateScale(5),
      fontFamily: FontFamily.KhulaSemiBold,
    },
    pinCodeContainer: {
      backgroundColor: theme.white,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: theme.black,
      height: moderateScale(40),
      width: moderateScale(40),
    },
    pinCodeErrorContainer: {
      backgroundColor: theme.white,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: theme.themeRed,
      height: moderateScale(40),
      width: moderateScale(40),
    },
    activePinCodeContainer: {
      backgroundColor: theme.white,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: theme.themeColor,
      height: moderateScale(40),
      width: moderateScale(40),
    },
    pinCodeText: {
      color: theme.black,
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(14),
    },
    focusStick: { backgroundColor: theme.black },
  });

export default ResetPinScreen;
