import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  Platform,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useTheme } from '@theme/themeContext';

import CustomHeader from '@components/CustomHeader';
import CustomLoader from '@utils/CustomLoader';
import IMAGES from '@assets/images';

import BleService from '../../ble/BleService';
// import { base64Encode } from '../../ble/BleUtils';

const BluetoothScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [battery, setBattery] = useState<number | null>(null);

  /* ----------------------------------------------------
     1. PERMISSIONS
  ---------------------------------------------------- */
  const requestPermissions = async () => {
    setLoading(true);

    try {
      if (Platform.OS === 'android') {
        const scan = await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
        const connect = await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
        const location = await request(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        );

        const ok =
          scan === RESULTS.GRANTED &&
          connect === RESULTS.GRANTED &&
          location === RESULTS.GRANTED;

        setHasPermission(ok);
        setLoading(false);

        if (!ok) {
          Alert.alert(
            'Permissions Needed',
            'Please allow Bluetooth permissions.',
          );
        }

        return;
      }

      setHasPermission(true);
      setLoading(false);
    } catch (e) {
      console.log('Permission error:', e);
      setLoading(false);
    }
  };

  /* ----------------------------------------------------
     2. START SCAN → CONNECT
  ---------------------------------------------------- */
  const startConnectionProcess = () => {
    if (!hasPermission) {
      Alert.alert('Error', 'Grant permissions first');
      return;
    }

    setLoading(true);

    BleService.scanForDevice(async device => {
      try {
        const connected = await BleService.connect(device);
        setConnectedDevice(connected);

        const batt = await BleService.getBatteryLevel(connected);

        console.log('battbattbatt', batt);
        setBattery(batt);

        BleService.subscribePlayback(connected, data => {
          console.log('Playback Status:', data);
        });

        Alert.alert('Connected', `Device: ${device.name}`);
      } catch (e) {
        Alert.alert('Connection Failed', 'Try again');
        setLoading(false);

        console.log('Connection error:', e);
      } finally {
        setLoading(false);
      }
    });
  };

  /* ----------------------------------------------------
     3. SEND COMMAND
  ---------------------------------------------------- */
  const sendPlayCommand = () => {
    if (!connectedDevice) {
      Alert.alert('Not Connected', 'Scan & Connect first');
      return;
    }

    const cmd = {
      command: 'play',
      params: { content_id: 'story_123' },
    };

    BleService.sendCommand(connectedDevice, cmd);
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar backgroundColor={theme.transparent} barStyle="light-content" />

      <CustomHeader goBack={true} title="Bluetooth Pairing Manager" />

      <View style={styles.container}>
        {!connectedDevice ? (
          <>
            <Text style={styles.title}>Connect Smart Dara Buddy</Text>

            <Image source={IMAGES.daraDoll} style={styles.deviceImg} />

            <TouchableOpacity
              style={styles.btn}
              onPress={startConnectionProcess}
            >
              <Text style={styles.btnText}>Scan & Connect</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.connected}>
              Connected: {connectedDevice.name}
            </Text>
            <Text style={styles.batt}>Battery: {battery}%</Text>

            <TouchableOpacity style={styles.btn} onPress={sendPlayCommand}>
              <Text style={styles.btnText}>Send Play Command</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <CustomLoader visible={loading} />
    </SafeAreaView>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      padding: 25,
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: '#1D2C4D',
      marginBottom: 20,
    },
    deviceImg: {
      width: 180,
      height: 260,
      resizeMode: 'contain',
      marginBottom: 20,
    },
    btn: {
      backgroundColor: '#7E4FFF',
      paddingVertical: 14,
      paddingHorizontal: 25,
      borderRadius: 10,
      marginTop: 10,
    },
    btnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    connected: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
      color: '#2B4',
    },
    batt: {
      fontSize: 16,
      marginBottom: 20,
    },
  });

export default BluetoothScreen;
