/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useTheme } from '@theme/themeContext';
import CustomLoader from '@utils/CustomLoader';
import FontFamily from '@assets/fonts/FontFamily';
import { moderateScale } from 'react-native-size-matters';
import CustomButton from '@components/CustomButton';
import CustomTextInput from '@components/CustomTextInput';
import SuccessErrorPopup from '@utils/SuccessErrorPopup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { showSuccessToast } from '@utils/CustomToast';
import CustomHeader from '@components/CustomHeader';
import { useSelector } from 'react-redux';

const ForgotPasswordScreen = (props: any) => {
  const { navigation } = props;
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme);

  const [Loader, setLoader] = useState(false);
  const [successModalState, setsuccessModalState] = useState(false);
  const [successMsg, setsuccessMsg] = useState('');
  const [FailedModalState, setFailedModalState] = useState(false);
  const [errorMessage, seterrorMessage] = useState('');
  const languageData = useSelector((state: any) => state?.data?.languageData);

  const [inputs, setInputs] = useState({
    email: '',
  });

  const [errors, setErrors] = useState({
    email: '',
  });

  let emailRef = React.createRef<any>();

  const handleOnchange = (text: any, input: any) => {
    setInputs(prevState => ({ ...prevState, [input]: text }));
  };

  const handleError = (error: any, input: any) => {
    setErrors(prevState => ({ ...prevState, [input]: error }));
  };

  const handelValidate = () => {
    Keyboard.dismiss();
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inputs.email.trim()) {
      handleError(
        languageData?.email_invalid || 'Please enter a valid email address',
        'email',
      );

      isValid = false;
    } else if (!emailRegex.test(inputs.email)) {
      handleError('Please enter a valid email address', 'email');
      isValid = false;
    }

    if (isValid) {
      handlePasswordReset();
    }
  };

  async function handlePasswordReset() {
    setLoader(true);

    const payload = {
      email: inputs.email,
    };

    try {
      const res = await apiRequest(
        ApiURL.forgetPassword,
        'POST',
        payload,
        false,
      );
      console.log('✅ API Response:', res);
      setLoader(false);

      if (!res?.error) {
        showSuccessToast(res?.message);

        setLoader(false);
        navigation.navigate('VerifyForgotPasswordOtp', {
          email: inputs.email,
          prevData: res?.data,
        });
      } else {
        const errorMsg = res?.message || 'Request failed. Please try again.';
        seterrorMessage(errorMsg);
        setFailedModalState(true);
      }
    } catch (error: any) {
      console.log('🔥API Exception:', error);
      setLoader(false);
      seterrorMessage(error.message || 'Unexpected error occurred');
      setFailedModalState(true);
    }
  }

  return (
    <ScrollView>
      <SafeAreaView style={{ backgroundColor: theme.background, flex: 1 }}>
        <StatusBar
          backgroundColor={'rgba(0,0,0,0.5)'}
          barStyle={
            Platform.OS === 'android' ? 'light-content' : 'dark-content'
          }
        />

        <CustomHeader showBackButton={true} showNotifications={false} />

        <View
          style={{
            // flex: 1,
            backgroundColor: theme.mainBackground,
            marginHorizontal: moderateScale(10),
            padding: moderateScale(20),
            marginTop: moderateScale(30),
            borderRadius: moderateScale(20),
          }}
        >
          <Text
            style={{
              fontSize: moderateScale(22),
              fontFamily: FontFamily.KhulaBold,
              color: theme.text,
            }}
          >
            {languageData?.forgot_password_title || 'Forgot Password'}
          </Text>

          <Text
            style={{
              fontSize: moderateScale(13),
              fontFamily: FontFamily.KhulaSemiBold,
              color: theme.textSub,
              marginBottom: moderateScale(15),
              marginTop: moderateScale(10),
              lineHeight: moderateScale(18),
            }}
          >
            {languageData?.forgot_password_desc ||
              'Please enter your registered email address. We’ll send you a link to reset your password.'}
          </Text>

          <CustomTextInput
            title={languageData?.enter_email || 'Enter Email'}
            placeholder={languageData?.email_placeholder || 'test@gmail.com'}
            value={inputs.email}
            onChangeText={text => handleOnchange(text, 'email')}
            errorMessage={errors.email}
            onFocus={() => handleError('', 'email')}
            ref={emailRef}
            returnKeyType="done"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginTop: moderateScale(25) }}
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          <CustomButton
            text={languageData?.send_otp || 'Send OTP'}
            backgroundColor={theme.themeColor}
            onPress={handelValidate}
            height={moderateScale(45)}
            style={{
              alignSelf: 'center',
              borderRadius: moderateScale(12),
              marginTop: moderateScale(30),
            }}
          />

          {/* <Text
          style={{
            fontSize: moderateScale(13),
            fontFamily: FontFamily.KhulaSemiBold,
            color: theme.black,
            marginTop: moderateScale(25),
            textAlign: 'center',
          }}
        >
          Remember your password?{' '}
          <Text
            style={{ fontFamily: FontFamily.KhulaExtraBold }}
            onPress={() => navigation.navigate('Login')}
          >
            Back to Login
          </Text>
        </Text> */}
        </View>

        <SuccessErrorPopup
          ok={true}
          btnText={languageData?.continue || 'Continue'}
          popupOpen={successModalState}
          type={'Success'}
          closePopup={() => {
            setsuccessModalState(false);
            navigation.navigate('OTPVerification', { email: inputs.email });
          }}
          title={languageData?.success || 'Success'}
          message={successMsg}
        />

        <SuccessErrorPopup
          ok={true}
          btnText={languageData?.try_again || 'Try Again'}
          popupOpen={FailedModalState}
          type={'Error'}
          closePopup={() => {
            setFailedModalState(false);
          }}
          title={languageData?.error || 'Error'}
          message={errorMessage}
        />

        <CustomLoader visible={Loader} />
      </SafeAreaView>
    </ScrollView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    content: {
      paddingHorizontal: moderateScale(0),
    },
    title: {
      fontSize: moderateScale(15),
      fontFamily: FontFamily.KhulaSemiBold,
      marginBottom: moderateScale(5),
      color: theme.text,
    },
  });

export default ForgotPasswordScreen;
