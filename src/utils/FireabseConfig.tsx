import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

const initNotifications = async () => {
  await createNotificationChannel();
  await setupNotificationListeners();
  await getFcmToken();
};

async function requestNotificationPermission() {
  if (Platform.OS === 'android') {
    // ✅ Android 13+ needs POST_NOTIFICATIONS
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Android notification permission granted');
      } else {
        console.log('Android notification permission denied');
      }
    } else {
      console.log('Android < 13 does not require POST_NOTIFICATIONS');
    }
  } else if (Platform.OS === 'ios') {
    // ✅ iOS request permissions
    PushNotificationIOS.requestPermissions().then(permissions => {
      if (permissions.alert || permissions.badge || permissions.sound) {
        console.log('iOS notification permission granted:', permissions);
      } else {
        console.log('iOS notification permission denied');
      }
    });
  }
}

const createNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: 'fsl',
        channelName: 'FCM Notifications',
        channelDescription: 'Channel for Firebase Cloud Messages',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created: any) => console.log(`Notification channel created: ${created}`),
    );
  }
};

const setupNotificationListeners = async () => {
  // Background
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background notification:', remoteMessage);
  });

  // When app in background and user taps
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened (background):', remoteMessage);
  });

  // Foreground
  messaging().onMessage(async remoteMessage => {
    const { title, body } = remoteMessage.notification || {};
    console.log('Foreground notification:', remoteMessage);

    PushNotification.localNotification({
      channelId: 'fsl',
      title: title || 'New Notification',
      message: body || '',
      playSound: true,
      soundName: 'default',
      allowWhileIdle: true,
      showBadge: true,
      largeIcon: 'ic_launcher', // must exist in android/app/src/main/res/mipmap-*
      smallIcon: 'ic_notification', // must exist in android/app/src/main/res/drawable-*
    });
  });

  // Initial notification
  const initialNotification = await messaging().getInitialNotification();
  if (initialNotification) {
    console.log('Initial notification on launch:', initialNotification);
  }
};

// ✅ Get FCM Token
const getFcmToken = async () => {
  try {
    await messaging().registerDeviceForRemoteMessages();
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      const newFcmToken = await messaging().getToken();
      if (newFcmToken) {
        await AsyncStorage.setItem('fcmToken', newFcmToken);
      }
    }
  } catch (error) {
    console.log('Error generating FCM token:', error);
  }
};

export { getFcmToken, initNotifications, requestNotificationPermission };
