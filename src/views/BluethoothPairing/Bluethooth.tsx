/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import CustomLoader from '@utils/CustomLoader';
import IMAGES from '@assets/images';
import CustomHeader from '@components/CustomHeader';
import { useBluetooth } from '@components/BluetoothContext';
import CustomVectorIcons from '@components/CustomVectorIcons';

// ================= COMPONENTS =================

const FilterButtons = ({ allDevices, isScanning }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const daraCount = allDevices?.filter((d: any) => d?.isDara)?.length;
  // const otherCount = allDevices.filter((d: any) => !d?.isDara).length;

  return (
    <View style={styles.filterContainer}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>{'DARA Smart Buddy'}</Text>

        {/* {(isScanning || allDevices.length > 0) && (
          <TouchableOpacity
            onPress={toggleDeviceView}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleButtonText}>
              {showAllDevices ? 'Show Only DARA' : 'Show All'}
            </Text>
          </TouchableOpacity>
        )} */}
      </View>

      {(isScanning || allDevices.length > 0) && (
        <View style={styles.deviceStats}>
          <Text style={styles.deviceStat}>
            📱 DARA Smart Buddy: {daraCount}
          </Text>
          {/* <Text style={styles.deviceStat}>🔵 Other Devices: {otherCount}</Text> */}
        </View>
      )}
    </View>
  );
};

