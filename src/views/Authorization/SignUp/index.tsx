/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useRef } from 'react';
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
  useWindowDimensions,
  Image,
  TextInput,
  FlatList,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import CountryCustomTextInput from '@components/CountryCustomTextInput';
import { showSuccessToast } from '@utils/CustomToast';
import CustomHeader from '@components/CustomHeader';
import CustomVectorIcons from '@components/CustomVectorIcons';
import { useSelector } from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import IMAGES from '@assets/images';
import { InputBox } from './counterycode';
import { heightPercentageToDP } from 'react-native-responsive-screen';

const SignupScreen = (props: any) => {
  const { navigation } = props;
  const { theme } = useTheme();

  // Use useWindowDimensions for responsive behavior on orientation change
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= 768;
  const isSmallPhone = width < 375;
  const languageData = useSelector((state: any) => state?.data?.languageData);

  // Create styles dynamically based on current dimensions
  const styles = getStyles(
    theme,
    width,
    height,
    isLandscape,
    isTablet,
    isSmallPhone,
  );
  const refRBSheet1 = useRef<any>(null);

  const [Loader, setLoader] = useState(false);
  const [FailedModalState, setFailedModalState] = useState(false);
  const [errorMessage, seterrorMessage] = useState('');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'India',
    dialCode: '+91',
    shortName: 'IN',
    emoji: '🇮🇳',
  });
  const [countrydata, setcountrydata] = useState([]);
  const [originalCountryData, setOriginalCountryData] = useState([]);
  const [countryApiAvailable, setCountryApiAvailable] = useState(true);
  const [countryCode] = useState('+91');
  const [inputs, setInputs] = useState({
    //  fullName: '',
    userName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    //  fullName: '',
    userName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [countryDetails, setcountryDetails] = useState<any>({
    name: 'India',
    dialCode: '+91',
    shortName: 'IN',
    emoji: '🇮🇳',
  });
  // Responsive scaling functions using current dimensions
  const scaleFont = (size: number) => {
    if (isSmallPhone) return moderateScale(size * 0.9);
    if (isTablet) return moderateScale(size * 1.2);
    return moderateScale(size);
  };

  const scaleVertical = (size: number) => {
    if (isSmallPhone) return moderateVerticalScale(size * 0.85);
    if (isTablet) return moderateVerticalScale(size * 1.1);
    return moderateVerticalScale(size);
  };

  // Fetch countries on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await apiRequest(ApiURL.getCountry, 'GET', null, false);
      console.log('✅ Countries API Response:', res);

      if (!res.error) {
        let datatemp = res.data || [];
        // let convertdata = datatemp.map((ele: any) => ({
        //   value: ele.dialCode,
        //   name: ele.name,
        //   id: ele._id,
        // }));
        datatemp.sort((a: any, b: any) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
        setcountrydata(datatemp);
        setOriginalCountryData(datatemp);
      }

      // if (!res?.error && res?.data) {
      //   setCountries(res.data);
      //   setCountryApiAvailable(true);

      //   // Find and set India as default
      //   const india = res.data.find(
      //     country => country.shortName === 'IN' || country.name === 'India',
      //   );
      //   if (india) {
      //     setSelectedCountry(india);
      //   }
      // } else {
      //   console.log('⚠️ Failed to fetch countries:', res?.message);
      //   setCountryApiAvailable(false);
      // }
    } catch (error) {
      console.log('🔥 Countries API Exception:', error);
      setCountryApiAvailable(false);
    }
  };
  function cityFilter(ele: any) {
    if (ele) {
      const lowerEle = ele.toLowerCase();
      const filteredItems = originalCountryData.filter(
        (item: any) =>
          item?.name?.toLowerCase().includes(lowerEle) ||
          item?.value?.toLowerCase().includes(lowerEle),
      );

      setcountrydata(filteredItems);
    } else {
      setcountrydata(originalCountryData); // reset full list
    }
  }
  // Add this helper function to render titles with asterisks
  const renderTitle = (title: string) => {
    return (
      <Text>
        {title}
        <Text style={styles.required}> *</Text>
      </Text>
    );
  };

  // Validation functions
  const validateEmail = (email: string) => {
    const emailPattern =
      /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(-?[a-zA-Z0-9]+)*(\.[a-zA-Z]{2,})$/;
    return emailPattern.test(email);
  };

  //   const validateFullName = (fullName: string) => {
  //   const fullNamePattern = /^[a-zA-Z\s.'-]{2,50}$/;
  //   return fullNamePattern.test(fullName.trim());
  // };

  const validateUsername = (username: string) => {
    const usernamePattern = /^[a-zA-Z0-9_.]+$/;
    return usernamePattern.test(username);
  };

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return cleanPhone.length >= 6 && cleanPhone.length <= 15;
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
      if (formattedText.length > 20) {
        return;
      }
    }

    if (input === 'email') {
      formattedText = text.trim();
      if (formattedText.length > 50) {
        return;
      }
    }

    if (input === 'phone') {
      formattedText = text.replace(/[^0-9]/g, '');
      if (formattedText.length > 15) {
        formattedText = formattedText.substring(0, 15);
      }
    }

    if (input === 'password' || input === 'confirmPassword') {
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

  const handleCountryChange = (country: any) => {
    setSelectedCountry(country);
  };

  const handelValidate = () => {
    Keyboard.dismiss();
    let isValid = true;

    // Clear previous errors
    setTermsError('');

    /* Comment out Full Name validation until backend is ready
    // Full Name validation
    if (!inputs.fullName.trim()) {
      handleError('Please enter your full name', 'fullName');
      isValid = false;
    } else if (!validateFullName(inputs.fullName)) {
      handleError(
        'Full name should contain only letters, spaces, dots, apostrophes and hyphens (2-50 characters)',
        'fullName',
      );
      isValid = false;
    } */

    // Username validation
    if (!inputs.userName.trim()) {
      handleError(
        languageData?.username_required || 'Please enter a username',
        'userName',
      );

      isValid = false;
    } else if (!validateUsername(inputs.userName)) {
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

    // Email validation
    if (!inputs.email.trim()) {
      handleError('Please enter an email address', 'email');
      isValid = false;
    } else if (!validateEmail(inputs.email)) {
      handleError('Please enter a valid email address', 'email');
      isValid = false;
    }

    // Phone validation
    if (!inputs.phone.trim()) {
      handleError('Please enter a phone number', 'phone');
      isValid = false;
    } else if (!validatePhone(inputs.phone)) {
      handleError(
        `Please enter a valid phone number for ${selectedCountry.name}`,
        'phone',
      );
      isValid = false;
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

    // Confirm Password validation
    if (!inputs.confirmPassword.trim()) {
      handleError('Please confirm your password', 'confirmPassword');
      isValid = false;
    } else if (inputs.password !== inputs.confirmPassword) {
      handleError(
        languageData?.password_mismatch || 'Passwords do not match',
        'confirmPassword',
      );

      isValid = false;
    }

    // Terms & Conditions validation
    if (!isTermsAccepted) {
      setTermsError('You must accept the Terms and Conditions to continue');
      isValid = false;
    }

    if (isValid) {
      handleSignup();
    }
  };

  function handleStates() {
    // handleError('', 'fullName');
    handleError('', 'userName');
    handleError('', 'email');
    handleError('', 'phone');
    handleError('', 'password');
    handleError('', 'confirmPassword');
    setTermsError('');
    setIsTermsAccepted(false);
    // handleOnchange('', 'fullName');
    handleOnchange('', 'userName');
    handleOnchange('', 'email');
    handleOnchange('', 'phone');
    handleOnchange('', 'password');
    handleOnchange('', 'confirmPassword');
  }

  async function handleSignup() {
    setLoader(true);

    // const payload = {
    //   username: inputs.userName,
    //   email: inputs.email,
    //   password: inputs.password,
    //   confirmPassword: inputs.confirmPassword,
    //   countryCode: selectedCountry.dialCode,
    //   countryName: selectedCountry.name,
    //   phoneNumber: inputs.phone,
    //   // termsAccepted: isTermsAccepted,
    //   // fullName: inputs.fullName,
    // };
    const payload = {
      username: inputs.userName,
      email: inputs.email,
      password: inputs.password,
      confirmPassword: inputs.confirmPassword,

      countryCode: {
        name: countryDetails.name,
        dialCode: countryDetails.dialCode,
        shortName: countryDetails.shortName,
        emoji: countryDetails.emoji,
      },

      phoneNumber: inputs.phone,
    };

    // const payload = {
    //   username: inputs.userName,
    //   email: inputs.email,
    //   password: inputs.password,
    //   confirmPassword: inputs.confirmPassword,
    //   countryCode: {
    //     name: 'India',
    //     dialCode: '+91',
    //     shortName: 'IN',
    //     emoji: '🇮🇳',
    //   },
    //   phoneNumber: inputs.phone,
    // };

    console.log('payloadSignup', payload);

    try {
      const res = await apiRequest(ApiURL.register, 'POST', payload, false);
      console.log('✅ Signup API Response:', res);
      setLoader(false);

      if (!res?.error) {
        handleStates();
        showSuccessToast(res?.message);
        setLoader(false);
        navigation.navigate('OTPVerify', { resData: res?.data, payload });
      } else {
        const errorMsg =
          res?.message || 'Registration failed. Please try again.';
        seterrorMessage(errorMsg);
        setFailedModalState(true);
      }
    } catch (error: any) {
      console.log('🔥 Signup API Exception:', error);
      setLoader(false);
      seterrorMessage(error.message || 'Unexpected error occurred');
      setFailedModalState(true);
    }
  }

  // Adjust keyboard offset for landscape
  const getKeyboardVerticalOffset = () => {
    if (Platform.OS === 'ios') {
      if (isLandscape) {
        return isTablet ? 60 : 40;
      }
      return isTablet ? 100 : 80;
    }
    return 0;
  };

  return (
    <SafeAreaView style={{ backgroundColor: theme.background, flex: 1 }}>
      <StatusBar
        backgroundColor={theme.statusBarColor}
        barStyle={'dark-content'}
      />

      <CustomHeader showBackButton={true} showNotifications={false} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={getKeyboardVerticalOffset()}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          // Enable bouncing only in portrait mode
          bounces={!isLandscape}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.title}>
              {languageData?.parent_registration || 'Parent Registration'}
            </Text>

            {/* Username Input */}
            <CustomTextInput
              title={renderTitle(languageData?.username || 'Username')}
              placeholder={
                languageData?.username_placeholder || 'david_smith_13456'
              }
              value={inputs.userName}
              onChangeText={text => handleOnchange(text, 'userName')}
              errorMessage={errors.userName}
              onFocus={() => handleError('', 'userName')}
              style={[styles.inputSpacing]}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />

            {/* Full Name Input - Comment this section until backend is ready
            <CustomTextInput
              title="Full Name"
              placeholder="David Smith"
              value={inputs.fullName}
              onChangeText={text => handleOnchange(text, 'fullName')}
              errorMessage={errors.fullName}
              onFocus={() => handleError('', 'fullName')}
              style={[styles.inputSpacing, isTablet && styles.tabletInput]}
              autoCapitalize="words"
              maxLength={50}
            />
            */}

            {/* Email Address Input */}
            <CustomTextInput
              title={renderTitle(
                languageData?.email_address || 'Email Address',
              )}
              placeholder={
                languageData?.email_placeholder || 'davidsmith@gmail.com'
              }
              value={inputs.email}
              onChangeText={text => handleOnchange(text, 'email')}
              errorMessage={errors.email}
              onFocus={() => handleError('', 'email')}
              keyboardType="email-address"
              style={[styles.inputSpacing]}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={30}
            />

            {/* Phone Number Input with Country Selection */}

            <View style={{ marginTop: 10 }}>
              <Text
                style={{
                  fontSize: moderateScale(14),
                  fontFamily: FontFamily.KhulaSemiBold,
                  marginBottom: moderateScale(2),
                  color: theme.text,
                }}
              >
                {languageData?.enter_phone_number_with_country_code ||
                  'Enter your phone number'}
              </Text>
              {/* <InputBox
                onPressCountryCode={() => refRBSheet1.current.open()}
                counterySelect={
                  countryDetails.dialCode
                    ? countryDetails.dialCode
                    : countryCode
                }
                placeholder="Enter mobile number"
                value={inputs.phone}
                onChangeText={text => handleOnchange(text, 'phone')}
                onFocus={() => handleError('', 'phone')}
                maxLength={15}
                error={errors.phone}
                keyboardType="phone-pad"
              /> */}
              <InputBox
                onPressCountryCode={() => refRBSheet1.current.open()}
                counterySelect={countryDetails} // 🔥 FULL OBJECT
                placeholder="Enter mobile number"
                value={inputs.phone}
                onChangeText={text => handleOnchange(text, 'phone')}
                onFocus={() => handleError('', 'phone')}
                maxLength={15}
                error={errors.phone}
                keyboardType="phone-pad"
              />
            </View>
            {/* Phone Number Input with Country Selection */}
            {/* <CountryCustomTextInput
              title={languageData?.phone_number || 'Phone Number'}
              placeholder={
                languageData?.phone_placeholder || 'Enter phone number'
              }
              value={inputs.phone}
              keyboardType="phone-pad"
              maxLength={15}
              onChangeText={text => handleOnchange(text, 'phone')}
              errorMessage={errors.phone}
              onFocus={() => handleError('', 'phone')}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              style={[styles.inputSpacing]}
              selectedCountry={selectedCountry}
              onCountryChange={handleCountryChange}
              countries={countries}
              countryApiAvailable={countryApiAvailable}
            /> */}

            {/* Password Input */}
            <CustomTextInput
              title={renderTitle(
                languageData?.enter_password || 'Enter Password',
              )}
              placeholder={languageData?.password_placeholder || 'Password'}
              value={inputs.password}
              onChangeText={text => handleOnchange(text, 'password')}
              errorMessage={errors.password}
              onFocus={() => handleError('', 'password')}
              secureTextEntry={true}
              style={[styles.inputSpacing]}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={15}
            />

            {/* Confirm Password Input */}

            <CustomTextInput
              title={renderTitle(
                languageData?.confirm_password || 'Confirm Password',
              )}
              placeholder={
                languageData?.confirm_password_placeholder ||
                'Confirm your password'
              }
              value={inputs.confirmPassword}
              onChangeText={text => handleOnchange(text, 'confirmPassword')}
              errorMessage={errors.confirmPassword}
              onFocus={() => handleError('', 'confirmPassword')}
              secureTextEntry={true}
              style={[styles.inputSpacing]}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={15}
            />

            {/* Terms & Conditions Checkbox */}
            <TouchableOpacity
              style={[
                styles.termsContainer,
                termsError ? styles.termsErrorBorder : null,
              ]}
              activeOpacity={0.7}
              onPress={toggleTermsAcceptance}
            >
              <View style={styles.checkboxContainer}>
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
                {/* <Text style={styles.termsText}>
                  I agree to the{' '}
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
                  {languageData?.agree_to || 'I agree to the'}{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={e => {
                      e.stopPropagation();
                      navigation.navigate('TermsAndConditionsScreen');
                    }}
                  >
                    {languageData?.terms_and_conditions ||
                      'Terms and Conditions'}
                  </Text>{' '}
                  {languageData?.and || 'and'}{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={e => {
                      e.stopPropagation();
                      navigation.navigate('PrivacyPolicyScreen');
                    }}
                  >
                    {languageData?.privacy_policy || 'Privacy Policy'}
                  </Text>
                </Text>

                {termsError ? (
                  <Text style={styles.errorText}>{termsError}</Text>
                ) : null}
              </View>
            </TouchableOpacity>

            {/* Signup Button */}
            <View>
              <CustomButton
                width={'100%'}
                text={'Register'}
                backgroundColor={theme.themeColor}
                onPress={handelValidate}
                height={scaleVertical(45)}
                styleBtn={{ width: '100%' }}
                style={[
                  styles.signupButton,
                  !isTermsAccepted && styles.disabledButton,
                ]}
                disabled={!isTermsAccepted}
              />
            </View>
          </View>

          {/* 'Already have an account' Text */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLinkContainer}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomLoader visible={Loader} />
      <SuccessErrorPopup
        ok={true}
        btnText={languageData?.continue || 'Continue'}
        title={languageData?.sorry || 'Sorry'}
        // btnText={'Continue'}
        popupOpen={FailedModalState}
        type={'Error'}
        closePopup={() => setFailedModalState(false)}
        // title={'Sorry'}
        message={errorMessage}
      />

      <RBSheet
        ref={refRBSheet1}
        animationType="slide"
        closeOnDragDown={true}
        closeOnPressMask={false}
        height={600}
        customStyles={{
          wrapper: { backgroundColor: 'rgba(0,0,0, 0.6)' },
          draggableIcon: {
            backgroundColor: 'red',
            width: '20%',
            height: 0,
            borderRadius: 50,
          },
          container: {
            backgroundColor: '#FFF',
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
          },
        }}
      >
        <View
          style={{
            // flex: 1,
            padding: 10,
            backgroundColor: theme.white,
            // marginTop: 40,
          }}
        >
          <TouchableOpacity
            onPress={() => refRBSheet1.current.close()}
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginVertical: 20,
              paddingRight: 15,
              // marginLeft: 10,
              marginRight: 100,
              marginBottom: 20,
            }}
          >
            <Image
              source={IMAGES.Close}
              style={{
                width: 30,
                height: 30,
                resizeMode: 'contain',

                // tintColor: '#000',
              }}
            />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: theme.white,
              borderWidth: 1,
              borderColor: theme.borderColorDynamic,
              padding: 5,
              borderRadius: 5,
              marginTop: 5,
              marginHorizontal: 10,
              marginBottom: 20,
            }}
          >
            <TextInput
              style={{
                backgroundColor: '#FFF',
                width: '90%',
                height: 40,
                fontSize: 16,
                fontWeight: '600',
                color: '#000',
              }}
              placeholder={'Search'}
              onChangeText={txt => cityFilter(txt)}
              placeholderTextColor={'#000'}
            />
          </View>

          <ScrollView style={{ marginHorizontal: 10 }}>
            {countrydata && countrydata.length > 0 ? (
              <FlatList
                data={countrydata}
                keyExtractor={(_item, index) => index.toString()}
                contentContainerStyle={{}}
                renderItem={({ item }: { item: any }) => (
                  // <TouchableOpacity
                  //   onPress={() => {
                  //     setcountryDetails(item);
                  //     refRBSheet1.current.close();
                  //     cityFilter('');
                  //   }}
                  //   style={{
                  //     flexDirection: 'row',
                  //     alignItems: 'center',
                  //     justifyContent: 'space-between',
                  //     marginVertical: 5,
                  //     height: 50,
                  //     borderWidth: 1,
                  //     borderRadius: 5,
                  //     borderColor: theme.borderColorDynamic,
                  //     backgroundColor: theme.white,
                  //   }}
                  // >
                  //   <View
                  //     style={{ flexDirection: 'row', alignItems: 'center' }}
                  //   >
                  //     <View style={{ width: '48%', marginLeft: 20 }}>
                  //       <Text
                  //         style={{
                  //           fontSize: 14,
                  //           color: '#000',
                  //           fontFamily: FontFamily.KhulaSemiBold,
                  //         }}
                  //       >
                  //         {item?.emoji} {item.dialCode}
                  //       </Text>
                  //     </View>
                  //     <View style={{ width: '40%', marginLeft: -20 }}>
                  //       <Text
                  //         style={{
                  //           fontSize: 14,
                  //           color: '#000',
                  //           fontFamily: FontFamily.KhulaBold,
                  //         }}
                  //       >
                  //         {item.name}
                  //       </Text>
                  //     </View>
                  //   </View>
                  // </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setcountryDetails(item);
                      refRBSheet1.current.close();
                      cityFilter('');
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 15,
                      justifyContent: 'space-between',
                      height: 50,
                      borderWidth: 1,
                      borderRadius: 5,
                      borderColor: theme.borderColorDynamic,
                      backgroundColor: theme.white,
                      marginTop: 10,
                    }}
                  >
                    {/* Emoji + Dial Code */}
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#000',
                        fontFamily: FontFamily.KhulaSemiBold,
                        marginRight: 12,
                      }}
                    >
                      {item?.emoji} {item.dialCode}
                    </Text>

                    {/* Country Name */}
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        textAlign: 'center',
                        // flex: 1,
                        fontSize: 14,
                        color: '#000',
                        fontFamily: FontFamily.KhulaBold,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#000',
                        fontFamily: FontFamily.KhulaSemiBold,
                        marginRight: 12,
                      }}
                    ></Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text
                style={{
                  fontSize: 20,
                  color: '#FFF',
                  fontFamily: FontFamily.KhulaBold,
                }}
              >
                No List Available
              </Text>
            )}
          </ScrollView>
          {/* <View style={{ marginVertical: 80 }} /> */}
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

