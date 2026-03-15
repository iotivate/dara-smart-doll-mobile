/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';

import FontFamily from '@assets/fonts/FontFamily';
import CustomTextInput from '@components/CustomTextInput';
import CustomButton from '@components/CustomButton';
import CustomLoader from '@utils/CustomLoader';
import CountDownTimer from '@components/CountDownTimer';
import { OtpInput } from 'react-native-otp-entry';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { showSuccessToast } from '@utils/CustomToast';
import CustomHeader from '@components/CustomHeader';
import { useSelector } from 'react-redux';

const VerifyForgotPasswordOtp = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { prevData, email: emails } = props.route?.params;
  const [email, setEmail] = useState(emails);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [errorMessage, seterrorMessage] = useState('');
  const [resendOtp, setresendOtp] = useState(false);
  // const [FailedModalState, setFailedModalState] = useState(false);
  const languageData = useSelector((state: any) => state?.data?.languageData);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const validate = () => {
    let valid = true;
    Keyboard.dismiss();

    if (!otp) {
      seterrorMessage(languageData?.otp_required || 'Please enter OTP');

      valid = false;
    } else if (otp.length < 6) {
      seterrorMessage('Please enter valid otp');
      valid = false;
    }

    if (valid) {
      handleVerifyOtp();
    }
  };

  async function handleVerifyOtp() {
    setLoading(true);

    const payload = {
      redisToken: prevData?.redisToken,
      otp: otp,
    };

    try {
      const res = await apiRequest(
        ApiURL.forgetPasswordOtpVerify,
        'POST',
        payload,
        false,
      );
      console.log('✅ API Response:', res);
      setLoading(false);

      if (!res?.error) {
        setOtp('');
        setLoading(false);

        props.navigation.navigate('CreatePasswordScreen', {
          prevData: res?.data,
        });
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

  async function handlePasswordReset() {
    setLoading(true);

    const payload = {
      email: email,
    };

    try {
      const res = await apiRequest(
        ApiURL.forgetPassword,
        'POST',
        payload,
        false,
      );
      console.log('✅ API Response:', res);
      setLoading(false);

      if (!res?.error) {
        showSuccessToast(res?.message);

        setLoading(false);
      } else {
        const errorMsg = res?.message || 'Request failed. Please try again.';
        seterrorMessage(errorMsg);
        // setFailedModalState(true);
      }
    } catch (error: any) {
      console.log('🔥API Exception:', error);
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
        <Text style={styles.title}>
          {languageData?.forgot_password || 'Forgot Password'}
        </Text>

        <Text style={styles.subtitle}>
          {languageData?.verify_otp_message ||
            'Please verify the OTP sent to your email to reset your password.'}
        </Text>

        <CustomTextInput
          title={languageData?.email || 'Email'}
          placeholder="test@gmail.com"
          value={email}
          onChangeText={text => setEmail(text)}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ marginTop: moderateScale(25) }}
        />

        <Text style={styles.inputLabel}>
          {languageData?.enter_otp || 'Enter OTP'}
        </Text>

        <View style={styles.otpContainer}>
          <OtpInput
            numberOfDigits={6}
            secureTextEntry={true}
            type="numeric"
            blurOnFilled={true}
            focusStickBlinkingDuration={400}
            onTextChange={text => setOtp(text)}
            onFocus={() => seterrorMessage('')}
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
          {errorMessage && (
            <Text style={styles.errorText}>
              {languageData?.otp_invalid || 'Please enter a valid 6-digit OTP'}
            </Text>
          )}

          {resendOtp ? (
            <TouchableOpacity
              onPress={() => handlePasswordReset()}
              activeOpacity={0.7}
              style={{ marginTop: moderateScale(10), alignSelf: 'flex-end' }}
            >
              <Text
                style={{
                  fontSize: moderateScale(13),
                  fontFamily: FontFamily.KhulaRegular,
                  color: theme.themeColor,
                }}
              >
                {languageData?.resend_otp || 'RESEND OTP'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                marginTop: moderateScale(10),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontFamily: FontFamily.KhulaRegular,
                  color: theme.themeColor,
                }}
              >
                {languageData?.didnt_get_otp || 'Didn’t get the OTP?'}{' '}
                <Text style={{ color: '#A3A3A3' }}>
                  {' '}
                  {languageData?.resend_in || 'Resend SMS in'}
                </Text>{' '}
                :{' '}
              </Text>
              <CountDownTimer
                onStatusChange={(status: any) => setresendOtp(true)}
              />
            </View>
          )}
        </View>

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
      padding: moderateScale(10),
      // marginTop: moderateScale(30),
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
    otpContainer: {},
    otpBox: {
      width: moderateScale(45),
      height: moderateScale(50),
      textAlign: 'center',
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

export default VerifyForgotPasswordOtp;
