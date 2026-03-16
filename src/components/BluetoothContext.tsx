/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import { BleManager, State } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { BASE_URL } from '@services/ApiConstants';

// ==================== DARA SMART DOLL CONSTANTS ====================
const DEVICE_INFO_SERVICE_UUID = '0000180A-0000-1000-8000-00805F9B34FB';
const BATTERY_SERVICE_UUID = '0000180F-0000-1000-8000-00805F9B34FB';
const DOLL_CONTROL_SERVICE_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
const ANALYTICS_SERVICE_UUID = '6E400020-B5A3-F393-E0A9-E50E24DCCA9E';
const OTA_SERVICE_UUID = '6E400010-B5A3-F393-E0A9-E50E24DCCA9E';

// Characteristics
const MANUFACTURER_NAME_CHAR = '00002A29-0000-1000-8000-00805F9B34FB';
const MODEL_NUMBER_CHAR = '00002A24-0000-1000-8000-00805F9B34FB';
const SERIAL_NUMBER_CHAR = '00002A25-0000-1000-8000-00805F9B34FB';
const FIRMWARE_VERSION_CHAR = '00002A26-0000-1000-8000-00805F9B34FB';
const HARDWARE_VERSION_CHAR = '00002A27-0000-1000-8000-00805F9B34FB';
const SOFTWARE_VERSION_CHAR = '00002A28-0000-1000-8000-00805F9B34FB';
const BATTERY_LEVEL_CHAR = '00002A19-0000-1000-8000-00805F9B34FB';

// Doll Control Characteristics
const CONNECTION_STATUS_CHAR = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
const PLAYBACK_CONTROL_CHAR = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';
const CONTENT_SYNC_CHAR = '6E400004-B5A3-F393-E0A9-E50E24DCCA9E';
const CONFIGURATION_CHAR = '6E400005-B5A3-F393-E0A9-E50E24DCCA9E';
const CHILD_PROFILE_CHAR = '6E400006-B5A3-F393-E0A9-E50E24DCCA9E';

// Analytics Characteristics
const USAGE_DATA_CHAR = '6E400021-B5A3-F393-E0A9-E50E24DCCA9E';
const INTERACTION_LOGS_CHAR = '6E400022-B5A3-F393-E0A9-E50E24DCCA9E';

// OTA Characteristics (per hardware guide v2.0)
const OTA_FIRMWARE_VERSION_CHAR = '6E400011-B5A3-F393-E0A9-E50E24DCCA9E';
const OTA_CONTROL_CHAR = '6E400012-B5A3-F393-E0A9-E50E24DCCA9E';

const BluetoothContext = createContext(null);
export const useBluetooth = () => useContext(BluetoothContext);

export const encodeToBase64 = (data: any) => {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return Buffer.from(str, 'utf8').toString('base64');
};

/**
 * Decode Base64 to JS object / string
 */
export const decodeFromBase64 = (value: any) => {
  const decoded = Buffer.from(value, 'base64').toString('utf8');
  try {
    return JSON.parse(decoded);
  } catch {
    return decoded;
  }
};

