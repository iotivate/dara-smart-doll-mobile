/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useRef, useState } from 'react';
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
  FlatList,
} from 'react-native';
import { useTheme } from '@theme/themeContext';
import CustomLoader from '@utils/CustomLoader';
import FontFamily from '@assets/fonts/FontFamily';
import { moderateScale } from 'react-native-size-matters';
import CustomButton from '@components/CustomButton';
import createBasicStyles from 'styles';
import CustomTextInput from '@components/CustomTextInput';
import SuccessErrorPopup from '@utils/SuccessErrorPopup';
import CustomVectorIcons from '@components/CustomVectorIcons';
import CustomImageComponent from '@components/CustomImageComponent';
import RBSheet from 'react-native-raw-bottom-sheet';
import IMAGES from '@assets/images'; // Assuming IMAGES.bg_card_primary or similar is available
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import CountryCustomTextInput from '@components/CountryCustomTextInput';
import { showSuccessToast } from '@utils/CustomToast';
import CustomLucideIcon from '@components/CustomLucideIcon';
import FastImage from '@d11/react-native-fast-image';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '@components/CustomHeader';

interface CountryDetails {
  name?: string;
  dialCode?: string;
  shortName?: string;
  emoji?: string;
}

const EditNewProfileScreen = (props: any) => {
  const { navigation } = props;
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme);
  const basicStyles = createBasicStyles(theme);
  // const token = props.route?.params?.userToken;

  const [Loader, setLoader] = useState(false);
  const [avatarsData, setAvatarsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [FailedModalState, setFailedModalState] = useState(false);
  const [errorMessage, seterrorMessage] = useState('');
  const refRBSheet = useRef<{ open: () => void; close: () => void } | null>(
    null,
  );

  const [inputs, setInputs] = useState({
    userName: '',
  });

  const [errors, setErrors] = useState({
    userName: '',
  });

  const handleOnchange = (text: any, input: any) => {
    setInputs(prevState => ({ ...prevState, [input]: text }));
  };

  const handleError = (error: any, input: any) => {
    setErrors(prevState => ({ ...prevState, [input]: error }));
  };
  const openRBSheet = useCallback(() => {
    refRBSheet.current?.open();
  }, []);

  const handelValidate = () => {
    Keyboard.dismiss();
    let isValid = true;

    if (!inputs.userName.trim()) {
      handleError('Please enter a username', 'userName');
      isValid = false;
    }

    if (isValid) {
      // handleSignup();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAvatars();
    }, []),
  );

  async function fetchAvatars() {
    setLoading(true);

    try {
      const res = await apiRequest(
        ApiURL.fetchAvatarsProfiles,
        'GET',
        null,
        true,
      );

      setLoading(false);

      console.log('apirrr', res);

      if (!res?.error) {
        setAvatarsData(res?.data?.list);
      } else {
        const errorMsg =
          res?.message || 'Registration failed. Please try again.';
        seterrorMessage(errorMsg);
        setFailedModalState(true);
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoading(false);
      seterrorMessage(error.message || 'Unexpected error occurred');
      setFailedModalState(true);
    }
  }

  //   async function handleSignup() {
  //     setLoader(true);

  //     const payload = {
  //       username: inputs.userName,
  //       email: inputs.email,
  //       password: inputs.password,
  //       confirmPassword: inputs.confirmPassword,
  //       countryCode: {
  //         name: 'India',
  //         dialCode: '+91',
  //         shortName: 'IN',
  //         emoji: '🇮🇳',
  //       },
  //       phoneNumber: inputs.phone,
  //     };

  //     try {
  //       const res = await apiRequest(ApiURL.register, 'POST', payload, false);
  //       console.log('✅ Signup API Response:', res);
  //       setLoader(false);

  //       if (!res?.error) {

  //         showSuccessToast(res?.message);

  //         setLoader(false);
  //         navigation.navigate('OTPVerify', { resData: res?.data, payload });
  //       } else {
  //         const errorMsg =
  //           res?.message || 'Registration failed. Please try again.';
  //         seterrorMessage(errorMsg);
  //         setFailedModalState(true);
  //       }
  //     } catch (error: any) {
  //       console.log('🔥 Signup API Exception:', error);
  //       setLoader(false);
  //       seterrorMessage(error.message || 'Unexpected error occurred');
  //       setFailedModalState(true);
  //     }
  //   }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        // backgroundColor={theme.white}
        barStyle={Platform.OS === 'android' ? 'dark-content' : 'dark-content'}
        translucent={true}
      />

      <CustomHeader showBackButton={true} showNotifications={false} />

      <View style={styles.container}>
        <Text style={styles.title}>Create New Profile</Text>

        <View style={styles.profileCard}>
          <View style={[styles.profileIcon]}>
            <CustomImageComponent
              source={IMAGES.user4}
              height={moderateScale(100)}
              width={moderateScale(100)}
              style={{ borderRadius: moderateScale(52) }}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openRBSheet()}
              style={{
                backgroundColor: theme.white,
                padding: moderateScale(5),
                position: 'absolute',
                bottom: moderateScale(-10),
                right: moderateScale(0),
                elevation: 5,
                borderRadius: moderateScale(25),
              }}
            >
              <CustomLucideIcon
                name="PlusIcon"
                color={theme.iconColor}
                size={moderateScale(25)}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.subtitle}>Children's Profile</Text>
        <Text style={styles.description}>
          Designed for children under 12, empowering parents with complete
          control.
        </Text>

        <CustomTextInput
          title="Profile Name"
          placeholder="David Smith"
          value={inputs.userName}
          onChangeText={text => handleOnchange(text, 'userName')}
          errorMessage={errors.userName}
          onFocus={() => handleError('', 'userName')}
          style={styles.inputSpacing}
        />

        <CustomButton
          text={'Save'}
          backgroundColor={theme.themeColor}
          onPress={() => {
            refRBSheet?.current?.close();
          }}
          height={moderateScale(55)}
          style={{
            alignSelf: 'center',
            borderRadius: moderateScale(12),
            marginTop: moderateScale(50),
          }}
        />
      </View>

      <RBSheet
        ref={refRBSheet}
        height={500}
        openDuration={250}
        draggable={true}
        dragOnContent={true}
        closeOnPressMask={true}
        customStyles={{
          container: styles.rbSheetContainer,
        }}
      >
        <View style={styles.rbSheetContent}>
          <View style={styles.rbSheetHeader}>
            <Text style={styles.rbSheetTitle}>Choose Icon</Text>
          </View>

          <FlatList
            data={avatarsData}
            numColumns={4}
            keyExtractor={item => `thumbnail-${item.id}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  margin: moderateScale(5),
                  marginTop: moderateScale(15),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => refRBSheet?.current?.close()}
                activeOpacity={0.7}
              >
                <CustomImageComponent
                  source={item?.url}
                  height={moderateScale(70)}
                  width={moderateScale(70)}
                  style={{
                    borderRadius: moderateScale(52),
                    elevation: 3,
                    overflow: 'hidden',
                  }}
                />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{}}
          />
        </View>
      </RBSheet>

      <CustomLoader visible={Loader} />
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.mainBackground,
      marginHorizontal: 20,
      borderRadius: 10,
    },
    title: {
      fontSize: moderateScale(22),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      //   textAlign: 'center',
      marginVertical: moderateScale(10),
    },

    subtitle: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      textAlign: 'center',
      marginVertical: moderateScale(10),
    },
    description: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
      textAlign: 'center',
      //   marginVertical: moderateScale(10),
    },
    listContainer: {
      paddingVertical: moderateScale(20),
      flexGrow: 1,
    },
    columnWrapper: {
      justifyContent: 'space-between',
      marginBottom: moderateScale(10),
    },
    profileCard: {
      alignItems: 'center',
      marginVertical: moderateScale(20),
    },
    profileIcon: {
      width: moderateScale(100),
      height: moderateScale(100),
      borderRadius: moderateScale(50),
      backgroundColor: theme.themeColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: moderateScale(5),
    },
    kidsProfile: {
      backgroundColor: theme.background,
    },
    newProfile: {
      backgroundColor: theme.background,
    },
    profileName: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      textAlign: 'center',
      marginTop: moderateScale(10),
    },
    inputSpacing: {
      marginTop: moderateScale(20),
    },

    thumbnailsContainer: {
      marginTop: moderateScale(10),
    },
    rbSheetContainer: {
      backgroundColor: theme.mainBackground,
      borderTopLeftRadius: moderateScale(10),
      borderTopRightRadius: moderateScale(10),
    },
    rbSheetContent: {
      marginHorizontal: moderateScale(15),
    },
    rbSheetHeader: {
      marginVertical: moderateScale(20),
      borderBottomWidth: moderateScale(1),
      borderColor: theme.gray,
      paddingBottom: moderateScale(10),
    },
    rbSheetTitle: {
      fontSize: moderateScale(20),
      color: theme.text,
      fontFamily: FontFamily.KhulaBold,
      textAlign: 'center',
    },
  });

export default EditNewProfileScreen;
