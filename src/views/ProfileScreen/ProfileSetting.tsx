/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomVectorIcons from '@components/CustomVectorIcons';
import IMAGES from '@assets/images';
import CustomHeader from '@components/CustomHeader';
import { useDispatch, useSelector } from 'react-redux';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import CustomLoader from '@utils/CustomLoader';
import CustomButton from '@components/CustomButton';
import { clearData } from '@utils/CustomAsyncStorage';
import { showSuccessToast, showErrorToast } from '@utils/CustomToast';
import { getLanguageSetting, getProfile } from '@utils/Redux_api_fun';
import RBSheet from 'react-native-raw-bottom-sheet';
import CustomImageComponent from '@components/CustomImageComponent';
import CustomImageAvatarPopUp from '@components/CustomImageAvatarPopUp';
import { openImage_Picker } from '@utils/PickerServices';
import CustomTextInput from '@components/CustomTextInput';

const ProfileSettings = (props: any) => {
  const dispatch = useDispatch();

  const languageData = useSelector((state: any) => state?.data?.languageData);

  const { theme, currentTheme, setTheme } = useTheme();
  const styles = getStyles(theme);
  let myData = useSelector((state: any) => state?.data);
  let { getprofiledata } = myData;

  useEffect(() => {
    dispatch(getProfile());
    dispatch(getLanguageSetting());
  }, [dispatch]);

  useEffect(() => {
    if (getprofiledata) {
      setProfileName(getprofiledata.username);
    }
  }, [getprofiledata]);

  const [profileName, setProfileName] = useState(getprofiledata?.username);
  // const [autoplayNext, setAutoplayNext] = useState(true);
  // const [autoplayPreviews, setAutoplayPreviews] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [logoutModal, setlogoutModal] = useState(false);
  const [Loader, setLoader] = useState(false);
  const [logoutLoader, setLogoutLoader] = useState(false);

  // New states for profile image and password
  const [passwordModal, setPasswordModal] = useState(false);
  const [avatarPopupVisible, setAvatarPopupVisible] = useState(false);
  const [avatarsData, setAvatarsData] = useState([]);

  const [passwordInputs, setPasswordInputs] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPasswordError: '',
    newPasswordError: '',
    confirmPasswordError: '',
  });

  // Refs
  const refRBSheet = useRef(null);

  const options = [
    { label: languageData?.light_mode || 'Light Mode', value: 'light' },
    { label: languageData?.dark_mode || 'Dark Mode', value: 'dark' },
    { label: languageData?.custom_mode || 'Custom Mode', value: 'custom' },
  ];

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  // Fetch avatars for profile image selection
  async function fetchAvatars() {
    setLoader(true);
    try {
      const res = await apiRequest(
        ApiURL.fetchAvatarsProfiles,
        'GET',
        null,
        true,
      );

      setLoader(false);
      if (!res?.error) {
        setAvatarsData(res?.data?.list || []);
      }
    } catch (error: any) {
      console.log('🔥 Fetch Avatars Exception:', error);
      setLoader(false);
    }
  }

  async function setThemepreference(activeTheme: any) {
    setLoader(true);

    try {
      const payload = {
        theme: activeTheme,
      };

      const res = await apiRequest(
        ApiURL.setThemePreference,
        'POST',
        payload,
        true,
      );

      setLoader(false);

      console.log('apirrr', res);

      if (!res?.error) {
        showSuccessToast(
          languageData?.theme_updated || 'Theme preference updated',
        );
      } else {
        const errorMsg = res?.message || 'Request failed. Please try again.';
        showErrorToast(errorMsg);
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoader(false);
      showErrorToast('Failed to update theme preference');
    }
  }

  // Handle profile image change
  const handleProfileImageConfirm = async (option: 'avatar' | 'gallery') => {
    const selectedOption = option?.toLowerCase();

    if (selectedOption === 'avatar') {
      fetchAvatars(); // Fetch avatars first
      refRBSheet.current?.open();
      setAvatarPopupVisible(false);
    }

    if (selectedOption === 'gallery') {
      try {
        const image = await openImage_Picker();
        if (image?.path) {
          updateProfileImage(image.path);
        }
        setAvatarPopupVisible(false);
      } catch (e) {
        console.log('Gallery cancelled');
      }
    }
  };

  // Update profile image API call
  async function updateProfileImage(imageUrl: string) {
    if (!getprofiledata) {
      Alert.alert('Error', 'Profile data not available');
      return;
    }

    setLoader(true);

    try {
      const payload = {
        avatar: imageUrl,

        // ✅ Directly from Redux
        countryCode: getprofiledata.countryCode,
        phoneNumber: getprofiledata.phoneNumber,
      };

      console.log('📦 Update Profile Payload:', payload);

      const res = await apiRequest(ApiURL.updateProfile, 'POST', payload, true);

      setLoader(false);

      if (res && res.error === false) {
        showSuccessToast(
          languageData?.profile_picture_updated ||
            'Profile picture updated successfully!',
        );

        dispatch(getProfile()); // refresh redux
      } else {
        Alert.alert(
          'Error',
          res?.message || 'Failed to update profile picture',
        );
      }
    } catch (error: any) {
      console.log('🔥 Update Profile Image Exception:', error);
      setLoader(false);
      Alert.alert('Error', error?.message || 'Network error occurred');
    }
  }

  // Handle avatar selection from bottom sheet
  const handleAvatarSelect = (avatarUrl: string) => {
    updateProfileImage(avatarUrl);
    refRBSheet.current?.close();
  };

  // Password validation
  const validatePassword = () => {
    let isValid = true;

    // Reset errors
    setPasswordErrors({
      currentPasswordError: '',
      newPasswordError: '',
      confirmPasswordError: '',
    });

    // Current password validation
    if (!passwordInputs.currentPassword.trim()) {
      setPasswordErrors(prev => ({
        ...prev,
        currentPasswordError:
          languageData?.enter_current_password_error ||
          'Please enter current password',
      }));
      isValid = false;
    }

    // New password validation
    if (!passwordInputs.newPassword.trim()) {
      setPasswordErrors(prev => ({
        ...prev,
        newPasswordError: 'Please enter new password',
      }));
      isValid = false;
    } else if (passwordInputs.newPassword.length < 6) {
      setPasswordErrors(prev => ({
        ...prev,
        newPasswordError:
          languageData?.password_min_length ||
          'Password must be at least 6 characters',
      }));
      isValid = false;
    }

    // Confirm password validation
    if (!passwordInputs.confirmPassword.trim()) {
      setPasswordErrors(prev => ({
        ...prev,
        confirmPasswordError: 'Please confirm new password',
      }));
      isValid = false;
    } else if (passwordInputs.newPassword !== passwordInputs.confirmPassword) {
      setPasswordErrors(prev => ({
        ...prev,
        confirmPasswordError:
          languageData?.passwords_not_match || 'Passwords do not match',
      }));
      isValid = false;
    }

    return isValid;
  };

  // Update password API call
  async function handleUpdatePassword() {
    if (!validatePassword()) {
      return;
    }

    setLoader(true);
    try {
      const payload = {
        currentPassword: passwordInputs.currentPassword,
        newPassword: passwordInputs.newPassword,
        confirmPassword: passwordInputs.confirmPassword,
      };

      const res = await apiRequest(
        ApiURL.updatePassword,
        'POST',
        payload,
        true,
      );

      setLoader(false);
      if (!res?.error) {
        showSuccessToast(
          languageData?.password_updated || 'Password updated successfully!',
        );

        setPasswordModal(false);
        // Reset password inputs
        setPasswordInputs({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        Alert.alert('Error', res?.message || 'Failed to update password');
      }
    } catch (error: any) {
      console.log('🔥 Update Password Exception:', error);
      setLoader(false);
      Alert.alert('Error', error.message || 'Network error occurred');
    }
  }

  /**
   * Handle API-based logout
   */
  const handleLogout = async () => {
    try {
      setLogoutLoader(true);
      setlogoutModal(false);

      console.log('🔄 Starting API logout...');

      // 1. Call logout API
      const response = await apiRequest(ApiURL.logout, 'POST', {}, true);

      console.log('✅ Logout API response:', response);

      // 2. Check API response
      if (response?.error === false) {
        // Success - server acknowledged logout
        console.log('🎉 Logout API success:', response.message);

        // 3. Clear local data
        await clearData();

        // 4. Show success message
        showSuccessToast(response.message || 'Logged out successfully');

        // 5. Navigate to intro screen after delay
        setTimeout(() => {
          setLogoutLoader(false);
          props.navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }, 1000);
      } else {
        // API returned an error
        const errorMsg =
          response?.message || 'Logout failed. Please try again.';
        console.warn('⚠️ Logout API error:', errorMsg);

        // Still clear local data for security (client-side logout)
        await clearData();
      }
    } catch (error: any) {
      // Network error or exception
      console.log('🔥 Logout exception:', error);

      // Clear local data even if API fails
      try {
        await clearData();
      } catch (storageError) {
        console.log('❌ Failed to clear storage:', storageError);
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar
          // backgroundColor={theme.transparent}
          // barStyle={'light-content'}
          backgroundColor={theme.themeColor}
          barStyle="light-content"
          translucent={false}
        />
        <CustomHeader showBackButton={true} showNotifications={false} />

        <ScrollView style={{ flex: 1, paddingBottom: moderateScale(150) }}>
          <View style={styles.contentWrapper}>
            {/* Profile Image with Edit Button */}
            <View style={styles.profileImageWrapper}>
              <CustomImageComponent
                source={getprofiledata?.profilePictureUrl || IMAGES.doll}
                height={moderateScale(100)}
                width={moderateScale(100)}
                style={styles.profileImage}
              />
              <TouchableOpacity
                style={styles.editIconWrapper}
                onPress={() => setAvatarPopupVisible(true)}
              >
                <CustomVectorIcons
                  iconSet="Feather"
                  name="edit-3"
                  size={moderateScale(14)}
                  color={theme.black}
                />
              </TouchableOpacity>
            </View>

            {/* Profile Name */}
            <View style={styles.inputBox}>
              <Text style={styles.inputTitle}>
                {languageData?.profile_name || 'Profile name'}
              </Text>

              <Text style={styles.profileNameText}>{profileName}</Text>
            </View>

            {/* Update Password Button */}
            <TouchableOpacity
              style={styles.optionBox}
              // onPress={() => setPasswordModal(true)}
              onPress={() =>
                props.navigation.navigate('VerifyPin', {
                  onSuccess: () => {
                    setPasswordModal(true);
                  },
                })
              }
            >
              <Text style={styles.optionText}>
                {languageData?.update_password || 'Update Password'}
              </Text>

              <CustomVectorIcons
                iconSet="Feather"
                name="chevron-right"
                size={moderateScale(20)}
                color={theme.text}
              />
            </TouchableOpacity>

            {/* Language Selector */}
            <TouchableOpacity
              style={styles.optionBox}
              onPress={() => props.navigation.navigate('LanguageToggle')}
            >
              <Text style={styles.optionText}>
                {languageData?.display_language || 'Display Language'}
              </Text>

              <CustomVectorIcons
                iconSet="Feather"
                name="chevron-right"
                size={moderateScale(20)}
                color={theme.text}
              />
            </TouchableOpacity>

            {/* COMMENTED OUT - Autoplay Toggles */}
            {/* <View style={styles.optionBox}>
              <Text style={styles.optionText}>Autoplay Next Episode</Text>
              <Switch
                value={autoplayNext}
                onValueChange={setAutoplayNext}
                trackColor={{ false: theme.gray, true: theme.themeColor }}
                thumbColor={autoplayNext ? theme.white : theme.gray}
              />
            </View>

            <View style={styles.optionBox}>
              <Text style={styles.optionText}>Autoplay Previews</Text>
              <Switch
                value={autoplayPreviews}
                onValueChange={setAutoplayPreviews}
                trackColor={{ false: theme.gray, true: theme.themeColor }}
                thumbColor={autoplayPreviews ? theme.white : theme.gray}
              />
            </View> */}

            <TouchableOpacity
              style={styles.optionBox}
              onPress={() => props.navigation.navigate('NotificationSettings')}
            >
              <Text style={styles.optionText}>
                {languageData?.notification_manage || 'Notification Manage'}
              </Text>

              <CustomVectorIcons
                iconSet="Feather"
                name="chevron-right"
                size={moderateScale(20)}
                color={theme.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionBox}
              onPress={() => props.navigation.navigate('FeedbackSupportScreen')}
            >
              <Text style={styles.optionText}>
                {languageData?.support_feedback || 'Support & Feedback'}
              </Text>

              <CustomVectorIcons
                iconSet="Feather"
                name="chevron-right"
                size={moderateScale(20)}
                color={theme.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionBox}
              onPress={() => props.navigation.navigate('Bluethooth')}
            >
              <Text style={styles.optionText}>
                {languageData?.bluetooth_pairing || 'Bluetooth Pairing Manager'}
              </Text>

              <CustomVectorIcons
                iconSet="Feather"
                name="chevron-right"
                size={moderateScale(20)}
                color={theme.text}
              />
            </TouchableOpacity>

            {/* Theme Selector */}
            <View style={styles.themeContainer}>
              {options.map(option => (
                <TouchableOpacity
                  onPress={() => {
                    setTheme(option?.value);
                    setSelectedTheme(option?.value);
                    setThemepreference(option?.value);
                  }}
                  key={option?.value}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor:
                        selectedTheme === option?.value
                          ? theme.themeColor
                          : theme.transparent,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeOptionText,
                      {
                        color:
                          selectedTheme === option.value
                            ? theme.white
                            : theme.grayLight,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.optionBox, { marginTop: moderateScale(20) }]}
              onPress={() => setlogoutModal(true)}
            >
              <Text style={styles.optionText}>
                {languageData?.logout || 'Logout'}
              </Text>

              <CustomVectorIcons
                iconSet="Feather"
                name="chevron-right"
                size={moderateScale(20)}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Avatar Selection Popup */}
        <CustomImageAvatarPopUp
          visible={avatarPopupVisible}
          onDismiss={() => setAvatarPopupVisible(false)}
          onConfirm={handleProfileImageConfirm}
        />

        {/* Avatars Bottom Sheet */}
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
                {languageData?.choose_avatar || 'Choose Avatar'}
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.avatarsGrid}>
                {avatarsData.map((item, index) => (
                  <TouchableOpacity
                    key={`avatar-${item.id || item._id || index}`}
                    style={styles.avatarItem}
                    onPress={() => handleAvatarSelect(item?.url)}
                    activeOpacity={0.7}
                  >
                    <CustomImageComponent
                      source={item?.url}
                      height={moderateScale(70)}
                      width={moderateScale(70)}
                      style={styles.avatarImage}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </RBSheet>

        {/* Update Password Modal */}
        <Modal
          visible={passwordModal}
          animationType="slide"
          onRequestClose={() => setPasswordModal(false)}
          transparent={true}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {languageData?.update_password || 'Update Password'}
                </Text>

                <TouchableOpacity onPress={() => setPasswordModal(false)}>
                  <CustomVectorIcons
                    iconSet="Feather"
                    name="x"
                    size={moderateScale(24)}
                    color={theme.text}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <CustomTextInput
                  title={languageData?.current_password || 'Current Password'}
                  placeholder={
                    languageData?.enter_current_password ||
                    'Enter current password'
                  }
                  value={passwordInputs.currentPassword}
                  onChangeText={text =>
                    setPasswordInputs(prev => ({
                      ...prev,
                      currentPassword: text,
                    }))
                  }
                  errorMessage={passwordErrors.currentPasswordError}
                  onFocus={() =>
                    setPasswordErrors(prev => ({
                      ...prev,
                      currentPasswordError: '',
                    }))
                  }
                  style={styles.passwordInput}
                  secureTextEntry={true}
                />

                <CustomTextInput
                  title={languageData?.new_password || 'New Password'}
                  placeholder={
                    languageData?.enter_new_password || 'Enter new password'
                  }
                  value={passwordInputs.newPassword}
                  onChangeText={text =>
                    setPasswordInputs(prev => ({
                      ...prev,
                      newPassword: text,
                    }))
                  }
                  errorMessage={passwordErrors.newPasswordError}
                  onFocus={() =>
                    setPasswordErrors(prev => ({
                      ...prev,
                      newPasswordError: '',
                    }))
                  }
                  style={styles.passwordInput}
                  secureTextEntry={true}
                />

                <CustomTextInput
                  title={languageData?.confirm_password || 'Confirm Password'}
                  placeholder={
                    languageData?.confirm_new_password || 'Confirm new password'
                  }
                  value={passwordInputs.confirmPassword}
                  onChangeText={text =>
                    setPasswordInputs(prev => ({
                      ...prev,
                      confirmPassword: text,
                    }))
                  }
                  errorMessage={passwordErrors.confirmPasswordError}
                  onFocus={() =>
                    setPasswordErrors(prev => ({
                      ...prev,
                      confirmPasswordError: '',
                    }))
                  }
                  style={styles.passwordInput}
                  secureTextEntry={true}
                />

                <CustomButton
                  text={languageData?.update_password || 'Update Password'}
                  backgroundColor={theme.themeColor}
                  onPress={handleUpdatePassword}
                  height={moderateScale(50)}
                  style={styles.updateButton}
                  disabled={Loader}
                />

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setPasswordModal(false)}
                >
                  <Text style={styles.cancelButtonText}>
                    {languageData?.cancel || 'Cancel'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Logout Confirmation Modal */}
        <Modal
          visible={logoutModal}
          animationType="fade"
          onRequestClose={() => setlogoutModal(false)}
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmationModal}>
              <Image source={IMAGES.logoutIcon} style={styles.logoutIcon} />

              <View style={styles.confirmationContent}>
                <Text style={styles.confirmationTitle}>
                  {languageData?.are_you_sure || 'Are you sure?'}
                </Text>

                <Text style={styles.confirmationMessage}>
                  {languageData?.logout_confirmation ||
                    'This action will log you out of your account. You will need to log in again to access your data and continue using the app.'}
                </Text>
              </View>

              <View style={styles.confirmationButtons}>
                <View style={styles.styleBtn}>
                  <CustomButton
                    width={'100%'}
                    text={
                      logoutLoader
                        ? languageData?.logging_out || 'Logging out...'
                        : languageData?.logout || 'Logout'
                    }
                    backgroundColor={theme.themeColor}
                    onPress={handleLogout}
                    height={moderateScale(45)}
                    disabled={logoutLoader}
                    style={[
                      styles.confirmationButton,
                      { opacity: logoutLoader ? 0.7 : 1 },
                    ]}
                  />
                </View>
                <View style={styles.styleBtn}>
                  <CustomButton
                    text={languageData?.cancel || 'Cancel'}
                    backgroundColor={theme.themeColor}
                    onPress={() => setlogoutModal(!logoutModal)}
                    height={moderateScale(45)}
                    disabled={logoutLoader}
                    style={[
                      styles.confirmationButton,
                      {
                        opacity: logoutLoader ? 0.5 : 1,
                        marginTop: moderateScale(10),
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>

        <CustomLoader visible={Loader || logoutLoader} />
      </View>
    </GestureHandlerRootView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      marginTop: moderateScale(20),
    },
    contentWrapper: {
      alignItems: 'center',
      paddingHorizontal: moderateScale(20),
      marginTop: moderateScale(20),
    },
    profileImageWrapper: {
      position: 'relative',
      marginBottom: moderateScale(20),
    },
    profileImage: {
      borderRadius: 50,
    },
    editIconWrapper: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.white,
      borderRadius: 20,
      padding: moderateScale(6),
      elevation: 4,
    },
    inputBox: {
      width: '100%',
      borderWidth: 1,
      borderColor: theme.gray,
      borderRadius: moderateScale(10),
      padding: moderateScale(12),
      marginBottom: moderateScale(20),
    },
    inputTitle: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
      marginBottom: moderateScale(5),
    },
    profileNameText: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
    },
    optionBox: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.boxBackground,
      padding: moderateScale(14),
      borderRadius: moderateScale(10),
      marginBottom: moderateScale(15),
    },
    optionText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },
    themeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: moderateScale(5),
      width: '100%',
      borderWidth: 1,
      borderColor: theme.themeColor,
      borderRadius: moderateScale(10),
      marginTop: moderateScale(10),
    },
    themeOption: {
      width: '31%',
      paddingVertical: moderateScale(8),
      borderRadius: moderateScale(5),
    },
    themeOptionText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaBold,
      textAlign: 'center',
      textAlignVertical: 'center',
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
    avatarsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingBottom: moderateScale(20),
    },
    avatarItem: {
      width: '23%',
      alignItems: 'center',
      marginVertical: moderateScale(10),
    },
    avatarImage: {
      borderRadius: moderateScale(52),
      elevation: 3,
      overflow: 'hidden',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      backgroundColor: theme.background,
      borderRadius: moderateScale(15),
      padding: moderateScale(20),
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: moderateScale(20),
    },
    modalTitle: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
    },
    passwordInput: {
      marginBottom: moderateScale(15),
    },
    updateButton: {
      borderRadius: moderateScale(10),
      marginTop: moderateScale(10),
      marginBottom: moderateScale(15),
    },
    cancelButton: {
      alignItems: 'center',
      paddingVertical: moderateScale(12),
    },
    cancelButtonText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.themeColor,
    },
    confirmationModal: {
      width: '90%',
      backgroundColor: theme.white,
      borderRadius: moderateScale(10),
      padding: moderateScale(20),
      alignItems: 'center',
    },
    logoutIcon: {
      height: moderateScale(50),
      width: moderateScale(50),
      resizeMode: 'contain',
      marginBottom: moderateScale(15),
    },
    confirmationContent: {
      marginVertical: moderateScale(10),
      alignItems: 'center',
    },
    confirmationTitle: {
      color: theme.black,
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaSemiBold,
      marginBottom: moderateScale(10),
    },
    confirmationMessage: {
      color: theme.black,
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      textAlign: 'center',
      marginBottom: moderateScale(15),
    },
    confirmationButtons: {
      width: '100%',
      alignItems: 'center',
    },
    confirmationButton: {
      width: '90%',
      alignSelf: 'center',
      borderRadius: moderateScale(12),
    },
    styleBtn: {
      width: '100%',
    },
  });

export default ProfileSettings;