const StatusModal = ({
  visible,
  onClose,
  deviceInfo,
  batteryLevel,
  connectionStatus,
  usageData,
}: any) => {
  const { theme } = useTheme();
  const styles = getModalStyles(theme);

  let firmwareInfo = {
    current_version: '1.2.3',
    build_date: '2024-01-15',
    partition: 'ota_0',
    update_available: false,
    latest_version: '1.2.3',
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Device Status</Text>
            <TouchableOpacity onPress={onClose}>
              <CustomVectorIcons
                name="close"
                iconSet="Ionicons"
                size={moderateScale(24)}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Connection Status */}
            <View style={styles.statusCard}>
              <Text style={styles.cardTitle}>Connection Status</Text>
              <Text style={[styles.statusValue, { color: '#34C759' }]}>
                {connectionStatus?.toUpperCase() || 'DISCONNECTED'}
              </Text>
            </View>

            {/* Device Information */}
            {deviceInfo && (
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Device Information</Text>
                {deviceInfo?.manufacturer && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Manufacturer:</Text>
                    <Text style={styles.infoValue}>
                      {deviceInfo.manufacturer}
                    </Text>
                  </View>
                )}
                {deviceInfo?.model && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Model:</Text>
                    <Text style={styles.infoValue}>{deviceInfo.model}</Text>
                  </View>
                )}
                {deviceInfo?.serial && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Serial:</Text>
                    <Text style={styles.infoValue}>{deviceInfo.serial}</Text>
                  </View>
                )}

                {deviceInfo?.firmware && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Firmware:</Text>
                    <Text style={styles.infoValue}>{deviceInfo.firmware}</Text>
                  </View>
                )}
                {deviceInfo?.hardware && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Hardware:</Text>
                    <Text style={styles.infoValue}>{deviceInfo.hardware}</Text>
                  </View>
                )}
                {deviceInfo?.software && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Software:</Text>
                    <Text style={styles.infoValue}>{deviceInfo.software}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Battery Status */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Battery Status</Text>
              <View style={styles.batteryContainer}>
                <CustomVectorIcons
                  name={
                    batteryLevel > 50
                      ? 'battery-full'
                      : batteryLevel > 20
                      ? 'battery-half'
                      : 'battery-dead'
                  }
                  iconSet="Ionicons"
                  size={moderateScale(40)}
                  color={batteryLevel > 20 ? '#34C759' : '#FF3B30'}
                />
                <Text style={styles.batteryText}>
                  {batteryLevel !== null ? `${batteryLevel}%` : 'N/A'}
                </Text>
              </View>
              {batteryLevel !== null && batteryLevel <= 20 && (
                <Text style={styles.lowBatteryWarning}>
                  ⚠️ Low Battery - Please charge
                </Text>
              )}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>OTA Service</Text>
              {firmwareInfo && firmwareInfo?.current_version && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Current Version:</Text>
                  <Text style={styles.infoValue}>
                    {firmwareInfo?.current_version}
                  </Text>
                </View>
              )}
              {firmwareInfo && firmwareInfo?.build_date && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Build Date:</Text>
                  <Text style={styles.infoValue}>
                    {firmwareInfo?.build_date}
                  </Text>
                </View>
              )}

              {firmwareInfo && firmwareInfo?.partition && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Partition:</Text>
                  <Text style={styles.infoValue}>
                    {firmwareInfo?.partition}
                  </Text>
                </View>
              )}
              {firmwareInfo && firmwareInfo?.update_available && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Update Available:</Text>
                  <Text style={styles.infoValue}>
                    {firmwareInfo?.update_available}
                  </Text>
                </View>
              )}
              {firmwareInfo && firmwareInfo?.latest_version && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>latest Version:</Text>
                  <Text style={styles.infoValue}>
                    {firmwareInfo?.latest_version}
                  </Text>
                </View>
              )}
            </View>
            {/* Firmware Information */}
            {/* <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>OTA Service</Text>
              {firmwareInfo && firmwareInfo?.current_version && (
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Firmware Information</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Current Version:</Text>
                    <Text style={styles.infoValue}>
                      {firmwareInfo?.current_version}
                    </Text>
                  </View>
                  {firmwareInfo?.build_date && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Build Date:</Text>
                      <Text style={styles.infoValue}>
                        {firmwareInfo?.build_date}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View> */}

            {/* Usage Data */}
            {usageData && (
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Today's Usage</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total Minutes:</Text>
                  <Text style={styles.infoValue}>
                    {usageData.today?.total_minutes || 0}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Stories Played:</Text>
                  <Text style={styles.infoValue}>
                    {usageData.today?.stories_played || 0}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>AI Interactions:</Text>
                  <Text style={styles.infoValue}>
                    {usageData.today?.ai_interactions || 0}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const WiFiModal = ({
  visible,
  onClose,
  configuration,
  updateConfiguration,
}: any) => {
  const { theme } = useTheme();
  const styles = getModalStyles(theme);
  const [ssid, setSsid] = useState(configuration?.wifi?.ssid || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;

    if (configuration?.wifi?.connected === true) {
      Alert.alert('Success', 'WiFi connected successfully');
      setSubmitted(false);
      onClose();
    }

    if (configuration?.wifi?.connected === false) {
      Alert.alert('WiFi Failed', 'Please check SSID or password');
      setSubmitted(false);
    }
  }, [configuration?.wifi?.connected, submitted]);

  const handleConfigure = async () => {
    if (!ssid.trim()) {
      Alert.alert('Error', 'Please enter WiFi SSID');
      return;
    }
    if (!password.trim()) {
      Alert.alert(
        'Error',
        'Please enter WiFi password                                                                                                                                                                                                                              ',
      );
      return;
    }
    setSubmitted(true);
    setLoading(true);

    try {
      await updateConfiguration({
        wifi: {
          ssid: ssid.trim(),
          password: password.trim(),
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to send WiFi credentials');
      setSubmitted(false); // safety
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Configure WiFi</Text>
            <TouchableOpacity onPress={onClose}>
              <CustomVectorIcons
                name="close"
                iconSet="Ionicons"
                size={moderateScale(24)}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.wifiForm}>
            <Text style={styles.inputLabel}>WiFi Network Name (SSID)</Text>
            <TextInput
              style={styles.textInput}
              value={ssid}
              onChangeText={setSsid}
              placeholder="Enter WiFi name"
              placeholderTextColor={theme.textSub}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={theme.textSub}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.configureButton, loading && { opacity: 0.7 }]}
              onPress={handleConfigure}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <>
                  <CustomVectorIcons
                    name="wifi"
                    iconSet="Ionicons"
                    size={moderateScale(20)}
                    color={theme.white}
                  />
                  <Text style={styles.configureButtonText}>Configure WiFi</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SettingsModal = ({
  visible,
  onClose,
  configuration,
  updateConfiguration,
  childProfile,
  updateChildProfile,
  sendPlaybackCommand,
}: any) => {
  const { theme } = useTheme();
  const styles = getModalStyles(theme);
  const [volume, setVolume] = useState(configuration?.audio?.volume || 50);
  const [language, setLanguage] = useState(configuration?.language || 'en');
  const [childName, setChildName] = useState(childProfile?.name || '');
  const [childAge, setChildAge] = useState(childProfile?.age || '');

  const handleSaveSettings = async () => {
    try {
      // FIXED: Send volume command to correct characteristic (Playback Control)
      // per hardware guide: volume commands go to PLAYBACK_CONTROL_CHAR
      await sendPlaybackCommand('volume', { volume });

      // Update language only (volume handled separately)
      await updateConfiguration({
        language,
      });

      // Update child profile if name provided
      if (childName.trim()) {
        await updateChildProfile({
          name: childName.trim(),
          age: childAge ? parseInt(childAge) : null,
        });
      }

      Alert.alert('Success', 'Settings updated successfully');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Device Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <CustomVectorIcons
                name="close"
                iconSet="Ionicons"
                size={moderateScale(24)}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.settingsForm}>
            {/* Audio Settings */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Audio Settings</Text>
              <View style={styles.volumeContainer}>
                <Text style={styles.volumeLabel}>Volume: {volume}%</Text>
                <View style={styles.volumeSlider}>
                  <TouchableOpacity
                    onPress={() => setVolume(Math.max(0, volume - 10))}
                  >
                    <CustomVectorIcons
                      name="remove"
                      iconSet="Ionicons"
                      size={24}
                      color={theme.text}
                    />
                  </TouchableOpacity>
                  <Text style={styles.volumeValue}>{volume}</Text>
                  <TouchableOpacity
                    onPress={() => setVolume(Math.min(70, volume + 10))}
                  >
                    <CustomVectorIcons
                      name="add"
                      iconSet="Ionicons"
                      size={24}
                      color={theme.text}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Language Settings */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Language</Text>
              <View style={styles.languageContainer}>
                {['en', 'ha', 'yo'].map(lang => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.languageButton,
                      language === lang && styles.languageButtonActive,
                    ]}
                    onPress={() => setLanguage(lang)}
                  >
                    <Text
                      style={[
                        styles.languageText,
                        language === lang && styles.languageTextActive,
                      ]}
                    >
                      {lang === 'en'
                        ? 'English'
                        : lang === 'ha'
                        ? 'Hausa'
                        : 'Yoruba'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Child Profile */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Child Profile</Text>
              <TextInput
                style={styles.textInput}
                value={childName}
                onChangeText={setChildName}
                placeholder="Child's Name"
                placeholderTextColor={theme.textSub}
              />
              <TextInput
                style={styles.textInput}
                value={childAge}
                onChangeText={setChildAge}
                placeholder="Child's Age"
                placeholderTextColor={theme.textSub}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveSettings}
            >
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const DeviceItem = ({ item, onPress, loading }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const deviceName = item?.name || item?.localName || 'Unknown Device';
  // const isDara = item?.isDara;
  const isDara =
    item?.isDara ||
    item?.name?.includes('DARA') ||
    item?.localName?.includes('DARA');
  const rssi = item?.rssi ?? -100;

  const getSignalColor = () => {
    if (rssi > -60) return '#34C759';
    if (rssi > -70) return '#FF9500';
    if (rssi > -80) return '#FFCC00';
    return '#FF3B30';
  };

  return (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.deviceIconContainer}>
        <CustomVectorIcons
          name={isDara ? 'happy' : 'bluetooth'}
          iconSet="Ionicons"
          size={moderateScale(30)}
          color={isDara ? '#7E4FFF' : '#007AFF'}
        />
        {isDara && (
          <View style={styles.daraBadge}>
            <Text style={styles.daraBadgeText}>DARA</Text>
          </View>
        )}
      </View>

      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName} numberOfLines={1}>
          {deviceName}
        </Text>
        <Text
          style={[styles.deviceType, { color: isDara ? '#7E4FFF' : '#007AFF' }]}
        >
          {isDara ? 'DARA Smart Buddy' : 'Other Device'}
        </Text>
        <View style={styles.signalInfo}>
          <View
            style={[styles.signalDot, { backgroundColor: getSignalColor() }]}
          />
          <Text style={styles.signalText}>Signal: {rssi} dBm</Text>
        </View>
      </View>

      <CustomVectorIcons
        name="chevron-forward"
        iconSet="Ionicons"
        size={moderateScale(20)}
        color={theme.textSub}
      />
    </TouchableOpacity>
  );
};

const ConnectedCard = ({
  device,
  onDisconnect,
  onStatusPress,
  onSettingsPress,
  onWiFiPress,
  onPlayPause,
  onNext,
  onPrevious,
}: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const {
    batteryLevel,
    getConnectionStatusColor,
    getConnectionStatusText,
    playbackStatus,
    disconnecting,
    contentSync,
  }: any = useBluetooth();

  const deviceName = device?.name || 'Connected Device';
  const isDara = device?.isDara;

  return (
    <ScrollView>
      <View style={styles.connectedContainer}>
        {/* Big Connected Card */}
        <View
          style={[
            styles.bigConnectedCard,
            { backgroundColor: isDara ? '#F5F0FF' : '#F0F9FF' },
          ]}
        >
          <View style={styles.iconCircle}>
            <CustomVectorIcons
              name={isDara ? 'happy' : 'bluetooth'}
              iconSet="Ionicons"
              size={moderateScale(50)}
              color={isDara ? '#7E4FFF' : '#007AFF'}
            />
          </View>

          <View style={styles.connectedInfo}>
            <Text
              style={[
                styles.connectedBigLabel,
                { color: isDara ? '#7E4FFF' : '#007AFF' },
              ]}
            >
              CONNECTED TO
            </Text>
            <Text style={styles.connectedBigName}>{deviceName}</Text>
            <Text
              style={[
                styles.connectedBigType,
                { color: isDara ? '#7E4FFF' : '#007AFF' },
              ]}
            >
              {isDara ? 'DARA Smart Buddy' : 'Other Device'}
            </Text>

            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getConnectionStatusColor() },
                ]}
              />
              <Text style={styles.statusText}>{getConnectionStatusText()}</Text>
            </View>

            {batteryLevel !== null && (
              <View style={styles.batteryIndicator}>
                <CustomVectorIcons
                  name={batteryLevel > 20 ? 'battery-charging' : 'battery-dead'}
                  iconSet="Ionicons"
                  size={moderateScale(16)}
                  color={batteryLevel > 20 ? '#34C759' : '#FF3B30'}
                />
                <Text
                  style={[
                    styles.batteryText,
                    { color: batteryLevel > 20 ? '#34C759' : '#FF3B30' },
                  ]}
                >
                  Battery: {batteryLevel}%
                </Text>
              </View>
            )}

            {playbackStatus && playbackStatus?.state !== 'stopped' && (
              <View style={styles.playbackIndicator}>
                <CustomVectorIcons
                  name={playbackStatus?.state === 'playing' ? 'pause' : 'play'}
                  iconSet="Ionicons"
                  size={moderateScale(14)}
                  color="#007AFF"
                />
                <Text style={styles.playbackText}>
                  {playbackStatus?.state === 'playing' ? 'Playing' : 'Paused'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Controls Section */}
        <View style={styles.controlsContainer}>
          <Text style={styles.controlsTitle}>Device Controls</Text>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={onStatusPress}
            >
              <CustomVectorIcons
                name="stats-chart"
                iconSet="Ionicons"
                size={moderateScale(24)}
                color={theme.themeColor}
              />
              <Text style={styles.controlText}>Device information</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={onSettingsPress}
            >
              <CustomVectorIcons
                name="settings"
                iconSet="Ionicons"
                size={moderateScale(24)}
                color={theme.themeColor}
              />
              <Text style={styles.controlText}>Settings</Text>
            </TouchableOpacity>

            {/* {isDara && ( */}
            {/* <TouchableOpacity style={styles.controlButton} onPress={onWiFiPress}>
            <CustomVectorIcons
              name="wifi"
              iconSet="Ionicons"
              size={moderateScale(24)}
              color={theme.themeColor}
            />
            <Text style={styles.controlText}>Configure WiFi</Text>
          </TouchableOpacity> */}
            {/* )} */}
          </View>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              padding: moderateScale(14),
              borderRadius: moderateScale(10),
              backgroundColor: theme.white,
              borderWidth: 1,
              borderColor: theme.textBoxBorder,
              minWidth: moderateScale(100),
              marginVertical: 10,
            }}
            onPress={onWiFiPress}
          >
            <CustomVectorIcons
              name="wifi"
              iconSet="Ionicons"
              size={moderateScale(24)}
              color={theme.themeColor}
            />
            <Text style={styles.controlText}>Configure WiFi</Text>
          </TouchableOpacity>
          {/* Playback Controls for DARA */}
          {isDara && (
            <View style={styles.playbackControls}>
              <TouchableOpacity
                style={styles.playbackButton}
                onPress={onPrevious}
              >
                <CustomVectorIcons
                  name="play-back"
                  iconSet="Ionicons"
                  size={moderateScale(20)}
                  color={theme.text}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playbackButton}
                onPress={onPlayPause}
              >
                <CustomVectorIcons
                  name={playbackStatus?.state === 'playing' ? 'pause' : 'play'}
                  iconSet="Ionicons"
                  size={moderateScale(24)}
                  color={theme.themeColor}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.playbackButton} onPress={onNext}>
                <CustomVectorIcons
                  name="play-forward"
                  iconSet="Ionicons"
                  size={moderateScale(20)}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>
          )}
          {isDara && contentSync?.status === 'in_progress' && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontWeight: '600' }}>Downloading content</Text>
              <Text>
                File {contentSync.currentFile}/{contentSync.totalFiles}
              </Text>
              <Text>{contentSync.progress}% completed</Text>
            </View>
          )}

          {isDara && contentSync?.status === 'failed' && (
            <Text style={{ color: 'red', marginTop: 10 }}>
              Download failed: {contentSync.error}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.disconnectBtn, disconnecting && { opacity: 0.6 }]}
            onPress={onDisconnect}
            disabled={disconnecting}
          >
            <CustomVectorIcons
              name="close-circle"
              iconSet="Ionicons"
              size={moderateScale(20)}
              color={theme.themeRed}
            />
            <Text style={[styles.disconnectBtnText, { color: theme.themeRed }]}>
              {disconnecting ? 'Disconnecting...' : 'Disconnect Device'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ marginBottom: 50 }} />
    </ScrollView>
  );
};

