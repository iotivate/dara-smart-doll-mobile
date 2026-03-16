/**
 * @format
 */

/**
 * DARA SMART DOLL MOBILE APP - MAIN ENTRY POINT
 *
 * BLE Implementation Status: ✅ COMPLETE (See BLE_DEVELOPER_HANDOFF.md)
 * Ready for production build by India development team
 */

import { AppRegistry, Platform } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// Firebase background message handler for push notifications
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Firebase message handled in background:', remoteMessage);
});

// Register the main app component
// Note: 'dara' for Android, 'aiapp' for iOS (as per original configuration)
AppRegistry.registerComponent(
  Platform.OS === 'android' ? 'dara' : 'aiapp',
  () => App,
);
