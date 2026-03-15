/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import CustomHeader from '@components/CustomHeader';
import CustomVectorIcons from '@components/CustomVectorIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { showSuccessToast, showErrorToast } from '@utils/CustomToast';
import IMAGES from '@assets/images';
import { useSelector } from 'react-redux';

type TimeValue = { hour: string; minute: string; period: 'AM' | 'PM' };

const STORAGE_KEY = '@app_settings_v1';

const NotificationSettingsScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  // State for loading indicators
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [clearCacheLoading, setClearCacheLoading] = useState(false);

  // Master toggle for all notifications
  const [enableAllNotifications, setEnableAllNotifications] = useState(true);

  // Individual settings
  const [silentNotificationsOnly, setSilentNotificationsOnly] = useState(false);
  const [soundEffect, setSoundEffect] = useState(true);
  const [logoutModal, setLogoutModal] = useState(false);

  const [alerts, setAlerts] = useState({
    lessonStart: true,
    missedLesson: false,
    newContent: true,
    systemAnnouncements: false,
    promotional: false,
  });

  const [connectionStart, setConnectionStart] = useState<TimeValue>({
    hour: '09',
    minute: '00',
    period: 'PM',
  });
  const [connectionEnd, setConnectionEnd] = useState<TimeValue>({
    hour: '07',
    minute: '00',
    period: 'AM',
  });

  // Load settings from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setEnableAllNotifications(Boolean(parsed.enableAllNotifications));
          setSilentNotificationsOnly(Boolean(parsed.silentNotificationsOnly));
          setSoundEffect(Boolean(parsed.soundEffect));
          setAlerts({ ...(parsed.alerts || alerts) });
          setConnectionStart(parsed.connectionStart || connectionStart);
          setConnectionEnd(parsed.connectionEnd || connectionEnd);
        }
      } catch (err) {
        console.warn('Load settings error', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Master toggle effect - when disabled, turn off ALL notifications
  useEffect(() => {
    if (!enableAllNotifications) {
      setSilentNotificationsOnly(false);
      setSoundEffect(false);
      setAlerts({
        lessonStart: false,
        missedLesson: false,
        newContent: false,
        systemAnnouncements: false,
        promotional: false,
      });
    } else {
      // When enabled, restore sound effect to default
      setSoundEffect(true);
    }
  }, [enableAllNotifications]);

  /**
   * Handle navigation to detailed notification settings screen
   */
  const handleAllNotificationsPress = () => {
    navigation.navigate('UserNotification', {
      silentNotificationsOnly,
      soundEffect,
      alerts,
      connectionStart,
      connectionEnd,
      onSave: (data: any) => {
        // Update local state with data from AllNotificationsScreen
        setSilentNotificationsOnly(data.silentNotificationsOnly);
        setSoundEffect(data.soundEffect);
        setAlerts(data.alerts);
        setConnectionStart(data.connectionStart);
        setConnectionEnd(data.connectionEnd);

        // Ensure master toggle is ON when returning from detailed settings
        setEnableAllNotifications(true);
      },
    });
  };

  /**
   * Clear local cache/data from AsyncStorage
   */
  const clearLocalCache = async () => {
    Alert.alert(
      languageData?.clear_cache || 'Clear Local Cache',
      languageData?.clear_cache_desc ||
        'This will remove all locally stored data including settings and cached content. This action cannot be undone.',

      [
        { text: languageData?.cancel || 'Cancel', style: 'cancel' },

        {
          text: languageData?.clear_cache_btn || 'Clear Cache',

          style: 'destructive',
          onPress: async () => {
            try {
              setClearCacheLoading(true);
              await AsyncStorage.clear();
              showSuccessToast(
                languageData?.cache_cleared ||
                  'Local cache cleared successfully',
              );

              // Reset local state to defaults
              setEnableAllNotifications(true);
              setSilentNotificationsOnly(false);
              setSoundEffect(true);
              setAlerts({
                lessonStart: true,
                missedLesson: false,
                newContent: true,
                systemAnnouncements: false,
                promotional: false,
              });
              setConnectionStart({
                hour: '09',
                minute: '00',
                period: 'PM',
              });
              setConnectionEnd({
                hour: '07',
                minute: '00',
                period: 'AM',
              });

              setTimeout(() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'IntroSwiper' }],
                });
              }, 500);
            } catch (err) {
              console.log('Clear cache error:', err);
              showErrorToast(
                languageData?.cache_clear_failed ||
                  'Failed to clear local cache',
              );
            } finally {
              setClearCacheLoading(false);
            }
          },
        },
      ],
    );
  };

  /**
   * Handle user logout with API call
   */
  const handleLogout = async () => {
    setLogoutModal(true);
  };

  /**
   * Perform logout API call and clear local data
   */
  const performLogout = async () => {
    try {
      setLogoutLoading(true);

      console.log('🔄 Starting logout process...');

      // 1. Prepare logout payload - MUST be empty object or null, not true
      const logoutPayload = {}; // Empty object

      // 2. Call logout API to notify server
      const response = await apiRequest(
        ApiURL.logout, // Check this URL doesn't have extra }
        'POST',
        logoutPayload, // Empty object, not true
        true, // isToken: true - VERY IMPORTANT for authenticated requests
      );

      console.log('✅ Logout API response:', response);

      // 3. Check API response
      if (response?.error === false) {
        await AsyncStorage.clear();

        // 5. Show success message
        showSuccessToast(response.message || 'Logged out successfully');

        // 6. Navigate to login screen after delay
        console.log('🚪 Navigating to login screen...');
        setTimeout(() => {
          navigation.replace('Login');
        }, 1000);
      } else {
        // API returned an error
        const errorMsg =
          response?.message || 'Logout failed. Please try again.';
        await AsyncStorage.clear();

        // Show appropriate message
        showErrorToast(errorMsg || 'Logged out locally');

        // Navigate to login anyway
        setTimeout(() => {
          navigation.replace('Login');
        }, 1000);
      }
    } catch (error: any) {
      // Clear local storage even if API fails
      try {
        await AsyncStorage.clear();
      } catch (storageError) {}

      // Show user-friendly error message
      let errorMessage = 'Logged out locally due to network error';
      if (error.message?.includes('Network Error')) {
        errorMessage = 'No internet connection. Logged out locally.';
      } else if (error.message?.includes('400')) {
        errorMessage = 'Invalid logout request. Logged out locally.';
      } else if (error.message?.includes('401')) {
        errorMessage = 'Session expired. Logged out.';
      }

      showErrorToast(errorMessage);

      // Navigate to login screen anyway
      setTimeout(() => {
        navigation.replace('Login');
      }, 1000);
    } finally {
      setLogoutLoading(false);
      console.log('🏁 Logout process completed');
    }
  };

  // useEffect(() => {
  //   getCacheSize()

  //   return () => {

  //   }
  // }, [])

  // const getCacheSize = async () => {
  //   try {

  //     const path = RNFS.DocumentDirectoryPath;

  //     const files = await RNFS.readDir(path);

  //     let totalSize = 0;

  //     files.forEach(file => {
  //       totalSize += file.size;
  //     });

  //     const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  //     console.log("Cache Size:", sizeMB, "MB");

  //     return sizeMB;

  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  // const clearCache = async () => {

  //   await AsyncStorage.clear();

  //   const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);

  //   for (const file of files) {
  //     await RNFS.unlink(file.path);
  //   }

  //   Alert.alert("Cache cleared successfully");
  // };

  return (
    <View style={styles.container}>
      <CustomHeader
        showBackButton={true}
        showNotifications={false}
        title={languageData?.settings || 'Settings'}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Help & Support */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('HelpAndSupportScreen')}
        >
          <Text style={styles.rowText}>
            {languageData?.help_support || 'Help and Support'}
          </Text>

          <CustomVectorIcons
            name="chevron-right"
            type="Feather"
            size={20}
            color={theme.black}
          />
        </TouchableOpacity>

        {/* Language Settings */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('LanguageToggle')}
        >
          <Text style={styles.rowText}>
            {languageData?.language_settings || 'Language Settings'}
          </Text>

          <CustomVectorIcons
            name="chevron-right"
            type="Feather"
            size={20}
            color={theme.black}
          />
        </TouchableOpacity>

        {/* Privacy Settings */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('TermsAndConditionsScreen')}
        >
          <Text style={styles.rowText}>
            {languageData?.privacy_settings || 'Privacy Settings'}
          </Text>

          <CustomVectorIcons
            name="chevron-right"
            type="Feather"
            size={20}
            color={theme.black}
          />
        </TouchableOpacity>

        {/* All Notifications Configuration Button */}
        <TouchableOpacity
          style={[styles.row, !enableAllNotifications && styles.disabledRow]}
          onPress={handleAllNotificationsPress}
          disabled={!enableAllNotifications}
        >
          <View>
            <Text
              style={[
                styles.rowText,
                !enableAllNotifications && styles.disabledText,
              ]}
            >
              {languageData?.configure_notifications ||
                'Configure All Notifications'}
            </Text>
            <Text style={styles.subText}>
              {languageData?.notification_config_desc ||
                'Silent mode, sound, alerts categories, connection times'}
            </Text>
          </View>
          <CustomVectorIcons
            name="chevron-right"
            type="Feather"
            size={20}
            color={enableAllNotifications ? theme.black : '#CCCCCC'}
          />
        </TouchableOpacity>

        {/* Notification Summary (only shown when notifications are enabled) */}
        {enableAllNotifications && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>
              {languageData?.notification_summary || 'Notification Summary'}
            </Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {languageData?.silent_mode || 'Silent Mode'}:
              </Text>

              <Text style={styles.summaryValue}>
                {silentNotificationsOnly
                  ? languageData?.on || 'ON'
                  : languageData?.off || 'OFF'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {languageData?.sound || 'Sound'}:
              </Text>

              <Text style={styles.summaryValue}>
                {soundEffect ? 'ON' : 'OFF'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {languageData?.active_alerts || 'Active Alerts'}:
              </Text>

              <Text style={styles.summaryValue}>
                {Object.values(alerts).filter(Boolean).length} of{' '}
                {Object.values(alerts).length}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {languageData?.connection_time || 'Connection Time'}:
              </Text>

              <Text style={styles.summaryValue}>
                {connectionStart.hour}:{connectionStart.minute}{' '}
                {connectionStart.period} - {connectionEnd.hour}:
                {connectionEnd.minute} {connectionEnd.period}
              </Text>
            </View>
          </View>
        )}

        {/* Clear Local Cache Button */}
        <TouchableOpacity
          style={[styles.dangerRow, clearCacheLoading && styles.disabledRow]}
          onPress={clearLocalCache}
          disabled={clearCacheLoading}
        >
          <View style={styles.dangerRowContent}>
            {clearCacheLoading && (
              <ActivityIndicator
                size="small"
                color={theme.themeRed}
                style={styles.loadingIndicator}
              />
            )}
            <Text style={styles.dangerText}>
              {clearCacheLoading
                ? languageData?.clearing_cache || 'Clearing Cache...'
                : languageData?.clear_cache_data || 'Clear Local Cache/Data'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.dangerRow, logoutLoading && styles.disabledRow]}
          onPress={handleLogout}
          disabled={logoutLoading}
        >
          <View style={styles.dangerRowContent}>
            {logoutLoading && (
              <ActivityIndicator
                size="small"
                color={theme.themeRed}
                style={styles.loadingIndicator}
              />
            )}
            <Text style={styles.dangerText}>
              {logoutLoading
                ? languageData?.logging_out || 'Logging out...'
                : languageData?.logout || 'Logout'}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={logoutModal}
        animationType="fade"
        transparent
        onRequestClose={() => setLogoutModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
        >
          <View
            style={{
              width: '90%',
              backgroundColor: theme.white,
              borderRadius: moderateScale(12),
              padding: moderateScale(16),
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
            <Text
              style={{
                fontSize: moderateScale(16),
                fontFamily: FontFamily.KhulaSemiBold,
                color: theme.black,
                textAlign: 'center',
                marginBottom: moderateScale(10),
              }}
            >
              {languageData?.are_you_sure || 'Are you sure?'}
            </Text>

            <Text
              style={{
                fontSize: moderateScale(13),
                fontFamily: FontFamily.KhulaRegular,
                color: theme.black,
                textAlign: 'center',
                marginBottom: moderateScale(20),
              }}
            >
              {languageData?.logout_desc ||
                'This action will log you out of your account. You will need to log in again to access your data.'}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: theme.themeColor,
                paddingVertical: moderateScale(12),
                borderRadius: moderateScale(10),
                marginBottom: moderateScale(10),
                opacity: logoutLoading ? 0.7 : 1,
              }}
              disabled={logoutLoading}
              onPress={() => {
                setLogoutModal(false);
                performLogout();
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: theme.white,
                  fontFamily: FontFamily.KhulaSemiBold,
                  fontSize: moderateScale(14),
                }}
              >
                {logoutLoading
                  ? languageData?.logging_out || 'Logging out...'
                  : languageData?.logout || 'Logout'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: theme.themeColor,
                paddingVertical: moderateScale(12),
                borderRadius: moderateScale(10),
                opacity: logoutLoading ? 0.5 : 1,
              }}
              disabled={logoutLoading}
              onPress={() => setLogoutModal(false)}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: theme.themeColor,
                  fontFamily: FontFamily.KhulaSemiBold,
                  fontSize: moderateScale(14),
                }}
              >
                {languageData?.cancel || 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
      marginTop: moderateScale(20),
    },
    scrollContent: {
      paddingBottom: moderateScale(40),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: moderateScale(18),
      paddingVertical: moderateScale(12),
      borderBottomWidth: 0.5,
      borderColor: '#EEF2F6',
    },
    disabledRow: {
      opacity: 0.6,
    },
    disabledText: {
      color: '#999',
    },
    rowText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
    },
    subText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: '#6B7280',
      marginTop: moderateScale(4),
    },
    summaryBox: {
      marginHorizontal: moderateScale(18),
      marginTop: moderateScale(20),
      marginBottom: moderateScale(10),
      padding: moderateScale(16),
      backgroundColor: '#F8FAFC',
      borderRadius: moderateScale(10),
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    summaryTitle: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaBold,
      color: theme.black,
      marginBottom: moderateScale(12),
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: moderateScale(6),
    },
    summaryLabel: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: '#4B5563',
    },
    summaryValue: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
    },
    saveButton: {
      marginTop: moderateScale(16),
      paddingVertical: moderateScale(10),
      backgroundColor: theme.themeColor,
      borderRadius: moderateScale(8),
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.white,
    },
    dangerRow: {
      paddingHorizontal: moderateScale(18),
      paddingVertical: moderateScale(14),
      marginTop: moderateScale(8),
    },
    dangerRowContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dangerText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.themeRed,
      textAlign: 'center',
    },
    loadingIndicator: {
      marginRight: moderateScale(8),
    },
  });

export default NotificationSettingsScreen;
