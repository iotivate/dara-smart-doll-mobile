import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import CustomHeader from '@components/CustomHeader';
import CustomButton from '@components/CustomButton';
import CustomVectorIcons from '@components/CustomVectorIcons';
import IMAGES from '@assets/images';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TimeValue = { hour: string; minute: string; period: 'AM' | 'PM' };

const STORAGE_KEY = '@app_settings_v1';

const HomeSettings = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Notification settings
  const [silentNotificationsOnly, setSilentNotificationsOnly] = useState(false);
  const [soundEffect, setSoundEffect] = useState(true);
  const [enableAllNotifications, setEnableAllNotifications] = useState(true);

  // Alert categories
  const [alerts, setAlerts] = useState({
    lessonStart: true,
    missedLesson: false,
    newContent: true,
    systemAnnouncements: false,
    promotional: false,
  });

  // Connection behavior times
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

  // Modal for time editing
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<'start' | 'end' | null>(
    null,
  );
  const [tempTime, setTempTime] = useState<TimeValue>({
    hour: '09',
    minute: '00',
    period: 'AM',
  });

  // load settings from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // merge carefully
          setSilentNotificationsOnly(Boolean(parsed.silentNotificationsOnly));
          setSoundEffect(Boolean(parsed.soundEffect));
          setEnableAllNotifications(Boolean(parsed.enableAllNotifications));
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

  // Interdependent logic: if silentNotificationsOnly = true -> soundEffect false
  useEffect(() => {
    if (silentNotificationsOnly) {
      setSoundEffect(false);
    }
  }, [silentNotificationsOnly]);

  // Toggle helper for alerts
  const toggleAlert = (key: keyof typeof alerts) => {
    setAlerts(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
      Alert.alert('Invalid time', 'Please enter valid hour/minute');
      return;
    }
    const format = (val: string) => {
      const n = parseInt(val, 10);
      if (isNaN(n)) return '00';
      if (n <= 0) return '00';
      if (n < 10) return `0${n}`;
      return `${n}`;
    };
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

  const clearLocalCache = async () => {
    Alert.alert(
      'Clear cache',
      'Are you sure you want to clear local cache/data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Done', 'Local cache/data cleared.');
            } catch (err) {
              Alert.alert('Error', 'Failed to clear local cache.');
              console.warn(err);
            }
          },
        },
      ],
    );
  };

  const logout = async () => {
    Alert.alert('Logout', 'Do you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            navigation.replace('Login'); // adjust route name if needed
          } catch (err) {
            console.warn('Logout error', err);
            navigation.replace('Login');
          }
        },
      },
    ]);
  };

  const saveSettings = async () => {
    const payload = {
      silentNotificationsOnly,
      soundEffect,
      enableAllNotifications,
      alerts,
      connectionStart,
      connectionEnd,
      savedAt: new Date().toISOString(),
    };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      // You can also call API here if needed
      Alert.alert('Settings saved', 'Your settings were saved successfully.');
      console.log('Saved settings payload:', payload);
    } catch (err) {
      console.warn('Save settings failed', err);
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Back"
        goBack
        rightIcon={
          <View style={styles.profileRow}>
            <Image source={IMAGES.user4} style={styles.headerAvatar} />
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Help & Support / Language / Privacy */}
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Help and Support</Text>
          <CustomVectorIcons
            name="chevron-right"
            type="Feather"
            size={20}
            color={theme.black}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Language Settings</Text>
          <CustomVectorIcons
            name="chevron-right"
            type="Feather"
            size={20}
            color={theme.black}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Privacy Settings</Text>
          <CustomVectorIcons
            name="chevron-right"
            type="Feather"
            size={20}
            color={theme.black}
          />
        </TouchableOpacity>

        {/* Silent Notifications Only */}
        <View style={styles.switchRow}>
          <Text style={styles.rowText}>Silent Notifications Only</Text>
          <Switch
            value={silentNotificationsOnly}
            onValueChange={setSilentNotificationsOnly}
            thumbColor={silentNotificationsOnly ? theme.themeColor : undefined}
            trackColor={{ true: theme.themeColor20, false: '#D1D1D1' }}
          />
        </View>

        {/* Sound Effect */}
        <View style={styles.switchRow}>
          <Text style={styles.rowText}>Sound Effect</Text>
          <Switch
            value={soundEffect}
            onValueChange={val => setSoundEffect(val)}
            thumbColor={soundEffect ? theme.themeColor : undefined}
            trackColor={{ true: theme.themeColor20, false: '#D1D1D1' }}
            disabled={silentNotificationsOnly} // disabled when silent mode enabled
          />
        </View>

        {/* Enable All Notifications */}
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowText}>Enable All Notifications</Text>
            <Text style={styles.subText}>
              Automatically tries to connect when the app is opened.
            </Text>
          </View>
          <Switch
            value={enableAllNotifications}
            onValueChange={setEnableAllNotifications}
            thumbColor={enableAllNotifications ? theme.themeColor : undefined}
            trackColor={{ true: theme.themeColor20, false: '#D1D1D1' }}
          />
        </View>

        {/* Alert Categories */}
        <Text style={styles.sectionTitle}>Alert Categories</Text>
        <View style={styles.categoryBox}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>Lesson start reminders</Text>
            <Switch
              value={alerts.lessonStart}
              onValueChange={() => toggleAlert('lessonStart')}
              thumbColor={alerts.lessonStart ? theme.themeColor : undefined}
              trackColor={{ true: theme.themeColor20, false: '#D1D1D1' }}
            />
          </View>

          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>Missed lesson follow-up</Text>
            <Switch
              value={alerts.missedLesson}
              onValueChange={() => toggleAlert('missedLesson')}
              thumbColor={alerts.missedLesson ? theme.themeColor : undefined}
              trackColor={{ true: theme.themeColor20, false: '#D1D1D1' }}
            />
          </View>

          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>New story/content available</Text>
            <Switch
              value={alerts.newContent}
              onValueChange={() => toggleAlert('newContent')}
              thumbColor={alerts.newContent ? theme.themeColor : undefined}
              trackColor={{ true: theme.themeColor20, false: '#D1D1D1' }}
            />
          </View>

          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>
              System announcements or updates
            </Text>
            <Switch
              value={alerts.systemAnnouncements}
              onValueChange={() => toggleAlert('systemAnnouncements')}
              thumbColor={
                alerts.systemAnnouncements ? theme.themeColor : undefined
              }
              trackColor={{ true: theme.themeColor20, false: '#D1D1D1' }}
            />
          </View>

          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>
              Promotional or special feature alerts
            </Text>
            <Switch
              value={alerts.promotional}
              onValueChange={() => toggleAlert('promotional')}
              thumbColor={alerts.promotional ? theme.themeColor : undefined}
              trackColor={{ true: theme.themeColor20, false: '#D1D1D1' }}
            />
          </View>
        </View>

        {/* Connection Behavior */}
        <Text style={[styles.sectionTitle, { marginTop: moderateScale(14) }]}>
          Connection Behavior
        </Text>
        <View style={styles.connectionBox}>
          <View style={styles.timeBoxRow}>
            <Text style={styles.smallLabel}>Start Time</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => openTimeModal('start')}
            >
              <Text
                style={styles.timeButtonText}
              >{`${connectionStart.hour} : ${connectionStart.minute} ${connectionStart.period}`}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeBoxRow}>
            <Text style={styles.smallLabel}>End Time</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => openTimeModal('end')}
            >
              <Text
                style={styles.timeButtonText}
              >{`${connectionEnd.hour} : ${connectionEnd.minute} ${connectionEnd.period}`}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Clear cache / Logout */}
        <TouchableOpacity style={styles.dangerRow} onPress={clearLocalCache}>
          <Text style={styles.dangerText}>Clear Local Cache/Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerRow} onPress={logout}>
          <Text style={styles.dangerText}>Logout</Text>
        </TouchableOpacity>

        <CustomButton
          text="Save Settings"
          backgroundColor={theme.themeColor}
          height={moderateScale(52)}
          style={{
            marginTop: moderateScale(20),
            marginHorizontal: moderateScale(20),
            borderRadius: moderateScale(10),
          }}
          onPress={saveSettings}
        />
      </ScrollView>

      {/* Time edit modal */}
      <Modal
        visible={timeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Time</Text>

            <View style={styles.modalRow}>
              <TextInput
                value={tempTime.hour}
                onChangeText={h => setTempTime(prev => ({ ...prev, hour: h }))}
                keyboardType="numeric"
                maxLength={2}
                style={styles.modalInput}
              />
              <Text style={{ marginHorizontal: 6 }}>:</Text>
              <TextInput
                value={tempTime.minute}
                onChangeText={m =>
                  setTempTime(prev => ({ ...prev, minute: m }))
                }
                keyboardType="numeric"
                maxLength={2}
                style={styles.modalInput}
              />
            </View>

            <View style={styles.modalPeriodRow}>
              <TouchableOpacity
                style={[
                  styles.periodBtn,
                  tempTime.period === 'AM' && {
                    backgroundColor: theme.themeColor20,
                  },
                ]}
                onPress={() => setTempTime(prev => ({ ...prev, period: 'AM' }))}
              >
                <Text
                  style={[
                    styles.periodBtnText,
                    tempTime.period === 'AM' && { color: theme.themeColor },
                  ]}
                >
                  AM
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.periodBtn,
                  tempTime.period === 'PM' && {
                    backgroundColor: theme.themeColor20,
                  },
                ]}
                onPress={() => setTempTime(prev => ({ ...prev, period: 'PM' }))}
              >
                <Text
                  style={[
                    styles.periodBtnText,
                    tempTime.period === 'PM' && { color: theme.themeColor },
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
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSave} onPress={saveTempTime}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
    scrollContent: { paddingBottom: moderateScale(40) },

    // rows
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: moderateScale(18),
      paddingVertical: moderateScale(12),
      borderBottomWidth: 0.5,
      borderColor: '#EEF2F6',
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
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: moderateScale(18),
      paddingVertical: moderateScale(12),
      borderBottomWidth: 0.5,
      borderColor: '#EEF2F6',
    },

    sectionTitle: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaBold,
      marginLeft: moderateScale(18),
      marginTop: moderateScale(14),
      marginBottom: moderateScale(8),
      color: theme.black,
    },

    categoryBox: {
      marginHorizontal: moderateScale(18),
      borderRadius: moderateScale(10),
      padding: moderateScale(10),
      backgroundColor: '#FAFAFB',
      borderWidth: 1,
      borderColor: '#F1F5F9',
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
    timeButtonText: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
    },

    dangerRow: {
      paddingHorizontal: moderateScale(18),
      paddingVertical: moderateScale(12),
    },
    dangerText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.themeRed,
    },

    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerAvatar: {
      width: moderateScale(36),
      height: moderateScale(36),
      borderRadius: moderateScale(18),
    },

    // Modal
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

export default HomeSettings;
