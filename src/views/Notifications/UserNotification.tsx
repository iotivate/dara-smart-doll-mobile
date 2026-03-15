/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import CustomHeader from '@components/CustomHeader';
import CustomButton from '@components/CustomButton';
import { useSelector } from 'react-redux';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { showSuccessToast, showErrorToast } from '@utils/CustomToast';

type TimeValue = { hour: string; minute: string; period: 'AM' | 'PM' };

interface Props {
  navigation: any;
  route: {
    params: {
      alerts: {
        lessonStart: boolean;
        missedLesson: boolean;
        newContent: boolean;
        systemAnnouncements: boolean;
        promotional: boolean;
      };
      connectionStart: TimeValue;
      connectionEnd: TimeValue;
      onSave: (data: any) => void;
    };
  };
}

const UserNotification = ({ navigation, route }: Props) => {
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  const { theme } = useTheme();
  const [loader, setLoader] = useState(false);
  // const [errorMessage, setErrorMessage] = useState('');
  // const [failedModalState, setFailedModalState] = useState(false);

  let reduxResponse = useSelector((state: any) => state?.data);
  let { getprofiledata } = reduxResponse;

  const styles = getStyles(theme);

  // Initialize notification settings from API or use defaults
  const notificationUpdate = getprofiledata?.notificationSettings;

  // Ensure enableAllNotifications has a valid boolean value
  const [enableAllNotifications, setEnableAllNotifications] = useState<boolean>(
    getprofiledata?.enableNotifications !== undefined
      ? getprofiledata.enableNotifications
      : true, // Default to true if undefined
  );

  // Initialize notification keys from API or use defaults
  const [notificationKeys, setNotificationKeys] = useState({
    lessonReminders: notificationUpdate?.lessonReminders ?? true,
    newContentAlerts: notificationUpdate?.newContentAlerts ?? true,
    promotions: notificationUpdate?.promotions ?? false,
    systemUpdates: notificationUpdate?.systemUpdates ?? false,
  });

  // Alert categories - keeping for potential future use
  // const [alerts, setAlerts] = useState(
  //   route.params?.alerts || {
  //     lessonStart: true,
  //     missedLesson: false,
  //     newContent: true,
  //     systemAnnouncements: false,
  //     promotional: false,
  //   },
  // );

  const [connectionStart, setConnectionStart] = useState<TimeValue>(
    route.params?.connectionStart || { hour: '09', minute: '00', period: 'PM' },
  );
  const [connectionEnd, setConnectionEnd] = useState<TimeValue>(
    route.params?.connectionEnd || { hour: '07', minute: '00', period: 'AM' },
  );

  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<'start' | 'end' | null>(
    null,
  );
  const [tempTime, setTempTime] = useState<TimeValue>({
    hour: '09',
    minute: '00',
    period: 'AM',
  });

  // Update notification keys when enableAllNotifications changes
  useEffect(() => {
    if (!enableAllNotifications) {
      // If master switch is off, turn off all notifications
      setNotificationKeys({
        lessonReminders: false,
        newContentAlerts: false,
        promotions: false,
        systemUpdates: false,
      });
    } else {
      // If master switch is on, restore to default values or previously saved values
      setNotificationKeys({
        lessonReminders: notificationUpdate?.lessonReminders ?? true,
        newContentAlerts: notificationUpdate?.newContentAlerts ?? true,
        promotions: notificationUpdate?.promotions ?? false,
        systemUpdates: notificationUpdate?.systemUpdates ?? false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableAllNotifications]);

  const openTimeModal = (field: 'start' | 'end') => {
    setEditingField(field);
    const cur = field === 'start' ? connectionStart : connectionEnd;
    setTempTime({ ...cur });
    setTimeModalVisible(true);
  };

  const saveTempTime = () => {
    if (
      !/^\d{1,2}$/.test(tempTime.hour) ||
      !/^\d{1,2}$/.test(tempTime.minute)
    ) {
      Alert.alert(
        languageData?.invalid_time || 'Invalid time',
        languageData?.invalid_time_desc ||
          'Please enter valid hour and minute values',
      );

      return;
    }

    const hour = Math.min(Math.max(parseInt(tempTime.hour, 10), 1), 12);
    const minute = Math.min(Math.max(parseInt(tempTime.minute, 10), 0), 59);
    const final: TimeValue = {
      hour: hour < 10 ? `0${hour}` : `${hour}`,
      minute: minute < 10 ? `0${minute}` : `${minute}`,
      period: tempTime.period,
    };

    if (editingField === 'start') setConnectionStart(final);
    else if (editingField === 'end') setConnectionEnd(final);

    setTimeModalVisible(false);
    setEditingField(null);
  };

  const handleSave = () => {
    // Validate enableAllNotifications is a proper boolean
    if (
      enableAllNotifications === undefined ||
      enableAllNotifications === null
    ) {
      Alert.alert(
        'Validation Error',
        'Please enable or disable notifications using the master switch.',
        [{ text: 'OK' }],
      );
      return;
    }

    UpdateNotificationAPI();
  };

  async function UpdateNotificationAPI() {
    setLoader(true);

    // Prepare payload with proper boolean values
    const payload = {
      enableNotifications: Boolean(enableAllNotifications), // Ensure it's boolean
      notificationSettings: {
        lessonReminders: Boolean(notificationKeys.lessonReminders),
        newContentAlerts: Boolean(notificationKeys.newContentAlerts),
        systemUpdates: Boolean(notificationKeys.systemUpdates),
        promotions: Boolean(notificationKeys.promotions),
        quietHours: {
          startTime: null,
          endTime: null,
        },
      },
    };

    console.log('📤 Sending payload to API:', payload);

    try {
      const res = await apiRequest(
        ApiURL.updateNotificationSetting,
        'POST',
        payload,
        true,
      );

      console.log('✅ API Response from updateNotificationSetting:', res);
      setLoader(false);

      if (!res?.error) {
        showSuccessToast('Notification settings updated successfully!');
        // Optionally navigate back or refresh data
        navigation.goBack();
      } else {
        const errorMsg =
          res?.message ||
          'Failed to update notification settings. Please try again.';
        // setErrorMessage(errorMsg);
        // setFailedModalState(true);

        // Show error toast for user feedback
        showErrorToast(errorMsg);
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoader(false);

      // Determine error message based on error type
      let errorMsg =
        'Network error. Please check your connection and try again.';

      if (error.message?.includes('enableNotifications')) {
        errorMsg =
          'Notification settings are required. Please enable or disable notifications.';
      }

      // setErrorMessage(errorMsg);
      // setFailedModalState(true);
      showErrorToast(errorMsg);
    }
  }

  // Function to handle enableAllNotifications toggle
  const handleMasterToggle = (value: boolean) => {
    setEnableAllNotifications(value);

    // Show confirmation when turning off all notifications
    if (!value) {
      Alert.alert(
        'Turn Off All Notifications?',
        'This will disable all notification categories. You can enable them individually later.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setEnableAllNotifications(true),
          },
          {
            text: 'Turn Off',
            onPress: () => {
              // Already set to false by the toggle
            },
          },
        ],
      );
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        showBackButton={true}
        showNotifications={false}
        title={languageData?.notification_settings || 'Notification Settings'}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Master Switch Section */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: moderateScale(18),
            paddingVertical: moderateScale(12),
            borderBottomWidth: 0.5,
            borderColor: '#EEF2F6',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: moderateScale(14),
                fontFamily: FontFamily.KhulaSemiBold,
                color: theme.black,
              }}
            >
              {languageData?.enable_all_notifications ||
                'Enable All Notifications'}
            </Text>
            <Text
              style={{
                fontSize: moderateScale(12),
                fontFamily: FontFamily.KhulaRegular,
                color: '#6B7280',
                marginTop: moderateScale(4),
              }}
            >
              {languageData?.master_switch_desc ||
                'Master switch for all notification settings'}
            </Text>
          </View>

          <Switch
            value={enableAllNotifications}
            onValueChange={handleMasterToggle}
            thumbColor={enableAllNotifications ? theme.themeColor : '#f4f3f4'}
            trackColor={{
              true: `${theme.themeColor}80`, // 50% opacity
              false: '#D1D1D1',
            }}
          />
        </View>

        {/* Alert Categories Section */}
        <Text style={styles.sectionTitle}>
          {languageData?.alert_categories || 'Alert Categories'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {enableAllNotifications
            ? 'Customize which notifications you want to receive'
            : 'Turn on "Enable All Notifications" to customize categories'}
        </Text>

        <View
          style={[
            styles.categoryBox,
            !enableAllNotifications && styles.disabledCategoryBox,
          ]}
        >
          <View style={styles.categoryRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.categoryText,
                  !enableAllNotifications && styles.disabledText,
                ]}
              >
                {languageData?.lesson_start_reminders ||
                  'Lesson start reminders'}
              </Text>
              <Text
                style={[
                  styles.subText,
                  !enableAllNotifications && styles.disabledText,
                ]}
              >
                {languageData?.lesson_start_desc ||
                  'Get notified before lessons start'}
              </Text>
            </View>
            <Switch
              value={notificationKeys.lessonReminders}
              onValueChange={value =>
                setNotificationKeys(prev => ({
                  ...prev,
                  lessonReminders: value,
                }))
              }
              disabled={!enableAllNotifications}
              thumbColor={
                notificationKeys.lessonReminders && enableAllNotifications
                  ? theme.themeColor
                  : '#f4f3f4'
              }
              trackColor={{
                true: enableAllNotifications ? theme.themeColor : '#D1D1D1',
                false: '#D1D1D1',
              }}
            />
          </View>

          <View style={styles.categoryRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.categoryText,
                  !enableAllNotifications && styles.disabledText,
                ]}
              >
                New story/content available
              </Text>
              <Text
                style={[
                  styles.subText,
                  !enableAllNotifications && styles.disabledText,
                ]}
              >
                Get notified about new content
              </Text>
            </View>
            <Switch
              value={notificationKeys.newContentAlerts}
              onValueChange={value =>
                setNotificationKeys(prev => ({
                  ...prev,
                  newContentAlerts: value,
                }))
              }
              disabled={!enableAllNotifications}
              thumbColor={
                notificationKeys.newContentAlerts && enableAllNotifications
                  ? theme.themeColor
                  : '#f4f3f4'
              }
              trackColor={{
                true: enableAllNotifications ? theme.themeColor : '#D1D1D1',
                false: '#D1D1D1',
              }}
            />
          </View>

          <View style={styles.categoryRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.categoryText,
                  !enableAllNotifications && styles.disabledText,
                ]}
              >
                System announcements or updates
              </Text>
              <Text
                style={[
                  styles.subText,
                  !enableAllNotifications && styles.disabledText,
                ]}
              >
                Important system updates and announcements
              </Text>
            </View>
            <Switch
              value={notificationKeys.systemUpdates}
              onValueChange={value =>
                setNotificationKeys(prev => ({
                  ...prev,
                  systemUpdates: value,
                }))
              }
              disabled={!enableAllNotifications}
              thumbColor={
                notificationKeys.systemUpdates && enableAllNotifications
                  ? theme.themeColor
                  : '#f4f3f4'
              }
              trackColor={{
                true: enableAllNotifications ? theme.themeColor : '#D1D1D1',
                false: '#D1D1D1',
              }}
            />
          </View>

          <View style={styles.categoryRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.categoryText,
                  !enableAllNotifications && styles.disabledText,
                ]}
              >
                Promotional or special feature alerts
              </Text>
              <Text
                style={[
                  styles.subText,
                  !enableAllNotifications && styles.disabledText,
                ]}
              >
                Offers and new feature announcements
              </Text>
            </View>
            <Switch
              value={notificationKeys.promotions}
              onValueChange={value =>
                setNotificationKeys(prev => ({
                  ...prev,
                  promotions: value,
                }))
              }
              disabled={!enableAllNotifications}
              thumbColor={
                notificationKeys.promotions && enableAllNotifications
                  ? theme.themeColor
                  : '#f4f3f4'
              }
              trackColor={{
                true: enableAllNotifications ? theme.themeColor : '#D1D1D1',
                false: '#D1D1D1',
              }}
            />
          </View>
        </View>

        {/* Connection Behavior Section */}
        <Text style={[styles.sectionTitle, { marginTop: moderateScale(14) }]}>
          {languageData?.quiet_hours || 'Quiet Hours'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {enableAllNotifications
            ? "Set when you don't want to receive notifications"
            : 'Enable notifications to set quiet hours'}
        </Text>

        <View
          style={[
            styles.connectionBox,
            !enableAllNotifications && styles.disabledCategoryBox,
          ]}
        >
          <View style={styles.timeBoxRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.smallLabel,
                  !enableAllNotifications && styles.disabledText,
                ]}
              >
                Start Time
              </Text>
              <Text
                style={[
                  styles.subText,
                  !enableAllNotifications && styles.disabledText,
                ]}
              >
                When to start receiving notifications
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.timeButton,
                !enableAllNotifications && styles.disabledButton,
              ]}
              onPress={() => enableAllNotifications && openTimeModal('start')}
              disabled={!enableAllNotifications}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  !enableAllNotifications && styles.disabledText,
                ]}
              >{`${connectionStart.hour} : ${connectionStart.minute} ${connectionStart.period}`}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeBoxRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.smallLabel,
                  !enableAllNotifications && styles.disabledText,
                ]}
              >
                End Time
              </Text>
              <Text
                style={[
                  styles.subText,
                  !enableAllNotifications && styles.disabledText,
                ]}
              >
                When to stop receiving notifications
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.timeButton,
                !enableAllNotifications && styles.disabledButton,
              ]}
              onPress={() => enableAllNotifications && openTimeModal('end')}
              disabled={!enableAllNotifications}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  !enableAllNotifications && styles.disabledText,
                ]}
              >{`${connectionEnd.hour} : ${connectionEnd.minute} ${connectionEnd.period}`}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <CustomButton
            text={
              loader
                ? languageData?.saving || 'Saving...'
                : languageData?.save_settings || 'Save Settings'
            }
            backgroundColor={theme.themeColor}
            onPress={handleSave}
            height={moderateScale(40)}
            disable={loader}
            style={{
              borderRadius: moderateScale(10),
              opacity: loader ? 0.7 : 1,
            }}
          />
        </View>
      </ScrollView>

      {/* Time Edit Modal */}
      <Modal
        visible={timeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {languageData?.edit_time || 'Edit Time'}
            </Text>

            <View style={styles.modalRow}>
              <TextInput
                value={tempTime.hour}
                onChangeText={h => setTempTime(prev => ({ ...prev, hour: h }))}
                keyboardType="numeric"
                maxLength={2}
                style={styles.modalInput}
                placeholder="HH"
                placeholderTextColor="#999"
              />
              <Text
                style={{ marginHorizontal: 6, fontSize: moderateScale(20) }}
              >
                :
              </Text>
              <TextInput
                value={tempTime.minute}
                onChangeText={m =>
                  setTempTime(prev => ({ ...prev, minute: m }))
                }
                keyboardType="numeric"
                maxLength={2}
                style={styles.modalInput}
                placeholder="MM"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.modalPeriodRow}>
              <TouchableOpacity
                style={[
                  styles.periodBtn,
                  tempTime.period === 'AM' && {
                    backgroundColor: theme.themeColor,
                  },
                ]}
                onPress={() => setTempTime(prev => ({ ...prev, period: 'AM' }))}
              >
                <Text
                  style={[
                    styles.periodBtnText,
                    tempTime.period === 'AM' && { color: 'white' },
                  ]}
                >
                  AM
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.periodBtn,
                  tempTime.period === 'PM' && {
                    backgroundColor: theme.themeColor,
                  },
                ]}
                onPress={() => setTempTime(prev => ({ ...prev, period: 'PM' }))}
              >
                <Text
                  style={[
                    styles.periodBtnText,
                    tempTime.period === 'PM' && { color: 'white' },
                  ]}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginTop: moderateScale(18),
                width: '100%',
                justifyContent: 'space-between',
              }}
            >
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setTimeModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>
                  {languageData?.cancel || 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSave} onPress={saveTempTime}>
                <Text style={styles.modalSaveText}>
                  {languageData?.save || 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
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
    scrollContent: { paddingBottom: moderateScale(40) },
    sectionTitle: {
      fontSize: moderateScale(15),
      fontFamily: FontFamily.KhulaBold,
      marginLeft: moderateScale(18),
      marginTop: moderateScale(14),
      color: theme.black,
    },
    sectionSubtitle: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      marginLeft: moderateScale(18),
      marginBottom: moderateScale(8),
      color: '#6B7280',
    },
    subText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: '#6B7280',
      marginTop: moderateScale(4),
    },
    disabledText: {
      color: '#9CA3AF',
    },
    categoryBox: {
      marginHorizontal: moderateScale(18),
      borderRadius: moderateScale(10),
      padding: moderateScale(10),
      backgroundColor: '#FAFAFB',
      borderWidth: 1,
      borderColor: '#F1F5F9',
    },
    disabledCategoryBox: {
      backgroundColor: '#F9FAFB',
      borderColor: '#E5E7EB',
    },
    categoryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: moderateScale(8),
    },
    categoryText: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.black,
      flex: 1,
      paddingRight: moderateScale(8),
    },
    connectionBox: {
      marginHorizontal: moderateScale(18),
      marginTop: moderateScale(8),
      padding: moderateScale(12),
      borderRadius: moderateScale(10),
      backgroundColor: '#FAFAFB',
      borderWidth: 1,
      borderColor: '#F1F5F9',
    },
    timeBoxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: moderateScale(10),
    },
    smallLabel: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: '#374151',
    },
    timeButton: {
      paddingVertical: moderateScale(8),
      paddingHorizontal: moderateScale(12),
      backgroundColor: '#FFF',
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: '#E5E7EB',
      minWidth: moderateScale(140),
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: '#F3F4F6',
      borderColor: '#E5E7EB',
    },
    timeButtonText: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
    },
    buttonContainer: {
      marginHorizontal: moderateScale(20),
      marginTop: moderateScale(30),
      marginBottom: moderateScale(20),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: moderateScale(20),
    },
    modalBox: {
      width: '100%',
      backgroundColor: theme.white,
      borderRadius: moderateScale(12),
      padding: moderateScale(18),
    },
    modalTitle: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.black,
      marginBottom: moderateScale(8),
    },
    modalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: moderateScale(6),
    },
    modalInput: {
      width: moderateScale(70),
      height: moderateScale(46),
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: moderateScale(8),
      textAlign: 'center',
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
    },
    modalPeriodRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: moderateScale(12),
      gap: moderateScale(12),
    },
    periodBtn: {
      paddingVertical: moderateScale(8),
      paddingHorizontal: moderateScale(18),
      borderRadius: moderateScale(8),
      backgroundColor: '#F3F4F6',
    },
    periodBtnText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: '#374151',
    },
    modalCancel: {
      flex: 1,
      paddingVertical: moderateScale(12),
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: '#E5E7EB',
      alignItems: 'center',
      marginRight: moderateScale(8),
    },
    modalCancelText: {
      fontSize: moderateScale(14),
      color: '#374151',
      fontFamily: FontFamily.KhulaSemiBold,
    },
    modalSave: {
      flex: 1,
      paddingVertical: moderateScale(12),
      borderRadius: moderateScale(8),
      backgroundColor: theme.themeColor,
      alignItems: 'center',
    },
    modalSaveText: {
      fontSize: moderateScale(14),
      color: theme.white,
      fontFamily: FontFamily.KhulaSemiBold,
    },
  });

export default UserNotification;
