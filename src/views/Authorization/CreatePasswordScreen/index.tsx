/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';

import FontFamily from '@assets/fonts/FontFamily';
import CustomTextInput from '@components/CustomTextInput';
import CustomButton from '@components/CustomButton';
import CustomLoader from '@utils/CustomLoader';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import CustomHeader from '@components/CustomHeader';
import { useSelector } from 'react-redux';

const CreatePasswordScreen = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { prevData } = props.route?.params;
  const [errorMessage, seterrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // const [FailedModalState, setFailedModalState] = useState(false);
  const languageData = useSelector((state: any) => state?.data?.languageData);

  const [inputs, setInputs] = useState({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleOnchange = (text: any, input: any) => {
    setInputs(prevState => ({ ...prevState, [input]: text }));
  };

  const handleError = (error: any, input: any) => {
    setErrors(prevState => ({ ...prevState, [input]: error }));
  };

  const handelValidate = () => {
    Keyboard.dismiss();
    let isValid = true;

    if (!inputs.password.trim()) {
      handleError(
        languageData?.password_required || 'Please enter a password',
        'password',
      );

      isValid = false;
    } else if (inputs.password.length < 6) {
      handleError(
        languageData?.password_min_length ||
          'Password must be at least 6 characters long',
        'password',
      );

      isValid = false;
    }

    if (!inputs.confirmPassword.trim()) {
      handleError(
        languageData?.confirm_password_required ||
          'Please confirm your password',
        'confirmPassword',
      );

      isValid = false;
    } else if (inputs.password !== inputs.confirmPassword) {
      handleError(
        languageData?.password_mismatch || 'Passwords do not match',
        'confirmPassword',
      );

      isValid = false;
    }

    if (isValid) {
      handlePasswordChange();
    }
  };

  async function handlePasswordChange() {
    setLoading(true);

    const payload = {
      redisToken: prevData?.redisToken,
      password: inputs?.password,
      confirmPassword: inputs?.confirmPassword,
    };

    try {
      const res = await apiRequest(
        ApiURL.resetPassword,
        'POST',
        payload,
        false,
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
        <Text style={styles.title}>
          {languageData?.create_password || 'Create Password'}
        </Text>

        <Text style={styles.subtitle}>
          {languageData?.create_password_subtitle ||
            'Set up a new password to protect your account and ensure secure access.'}
        </Text>

        {/* Password Input */}
        <CustomTextInput
          title={languageData?.new_password || 'New Password'}
          placeholder={languageData?.enter_password || 'Enter Password'}
          value={inputs.password}
          onChangeText={text => handleOnchange(text, 'password')}
          errorMessage={errors.password}
          onFocus={() => handleError('', 'password')}
          secureTextEntry={true}
          style={styles.inputSpacing}
        />

        {/* Confirm Password Input */}
        <CustomTextInput
          title={languageData?.confirm_password || 'Confirm Password'}
          placeholder={
            languageData?.enter_confirm_password || 'Enter Confirm Password'
          }
          value={inputs.confirmPassword}
          onChangeText={text => handleOnchange(text, 'confirmPassword')}
          errorMessage={errors.confirmPassword}
          onFocus={() => handleError('', 'confirmPassword')}
          secureTextEntry={true}
          style={styles.inputSpacing}
        />

        <CustomButton
          text={languageData?.update || 'Update'}
          backgroundColor={theme.themeColor}
          onPress={() => {
            handelValidate();
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
      paddingHorizontal: moderateScale(10),

      borderRadius: moderateScale(20),
    },
    title: {
      fontSize: moderateScale(20),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginTop: moderateScale(20),
    },
    subtitle: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      marginTop: moderateScale(5),
    },
    inputSpacing: {
      marginTop: moderateScale(20),
    },
  });

export default CreatePasswordScreen;
