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
  Alert,
} from 'react-native';
import { useTheme } from '@theme/themeContext';
import CustomLoader from '@utils/CustomLoader';
import FontFamily from '@assets/fonts/FontFamily';
import { moderateScale } from 'react-native-size-matters';
import CustomButton from '@components/CustomButton';
import createBasicStyles from 'styles';
import CustomTextInput from '@components/CustomTextInput';
import CustomImageComponent from '@components/CustomImageComponent';
import RBSheet from 'react-native-raw-bottom-sheet';
import IMAGES from '@assets/images'; // Assuming IMAGES.bg_card_primary or similar is available
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { showSuccessToast } from '@utils/CustomToast';
import CustomLucideIcon from '@components/CustomLucideIcon';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '@components/CustomHeader';
import CustomDropdown from '@components/CustomDropdown';
import CustomImageAvatarPopUp from '@components/CustomImageAvatarPopUp';
import { useSelector } from 'react-redux';
import { openImage_Picker } from '@utils/PickerServices';

const AddNewProfileScreen = (props: any) => {
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  const { navigation } = props;
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme);
  // const basicStyles = createBasicStyles(theme);

  const [Loader, setLoader] = useState(false);
  const [avatarsData, setAvatarsData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [FailedModalState, setFailedModalState] = useState(false);
  const [errorMessage, seterrorMessage] = useState('');
  const [fetchAgeData, setfetchAgeData] = useState('');
  const [bleDevices, setBleDevices] = useState<any[]>([]);
  const [selectedBleDevice, setSelectedBleDevice] = useState<any>(null);

  let reduxResponse = useSelector((state: any) => state?.data);
  let { settingsData } = reduxResponse;

  // const languageDropdownData =
  //   settingsData?.DARA_SUPPORTED_LANGUAGES?.map((item: any) => ({
  //     label: item.name,
  //     value: item.code,
  //   })) ?? [];

  const languageDropdownData = [
    {
      label: settingsData?.DARA_DEFAULT_LANGUAGE?.name,
      value: settingsData?.DARA_DEFAULT_LANGUAGE?.code,
    },
    ...(settingsData?.DARA_SUPPORTED_LANGUAGES?.map((item: any) => ({
      label: item.name,
      value: item.code,
    })) ?? []),
  ];

  const refRBSheet = useRef<{ open: () => void; close: () => void } | null>(
    null,
  );
  let manageByRef = React.createRef<any>();
  const openRBSheet = useCallback(() => {
    refRBSheet.current?.open();
  }, []);

  const [visible, setVisible] = useState(false);

  const openPopup = () => setVisible(true);
  const closePopup = () => setVisible(false);

  // const handleConfirm = (option: 'avatar' | 'gallery') => {
  //   if (option === 'avatar') {
  //     openRBSheet();
  //   } else {
  //     console.log('🖼️ Open Image Gallery');
  //   }
  // };

  const handleConfirm = async (option: 'avatar' | 'gallery') => {
    console.log('CONFIRM OPTION 👉', option);

    const selectedOption = option?.toLowerCase();

    if (selectedOption === 'avatar') {
      openRBSheet();
    }

    if (selectedOption === 'gallery') {
      try {
        const image = await openImage_Picker();
        if (image?.path) {
          handleOnchange(image.path, 'userImage');
        }
      } catch (e) {
        console.log('Gallery cancelled');
      }
    }
  };

  const [inputs, setInputs] = useState({
    userImage: '',
    userName: '',
    password: '',
    confirmPassword: '',
    age: '',
    selectedDoll: '',
    gender: '',
    selectedPlaylistContent: '',
  });

  const [errors, setErrors] = useState({
    userNameError: '',
    passwordError: '',
    confirmPasswordError: '',
    ageError: '',
    selectedDollError: '',
    genderError: '',
    selectedPlaylistContentError: '',
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchAvatars();
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      setAgeData(settingsData?.DARA_AGE_RANGES);
    }, [settingsData]),
  );

  const cleanUsername = (text: string): string => {
    // Trim and replace multiple spaces with single space
    return text.trim().replace(/\s+/g, ' ');
  };

  /**
   * Handle input changes with proper cleaning for username
   */
  const handleOnchange = (text: any, input: any) => {
    // Clean username specifically - remove extra spaces
    if (input === 'userName') {
      const cleanedText = cleanUsername(text);
      setInputs(prevState => ({ ...prevState, [input]: cleanedText }));
    } else {
      setInputs(prevState => ({ ...prevState, [input]: text }));
    }
  };

  const handleError = (error: any, input: any) => {
    setErrors(prevState => ({ ...prevState, [input]: error }));
  };

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

      if (!res?.error) {
        setAvatarsData(res?.data?.list);
      } else {
        const errorMsg =
          res?.message || 'Registration failed. Please try again.';
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

  async function fetchAge(item: any) {
    console.log('fetchage log------------------', item);
    setLoading(true);

    try {
      const query = encodeURIComponent(JSON.stringify({ ageRanges: ['3-4'] }));

      const res = await apiRequest(
        `${ApiURL.fetchAge}?query=${query}`,
        'GET',
        null,
        true,
      );

      setLoading(false);

      if (!res?.error) {
        let droupDownData = res?.data?.list;

        let convertedData = droupDownData.map((item: any) => ({
          label: item.title,
          value: item._id,
        }));

        setfetchAgeData(convertedData);
      } else {
        const errorMsg =
          res?.message || 'Registration failed. Please try again.';
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

  const handleValidate = () => {
    Keyboard.dismiss();
    let isValid = true;

    setErrors({
      userNameError: '',
      passwordError: '',
      confirmPasswordError: '',
      ageError: '',
      selectedDollError: '',
      genderError: '',
      selectedPlaylistContentError: '',
    });

    // ✅ Username (string → trim OK)
    const cleanedUsername = (inputs.userName || '').trim();
    if (!cleanedUsername) {
      handleError(
        languageData?.username_error || 'Please enter a username',
        'userNameError',
      );

      isValid = false;
    }

    // ✅ Password
    if (!inputs.password || !inputs.password.trim()) {
      handleError(
        languageData?.password_error || 'Please enter a password',
        'passwordError',
      );

      isValid = false;
    }

    // ✅ Confirm Password
    if (!inputs.confirmPassword || !inputs.confirmPassword.trim()) {
      handleError(
        languageData?.confirm_password_error || 'Please confirm your password',
        'confirmPasswordError',
      );
      isValid = false;
    } else if (inputs.password !== inputs.confirmPassword) {
      handleError(
        languageData?.password_mismatch || 'Passwords do not match',
        'confirmPasswordError',
      );
      isValid = false;
    }

    // ✅ Age (object → NO trim)
    if (!inputs.age) {
      handleError(
        languageData?.age_error || 'Please select age range',
        'ageError',
      );
      isValid = false;
    }

    // ✅ Gender (object/string → NO trim)
    if (!inputs.gender) {
      handleError(
        languageData?.gender_error || 'Please select gender',
        'genderError',
      );
      isValid = false;
    }

    if (
      !inputs.selectedPlaylistContent ||
      inputs.selectedPlaylistContent.length === 0
    ) {
      handleError(
        languageData?.playlist_error || 'Please select playlist content',
        'selectedPlaylistContentError',
      );
      isValid = false;
    }
    //     if (!selectedBleDevice) {
    //   Alert.alert('Error', 'Please select a BLE device');
    //   isValid = false;
    // }

    if (isValid) {
      handleCreateChild();
    }
  };

  async function handleCreateChild() {
    setLoader(true);
    console.log('Creating child...');

    // Clean username before sending to API
    const cleanedUsername = cleanUsername(inputs.userName);

    const payload = {
      username: cleanedUsername,
      password: inputs.password,
      confirmPassword: inputs.confirmPassword,
      avatar: inputs?.userImage || '', // Handle empty avatar
      languagePreference: settingsData?.DARA_DEFAULT_LANGUAGE?.code || 'en',
      ageRange: inputs?.age,
      gender: inputs.gender,
      bleDeviceId: '6902080605cf3bc9adaf02be', // Consider making this dynamic
      assignContentCategories: inputs.selectedPlaylistContent,
      // bleDeviceId: selectedBleDevice?.value,
      // profilePicture: '',
    };

    try {
      const res = await apiRequest(
        ApiURL.createNewChild,
        'POST',
        payload,
        true,
      );
      console.log('API Response: child creation', res);
      setLoader(false);

      if (!res?.error) {
        showSuccessToast(
          res?.message ||
            languageData?.child_create_success ||
            'Child profile created successfully!',
        );

        // Reset form on success
        setInputs({
          userImage: '',
          userName: '',
          password: '',
          confirmPassword: '',
          age: '',
          selectedDoll: '',
          gender: '',
          selectedPlaylistContent: '',
        });

        setLoader(false);

        // Navigate back or show success message
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        const errorMsg = res?.message || 'Request failed. Please try again.';

        // Handle specific validation errors from API
        if (res?.message?.includes('username')) {
          handleError(errorMsg, 'userNameError');
          Alert.alert(languageData?.error || 'Error', errorMsg);
        } else {
          Alert.alert('Error', errorMsg);
        }

        seterrorMessage(errorMsg);
        // setFailedModalState(true);
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoader(false);
      Alert.alert('Error', error.message || 'Network error occurred');
      seterrorMessage(error.message || 'Unexpected error occurred');
      // setFailedModalState(true);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        backgroundColor={theme.transparent}
        barStyle={'light-content'}
      />
      <CustomHeader showBackButton={true} showNotifications={false} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <Text style={styles.title}>
              {languageData?.add_child_title || 'Add Child'}
            </Text>

            <View style={styles.profileCard}>
              <View style={[styles.profileIcon]}>
                <CustomImageComponent
                  source={inputs?.userImage ? inputs?.userImage : IMAGES.user4}
                  height={moderateScale(100)}
                  width={moderateScale(100)}
                  style={{ borderRadius: moderateScale(52) }}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => openPopup()}
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
                    color={theme.themeColor}
                    size={moderateScale(25)}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <CustomTextInput
              title={languageData?.username_label || 'User Name'}
              placeholder={languageData?.username_placeholder || 'Enter name'}
              value={inputs.userName}
              onChangeText={text => handleOnchange(text, 'userName')}
              errorMessage={errors.userNameError}
              onFocus={() => handleError('', 'userNameError')}
              style={styles.inputSpacing}
              maxLength={50} // Limit input length
            />

            <CustomTextInput
              title={languageData?.password_label || 'Password'}
              placeholder={
                languageData?.password_placeholder || 'Enter Password'
              }
              value={inputs.password}
              onChangeText={text => handleOnchange(text, 'password')}
              errorMessage={errors.passwordError}
              onFocus={() => handleError('', 'passwordError')}
              style={styles.inputSpacing}
              secureTextEntry={true}
              maxLength={50} // Limit input length
            />

            <CustomTextInput
              title={languageData?.confirm_password_label || 'Confirm Password'}
              placeholder={
                languageData?.confirm_password_placeholder ||
                'Enter Password Again'
              }
              value={inputs.confirmPassword}
              onChangeText={text => handleOnchange(text, 'confirmPassword')}
              errorMessage={errors.confirmPasswordError}
              onFocus={() => handleError('', 'confirmPasswordError')}
              style={styles.inputSpacing}
              secureTextEntry={true}
              maxLength={50} // Limit input length
            />

            <CustomDropdown
              title={languageData?.age_label || 'Age'}
              placeholder={languageData?.age_placeholder || 'Select Age Range'}
              titleStyle={{
                fontSize: moderateScale(14),
                color: theme.text,
                fontFamily: FontFamily.KhulaSemiBold,
              }}
              data={ageData || []}
              value={inputs.age}
              onChange={(item: any) => {
                handleOnchange(item, 'age');
                fetchAge(item);
              }}
              customDropdownContainerStyle={styles.inputSpacing}
              errorMessage={errors?.ageError}
              customDropdownStyle={{
                borderWidth: 1,
                borderColor: errors?.ageError ? theme.themeRed : '#D2D2D26E',
                paddingHorizontal: moderateScale(12),
                marginRight: moderateScale(15),
              }}
              onFocus={() => handleError('', 'ageError')}
              ref={manageByRef}
            />

            <CustomDropdown
              title={languageData?.gender_label || 'Gender'}
              placeholder={languageData?.gender_placeholder || 'Select Gender'}
              titleStyle={{
                fontSize: moderateScale(14),
                color: theme.text,
                fontFamily: FontFamily.KhulaSemiBold,
              }}
              data={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' },
              ]}
              value={inputs.gender}
              onChange={(item: any) => {
                handleOnchange(item, 'gender');
              }}
              customDropdownContainerStyle={styles.inputSpacing}
              errorMessage={errors?.genderError}
              customDropdownStyle={{
                borderWidth: 1,
                borderColor: errors?.genderError ? theme.themeRed : '#D2D2D26E',
                paddingHorizontal: moderateScale(12),
                marginRight: moderateScale(15),
              }}
              onFocus={() => handleError('', 'genderError')}
              ref={manageByRef}
            />

            <CustomDropdown
              title={languageData?.language_label || 'Select language'}
              placeholder={
                languageData?.language_placeholder || 'Select language'
              }
              titleStyle={{
                fontSize: moderateScale(14),
                color: theme.text,
                fontFamily: FontFamily.KhulaSemiBold,
              }}
              data={languageDropdownData}
              value={inputs.selectedDoll}
              valueKey="value"
              labelKey="label"
              // onChange={(item: any) => {
              //   handleOnchange(item.value, 'selectedDoll');
              // }}
              onChange={val => handleOnchange(val, 'selectedDoll')}
              customDropdownContainerStyle={styles.inputSpacing}
              errorMessage={errors?.selectedDollError}
              customDropdownStyle={{
                borderWidth: 1,
                borderColor: errors?.selectedDollError
                  ? theme.themeRed
                  : '#D2D2D26E',
                paddingHorizontal: moderateScale(12),
                marginRight: moderateScale(15),
              }}
              onFocus={() => handleError('', 'selectedDollError')}
              ref={manageByRef}
            />

            <CustomDropdown
              title={languageData?.playlist_label || 'Select Playlist Content'}
              placeholder={
                languageData?.playlist_placeholder || 'Select Playlist Content'
              }
              multiSelect={true}
              titleStyle={{
                fontSize: moderateScale(14),
                color: theme.text,
                fontFamily: FontFamily.KhulaSemiBold,
              }}
              data={fetchAgeData || []}
              value={inputs.selectedPlaylistContent}
              onChange={(item: any) => {
                handleOnchange(item, 'selectedPlaylistContent');
              }}
              customDropdownContainerStyle={styles.inputSpacing}
              errorMessage={errors?.selectedPlaylistContentError}
              customDropdownStyle={{
                borderWidth: 1,
                borderColor: errors?.selectedPlaylistContentError
                  ? theme.themeRed
                  : '#D2D2D26E',
                paddingHorizontal: moderateScale(12),
                marginRight: moderateScale(15),
              }}
              onFocus={() => handleError('', 'selectedPlaylistContentError')}
              ref={manageByRef}
            />
            <CustomDropdown
              title={'Select Device'}
              placeholder={'Select BLE Device'}
              data={bleDevices}
              value={selectedBleDevice}
              valueKey="value"
              labelKey="label"
              onChange={(item: any) => {
                setSelectedBleDevice(item);
              }}
              customDropdownContainerStyle={styles.inputSpacing}
              errorMessage={!selectedBleDevice ? 'Please select device' : ''}
              customDropdownStyle={{
                borderWidth: 1,
                borderColor: !selectedBleDevice ? theme.themeRed : '#D2D2D26E',
                paddingHorizontal: moderateScale(12),
                marginRight: moderateScale(15),
              }}
            />

            <CustomButton
              text={
                Loader
                  ? languageData?.creating_button || 'Creating...'
                  : languageData?.save_button || 'Save'
              }
              backgroundColor={theme.themeColor}
              onPress={() => {
                handleValidate();
              }}
              height={moderateScale(55)}
              style={{
                alignSelf: 'center',
                borderRadius: moderateScale(12),
                marginTop: moderateScale(50),
                marginBottom: moderateScale(30),
              }}
              disabled={Loader}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomImageAvatarPopUp
        visible={visible}
        onDismiss={closePopup}
        onConfirm={handleConfirm}
      />

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
            <Text style={styles.rbSheetTitle}>
              {languageData?.choose_icon_title || 'Choose Icon'}
            </Text>
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
                onPress={() => {
                  handleOnchange(item?.url, 'userImage');
                  refRBSheet?.current?.close();
                }}
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
      marginHorizontal: moderateScale(15),
      marginTop: moderateScale(20),
      borderRadius: 10,
      paddingBottom: moderateScale(20),
    },
    title: {
      fontSize: moderateScale(22),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginVertical: moderateScale(10),
      marginLeft: moderateScale(10),
    },

    description: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
      textAlign: 'center',
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
      marginVertical: moderateScale(10),
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
      marginLeft: moderateScale(10),
      marginRight: moderateScale(10),
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

export default AddNewProfileScreen;
