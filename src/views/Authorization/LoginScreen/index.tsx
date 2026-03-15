/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
  Keyboard,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { useTheme } from '@theme/themeContext';
import CustomLoader from '@utils/CustomLoader';
import FontFamily from '@assets/fonts/FontFamily';
import {
  moderateScale,
  moderateVerticalScale,
} from 'react-native-size-matters';
import CustomButton from '@components/CustomButton';
import CustomTextInput from '@components/CustomTextInput';
import SuccessErrorPopup from '@utils/SuccessErrorPopup';
import CustomVectorIcons from '@components/CustomVectorIcons';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { showSuccessToast } from '@utils/CustomToast';
import { storeData } from '@utils/CustomAsyncStorage';
import CustomHeader from '@components/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const LoginScreen = (props: any) => {
  const { navigation } = props;
  const { theme, setTheme } = useTheme();
  const styles = getStyles(theme);
  const [Loader, setLoader] = useState(false);
  const [successModalState, setsuccessModalState] = useState(false);
  const [successMsg, setsuccessMsg] = useState('');
  const [FailedModalState, setFailedModalState] = useState(false);
  const [errorMessage, seterrorMessage] = useState('');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [isRememberMe, setIsRememberMe] = useState(false);
  const languageData = useSelector((state: any) => state?.data?.languageData);

  const [inputs, setInputs] = useState({
    userName: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    userName: '',
    password: '',
  });

  let userNameref = React.createRef<any>();
  let passwordref = React.createRef<any>();

  console.log('langugageData', languageData);

  // Responsive scaling functions
  const scaleFont = (size: number) => {
    return isTablet ? moderateScale(size * 1.2) : moderateScale(size);
  };

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validateUsername = (username: string) => {
    const usernamePattern = /^[a-zA-Z0-9_.]+$/;
    return usernamePattern.test(username);
  };

  const validatePassword = (password: string) => {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
    return passwordPattern.test(password);
  };

  const handleOnchange = (text: any, input: any) => {
    let formattedText = text;

    if (input === 'userName') {
      formattedText = text.trim();
      if (formattedText.length > 50) {
        return;
      }
    }

    if (input === 'password') {
      formattedText = text.replace(/[^\w@$!%*?&]/g, '');
      if (formattedText.length > 15) {
        formattedText = formattedText.substring(0, 15);
      }
    }

    setInputs(prevState => ({ ...prevState, [input]: formattedText }));
  };

  const handleError = (error: any, input: any) => {
    setErrors(prevState => ({ ...prevState, [input]: error }));
  };

  const toggleTermsAcceptance = () => {
    setIsTermsAccepted(!isTermsAccepted);
    if (termsError && !isTermsAccepted) {
      setTermsError('');
    }
  };

  const handelValidate = () => {
    Keyboard.dismiss();
    let isValid = true;

    // Clear previous errors
    setTermsError('');

    // Username/Email validation
    if (!inputs.userName.trim()) {
      handleError('Please enter Username or Email', 'userName');
      isValid = false;
    } else if (inputs.userName.includes('@')) {
      if (!validateEmail(inputs.userName)) {
        handleError('Please enter a valid email address', 'userName');
        isValid = false;
      }
    } else {
      if (!validateUsername(inputs.userName)) {
        handleError(
          'Username can only contain letters, numbers, underscores and dots',
          'userName',
        );
        isValid = false;
      } else if (inputs.userName.length < 3) {
        handleError('Username must be at least 3 characters long', 'userName');
        isValid = false;
      } else if (inputs.userName.length > 30) {
        handleError('Username must not exceed 30 characters', 'userName');
        isValid = false;
      }
    }

    // Password validation
    if (!inputs.password.trim()) {
      handleError('Please enter a password', 'password');
      isValid = false;
    } else if (inputs.password.length < 8) {
      handleError('Password must be at least 8 characters long', 'password');
      isValid = false;
    } else if (inputs.password.length > 15) {
      handleError('Password must not exceed 15 characters', 'password');
      isValid = false;
    } else if (!validatePassword(inputs.password)) {
      handleError(
        'Password must contain 8-15 characters with uppercase, lowercase, number, and special character (@$!%*?&)',
        'password',
      );
      isValid = false;
    }

    // Terms & Conditions validation
    if (!isTermsAccepted) {
      setTermsError('You must accept the Terms and Conditions to continue');
      isValid = false;
    }

    if (isValid) {
      handleLogin();
    }
  };

  async function handleLogin() {
    const storedFcmToken = await AsyncStorage.getItem('DEVICE_ID');
    Keyboard.dismiss();
    setLoader(true);
    const payload = {
      identifier: inputs.userName,
      password: inputs.password,
      fcmToken: storedFcmToken,
    };

    try {
      const res = await apiRequest(ApiURL.login, 'POST', payload, false);
      console.log('✅ API Response:', res);
      setLoader(false);

      if (!res?.error) {
        showSuccessToast(res?.message);

        await storeData('token', res?.data?.token);
        await storeData('accessMode', res?.data?.accessMode);

        // Store remember me preference
        if (isRememberMe) {
          await storeData('rememberMe', 'true');
          await storeData('rememberedUserName', inputs.userName);
        } else {
          await storeData('rememberMe', 'false');
          await storeData('rememberedUserName', '');
        }

        // Child navigation
        const accessMode = res?.data?.accessMode;

        // ✅ NEW CONDITION
        if (accessMode === 4) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'HomeScreen' }],
          });
          return;
        }
        setLoader(false);
        if (res?.data?.languageSetup === false) {
          props.navigation.navigate('SelectPreferenceScreen', {
            prevData: res?.data,
          });
        } else if (res?.data?.securityPinSetup === false) {
          navigation.navigate('SetupPin', {
            prevData: { isFromLogin: true },
          });
        } else if (res?.data?.securityPinSetup === true) {
          navigation.navigate('VerifyPin');
        }
      } else {
        const errorMsg = res?.message || 'Login failed. Please try again.';
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
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <StatusBar
        backgroundColor={theme.themeColor}
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
      />

      <CustomHeader showBackButton={false} showNotifications={false} title="" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? (isTablet ? 100 : 80) : 0
        }
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentContainer}>
            <Text style={styles.title}> {languageData?.login || 'Login'}</Text>
            <Text style={styles.subtitle}>
              {languageData?.welcome_back ||
                "Welcome Back, You've been missed so much."}
            </Text>

            <CustomTextInput
              title={languageData?.username_or_email || 'Username or Email'}
              placeholder={
                languageData?.username_placeholder ||
                'Enter your username or email '
              }
              value={inputs.userName}
              onChangeText={text => handleOnchange(text, 'userName')}
              errorMessage={errors.userName}
              onFocus={() => handleError('', 'userName')}
              ref={userNameref}
              returnKeyType="next"
              style={[styles.inputSpacing, isTablet && styles.tabletInput]}
              onSubmitEditing={() => passwordref.current?.focus()}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              maxLength={30}
            />

            <CustomTextInput
              title={languageData?.password || 'Password'}
              placeholder={
                languageData?.enter_password || 'Enter your password'
              }
              value={inputs.password}
              onChangeText={text => handleOnchange(text, 'password')}
              errorMessage={errors.password}
              onFocus={() => handleError('', 'password')}
              ref={passwordref}
              returnKeyType="done"
              secureTextEntry={true}
              style={[styles.inputSpacing, isTablet && styles.tabletInput]}
              onSubmitEditing={handelValidate}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={15}
            />

            <View style={styles.rememberMeContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsRememberMe(!isRememberMe)}
                style={styles.checkboxContainer}
              >
                <CustomVectorIcons
                  name={isRememberMe ? 'checkbox-active' : 'checkbox-passive'}
                  iconSet="Fontisto"
                  size={scaleFont(18)}
                  color={isRememberMe ? theme.themeColor : theme.iconColor}
                />
                <Text style={styles.rememberMeText}>
                  {languageData?.remember_me || 'Remember me'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>
                  {languageData?.forgot_password || 'Forgot Password?'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms and Conditions - Mandatory */}
            <TouchableOpacity
              style={[
                styles.termsContainer,
                isTablet && styles.tabletTermsContainer,
                termsError ? styles.termsErrorBorder : null,
              ]}
              activeOpacity={0.7}
              onPress={toggleTermsAcceptance}
            >
              <View style={styles.termsCheckboxContainer}>
                <CustomVectorIcons
                  name={
                    isTermsAccepted ? 'checkbox-active' : 'checkbox-passive'
                  }
                  iconSet="Fontisto"
                  size={scaleFont(18)}
                  color={isTermsAccepted ? theme.themeColor : theme.iconColor}
                />
              </View>
              <View style={styles.termsTextContainer}>
                {/* <Text
                  style={[styles.termsText, isTablet && styles.tabletTermsText]}
                >
                  By logging in you agree to our{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={e => {
                      e.stopPropagation();
                      navigation.navigate('TermsAndConditionsScreen');
                    }}
                  >
                    Terms and Conditions
                  </Text>{' '}
                  and{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={e => {
                      e.stopPropagation();
                      navigation.navigate('TermsAndConditionsScreen');
                    }}
                  >
                    Privacy Policy
                  </Text>
                </Text> */}
                <Text style={styles.termsText}>
                  {languageData?.agree_terms ||
                    'By logging in you agree to our'}{' '}
                  <Text style={styles.termsLink}>
                    {languageData?.terms_conditions || 'Terms and Conditions'}
                  </Text>{' '}
                  {languageData?.and || 'and'}{' '}
                  <Text style={styles.termsLink}>
                    {languageData?.privacy_policy || 'Privacy Policy'}
                  </Text>
                </Text>

                {termsError ? (
                  <Text style={styles.termsErrorText}>{termsError}</Text>
                ) : null}
              </View>
            </TouchableOpacity>

            <View>
              <CustomButton
                styleBtn={{ width: '100%' }}
                text={languageData?.login || 'Login'}
                backgroundColor={theme.themeColor}
                onPress={handelValidate}
                // height={scaleVertical(45)}
                style={[
                  styles.loginButton,
                  isTablet && styles.tabletLoginButton,
                  !isTermsAccepted && styles.disabledButton,
                ]}
                disabled={!isTermsAccepted}
              />
            </View>

            {/* <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text
                style={[
                  styles.dividerText,
                  isTablet && styles.tabletDividerText,
                ]}
              >
                Or
              </Text>
              <View style={styles.dividerLine} />
            </View> */}

            {/* <TouchableOpacity
              style={[
                styles.socialButton,
                isTablet && styles.tabletSocialButton,
              ]}
            >
              <CustomVectorIcons
                name="google"
                iconSet="AntDesign"
                size={isTablet ? moderateScale(24) : moderateScale(20)}
                color={theme.themeColor}
              />
            </TouchableOpacity> */}
          </View>

          <View style={styles.registerContainer}>
            <Text
              style={[
                styles.registerText,
                isTablet && styles.tabletRegisterText,
              ]}
            >
              Don't have an account?{' '}
              <Text
                style={styles.registerLink}
                onPress={() => props.navigation.navigate('SignUp')}
              >
                Register
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessErrorPopup
        ok={false}
        popupOpen={successModalState}
        type={'Success'}
        closePopup={() => {
          setsuccessModalState(false);
        }}
        title={'Congratulations'}
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
        title={'Sorry'}
        message={errorMessage}
      />

      <CustomLoader visible={Loader} />
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingBottom: moderateVerticalScale(30),
      paddingHorizontal: isTablet ? moderateScale(40) : 0,
    },
    contentContainer: {
      backgroundColor: theme.mainBackground,
      borderRadius: moderateScale(20),
      marginHorizontal: isTablet ? moderateScale(60) : moderateScale(15),
      padding: isTablet ? moderateScale(40) : moderateScale(20),
      marginTop: isTablet
        ? moderateVerticalScale(40)
        : moderateVerticalScale(30),
      width: isTablet ? '80%' : 'auto',
      alignSelf: 'center',
      maxWidth: 600,
    },
    title: {
      fontSize: isTablet ? moderateScale(28) : moderateScale(22),
      fontFamily: FontFamily.KhulaExtraBold,
      color: theme.text,
      textAlign: isTablet ? 'center' : 'left',
    },
    subtitle: {
      fontSize: isTablet ? moderateScale(16) : moderateScale(13),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.textSub,
      marginBottom: isTablet
        ? moderateVerticalScale(5)
        : moderateVerticalScale(-10),
      textAlign: isTablet ? 'center' : 'left',
    },
    inputSpacing: {
      marginTop: moderateVerticalScale(25),
    },
    tabletInput: {
      marginTop: moderateVerticalScale(30),
    },
    rememberMeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: moderateVerticalScale(20),
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rememberMeText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      marginLeft: moderateScale(8),
    },
    tabletRememberMeText: {
      fontSize: moderateScale(16),
    },
    forgotPasswordText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },
    tabletForgotPasswordText: {
      fontSize: moderateScale(16),
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: moderateVerticalScale(15),
      marginBottom: moderateVerticalScale(5),
      paddingHorizontal: moderateScale(5),
      paddingVertical: moderateVerticalScale(15),
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: 'transparent',
    },
    tabletTermsContainer: {
      marginTop: moderateVerticalScale(20),
      marginBottom: moderateVerticalScale(10),
    },
    termsErrorBorder: {
      borderColor: theme.themeRed,
      backgroundColor: `${theme.themeRed}10`,
    },
    termsCheckboxContainer: {
      marginRight: moderateScale(10),
      paddingTop: moderateVerticalScale(2),
    },
    termsTextContainer: {
      flex: 1,
    },
    termsText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      lineHeight: moderateVerticalScale(18),
    },
    tabletTermsText: {
      fontSize: moderateScale(14),
      lineHeight: moderateVerticalScale(22),
    },
    termsLink: {
      color: theme.themeColor,
      fontFamily: FontFamily.KhulaSemiBold,
      textDecorationLine: 'underline',
    },
    termsErrorText: {
      fontSize: moderateScale(11),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.themeRed,
      marginTop: moderateVerticalScale(5),
      marginLeft: moderateScale(2),
    },
    loginButton: {
      alignSelf: 'center',
      borderRadius: moderateScale(12),
      marginTop: moderateVerticalScale(25),
      width: '100%',
      maxWidth: 400,
    },
    tabletLoginButton: {
      marginTop: moderateVerticalScale(30),
      height: moderateVerticalScale(55),
    },
    disabledButton: {
      opacity: 0.6,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: moderateVerticalScale(25),
    },
    dividerLine: {
      flex: 1,
      height: moderateScale(1.5),
      backgroundColor: theme.borderColorDynamic || '#E5E5E5',
    },
    dividerText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      marginHorizontal: moderateScale(10),
    },
    tabletDividerText: {
      fontSize: moderateScale(16),
    },
    socialButton: {
      backgroundColor: theme.themeLight,
      width: moderateScale(50),
      height: moderateScale(50),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: moderateScale(25),
      alignSelf: 'center',
      elevation: 3,
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    tabletSocialButton: {
      width: moderateScale(60),
      height: moderateScale(60),
      borderRadius: moderateScale(30),
    },
    registerContainer: {
      marginTop: moderateVerticalScale(5),
      alignItems: 'center',
      paddingBottom: moderateVerticalScale(20),
    },
    registerText: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      textAlign: 'center',
    },
    tabletRegisterText: {
      fontSize: moderateScale(15),
    },
    registerLink: {
      fontFamily: FontFamily.KhulaExtraBold,
      color: theme.themeColor,
    },
  });

export default LoginScreen;