// ================= MAIN COMPONENT =================

const Bluetooth = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const {
    hasPermission,
    isBluetoothEnabled,
    connectedDevice,
    discoveredDevices,
    allDevices,
    loading,
    isScanning,
    startBLEScan,
    connectToDevice,
    disconnectDevice,
    requestBLEPermissions,
    deviceInfo,
    batteryLevel,
    connectionStatus,
    configuration,
    childProfile,
    firmwareInfo,
    usageData,
    updateConfiguration,
    updateChildProfile,
    sendPlaybackCommand,
    playbackStatus,
    showAllDevices,
    toggleDeviceView,
  }: any = useBluetooth();

  const handlePlayPause = () => {
    if (!connectedDevice) return;

    if (playbackStatus?.state === 'playing') {
      sendPlaybackCommand('pause');
    } else {
      sendPlaybackCommand('play');
    }
  };

  const handleNext = () => {
    if (!connectedDevice) return;
    sendPlaybackCommand('next');
  };

  const handlePrevious = () => {
    if (!connectedDevice) return;
    sendPlaybackCommand('previous');
  };

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [wifiModalVisible, setWiFiModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const handleScan = () => {
    if (isScanning) return;
    startBLEScan();
  };
  const handleConnect = async (device: any) => {
    if (loading || connectionStatus === 'connecting') return;
    await connectToDevice(device);
  };

  const handleDisconnect = async () => {
    try {
      await disconnectDevice();
    } catch (error) {
      console.log('Disconnect error:', error);
    }
  };

  const renderDiscoveryUI = () => {
    return (
      <>
        <FilterButtons
          showAllDevices={showAllDevices}
          toggleDeviceView={toggleDeviceView}
          allDevices={allDevices}
          isScanning={isScanning}
        />

        <TouchableOpacity
          style={[
            styles.scanButton,
            isScanning && styles.scanningButton,
            (!isBluetoothEnabled || loading) && styles.scanButtonDisabled,
          ]}
          onPress={handleScan}
          disabled={!isBluetoothEnabled || loading}
        >
          <CustomVectorIcons
            name={isScanning ? 'stop-circle' : 'search'}
            iconSet="Ionicons"
            size={moderateScale(24)}
            color={theme.white}
          />
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan for Devices'}
          </Text>
          {isScanning && (
            <ActivityIndicator
              color={theme.white}
              style={styles.scanningIndicator}
            />
          )}
        </TouchableOpacity>

        <View style={styles.deviceListContainer}>
          <Text style={styles.deviceListTitle}>
            {discoveredDevices.length} Device(s) Found
            {isScanning && ' - Scanning...'}
          </Text>

          {discoveredDevices.length === 0 ? (
            <View style={styles.emptyState}>
              <CustomVectorIcons
                name={showAllDevices ? 'bluetooth' : 'happy-outline'}
                iconSet="Ionicons"
                size={moderateScale(60)}
                color={theme.grayLight}
              />
              <Text style={styles.emptyStateText}>
                {isScanning
                  ? 'Scanning for devices...'
                  : showAllDevices
                  ? 'No BLE devices found.'
                  : 'No DARA Smart Buddy found. Try "Show All" to see available devices.'}
              </Text>

              {!showAllDevices && allDevices.length > 0 && (
                <TouchableOpacity
                  style={styles.showAllButton}
                  onPress={toggleDeviceView}
                >
                  <Text style={styles.showAllButtonText}>
                    Show {allDevices.length} Available Devices
                  </Text>
                </TouchableOpacity>
              )}

              {!isBluetoothEnabled && (
                <Text style={styles.bluetoothWarning}>
                  Bluetooth is turned off
                </Text>
              )}
            </View>
          ) : (
            <FlatList
              data={discoveredDevices}
              renderItem={({ item }) => (
                <DeviceItem
                  item={item}
                  onPress={() => handleConnect(item)}
                  disabled={loading || connectionStatus === 'connecting'}
                />
              )}
              keyExtractor={item => item.id}
              style={styles.deviceList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </>
    );
  };

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar
          backgroundColor={theme.transparent}
          barStyle="light-content"
        />
        <CustomHeader
          showBackButton={true}
          title="DARA Smart Buddy"
          showNotifications={false}
        />

        <View style={styles.innerContainer}>
          <Text style={styles.title}>Connect DARA Smart Buddy</Text>
          <View style={styles.imageContainer}>
            <Image
              source={IMAGES.daraDoll}
              style={styles.dollImage}
              resizeMode="contain"
            />
            <View style={styles.bleTag}>
              <Text style={styles.bleText}>BLE</Text>
            </View>
          </View>
          <Text style={styles.desc}>
            Enable Bluetooth to connect with your DARA Smart Buddy
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.themeColor }]}
            onPress={requestBLEPermissions}
          >
            <Text style={styles.primaryText}>Enable Bluetooth Access</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.transparent} barStyle="light-content" />
      <CustomHeader
        showBackButton={true}
        title="DARA Smart Buddy"
        showNotifications={false}
      />
      <View style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator}>
              <CustomVectorIcons
                name={isBluetoothEnabled ? 'bluetooth' : 'bluetooth-disabled'}
                iconSet="Ionicons"
                size={moderateScale(24)}
                color={isBluetoothEnabled ? '#34C759' : theme.themeRed}
              />
              <Text style={styles.statusText}>
                Bluetooth: {isBluetoothEnabled ? 'ON' : 'OFF'}
              </Text>
            </View>
            {connectedDevice && (
              <View style={styles.connectionStatus}>
                <View
                  style={[styles.connectionDot, { backgroundColor: '#34C759' }]}
                />
                <Text style={styles.connectionStatusText}>
                  {connectionStatus || 'Connected'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {connectedDevice ? (
          <ConnectedCard
            device={connectedDevice}
            configuration={configuration}
            onDisconnect={handleDisconnect}
            onStatusPress={() => setStatusModalVisible(true)}
            onSettingsPress={() => setSettingsModalVisible(true)}
            onWiFiPress={() => setWiFiModalVisible(true)}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        ) : (
          renderDiscoveryUI()
        )}
      </View>
      <StatusModal
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        deviceInfo={deviceInfo}
        batteryLevel={batteryLevel}
        connectionStatus={connectionStatus}
        firmwareInfo={firmwareInfo}
        usageData={usageData}
      />
      <WiFiModal
        visible={wifiModalVisible}
        onClose={() => setWiFiModalVisible(false)}
        configuration={configuration}
        updateConfiguration={updateConfiguration}
      />
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        configuration={configuration}
        updateConfiguration={updateConfiguration}
        childProfile={childProfile}
        updateChildProfile={updateChildProfile}
        sendPlaybackCommand={sendPlaybackCommand}
      />
      <CustomLoader visible={loading} />
    </View>
  );
};

// ================= STYLES =================

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    permissionContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      padding: moderateScale(16),
    },
    innerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: moderateScale(20),
    },
    title: {
      fontSize: moderateScale(22),
      fontWeight: '700',
      marginBottom: moderateScale(20),
      color: theme.themeDark,
      textAlign: 'center',
    },
    imageContainer: {
      height: moderateScale(200),
      width: moderateScale(200),
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: moderateScale(20),
    },
    dollImage: {
      height: '100%',
      width: '100%',
    },
    bleTag: {
      position: 'absolute',
      bottom: -10,
      backgroundColor: theme.themeColor,
      paddingHorizontal: moderateScale(15),
      paddingVertical: moderateScale(6),
      borderRadius: moderateScale(20),
    },
    bleText: {
      color: theme.white,
      fontWeight: '600',
      fontSize: moderateScale(12),
    },
    desc: {
      textAlign: 'center',
      fontSize: moderateScale(15),
      color: theme.text,
      marginVertical: moderateScale(20),
      lineHeight: moderateScale(22),
    },
    primaryBtn: {
      paddingVertical: moderateScale(14),
      paddingHorizontal: moderateScale(25),
      width: '100%',
      borderRadius: moderateScale(10),
      alignItems: 'center',
      marginTop: moderateScale(20),
    },
    primaryText: {
      color: theme.white,
      fontSize: moderateScale(16),
      fontWeight: '600',
    },
    statusCard: {
      backgroundColor: theme.boxBackground,
      borderRadius: moderateScale(12),
      padding: moderateScale(16),
      marginBottom: moderateScale(16),
      borderWidth: 1,
      borderColor: theme.textBoxBorder,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(8),
    },
    statusText: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: theme.text,
    },
    connectionStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(6),
    },
    connectionDot: {
      width: moderateScale(8),
      height: moderateScale(8),
      borderRadius: moderateScale(4),
    },
    connectionStatusText: {
      fontSize: moderateScale(14),
      color: theme.textSub,
      fontWeight: '500',
    },
    connectedContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    bigConnectedCard: {
      borderWidth: 2,
      borderRadius: moderateScale(20),
      padding: moderateScale(10),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: moderateScale(30),
      borderColor: '#7E4FFF',
      marginTop: 40,
    },
    iconCircle: {
      width: moderateScale(80),
      height: moderateScale(80),
      borderRadius: moderateScale(40),
      backgroundColor: theme.white,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: moderateScale(15),
    },
    connectedInfo: {
      alignItems: 'center',
    },
    connectedBigLabel: {
      fontSize: moderateScale(12),
      fontWeight: '600',
      letterSpacing: 1,
      marginBottom: moderateScale(4),
    },
    connectedBigName: {
      fontSize: moderateScale(22),
      fontWeight: '700',
      color: theme.text,
      marginBottom: moderateScale(2),
      textAlign: 'center',
    },
    connectedBigType: {
      fontSize: moderateScale(14),
      marginBottom: moderateScale(10),
      fontWeight: '500',
    },
    // statusIndicator: {
    //   flexDirection: 'row',
    //   alignItems: 'center',
    //   marginTop: moderateScale(10),
    //   gap: moderateScale(6),
    // },
    statusDot: {
      width: moderateScale(8),
      height: moderateScale(8),
      borderRadius: moderateScale(4),
    },
    // statusText: {
    //   fontSize: moderateScale(14),
    //   color: theme.textSub,
    //   fontWeight: '500',
    // },
    batteryIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: moderateScale(8),
      gap: moderateScale(4),
    },
    batteryText: {
      fontSize: moderateScale(12),
      fontWeight: '600',
    },
    playbackIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: moderateScale(6),
      gap: moderateScale(4),
    },
    playbackText: {
      fontSize: moderateScale(12),
      color: '#007AFF',
      fontWeight: '500',
    },
    controlsContainer: {
      backgroundColor: theme.boxBackground,
      borderRadius: moderateScale(12),
      padding: moderateScale(20),
      borderWidth: 1,
      borderColor: theme.textBoxBorder,
    },
    controlsTitle: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      color: theme.text,
      marginBottom: moderateScale(15),
      textAlign: 'center',
    },
    controlRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: moderateScale(15),
    },
    controlButton: {
      alignItems: 'center',
      padding: moderateScale(14),
      borderRadius: moderateScale(10),
      backgroundColor: theme.white,
      borderWidth: 1,
      borderColor: theme.textBoxBorder,
      minWidth: moderateScale(100),
    },
    controlText: {
      fontSize: moderateScale(14),
      color: theme.text,
      fontWeight: '500',
      marginTop: moderateScale(4),
    },
    playbackControls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: moderateScale(30),
      marginBottom: moderateScale(15),
      padding: moderateScale(10),
      backgroundColor: theme.white,
      borderRadius: moderateScale(10),
      borderWidth: 1,
      borderColor: theme.textBoxBorder,
    },
    playbackButton: {
      padding: moderateScale(10),
    },
    disconnectBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: moderateScale(8),
      backgroundColor: '#FFE5E5',
      padding: moderateScale(14),
      borderRadius: moderateScale(10),
    },
    disconnectBtnText: {
      fontSize: moderateScale(15),
      fontWeight: '600',
    },
    filterContainer: {
      marginBottom: moderateScale(16),
    },
    filterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: moderateScale(8),
    },
    filterTitle: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: theme.text,
    },
    toggleButton: {
      backgroundColor: theme.boxBackground,
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(6),
      borderRadius: moderateScale(20),
      borderWidth: 1,
      borderColor: theme.textBoxBorder,
    },
    toggleButtonText: {
      fontSize: moderateScale(12),
      color: theme.text,
      fontWeight: '500',
    },
    deviceStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.boxBackground,
      padding: moderateScale(10),
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: theme.textBoxBorder,
    },
    deviceStat: {
      fontSize: moderateScale(12),
      color: theme.text,
      fontWeight: '500',
    },
    scanButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: moderateScale(12),
      backgroundColor: theme.themeColor,
      paddingVertical: moderateScale(16),
      borderRadius: moderateScale(12),
      marginBottom: moderateScale(20),
    },
    scanningButton: {
      backgroundColor: theme.themeRed,
    },
    scanButtonDisabled: {
      backgroundColor: theme.textBoxBorder,
    },
    scanButtonText: {
      color: theme.white,
      fontSize: moderateScale(16),
      fontWeight: '600',
    },
    scanningIndicator: {
      marginLeft: moderateScale(8),
    },
    deviceListContainer: {
      flex: 1,
    },
    deviceListTitle: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      color: theme.text,
      marginBottom: moderateScale(12),
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: moderateScale(40),
    },
    emptyStateText: {
      fontSize: moderateScale(16),
      color: theme.textSub,
      marginTop: moderateScale(12),
      textAlign: 'center',
      paddingHorizontal: moderateScale(20),
    },
    showAllButton: {
      marginTop: moderateScale(16),
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(24),
      backgroundColor: theme.themeColor,
      borderRadius: moderateScale(20),
    },
    showAllButtonText: {
      color: theme.white,
      fontSize: moderateScale(14),
      fontWeight: '600',
    },
    bluetoothWarning: {
      fontSize: moderateScale(14),
      color: theme.themeRed,
      marginTop: moderateScale(8),
    },
    deviceList: {
      flex: 1,
    },
    deviceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.white,
      borderRadius: moderateScale(12),
      padding: moderateScale(16),
      marginBottom: moderateScale(10),
      borderWidth: 1,
      borderColor: theme.textBoxBorder,
    },
    deviceIconContainer: {
      marginRight: moderateScale(16),
      position: 'relative',
    },
    daraBadge: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: '#7E4FFF',
      paddingHorizontal: moderateScale(6),
      paddingVertical: moderateScale(2),
      borderRadius: moderateScale(10),
    },
    daraBadgeText: {
      color: theme.white,
      fontSize: moderateScale(8),
      fontWeight: '700',
    },
    deviceInfo: {
      flex: 1,
    },
    deviceName: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: theme.text,
      marginBottom: moderateScale(4),
    },
    deviceType: {
      fontSize: moderateScale(14),
      fontWeight: '500',
      marginBottom: moderateScale(4),
    },
    signalInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(4),
    },
    signalDot: {
      width: moderateScale(6),
      height: moderateScale(6),
      borderRadius: moderateScale(3),
    },
    signalText: {
      fontSize: moderateScale(12),
      color: theme.textSub,
    },
  });

