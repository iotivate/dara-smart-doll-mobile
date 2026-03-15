import React, { useEffect } from 'react';
import { ThemeProvider } from '@theme/themeContext';

import Routes from '@navigation/routes';
import { PaperProvider } from 'react-native-paper';
// import NoInternetModal from '@utils/NoInternetModal';
import { Provider } from 'react-redux';
import { persistor, store } from '@redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { NetworkProvider } from '@utils/NetworkContext';
import {
  initNotifications,
  requestNotificationPermission,
} from '@utils/FireabseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { SocketProvider } from 'context/SocketContext';
import SocketContentModal from '@components/SocketContentModal';
import { getToken } from '@utils/notificationService';
import { BluetoothProvider } from '@components/BluetoothContext';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://94ce9b29cc8a61148abd97e956f32b39@o4510944936394752.ingest.us.sentry.io/4510951891468288',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],
});

const App: React.FC = () => {
  useEffect(() => {
    requestNotificationPermission();
    initNotifications();
    getToken();

    const unsubscribe = messaging().onTokenRefresh(async newToken => {
      await AsyncStorage.setItem('DEVICE_ID', newToken);
    });

    return unsubscribe;
  }, []);

  return (
    <NetworkProvider>
      <BluetoothProvider>
        <Provider store={store}>
          <ThemeProvider>
            <PaperProvider>
              <SocketProvider>
                <PersistGate loading={null} persistor={persistor}>
                  <Routes />
                  <SocketContentModal />
                </PersistGate>
              </SocketProvider>
            </PaperProvider>
          </ThemeProvider>
        </Provider>
      </BluetoothProvider>
    </NetworkProvider>
  );
};

export default Sentry.wrap(App);
// import { View, Text, Button, StyleSheet } from 'react-native';
// import React, { useState } from 'react';
// import { startSpeechToText } from 'react-native-voice-to-text';

// const App = () => {
//   const [text, setText] = useState<any>('');

//   console.log('texttexttexttexttexttexttexttexttext', text);
//   return (
//     <View style={styles.container}>
//       <Text style={{ color: 'white', fontWeight: 'bold' }}>Result: {text}</Text>

//       <Button
//         title="Mic check"
//         color={'#ace10d'}
//         onPress={async () => {
//           try {
//             const audioText = await startSpeechToText();
//             console.log('audioText:', { audioText });
//             setText(audioText);
//           } catch (error) {
//             console.log({ error });
//           }
//         }}
//       />
//     </View>
//   );
// };

// export default App;
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#04ff0028',
//   },
// });