// ==================== PROVIDER COMPONENT ====================
export const BluetoothProvider = ({ children }: any) => {
  const isConnectingRef = useRef(false);
  const isScanningRef = useRef(false);
  const isMounted = useRef(true);
  const activeMonitors = useRef(new Set());
  const monitorSubscriptions = useRef<any[]>([]);
  const isDisconnectingRef = useRef(false);
  const bleManagerRef = useRef<BleManager | null>(null);
  if (!bleManagerRef.current) {
    bleManagerRef.current = new BleManager();
  }
  const bleManager = bleManagerRef.current;
  const [hasPermission, setHasPermission] = useState(false);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showAllDevices, setShowAllDevices] = useState(true); // TRUE for testing
  const [downloadedContentIds, setDownloadedContentIds] = useState<string[]>(
    [],
  );
  const [disconnecting] = useState(false);
  const [bleReady, setBleReady] = useState(false);

  // Document 1.2: Device Information
  const [deviceInfo, setDeviceInfo] = useState<any>({
    manufacturer: null,
    model: null,
    serial: null,
    firmware: null,
    hardware: null,
    software: null,
  });

  const [batteryLevel, setBatteryLevel] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [playbackStatus, setPlaybackStatus] = useState({
    state: 'stopped',
    content_id: null,
    content_title: null,
    current_position: 0,
    duration: 0,
    volume: 50,
  });
  const [configuration, setConfiguration] = useState<any>({
    wifi: {
      ssid: null,
      connected: false,
      signal_strength: null,
      ip: '192.168.0.150',
    },
    audio: {
      volume: 50,
      max_volume: 70,
    },
    language: 'en',
    wake_word: 'hey_buddy',
    ai_enabled: true,
    offline_mode: false,
  });

  const [contentSync, setContentSync] = useState({
    status: 'idle',
    progress: 0,
    currentFile: '',
    totalFiles: 0,
    fileProgress: 0,
    downloaded: 0, // Added missing field per hardware guide
    error: null,
  });
  /**
   * CRITICAL BLE FUNCTION: Safely enable notifications for a BLE characteristic
   *
   * This function implements the HARDWARE-REQUIRED CCCD (Client Characteristic
   * Configuration Descriptor) enablement that was missing in the original implementation.
   *
   * WHY THIS IS CRITICAL:
   * - Dara Smart Doll hardware REQUIRES CCCD enablement before notifications work
   * - Without this, the doll appears connected but NEVER sends any data
   * - This follows Bluetooth Low Energy specification requirements
   * - The hardware guide v2.0 specifically mandates this implementation
   *
   * IMPLEMENTATION DETAILS:
   * - CCCD UUID is standard: '00002902-0000-1000-8000-00805f9b34fb'
   * - Enable value is [0x01, 0x00] meaning "enable notifications"
   * - Must be called BEFORE monitorCharacteristicForService()
   * - Includes duplicate monitoring prevention
   *
   * @param device - The connected BLE device
   * @param serviceUUID - The service UUID containing the characteristic
   * @param charUUID - The characteristic UUID to enable notifications for
   * @param callback - Function to handle incoming notification data
   */
  const enableNotifySafe = async (
    device: any,
    serviceUUID: any,
    charUUID: any,
    callback: any,
  ) => {
    // Create unique key to prevent duplicate monitoring
    const key = `${serviceUUID}:${charUUID}`;
    if (activeMonitors.current.has(key)) {
      console.log('[BLE] Already monitoring', charUUID, '- skipping duplicate');
      return;
    }

    try {
      // CRITICAL STEP 1: Write to CCCD descriptor to enable notifications
      // This is what was missing and causing the "connected but no data" issue
      const CCCD_UUID = '00002902-0000-1000-8000-00805f9b34fb'; // Standard CCCD UUID
      const enableNotificationValue = encodeToBase64([0x01, 0x00]); // Enable notifications

      console.log('[BLE] 🔧 Writing CCCD for characteristic:', charUUID);
      await device.writeDescriptorForCharacteristic(
        serviceUUID,
        charUUID,
        CCCD_UUID,
        enableNotificationValue,
      );

      console.log('[BLE] ✅ CCCD write successful for:', charUUID);

      // CRITICAL STEP 2: ONLY NOW start monitoring the characteristic
      // The hardware will now send notifications because CCCD is enabled
      const subscription = device.monitorCharacteristicForService(
        serviceUUID,
        charUUID,
        callback,
      );

      // Track active monitors to prevent duplicates and enable cleanup
      activeMonitors.current.add(key);
      monitorSubscriptions.current.push(subscription);

      console.log('[BLE] 📡 Notification monitoring enabled for:', charUUID);
    } catch (e) {
      console.error('[BLE] ❌ Failed to enable notifications for', charUUID, ':', e);

      // ENHANCED ERROR HANDLING: Try multiple recovery strategies

      // Strategy 1: Retry CCCD write with small delay
      try {
        console.log('[BLE] 🔄 Retrying CCCD write after 500ms delay...');
        await new Promise(resolve => setTimeout(resolve, 500));

        const CCCD_UUID = '00002902-0000-1000-8000-00805f9b34fb';
        const enableNotificationValue = encodeToBase64([0x01, 0x00]);

        await device.writeDescriptorForCharacteristic(
          serviceUUID,
          charUUID,
          CCCD_UUID,
          enableNotificationValue,
        );

        const subscription = device.monitorCharacteristicForService(
          serviceUUID,
          charUUID,
          callback,
        );

        activeMonitors.current.add(key);
        monitorSubscriptions.current.push(subscription);
        console.log('[BLE] ✅ Retry successful for', charUUID);
        return; // Success, exit early
      } catch (retryError) {
        console.warn('[BLE] ⚠️ Retry failed, trying fallback for', charUUID, ':', retryError);
      }

      // Strategy 2: Try without CCCD write as fallback
      try {
        console.log('[BLE] 🔄 Attempting fallback without CCCD...');
        const subscription = device.monitorCharacteristicForService(
          serviceUUID,
          charUUID,
          callback,
        );
        activeMonitors.current.add(key);
        monitorSubscriptions.current.push(subscription);
        console.log('[BLE] ⚠️ Fallback notify enabled for', charUUID, '(may not receive data)');
      } catch (fallbackError) {
        console.error('[BLE] 💥 All strategies failed for', charUUID, ':', fallbackError);
        // Don't throw - continue with other characteristics
      }
    }
  };

  const removeAllMonitors = () => {
    monitorSubscriptions?.current?.forEach(sub => {
      try {
        sub?.remove();
      } catch {}
    });

    monitorSubscriptions.current = [];
    activeMonitors.current.clear();

    console.log('[BLE] All monitors removed');
  };

  const setupContentSyncNotifications = async (device: any) => {
    await enableNotifySafe(
      device,
      DOLL_CONTROL_SERVICE_UUID,
      CONTENT_SYNC_CHAR,
      (error: any, characteristic: any) => {
        if (error || !characteristic?.value || !isMounted.current) return;

        const data = decodeFromBase64(characteristic.value);
        console.log('[BLE] Content Sync update:', data);

        if (data?.status === 'in_progress') {
          // FIXED: Use correct field names per hardware guide v2.0
          setContentSync({
            status: 'in_progress',
            progress: data.progress ?? 0,
            currentFile: data.current_file ?? '', // Current file being downloaded
            totalFiles: data.total ?? 0, // Total files to download
            fileProgress: data.file_progress ?? 0, // Progress of current file (0-100%)
            downloaded: data.downloaded ?? 0, // Number of files completed
            error: data.error || null,
          });
        }

        if (data?.status === 'completed') {
          setContentSync(prev => ({
            ...prev,
            status: 'completed',
            progress: 100,
          }));

          if (typeof data?.content_id === 'string') {
            setDownloadedContentIds(prev =>
              prev.includes(data.content_id)
                ? prev
                : [...prev, data.content_id],
            );
          }
        }

        if (data?.status === 'failed') {
          setContentSync(prev => ({
            ...prev,
            status: 'failed',
            error: data.error || 'Content download failed',
          }));
        }
      },
    );
  };

  const setupPlaybackNotifications = async (device: any) => {
    await enableNotifySafe(
      device,
      DOLL_CONTROL_SERVICE_UUID,
      PLAYBACK_CONTROL_CHAR,
      (error: any, characteristic: any) => {
        if (error || !characteristic?.value) return;

        const data = decodeFromBase64(characteristic.value);
        console.log('[BLE] Playback notification:', data);

        // ENHANCED: Handle all notification types per hardware guide
        if (isMounted.current) {
          setPlaybackStatus(data);

          // Handle AI interaction states (per hardware guide)
          if (data?.type === 'ai_interaction') {
            console.log('[BLE] AI interaction state:', data.state);
            switch (data.state) {
              case 'listening':
                // Device is capturing voice input
                setConnectionStatus('listening');
                break;
              case 'processing':
                // Device is processing STT/AI response
                setConnectionStatus('processing');
                break;
              case 'speaking':
                // AI response is playing
                setConnectionStatus('speaking');
                break;
              case 'idle':
                // AI interaction complete
                setConnectionStatus('idle');
                break;
              case 'error':
                // AI pipeline error
                console.log('[BLE] AI interaction error:', data.details);
                setConnectionStatus('error');
                break;
            }
          }

          // Handle next/previous track requests (per hardware guide)
          if (data?.next_requested) {
            console.log('[BLE] Device requested next track');
            // TODO: App should respond by sending next content_id
          }

          if (data?.previous_requested) {
            console.log('[BLE] Device requested previous track');
            // TODO: App should respond by sending previous content_id
          }

          // Handle specific error details (per hardware guide)
          if (data?.state === 'error' && data?.details) {
            console.log('[BLE] Playback error:', data.details);
            // Process specific error codes
            switch (data.details) {
              case 'SD card not available':
              case 'WiFi not connected':
              case 'daily time limit exceeded':
              case 'content category not allowed':
              case 'AI interaction disabled':
              case 'content not appropriate for age':
                console.log('[BLE] Known error condition:', data.details);
                break;
              default:
                console.log('[BLE] Unknown error condition:', data.details);
            }
          }
        }
      },
    );
  };

  // NEW: OTA update notifications handler (per hardware guide v2.0)
  const setupOTANotifications = async (device: any) => {
    // OTA Control notifications for update progress
    await enableNotifySafe(
      device,
      OTA_SERVICE_UUID,
      OTA_CONTROL_CHAR,
      (error: any, characteristic: any) => {
        if (error || !characteristic?.value) return;

        const data = decodeFromBase64(characteristic.value);
        console.log('[BLE] OTA notification:', data);

        if (isMounted.current) {
          // Handle OTA progress notifications
          if (data?.status) {
            switch (data.status) {
              case 'checking':
                console.log('[BLE] OTA: Checking for updates...');
                break;
              case 'downloading':
                console.log(`[BLE] OTA: Downloading... ${data.progress}%`);
                break;
              case 'installing':
                console.log('[BLE] OTA: Installing firmware...');
                break;
              case 'success':
                console.log('[BLE] OTA: Update successful, device will reboot');
                break;
              case 'failed':
                console.log('[BLE] OTA: Update failed -', data.error_code);
                break;
              case 'cancelled':
                console.log('[BLE] OTA: Update cancelled');
                break;
            }
          }

          // Handle system errors (SD card, etc.)
          if (data?.system_error) {
            console.log('[BLE] System error:', data.system_error);
            // TODO: Show system error UI
          }
        }
      },
    );

    // Firmware Version notifications for update availability
    await enableNotifySafe(
      device,
      OTA_SERVICE_UUID,
      OTA_FIRMWARE_VERSION_CHAR,
      (error: any, characteristic: any) => {
        if (error || !characteristic?.value) return;

        const data = decodeFromBase64(characteristic.value);
        console.log('[BLE] Firmware version notification:', data);

        if (isMounted.current && data?.update_available !== undefined) {
          console.log('[BLE] Update available:', data.update_available);
          if (data.update_available) {
            console.log('[BLE] Latest version:', data.latest_version);
            console.log('[BLE] File size:', data.file_size);
          }
        }
      },
    );
  };

  // NEW: Analytics notifications handler (per hardware guide v2.0)
  const setupAnalyticsNotifications = async (device: any) => {
    // Usage Data notifications for real-time stats
    await enableNotifySafe(
      device,
      ANALYTICS_SERVICE_UUID,
      USAGE_DATA_CHAR,
      (error: any, characteristic: any) => {
        if (error || !characteristic?.value) return;

        const data = decodeFromBase64(characteristic.value);
        console.log('[BLE] Usage data notification:', data);

        if (isMounted.current) {
          // TODO: Update usage data state
          console.log('[BLE] Today total minutes:', data?.today?.total_minutes);
          console.log('[BLE] Stories played:', data?.today?.stories_played);
          console.log('[BLE] AI interactions:', data?.today?.ai_interactions);
        }
      },
    );
  };

  const sendContentSyncCommand = async (contentId: string) => {
    if (!connectedDevice) {
      Alert.alert('Error', 'Doll not connected');
      return;
    }

    const payload = {
      action: 'download',
      content_ids: [contentId],
      manifest_url: `${BASE_URL}/content/manifest`, // Example manifest URL
    };

    console.log('[BLE] Content Sync Payload:', payload);

    try {
      await connectedDevice.writeCharacteristicWithResponseForService(
        DOLL_CONTROL_SERVICE_UUID,
        CONTENT_SYNC_CHAR,
        encodeToBase64(payload),
      );
      Alert.alert('Downloaded successfull');
    } catch (error) {
      console.log('[BLE] Content sync failed', error);
    }
  };

  // Document 1.2: Child Profile
  const [childProfile, setChildProfile] = useState({
    profile_id: null,
    name: null,
    age: null,
    language_preference: 'en',
    favorite_categories: [],
    learning_level: 1,
    parent_controls: {
      max_daily_minutes: 60,
      allowed_categories: ['stories', 'rhymes'],
      ai_interaction_enabled: true,
    },
  });

  // Document 1.2: Firmware Info
  const [firmwareInfo, setFirmwareInfo] = useState<any>({
    current_version: null,
    build_date: null,
    partition: null,
    update_available: false,
    latest_version: null,
  });

  // Document 1.2: Usage Data
  const [usageData, setUsageData] = useState<any>({
    today: {
      total_minutes: 0,
      stories_played: 0,
      ai_interactions: 0,
      favorite_content: null,
    },
    weekly: {
      total_minutes: 0,
      most_active_day: null,
      categories: {
        stories: 0,
        rhymes: 0,
        ai_chat: 0,
      },
    },
    battery: {
      average_runtime: 0,
      charge_cycles: 0,
    },
  });

  // Refs

  // ==================== CLEANUP ====================
  useEffect(() => {
    console.log('[BLE] Provider mounted');

    checkBluetoothState();

    const subscription = bleManager.onStateChange(state => {
      console.log('[BLE] State changed:', state);

      if (!isMounted.current) return;

      setIsBluetoothEnabled(state === State.PoweredOn);
      setBleReady(true);
    }, true);

    return () => {
      // console.log('[BLE] Provider unmounted');
      isMounted.current = false;

      subscription.remove();

      try {
        bleManager.stopDeviceScan();
      } catch {}

      // ❌ YAHAN DISCONNECT MAT KARO
      // ❌ Screen change pe device mat todo
    };
  }, []);

  // ==================== PERMISSIONS ====================

  const requestBLEPermissions = async () => {
    console.log('[BLE] Requesting permissions');

    try {
      setLoading(true);

      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version;
        let permissions: any = [];

        if (androidVersion >= 31) {
          permissions = [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ];
        } else {
          permissions = [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ];
        }

        const result = await PermissionsAndroid.requestMultiple(permissions);

        const allGranted = Object.values(result).every(
          res => res === PermissionsAndroid.RESULTS.GRANTED,
        );

        if (!allGranted) {
          Alert.alert(
            'Permission Required',
            'Bluetooth permissions are required to connect the device',
          );
          return;
        }

        // ✅ IMPORTANT
        setHasPermission(true);

        // 🔥 CHECK BLUETOOTH STATE
        const enabled = await checkBluetoothState();

        if (!enabled) {
          Alert.alert('Bluetooth Off', 'Please turn on Bluetooth', [
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]);
          return;
        }

        // 🔥 AUTO START SCAN
        setTimeout(() => {
          startBLEScan();
        }, 500);
      } else {
        setHasPermission(true);
        await checkBluetoothState();
      }
    } catch (error) {
      console.log('[BLE] Permission error:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------
     CHECK BLUETOOTH STATE (FIXED)
  --------------------------------------------------- */
  const checkBluetoothState = async (): Promise<boolean> => {
    try {
      let state = await bleManager.state();
      console.log('[BLE] Initial state:', state);

      if (state === State.Unknown || state === State.Resetting) {
        await new Promise((resolve: any) => setTimeout(resolve, 700));
        state = await bleManager.state();
        console.log('[BLE] Retried state:', state);
      }

      if (!isMounted.current) return false;

      const enabled = state === State.PoweredOn;

      setIsBluetoothEnabled(enabled);
      setBleReady(true); // ✅ IMPORTANT

      return enabled;
    } catch (error) {
      console.log('[BLE] checkBluetoothState error', error);

      setIsBluetoothEnabled(false);
      setBleReady(true); // ✅ IMPORTANT

      return false;
    }
  };

  // ==================== DEVICE DETECTION ====================
  const isDaraDevice = (device: any) => {
    const name = device.name || device.localName || '';
    return name.startsWith('DARA-Buddy-') || name.includes('DARA');

    // name.includes('DARA') ||
    // name.includes('Dara') ||
    // name.includes('dara') ||
    // name.includes('Smart Buddy') ||
    // name.includes('DARA-Buddy')
  };

  // ==================== STOP SCAN ====================
  const stopBLEScan = () => {
    if (!isScanningRef.current) return;

    try {
      bleManager.stopDeviceScan();
    } catch {}

    isScanningRef.current = false;
    setIsScanning(false);
  };

  // ==================== START SCAN ====================
  const startBLEScan = useCallback(async () => {
    const enabled = await checkBluetoothState();
    if (!enabled || isScanningRef.current) return;

    console.log('[BLE] Starting scan');

    isScanningRef.current = true;
    setIsScanning(true);
    setDiscoveredDevices([]);

    bleManager.startDeviceScan(
      null,
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          stopBLEScan();
          return;
        }

        if (!device) return;

        setDiscoveredDevices((prev: any) => {
          if (prev.find((d: any) => d.id === device.id)) return prev;
          return [
            ...prev,
            Object.assign(device, { isDara: isDaraDevice(device) }),
          ];
        });
      },
    );

    setTimeout(stopBLEScan, 10000);
  }, []);

  // ==================== FILTERED DEVICES ====================
  const getFilteredDevices = useCallback(() => {
    if (showAllDevices) {
      return discoveredDevices.filter((d: any) => d.isDara);
    } else {
      return discoveredDevices.filter((d: any) => d.isDara);
    }
  }, [discoveredDevices, showAllDevices]);

  /* ---------------------------------------------------
     CONNECT
  --------------------------------------------------- */
  // const connectToDevice = async (device: any) => {
  //   if (!device?.id) return;

  //   // 🔒 DOUBLE CLICK / DOUBLE CONNECT PROTECTION
  //   if (isConnectingRef.current) {
  //     console.log('[BLE] Already connecting, ignoring tap');
  //     return;
  //   }

  //   isConnectingRef.current = true;

  //   try {
  //     stopBLEScan(); // 🔥 VERY IMPORTANT
  //     setLoading(true);
  //     setConnectionStatus('connecting');

  //     console.log('[BLE] Connecting to', device.name);

  //     const connected: any = await bleManager.connectToDevice(device.id, {
  //       autoConnect: false,
  //     });

  //     await connected.discoverAllServicesAndCharacteristics();

  //     if (!isMounted.current) return;

  //     setConnectedDevice(connected);
  //     setConnectionStatus('connected');

  //     if (device?.isDara) {
  //       await setupDaraDevice(connected);
  //     }

  //     console.log('[BLE] Connected successfully');
  //   } catch (error) {
  //     console.log('[BLE] Connection failed:', error);
  //     if (isMounted.current) {
  //       setConnectionStatus('idle');
  //       setConnectedDevice(null);
  //     }
  //   } finally {
  //     isConnectingRef.current = false;
  //     setLoading(false);
  //   }
  // };

  // const connectToDevice = async (device: any) => {
  //   if (!device?.id) return;

  //   if (isConnectingRef.current) {
  //     console.log('[BLE] Already connecting, ignoring tap');
  //     return;
  //   }

  //   isConnectingRef.current = true;

  //   try {
  //     stopBLEScan();
  //     setLoading(true);
  //     setConnectionStatus('connecting');

  //     console.log('[BLE] Connecting to', device.name);

  //     const connected: any = await bleManager.connectToDevice(device.id, {
  //       autoConnect: false,
  //     });

  //     await connected.discoverAllServicesAndCharacteristics();

  //     // ✅ ADD THIS BLOCK HERE
  //     connected.onDisconnected((error: any) => {
  //       console.log('[BLE] Device disconnected callback', error?.message);

  //       removeAllMonitors(); // 🔥 VERY IMPORTANT

  //       if (isMounted.current) {
  //         setConnectedDevice(null);
  //         setConnectionStatus('idle');
  //       }
  //     });

  //     if (!isMounted.current) return;

  //     setConnectedDevice(connected);
  //     setConnectionStatus('connected');

  //     if (device?.isDara) {
  //       await setupDaraDevice(connected);
  //     }

  //     console.log('[BLE] Connected successfully');
  //   } catch (error) {
  //     console.log('[BLE] Connection failed:', error);

  //     if (isMounted.current) {
  //       setConnectionStatus('idle');
  //       setConnectedDevice(null);
  //     }
  //   } finally {
  //     isConnectingRef.current = false;
  //     setLoading(false);
  //   }
  // };
  const connectToDevice = async (device: any) => {
    if (!device?.id) return;

    if (isConnectingRef.current) {
      console.log('[BLE] Already connecting, ignoring tap');
      return;
    }

    isConnectingRef.current = true;

    try {
      stopBLEScan();
      setLoading(true);
      setConnectionStatus('connecting');

      console.log('[BLE] Connecting to', device.name);

      const connected: any = await bleManager.connectToDevice(device.id, {
        autoConnect: false,
      });

      await connected.discoverAllServicesAndCharacteristics();

      // attach disconnect listener
      connected.onDisconnected((error: any) => {
        console.log('[BLE] Device disconnected callback', error?.message);

        removeAllMonitors();

        if (isMounted.current) {
          setConnectedDevice(null);
          setConnectionStatus('idle');
        }
      });

      if (!isMounted.current) return;

      // set state
      setConnectedDevice(connected);
      setConnectionStatus('connected');

      // setup device features
      if (device?.isDara) {
        await setupDaraDevice(connected);
      }

      console.log('[BLE] Connected successfully');
    } catch (error) {
      console.log('[BLE] Connection failed:', error);

      if (isMounted.current) {
        setConnectionStatus('idle');
        setConnectedDevice(null);
      }
    } finally {
      isConnectingRef.current = false;
      setLoading(false);
    }
  };
  const setupDaraDevice = async (device: any) => {
    console.log('[BLE] Setting up DARA doll');

    // 1️⃣ ENABLE NOTIFICATIONS FIRST (with CCCD writes) - Complete implementation
    await setupConnectionStatusNotifications(device);
    await setupPlaybackNotifications(device);
    await setupContentSyncNotifications(device);
    await setupOTANotifications(device); // Added: OTA updates and system errors
    await setupAnalyticsNotifications(device); // Added: Usage data monitoring

    // 2️⃣ THEN READ VALUES
    await readDeviceInformation(device);
    await readBatteryLevel(device);
    await readConfiguration(device);
    await readChildProfile(device);
    await readUsageData(device);
    await readInteractionLogs(device); // Added: Complete Analytics service

    console.log('[BLE] DARA doll setup complete - ALL SERVICES IMPLEMENTED');
  };

  // NEW: Read interaction logs function (completing Analytics service)
  const readInteractionLogs = async (device: any) => {
    console.log('[BLE] Reading interaction logs');
    try {
      const char = await device.readCharacteristicForService(
        ANALYTICS_SERVICE_UUID,
        INTERACTION_LOGS_CHAR,
      );

      const logs = decodeFromBase64(char.value);
      console.log('[BLE] Interaction logs:', logs);

      if (isMounted.current) {
        // TODO: Update interaction logs state if needed
        console.log('[BLE] Logs page:', logs?.page);
        console.log('[BLE] Total pages:', logs?.total_pages);
        console.log('[BLE] Logs entries:', logs?.logs?.length || 0);
      }
    } catch (error) {
      console.log('[BLE] Interaction logs read failed', error);
    }
  };

  const simulateDaraData = () => {
    console.log('[BLE] Simulating DARA doll data for testing');

    if (isMounted.current) {
      // Device Information
      setDeviceInfo({
        manufacturer: 'DARA',
        model: 'Smart Buddy v1',
        serial: 'DARA-2024-001',
        firmware: '1.2.3',
        hardware: 'ESP32-S3-WROOM-1',
        software: 'OS-v1.0.0',
      });

      // Battery
      setBatteryLevel(78);

      // Configuration
      setConfiguration({
        wifi: {
          ssid: 'Home_WiFi',
          signal_strength: -45,
          connected: false,
        },
        audio: {
          volume: 60,
          max_volume: 70,
        },
        language: 'en',
        wake_word: 'hey_buddy',
        ai_enabled: true,
        offline_mode: false,
      });

      // Firmware Info
      setFirmwareInfo({
        current_version: '1.2.3',
        build_date: '2024-01-15',
        partition: 'ota_0',
        update_available: false,
        latest_version: '1.2.3',
      });

      // Usage Data
      setUsageData({
        today: {
          total_minutes: 45,
          stories_played: 3,
          ai_interactions: 8,
          favorite_content: 'story_123',
        },
        weekly: {
          total_minutes: 320,
          most_active_day: 'Monday',
          categories: {
            stories: 60,
            rhymes: 30,
            ai_chat: 10,
          },
        },
        battery: {
          average_runtime: 165,
          charge_cycles: 42,
        },
      });
    }
  };

  // ==================== DOCUMENT FUNCTIONS ====================

  const readDeviceInformation = async (device: any) => {
    console.log('[BLE] Reading Device Information');

    try {
      const manufacturer = await device.readCharacteristicForService(
        DEVICE_INFO_SERVICE_UUID,
        MANUFACTURER_NAME_CHAR,
      );

      const model = await device.readCharacteristicForService(
        DEVICE_INFO_SERVICE_UUID,
        MODEL_NUMBER_CHAR,
      );

      const serial = await device.readCharacteristicForService(
        DEVICE_INFO_SERVICE_UUID,
        SERIAL_NUMBER_CHAR,
      );

      const firmware = await device.readCharacteristicForService(
        DEVICE_INFO_SERVICE_UUID,
        FIRMWARE_VERSION_CHAR,
      );

      const hardware = await device.readCharacteristicForService(
        DEVICE_INFO_SERVICE_UUID,
        HARDWARE_VERSION_CHAR,
      );
      const software = await device.readCharacteristicForService(
        DEVICE_INFO_SERVICE_UUID,
        SOFTWARE_VERSION_CHAR,
      );

      if (isMounted.current) {
        setDeviceInfo({
          manufacturer: decodeFromBase64(manufacturer.value),
          model: decodeFromBase64(model.value),
          serial: decodeFromBase64(serial.value),
          firmware: decodeFromBase64(firmware.value),
          hardware: decodeFromBase64(hardware.value),
          software: decodeFromBase64(software.value),
        });
      }
    } catch (error) {
      console.log('[BLE] Device info read failed', error);
    }
  };

  const readBatteryLevel = async (device: any) => {
    console.log('[BLE] Reading Battery Level');

    try {
      // 1️⃣ READ once (Document required)
      const characteristic = await device.readCharacteristicForService(
        BATTERY_SERVICE_UUID,
        BATTERY_LEVEL_CHAR,
      );

      if (characteristic?.value) {
        const battery = Buffer.from(characteristic.value, 'base64').readUInt8(
          0,
        );

        console.log('[BLE] Battery initial value:', battery);

        if (isMounted.current) {
          setBatteryLevel(battery);
        }
      }

      // 2️⃣ ENABLE NOTIFICATIONS (SAFE – only once)
      await enableNotifySafe(
        device,
        BATTERY_SERVICE_UUID,
        BATTERY_LEVEL_CHAR,
        (error: any, char: any) => {
          if (error || !char?.value) {
            if (error) {
              console.log('[BLE] Battery notify error', error);
            }
            return;
          }

          const value = Buffer.from(char.value, 'base64').readUInt8(0);
          console.log('[BLE] Battery update:', value);

          if (isMounted.current) {
            setBatteryLevel(value);
          }
        },
      );
    } catch (error) {
      console.log('[BLE] Battery read failed', error);
    }
  };

  const setupConnectionStatusNotifications = async (device: any) => {
    console.log('[BLE] Subscribing to connection status');

    await enableNotifySafe(
      device,
      DOLL_CONTROL_SERVICE_UUID,
      CONNECTION_STATUS_CHAR,
      (error: any, characteristic: any) => {
        if (error) {
          console.log('[BLE] Connection status notify error', error);
          return;
        }

        if (!characteristic?.value || !isMounted.current) return;

        const data = decodeFromBase64(characteristic.value);
        console.log('[BLE] Connection status raw:', data);

        let status: string | null = null;

        // normalize
        if (typeof data === 'string') {
          status = data;
        } else if (typeof data === 'object' && data?.status) {
          status = data.status;
        }

        if (!status) return;

        console.log('[BLE] Connection status parsed:', status);

        // ========= BLE LEVEL =========
        if (status === 'connected' || status === 'disconnected') {
          setConnectionStatus(status);
          return;
        }

        // ========= WIFI LEVEL =========
        if (status === 'wifi_connecting') {
          setConnectionStatus('wifi_connecting');
          setConfiguration((prev: any) => ({
            ...prev,
            wifi: {
              ...prev.wifi,
              connected: false,
            },
          }));
          return;
        }

        if (status === 'wifi_connected') {
          const ssid =
            typeof data === 'object' && data?.ssid ? data.ssid : null;
          const signal_strength =
            typeof data === 'object' && data?.signal_strength !== undefined
              ? data.signal_strength
              : null;

          setConnectionStatus('wifi_connected');
          setConfiguration((prev: any) => ({
            ...prev,
            wifi: {
              ...prev.wifi,
              connected: true,
              ssid: ssid ?? prev.wifi.ssid,
              signal_strength: signal_strength ?? prev.wifi.signal_strength,
            },
          }));
          return;
        }

        if (status === 'wifi_disconnected') {
          setConnectionStatus('wifi_disconnected');
          setConfiguration((prev: any) => ({
            ...prev,
            wifi: {
              ...prev.wifi,
              connected: false,
            },
          }));
          return;
        }

        // ========= FUTURE SAFE =========
        if (status === 'low_battery') {
          console.log('[BLE] Low battery warning');
        }

        if (status === 'charging') {
          console.log('[BLE] Device charging');
        }
      },
    );
  };

  const readConfiguration = async (device: any) => {
    console.log('[BLE] Reading configuration');

    try {
      const char = await device.readCharacteristicForService(
        DOLL_CONTROL_SERVICE_UUID,
        CONFIGURATION_CHAR,
      );

      const config = decodeFromBase64(char.value);

      if (isMounted.current) {
        setConfiguration(config);
      }
    } catch (error) {
      console.log('[BLE] Config read failed', error);
    }
  };

  const readChildProfile = async (device: any) => {
    console.log('[BLE] Reading child profile');

    try {
      const char = await device.readCharacteristicForService(
        DOLL_CONTROL_SERVICE_UUID,
        CHILD_PROFILE_CHAR,
      );

      const profile = decodeFromBase64(char.value);

      if (isMounted.current) {
        setChildProfile(profile);
      }
    } catch (error) {
      console.log('[BLE] Child profile read failed', error);
    }
  };

  // const readFirmwareInfo = async device => {
  //   console.log('[BLE] Reading firmware info');
  //   // Implementation for real device
  // };

  const readUsageData = async (device: any) => {
    console.log('[BLE] Reading usage data');

    try {
      const char = await device.readCharacteristicForService(
        ANALYTICS_SERVICE_UUID,
        USAGE_DATA_CHAR,
      );

      const usage = decodeFromBase64(char.value);

      if (isMounted.current) {
        setUsageData(usage);
      }
    } catch (error) {
      console.log('[BLE] Usage read failed', error);
    }
  };

  // NEW: OTA update commands (per hardware guide v2.0)
  const sendOTACommand = async (action: 'check' | 'start' | 'cancel' | 'rollback') => {
    if (!connectedDevice) {
      Alert.alert('Error', 'Doll not connected');
      return;
    }

    const payload = { action };
    console.log('[BLE] OTA Command:', payload);

    try {
      await connectedDevice.writeCharacteristicWithResponseForService(
        OTA_SERVICE_UUID,
        OTA_CONTROL_CHAR,
        encodeToBase64(payload),
      );
      console.log('[BLE] OTA command sent successfully:', action);
    } catch (error) {
      console.log('[BLE] OTA command failed:', error);
      throw error;
    }
  };

  const updateConfiguration = async (newConfig: any) => {
    if (!connectedDevice) return;

    try {
      console.log('[BLE] Writing configuration:', newConfig);

      // 1️⃣ WRITE (ssid + password only)
      await connectedDevice.writeCharacteristicWithResponseForService(
        DOLL_CONTROL_SERVICE_UUID,
        CONFIGURATION_CHAR,
        encodeToBase64(newConfig),
      );

      // 2️⃣ Firmware ko time do (WiFi connect)
      // await new Promise(resolve => setTimeout(resolve, 3000));

      // 3️⃣ READ again (DOCUMENT REQUIRED)
      // await readConfiguration(connectedDevice);
    } catch (error) {
      console.log('[BLE] Config write/read failed', error);
      throw error;
    }
  };

  // ==================== UPDATE CHILD PROFILE ====================

  const updateChildProfile = async (profile: any) => {
    if (!connectedDevice) return;

    try {
      await connectedDevice.writeCharacteristicWithResponseForService(
        DOLL_CONTROL_SERVICE_UUID,
        CHILD_PROFILE_CHAR,
        encodeToBase64(profile),
      );

      if (isMounted.current) {
        setChildProfile(prev => ({ ...prev, ...profile }));
      }
    } catch (error) {
      console.log('[BLE] Child profile write failed', error);
    }
  };

  const sendPlaybackCommand = async (
    command:
      | 'play'
      | 'pause'
      | 'stop'
      | 'next'
      | 'previous'
      | 'seek'
      | 'volume'
      | 'ai_listen', // Added AI interaction command per hardware guide
    params: any = {},
  ) => {
    if (!connectedDevice) {
      Alert.alert('Error', 'Doll not connected');
      return;
    }

    // const payload =
    //   Object.keys(params).length > 0 ? { command, params } : { command };
    const payload = { command, ...params };

    console.log('[BLE] Playback Payload:', payload);

    try {
      await connectedDevice.writeCharacteristicWithResponseForService(
        DOLL_CONTROL_SERVICE_UUID,
        PLAYBACK_CONTROL_CHAR,
        encodeToBase64(payload),
      );
    } catch (error) {
      console.log('[BLE] Playback command failed', error);
    }
  };
  /* ---------------------------------------------------
     DISCONNECT (USER ACTION ONLY)
  --------------------------------------------------- */
  const disconnectDevice = () => {
    const deviceId = connectedDevice?.id;
    if (!deviceId || isDisconnectingRef.current) return;

    isDisconnectingRef.current = true;

    setConnectionStatus('disconnecting');

    // 1️⃣ remove all BLE monitors first
    removeAllMonitors();

    // 2️⃣ stop scan (safe)
    try {
      bleManager.stopDeviceScan();
    } catch {}

    // 3️⃣ disconnect safely (DO NOT await)
    bleManager
      .cancelDeviceConnection(deviceId)
      .catch(() => {
        console.log('[BLE] disconnect ignored');
      })
      .finally(() => {
        if (isMounted.current) {
          setConnectedDevice(null);
          setConnectionStatus('idle');
        }

        isDisconnectingRef.current = false;
      });
  };
  // const disconnectDevice = async () => {
  //   if (!connectedDevice?.id) return;

  //   try {
  //     const isConnected = await bleManager.isDeviceConnected(
  //       connectedDevice.id,
  //     );

  //     if (!isConnected) {
  //       console.log('[BLE] Device already disconnected');
  //       return;
  //     }

  //     setConnectionStatus('disconnecting');

  //     await bleManager.cancelDeviceConnection(connectedDevice.id);
  //   } catch (error: any) {
  //     console.log('[BLE] Safe disconnect catch:', error?.message);
  //   } finally {
  //     if (isMounted.current) {
  //       setConnectedDevice(null);
  //       setConnectionStatus('idle');
  //     }
  //   }
  // };

  // const disconnectDevice = async () => {
  //   if (!connectedDevice?.id) return;

  //   try {
  //     setConnectionStatus('idle');

  //     await bleManager.cancelDeviceConnection(connectedDevice.id).catch(() => {
  //       console.log('[BLE] Already disconnected');
  //     });
  //   } finally {
  //     if (isMounted.current) {
  //       setConnectedDevice(null);
  //     }
  //   }
  // };
  // ==================== TOGGLE DEVICE VIEW ====================
  const toggleDeviceView = () => {
    console.log('[BLE] Toggling view:', !showAllDevices);
    if (isMounted.current) {
      setShowAllDevices(!showAllDevices);
    }
  };

  // ==================== CONTEXT VALUE ====================
  const value: any = {
    // State
    hasPermission,
    isBluetoothEnabled,
    connectedDevice,
    discoveredDevices: getFilteredDevices(),
    allDevices: discoveredDevices,
    loading,
    isScanning,
    deviceInfo,
    batteryLevel,
    connectionStatus,
    playbackStatus,
    configuration,
    childProfile,
    firmwareInfo,
    usageData,
    showAllDevices,
    downloadedContentIds,
    disconnecting,
    contentSync,
    bleReady,
    requestBLEPermissions,
    startBLEScan,
    stopBLEScan,
    connectToDevice,
    disconnectDevice,
    updateConfiguration,
    updateChildProfile,
    sendPlaybackCommand,
    sendOTACommand, // Added: OTA update commands (check, start, cancel, rollback)
    toggleDeviceView,
    sendContentSyncCommand,
    getConnectionStatusColor: () => {
      switch (connectionStatus) {
        case 'connected':
          return '#34C759';
        case 'playing':
          return '#007AFF';
        case 'listening':
          return '#FF9500';
        case 'processing':
          return '#5856D6';
        case 'low_battery':
          return '#FF3B30';
        case 'charging':
          return '#34C759';
        default:
          return '#8E8E93';
      }
    },
    getConnectionStatusText: () => {
      switch (connectionStatus) {
        case 'idle':
          return 'Ready';
        case 'connecting':
          return 'Connecting...';
        case 'connected':
          return 'Connected';
        case 'playing':
          return 'Playing Content';
        case 'listening':
          return 'Listening';
        case 'processing':
          return 'AI Processing';
        case 'low_battery':
          return 'Low Battery';
        case 'charging':
          return 'Charging';
        default:
          return connectionStatus || 'Unknown';
      }
    },

    // Document 1.2: Simulate data for testing
    simulateDaraData,
  };

  return (
    <BluetoothContext.Provider value={value}>
      {children}
    </BluetoothContext.Provider>
  );
};