// Create styles function that accepts dynamic parameters
const getStyles = (
  theme: any,
  width: number,
  height: number,
  isLandscape: boolean,
  isTablet: boolean,
  isSmallPhone: boolean,
) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingBottom: isLandscape
        ? moderateVerticalScale(20)
        : moderateVerticalScale(40),
      paddingHorizontal: isLandscape
        ? moderateScale(10) // Less padding in landscape
        : isTablet
        ? moderateScale(20)
        : isSmallPhone
        ? moderateScale(10)
        : moderateScale(15),
      minHeight: height, // Ensure scroll view takes full height
    },
    contentContainer: {
      backgroundColor: theme.mainBackground,
      borderRadius: moderateScale(20),
      marginHorizontal: isLandscape
        ? moderateScale(15) // Reduced margin in landscape
        : isTablet
        ? moderateScale(30)
        : isSmallPhone
        ? moderateScale(10)
        : moderateScale(15),
      padding: isLandscape
        ? moderateScale(20) // Reduced padding in landscape
        : isTablet
        ? moderateScale(30)
        : isSmallPhone
        ? moderateScale(15)
        : moderateScale(20),
      marginTop: isLandscape
        ? moderateVerticalScale(5)
        : moderateVerticalScale(5),
      width: '100%',
      alignSelf: 'center',
      maxWidth: isLandscape
        ? 600 // Smaller max width in landscape
        : isTablet
        ? 700
        : 500,
      minWidth: 280,
      // In landscape, ensure container doesn't take full width
      flexShrink: isLandscape ? 1 : 0,
    },
    title: {
      fontSize: isLandscape
        ? moderateScale(20) // Smaller font in landscape
        : isTablet
        ? moderateScale(28)
        : isSmallPhone
        ? moderateScale(18)
        : moderateScale(22),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      textAlign: 'center',
      marginBottom: isLandscape
        ? moderateVerticalScale(8)
        : moderateVerticalScale(2),
    },
    required: {
      color: theme.themeRed,
      fontSize: isTablet ? moderateScale(18) : moderateScale(16),
    },
    inputSpacing: {
      marginTop: isLandscape
        ? moderateVerticalScale(10) // Reduced spacing in landscape
        : moderateVerticalScale(isSmallPhone ? 12 : 15),
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: isLandscape
        ? moderateVerticalScale(8)
        : moderateVerticalScale(isSmallPhone ? 10 : 15),
      marginBottom: isLandscape
        ? moderateVerticalScale(3)
        : moderateVerticalScale(5),
      paddingHorizontal: moderateScale(isSmallPhone ? 3 : 5),
      paddingVertical: isLandscape
        ? moderateVerticalScale(6)
        : moderateVerticalScale(isSmallPhone ? 8 : 10),
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: 'transparent',
    },
    termsErrorBorder: {
      borderColor: theme.error,
      backgroundColor: `${theme.error}10`,
    },
    checkboxContainer: {
      marginRight: moderateScale(isSmallPhone ? 8 : 10),
      paddingTop: moderateVerticalScale(2),
    },
    termsTextContainer: {
      flex: 1,
      flexShrink: 1,
    },
    termsText: {
      fontSize: isLandscape
        ? moderateScale(10) // Smaller text in landscape
        : moderateScale(isSmallPhone ? 10 : 12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      lineHeight: isLandscape
        ? moderateVerticalScale(14)
        : moderateVerticalScale(isSmallPhone ? 16 : 18),
      flexWrap: 'wrap',
    },
    termsLink: {
      color: theme.themeColor,
      fontFamily: FontFamily.KhulaSemiBold,
      textDecorationLine: 'underline',
    },
    errorText: {
      fontSize: moderateScale(isSmallPhone ? 9 : 11),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.error,
      marginTop: moderateVerticalScale(3),
      marginLeft: moderateScale(2),
    },
    signupButton: {
      alignSelf: 'center',
      borderRadius: moderateScale(12),
      marginTop: isLandscape
        ? moderateVerticalScale(10)
        : moderateVerticalScale(isSmallPhone ? 12 : 20),
      width: '100%',
      maxWidth: 400,
    },
    disabledButton: {
      opacity: 0.6,
    },
    loginLinkContainer: {
      marginTop: isLandscape
        ? moderateVerticalScale(10)
        : moderateVerticalScale(isSmallPhone ? 15 : 20),
      alignItems: 'center',
      paddingBottom: isLandscape
        ? moderateVerticalScale(10)
        : moderateVerticalScale(20),
      paddingHorizontal: moderateScale(15),
    },
    loginText: {
      fontSize: isLandscape
        ? moderateScale(11)
        : moderateScale(isSmallPhone ? 12 : 13),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      textAlign: 'center',
    },
    loginLink: {
      fontFamily: FontFamily.KhulaExtraBold,
      color: theme.themeColor,
    },
  });

export default SignupScreen;
