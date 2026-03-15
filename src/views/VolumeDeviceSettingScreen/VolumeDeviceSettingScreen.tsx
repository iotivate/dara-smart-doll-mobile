/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { moderateScale } from 'react-native-size-matters';
import CustomHeader from '@components/CustomHeader';
import CustomVectorIcons from '@components/CustomVectorIcons';
import FontFamily from '@assets/fonts/FontFamily';
import { useTheme } from '@theme/themeContext';
import CustomButton from '@components/CustomButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const VolumeDeviceSettingScreen = (props: any) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  // ===== State =====
  const [muteDoll, setMuteDoll] = useState(false);
  const [muteApp, setMuteApp] = useState(true);

  const [dollVolume, setDollVolume] = useState(0.75);
  const [appVolume, setAppVolume] = useState(0.75);

  const [audioSwitch, setAudioSwitch] = useState(true);
  const [forcePlayback, setForcePlayback] = useState(false);

  const [autoReconnect, setAutoReconnect] = useState(true);

  // ===== Handlers =====
  const toggle = useCallback((setter: any) => setter((p: boolean) => !p), []);

  const volumeLabel = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <ScrollView>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <StatusBar
          backgroundColor={theme.statusBarColor}
          barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        />

        <CustomHeader
          title="Volume & Device Setting"
          showBackButton
          showNotifications={false}
        />

        <View style={styles.container}>
          {/* Connected Info */}
          <View style={styles.connectedCard}>
            <Text style={styles.connectedText}>
              Connected to: Amina Doll - 01
            </Text>
            <Text style={styles.batteryText}>Battery: 70%</Text>
          </View>

          {/* Mute Section */}
          <View style={styles.sectionCard}>
            <RowSwitch
              label="Mute Doll Speaker"
              value={muteDoll}
              onPress={() => toggle(setMuteDoll)}
              theme={theme}
            />
            <Divider />
            <RowSwitch
              label="Mute App Speaker"
              value={muteApp}
              onPress={() => toggle(setMuteApp)}
              theme={theme}
            />
          </View>

          {/* Volume Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Doll speaker Volume</Text>
            <VolumeRow
              value={dollVolume}
              onChange={setDollVolume}
              label={volumeLabel(dollVolume)}
              theme={theme}
            />

            <Text
              style={[styles.sectionTitle, { marginTop: moderateScale(10) }]}
            >
              In-App Audio
            </Text>
            <VolumeRow
              value={appVolume}
              onChange={setAppVolume}
              label={volumeLabel(appVolume)}
              theme={theme}
            />
          </View>

          {/* Audio Playback */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Audio Playback Volume</Text>

            <RowSwitch
              label="Audio-Switch (Recommended)"
              value={audioSwitch}
              onPress={() => toggle(setAudioSwitch)}
              theme={theme}
            />
            <Divider />
            <RowSwitch
              label="Force Playback to Doll"
              value={forcePlayback}
              onPress={() => toggle(setForcePlayback)}
              theme={theme}
            />
          </View>

          {/* Connection Behavior */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Connection Behavior</Text>

            <RowSwitch
              label="Auto-reconnect on startup"
              value={autoReconnect}
              onPress={() => toggle(setAutoReconnect)}
              theme={theme}
            />
            <Text style={styles.helperText}>
              Automatically tries to connect when the app is opened.
            </Text>
          </View>

          {/* Save Button */}
          <CustomButton
            text={'Save Settings'}
            backgroundColor={theme.themeColor}
            onPress={() => {
              props.navigation.navigate('');
            }}
            height={moderateScale(45)}
            style={{
              alignSelf: 'center',
              borderRadius: moderateScale(12),
              marginTop: moderateScale(8),
              // marginBottom: moderateScale(10),
            }}
          />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

// ===== Reusable Components =====
const RowSwitch = ({ label, value, onPress, theme }: any) => (
  <TouchableOpacity
    activeOpacity={0.7}
    style={stylesStatic.row}
    onPress={onPress}
  >
    <Text style={stylesStatic.rowLabel}>{label}</Text>
    <CustomVectorIcons
      name={value ? 'toggle-right' : 'toggle-left'}
      iconSet="Feather"
      size={moderateScale(30)}
      color={value ? theme.themeColor : theme.borderColorDynamic}
    />
  </TouchableOpacity>
);

const VolumeRow = ({ value, onChange, label, theme }: any) => (
  <View style={stylesStatic.volumeRow}>
    <CustomVectorIcons
      name="volume-2"
      iconSet="Feather"
      size={moderateScale(18)}
      color={theme.text}
    />
    <Slider
      style={stylesStatic.slider}
      minimumValue={0}
      maximumValue={1}
      value={value}
      minimumTrackTintColor={theme.themeColor}
      maximumTrackTintColor={theme.borderColorDynamic}
      thumbTintColor={theme.themeColor}
      onValueChange={onChange}
    />
    <Text style={stylesStatic.percent}>{label}</Text>
  </View>
);

const Divider = () => <View style={stylesStatic.divider} />;

// ===== Styles =====
const stylesStatic = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(10),
  },
  rowLabel: {
    fontFamily: FontFamily.KhulaSemiBold,
    fontSize: moderateScale(14),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.2,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(6),
  },
  slider: {
    flex: 1,
    marginHorizontal: moderateScale(8),
  },
  percent: {
    fontFamily: FontFamily.KhulaSemiBold,
    fontSize: moderateScale(12),
  },
});

const getStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: { flex: 1 },
    container: {
      paddingHorizontal: moderateScale(16),
      paddingTop: moderateScale(10),
    },
    connectedCard: {
      backgroundColor: theme.themeLight,
      borderRadius: moderateScale(14),
      padding: moderateScale(12),
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: moderateScale(10),
    },
    connectedText: {
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(12),
      color: theme.text,
    },
    batteryText: {
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(12),
      color: theme.text,
    },
    sectionCard: {
      backgroundColor: theme.white,
      borderRadius: moderateScale(16),
      padding: moderateScale(14),
      marginBottom: moderateScale(10),
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOpacity: 0.08,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
        },
        android: { elevation: 3 },
      }),
    },
    sectionTitle: {
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(13),
      color: theme.text,
      marginBottom: moderateScale(-8),
    },
    sectionHeader: {
      fontFamily: FontFamily.KhulaExtraBold,
      fontSize: moderateScale(14),
      color: theme.text,
      // marginBottom: moderateScale(6),
    },
    helperText: {
      marginTop: moderateScale(2),
      fontFamily: FontFamily.KhulaRegular,
      fontSize: moderateScale(11),
      color: theme.textSub,
    },
  });

export default VolumeDeviceSettingScreen;
