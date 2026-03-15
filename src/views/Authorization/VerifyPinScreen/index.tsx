/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';

import FontFamily from '@assets/fonts/FontFamily';
import CustomButton from '@components/CustomButton';
import CustomLoader from '@utils/CustomLoader';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { OtpInput } from 'react-native-otp-entry';
import { showSuccessToast } from '@utils/CustomToast';
import CustomHeader from '@components/CustomHeader';
import { useSelector } from 'react-redux';

const VerifyPinScreen = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { mode, nextScreen, onSuccess } = props.route?.params || {};

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, seterrorMessage] = useState('');
  const languageData = useSelector((state: any) => state?.data?.languageData);
  const validate = () => {
    let valid = true;
    Keyboard.dismiss();
    if (!pin) {
      languageData?.pin_required || 'Please enter your PIN';
      valid = false;
    } else if (pin.length < 4) {
      languageData?.pin_min_length || 'PIN must be at least 4 digits';
      valid = false;
    }
    if (valid) {
      handleVerifyPin();
    }
  };
  async function handleVerifyPin() {
    setLoading(true);
    const payload = {
      securityPin: pin,
    };
    try {
      const res = await apiRequest(
        ApiURL.verifySecurityPin,
        'POST',
        payload,
        true,
      );
      console.log('✅ API Response:', res);
      setLoading(false);
      if (res) {
        if (!res?.error) {
          showSuccessToast(res?.message);

          if (typeof onSuccess === 'function') {
            props.navigation.goBack();
            onSuccess();
            return;
          }
          if (mode === 'CONFIRM_PIN' && nextScreen) {
            // 🔐 Secure navigation
            // props.navigation.replace(nextScreen);
            props.navigation.replace(nextScreen, {
              sessionId: props.route.params?.sessionId,
              sessionData: props.route.params?.sessionData,
            });
          } else {
            // 🔁 Default flow
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
          }
        } else {
          const errorMsg =
            res?.message ||
            languageData?.request_failed ||
            'Request failed. Please try again.';

          seterrorMessage(errorMsg);
          // setFailedModalState(true);
        }
      } else {
        const errorMsg = res?.message || 'Request failed. Please try again.';
        seterrorMessage(errorMsg);
        // setFailedModalState(true);
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoading(false);
      seterrorMessage(
        error.message ||
          languageData?.unexpected_error ||
          'Unexpected error occurred',
      );

      // setFailedModalState(true);
    }
  }

  async function handleResetPin() {
    setLoading(true);
    try {
      const res = await apiRequest(
        ApiURL.securityPinRequestOtp,
        'POST',
        {},
        true,
      );
      setLoading(false);
      if (res) {
        if (!res?.error) {
          showSuccessToast(res?.message);
          props.navigation.navigate('ResetPinOtp', { prevData: res?.data });
        } else {
          const errorMsg = res?.message || 'Request failed. Please try again.';
          seterrorMessage(errorMsg);
          // setFailedModalState(true);
        }
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
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        marginTop: moderateScale(20),
      }}
    >
      <StatusBar
        backgroundColor={'rgba(0,0,0,0.5)'}
        barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'}
      />
      <CustomHeader showBackButton={true} showNotifications={false} />

      <View style={styles.container}>
        <Text style={styles.title}>
          {languageData?.verify_security_pin || 'Verify Security PIN'}
        </Text>

        <Text style={styles.subtitle}>
          {languageData?.verify_pin_subtitle ||
            'Please enter your security PIN. This helps verify your identity.'}
        </Text>

        <Text style={styles.inputLabel}>
          {languageData?.enter_pin || 'Enter PIN'}
        </Text>

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
        <TouchableOpacity onPress={() => handleResetPin()}>
          <Text
            style={{
              fontSize: moderateScale(14),
              fontFamily: FontFamily.KhulaBold,
              color: theme.themeColor,
              marginTop: moderateScale(10),
              textAlign: 'right',
            }}
          >
            {languageData?.forgot_pin || 'Forgot PIN?'}
          </Text>
        </TouchableOpacity>

        <CustomButton
          text={languageData?.proceed || 'Proceed'}
          backgroundColor={theme.themeColor}
          onPress={() => {
            Keyboard.dismiss();
            validate();
          }}
          height={moderateScale(55)}
          style={{
            alignSelf: 'center',
            // borderRadius: moderateScale(15),
            marginTop: moderateScale(30),
          }}
        />
      </View>

      <CustomLoader visible={loading} />
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.mainBackground,
      marginHorizontal: moderateScale(20),
      borderRadius: moderateScale(20),
      paddingHorizontal: moderateScale(10),
      paddingBottom: moderateScale(20),
      marginTop: moderateScale(20),
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

export default VerifyPinScreen;
