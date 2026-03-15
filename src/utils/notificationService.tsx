import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

export const getToken = async () => {
  try {
    const storedFcmToken = await AsyncStorage.getItem('DEVICE_ID');
    console.log(
      'storedFcmTokenstoredFcmTokenstoredFcmTokenstoredFcmToken',
      storedFcmToken,
    );
    if (!storedFcmToken) {
      const newFcmToken = await messaging().getToken();
      if (newFcmToken) {
        await AsyncStorage.setItem('DEVICE_ID', newFcmToken);
        console.log('📱 New FCM Token:', newFcmToken);
      }
    } else {
      console.log('📱 Existing FCM Token:', storedFcmToken);
    }
  } catch (error) {
    console.log('FCM token error:', error);
  }
};
