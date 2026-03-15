/**
 * @format
 */

import { AppRegistry, Platform } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
// enableScreens(false);

// 🛑 Background message handler (Firebase)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(
  Platform.OS === 'android' ? 'dara' : 'aiapp',
  () => App,
);
