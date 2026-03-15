/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Switch,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomVectorIcons from '@components/CustomVectorIcons';
import IMAGES from '@assets/images'; // Replace with actual avatar image path
import CustomHeader from '@components/CustomHeader';
// import { useSelector } from 'react-redux';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import CustomLoader from '@utils/CustomLoader';
import CustomButton from '@components/CustomButton';
import { clearData } from '@utils/CustomAsyncStorage';

const ProfileScreen = (props: any) => {
  const { theme, currentTheme, setTheme } = useTheme();
  const styles = getStyles(theme);
  // let myData = useSelector((state: any) => state?.data);
  // let { getprofiledata, settingsData } = myData;

  // const [profileName, setProfileName] = useState(getprofiledata?.username);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [autoplayPreviews, setAutoplayPreviews] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [logoutModal, setlogoutModal] = useState(false);
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
        theme: activeTheme, // light,dark, custom
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
      } else {
        const errorMsg = res?.message || 'Reques failed. Please try again.';
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoader(false);
    }
  }

  const LogOut = async () => {
    try {
      setLoader(true);
      setlogoutModal(false);

      console.log('User logged out successfully');

      await clearData();

      setTimeout(() => {
        setLoader(false);
        // dispatch(resetProfileData())
        props.navigation.reset({ index: 0, routes: [{ name: 'IntroSwiper' }] });
      }, 2000);
    } catch (error) {
      console.log('Logout Failed:', error.message);
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
          showNotifications
          notificationBadgeCount={3}
          showSettings
          showIconCircles
          showProfile={false}
          customLeftContent={undefined}
        />
      </View>

      <ScrollView style={{ flex: 1, paddingBottom: moderateScale(150) }}>
        <View style={styles.contentWrapper}>
          {/* Profile Image */}
          <View style={styles.profileImageWrapper}>
            <Image source={IMAGES.user4} style={styles.profileImage} />
            <TouchableOpacity style={styles.editIconWrapper}>
              <CustomVectorIcons
                iconSet="Feather"
                name="edit-3"
                size={moderateScale(14)}
                color={theme.black}
              />
            </TouchableOpacity>
          </View>
          {/* Profile Name Input */}
          <View style={styles.inputBox}>
            <Text style={styles.inputTitle}>Profile name</Text>
            <Text style={styles.profileNameText}>Zery</Text>
          </View>
          {/* Language Selector */}
          <TouchableOpacity
            style={styles.optionBox}
            onPress={() => props.navigation.navigate('LanguageToggle')}
          >
            <Text style={styles.optionText}>Display Language</Text>
            <CustomVectorIcons
              iconSet="Feather"
              name="chevron-right"
              size={moderateScale(20)}
              color={theme.text}
            />
          </TouchableOpacity>

          {/* Autoplay Toggles */}
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
              paddingHorizontal: moderateScale(3),
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
                    fontSize: moderateScale(12),
                    fontFamily: FontFamily.KhulaSemiBold,
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
              padding: 15,
              borderRadius: 10,
              width: '90%',
              marginTop: 20,
              backgroundColor: '#FFF',
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
                  color: '#000',
                  fontSize: moderateScale(16),
                  fontFamily: FontFamily.KhulaSemiBold,
                  alignSelf: 'center',
                }}
              >
                Are you sure?
              </Text>
              <Text
                style={{
                  color: '#000',
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
                marginVertical: 13,
                width: '100%',
                alignItems: 'center',
              }}
            >
              <View style={{ width: '90%' }}>
                <CustomButton
                  text={'Logout'}
                  backgroundColor={theme.themeColor}
                  onPress={LogOut}
                  height={moderateScale(55)}
                  style={{
                    alignSelf: 'center',
                    borderRadius: moderateScale(12),
                  }}
                />
              </View>

              <CustomButton
                text={'Cancel'}
                backgroundColor={theme.transparent}
                onPress={() => setlogoutModal(!logoutModal)}
                height={moderateScale(55)}
                textColor={theme.themeColor}
                style={{
                  alignSelf: 'center',
                  borderRadius: moderateScale(12),
                }}
              />

              {/* <TouchableOpacity
                onPress={() => setlogoutModal(!logoutModal)}
                style={{
                  overflow: 'hidden',
                  width: '90%',
                  borderWidth: 1,
                  backgroundColor: 'transparent',
                  borderColor: 'transparent',
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: moderateScale(45),
                  marginTop: moderateScale(20),
                }}
              >
                <Text
                  style={{
                    color: '#735EFD',
                    fontSize: 16,
                    textAlign: 'center',
                    fontFamily: FontFamily.KhulaSemiBold,
                  }}
                >
                  {'Cancel'}
                </Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </Modal>

      <CustomLoader visible={Loader} />
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

export default ProfileScreen;