const getModalStyles = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.background,
      borderTopLeftRadius: moderateScale(20),
      borderTopRightRadius: moderateScale(20),
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: moderateScale(20),
      borderBottomWidth: 1,
      borderBottomColor: theme.textBoxBorder,
    },
    modalTitle: {
      fontSize: moderateScale(20),
      fontWeight: '700',
      color: theme.text,
    },
    modalContent: {
      padding: moderateScale(20),
    },
    statusCard: {
      backgroundColor: theme.boxBackground,
      borderRadius: moderateScale(12),
      padding: moderateScale(16),
      marginBottom: moderateScale(16),
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: theme.text,
      marginBottom: moderateScale(8),
    },
    statusValue: {
      fontSize: moderateScale(18),
      fontWeight: '700',
    },
    infoCard: {
      backgroundColor: theme.boxBackground,
      borderRadius: moderateScale(12),
      padding: moderateScale(16),
      marginBottom: moderateScale(16),
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: moderateScale(8),
    },
    infoLabel: {
      fontSize: moderateScale(14),
      color: theme.textSub,
    },
    infoValue: {
      fontSize: moderateScale(14),
      fontWeight: '500',
      color: theme.text,
    },
    batteryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: moderateScale(12),
      marginVertical: moderateScale(10),
    },
    batteryText: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      color: theme.text,
    },
    lowBatteryWarning: {
      fontSize: moderateScale(12),
      color: '#FF3B30',
      textAlign: 'center',
      marginTop: moderateScale(8),
      fontWeight: '500',
    },
    wifiForm: {
      padding: moderateScale(20),
    },
    settingsForm: {
      padding: moderateScale(20),
    },
    inputLabel: {
      fontSize: moderateScale(14),
      color: theme.textSub,
      marginBottom: moderateScale(8),
    },
    textInput: {
      backgroundColor: theme.boxBackground,
      borderWidth: 1,
      borderColor: theme.textBoxBorder,
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      fontSize: moderateScale(16),
      color: theme.text,
      marginBottom: moderateScale(16),
    },
    configureButton: {
      backgroundColor: theme.themeColor,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: moderateScale(8),
      paddingVertical: moderateScale(16),
      borderRadius: moderateScale(12),
      marginTop: moderateScale(10),
    },
    configureButtonText: {
      color: theme.white,
      fontSize: moderateScale(16),
      fontWeight: '600',
    },
    saveButton: {
      backgroundColor: theme.themeColor,
      paddingVertical: moderateScale(16),
      borderRadius: moderateScale(12),
      alignItems: 'center',
      marginTop: moderateScale(20),
    },
    saveButtonText: {
      color: theme.white,
      fontSize: moderateScale(16),
      fontWeight: '600',
    },
    settingsSection: {
      marginBottom: moderateScale(20),
    },
    sectionTitle: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: theme.text,
      marginBottom: moderateScale(12),
    },
    volumeContainer: {
      backgroundColor: theme.boxBackground,
      padding: moderateScale(16),
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: theme.textBoxBorder,
    },
    volumeLabel: {
      fontSize: moderateScale(14),
      color: theme.text,
      marginBottom: moderateScale(12),
      textAlign: 'center',
    },
    volumeSlider: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: moderateScale(20),
    },
    volumeValue: {
      fontSize: moderateScale(18),
      fontWeight: '600',
      color: theme.text,
      minWidth: moderateScale(40),
      textAlign: 'center',
    },
    languageContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: moderateScale(8),
    },
    languageButton: {
      flex: 1,
      padding: moderateScale(12),
      borderRadius: moderateScale(8),
      backgroundColor: theme.boxBackground,
      borderWidth: 1,
      borderColor: theme.textBoxBorder,
      alignItems: 'center',
    },
    languageButtonActive: {
      backgroundColor: theme.themeColor,
      borderColor: theme.themeColor,
    },
    languageText: {
      fontSize: moderateScale(14),
      color: theme.text,
      fontWeight: '500',
    },
    languageTextActive: {
      color: theme.white,
    },
  });

export default Bluetooth;
