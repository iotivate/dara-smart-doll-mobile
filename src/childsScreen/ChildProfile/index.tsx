/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomVectorIcons from '@components/CustomVectorIcons';
import IMAGES from '@assets/images';
import CustomHeader from '@components/CustomHeader';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { showErrorToast, showSuccessToast } from '@utils/CustomToast';
import CustomButton from '@components/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '@utils/Redux_api_fun';

const ChildProfile = ({ navigation }: any) => {
  const { theme, currentTheme, setTheme } = useTheme();
  const styles = getStyles(theme);
  const dispatch = useDispatch();

  const LANGUAGE_LABELS: any = {
    en: 'English',
    hi: 'Hindi',
    fr: 'French',
    es: 'Spanish',
  };

  const { getprofiledata } = useSelector((state: any) => state.data);
  console.log('profile data from child:', getprofiledata);

  useEffect(() => {
    dispatch(getProfile());
  }, []);

  const [autoplayNext, setAutoplayNext] = useState(true);
  const [autoplayPreviews, setAutoplayPreviews] = useState(true);
  const selectedLanguage =
    LANGUAGE_LABELS[getprofiledata?.languagePreference] || 'English';

  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [logoutModal, setlogoutModal] = useState(false);
  const [logoutLoader, setLogoutLoader] = useState(false);
  const [Loader, setLoader] = useState(false);

  const options = [
    { label: 'Light Mode', value: 'light' },
    { label: 'Dark Mode', value: 'dark' },
    { label: 'Custom Mode', value: 'custom' },
  ];

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

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
        showSuccessToast('Theme preference updated');
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

        // 4. Show success message
        showSuccessToast(response.message || 'Logged out successfully');

        // 5. Navigate to intro screen after delay
        setTimeout(() => {
          setLogoutLoader(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }, 1000);
      } else {
        // API returned an error
        const errorMsg =
          response?.message || 'Logout failed. Please try again.';
        console.warn('⚠️ Logout API error:', errorMsg);
      }
    } catch (error: any) {
      // Network error or exception
      console.log('🔥 Logout exception:', error);

      // Clear local data even if API fails
      try {
      } catch (storageError) {
        console.log('❌ Failed to clear storage:', storageError);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.transparent}
        barStyle={'light-content'}
      />
      <View style={{ marginBottom: -90 }}>
        <CustomHeader
          type="dashboard"
          showBackButton
          showNotifications={false}
          notificationBadgeCount={3}
          showIconCircles
          showProfile={false}
          customLeftContent={undefined}
        />
      </View>

      <ScrollView style={{ flex: 1, paddingBottom: moderateScale(150) }}>
        <View style={styles.contentWrapper}>
          {/* Profile Image */}
          <View style={styles.profileImageWrapper}>
            <Image
              source={
                getprofiledata?.profileImage
                  ? { uri: getprofiledata.profileImage }
                  : IMAGES.user4
              }
              style={styles.profileImage}
            />
          </View>

          {/* Profile Name Input */}
          <View style={styles.inputBox}>
            <Text style={styles.inputTitle}>Profile name</Text>
            <Text style={styles.profileNameText}>
              {getprofiledata?.username || '—'}
            </Text>
          </View>
        </View>

        <View
          style={{
            marginLeft: moderateScale(10),
            marginRight: moderateScale(10),
          }}
        >
          {/* Language Display with only the selected language */}
          <TouchableOpacity
            style={styles.optionBox}
            // onPress={() => navigation.navigate('LanguageToggle')}
          >
            <View style={styles.languageContainer}>
              <Text style={styles.optionText}>Display Language</Text>
              <Text style={styles.selectedLanguageText}>
                {selectedLanguage}
              </Text>
            </View>
            {/* <CustomVectorIcons
              iconSet="Feather"
              name="chevron-right"
              size={moderateScale(20)}
              color={theme.text}
            /> */}
          </TouchableOpacity>

          <View style={styles.optionBox}>
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
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              paddingVertical: moderateScale(5),
              width: '100%',
              borderWidth: 1,
              borderColor: theme.themeColor,
              borderRadius: moderateScale(10),
            }}
          >
            {options.map(option => (
              <TouchableOpacity
                onPress={() => {
                  setTheme(option?.value);
                  setSelectedTheme(option?.value);
                  setThemepreference(option?.value);
                }}
                key={option?.value}
                style={{
                  backgroundColor:
                    selectedTheme === option?.value
                      ? theme.themeColor
                      : theme.transparent,
                  width: '31%',
                  paddingVertical: moderateScale(8),
                  borderRadius: moderateScale(5),
                }}
              >
                <Text
                  style={{
                    fontSize: moderateScale(14),
                    fontFamily: FontFamily.KhulaBold,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    color:
                      selectedTheme === option.value
                        ? theme.white
                        : theme.grayLight,
                  }}
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
            <Text style={styles.optionText}>Logout</Text>
            <CustomVectorIcons
              iconSet="Feather"
              name="chevron-right"
              size={moderateScale(20)}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={logoutModal}
        animationType="fade"
        onRequestClose={() => setlogoutModal(false)}
        transparent={true}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              padding: moderateScale(15),
              borderRadius: moderateScale(10),
              width: '90%',
              marginTop: moderateScale(20),
              backgroundColor: theme.white,
            }}
          >
            <Image
              source={IMAGES.logoutIcon}
              style={{
                height: moderateScale(50),
                width: moderateScale(50),
                resizeMode: 'contain',
                alignSelf: 'center',
              }}
            />

            <View style={{ marginVertical: 10 }}>
              <Text
                style={{
                  color: theme.black,
                  fontSize: moderateScale(16),
                  fontFamily: FontFamily.KhulaSemiBold,
                  alignSelf: 'center',
                }}
              >
                Are you sure?
              </Text>
              <Text
                style={{
                  color: theme.black,
                  fontSize: moderateScale(12),
                  fontFamily: FontFamily.KhulaRegular,
                  textAlign: 'center',
                  marginVertical: moderateScale(10),
                }}
              >
                This action will log you out of your account. You will need to
                log in again to access your data and continue using the app.
              </Text>
            </View>

            <View
              style={{
                marginVertical: moderateScale(13),
                width: '100%',
                alignItems: 'center',
              }}
            >
              <View style={{ width: '90%' }}>
                <CustomButton
                  text={logoutLoader ? 'Logging out...' : 'Logout'}
                  backgroundColor={theme.themeColor}
                  onPress={handleLogout}
                  height={moderateScale(45)}
                  disabled={logoutLoader}
                  style={{
                    alignSelf: 'center',
                    borderRadius: moderateScale(12),
                    opacity: logoutLoader ? 0.7 : 1,
                  }}
                />
              </View>
              <View style={{ width: '90%', marginTop: moderateScale(10) }}>
                <CustomButton
                  text={'Cancel'}
                  backgroundColor={theme.themeColor}
                  onPress={() => setlogoutModal(!logoutModal)}
                  height={moderateScale(45)}
                  disabled={logoutLoader}
                  style={{
                    alignSelf: 'center',
                    borderRadius: moderateScale(12),
                    opacity: logoutLoader ? 0.5 : 1,
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    contentWrapper: {
      alignItems: 'center',
      paddingHorizontal: moderateScale(20),
      marginTop: moderateScale(20),
    },
    profileImageWrapper: {
      marginBottom: moderateScale(20),
    },
    profileImage: {
      width: moderateScale(120),
      height: moderateScale(120),
      borderRadius: 60,
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
    languageContainer: {
      flex: 1,
    },
    selectedLanguageText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      marginTop: 2,
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
  });

export default ChildProfile;
