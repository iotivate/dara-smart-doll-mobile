import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GlobalToast } from '@utils/GlobalToast';

// Auth
import SplashScreen from '@views/SplashScreen';
import IntroSwiper from '@views/IntroSwiper/IntroSwiper';
import LoginScreen from '@views/Authorization/LoginScreen';
import SignupScreen from '@views/Authorization/SignUp';
import OurProductsScreen from '@views/OurProductsScreen';
import ForgotPasswordScreen from '@views/Authorization/ForgotPasswordScreen';
import VerifyForgotPasswordOtp from '@views/Authorization/VerifyForgotPasswordOtp';
import SelectPreferenceScreen from '@views/Authorization/SelectPreferenceScreen';
import CreatePasswordScreen from '@views/Authorization/CreatePasswordScreen';
import OTPVerifyScreen from '@views/Authorization/OTPVerifyScreen';
import SetupPinScreen from '@views/Authorization/SetupPinScreen';
import VerifyPinScreen from '@views/Authorization/VerifyPinScreen';
import ResetPinOtpVerify from '@views/Authorization/ResetPin/ResetPinOtpVerify';
import ResetPinScreen from '@views/Authorization/ResetPin/ResetPinScreen';

import WhosWatchingScreen from '@views/Authorization/WhosWatchingScreen';
import AddNewProfileScreen from '@views/Authorization/WhosWatchingScreen/AddNewProfileScreen';
import EditNewProfileScreen from '@views/Authorization/WhosWatchingScreen/EditNewProfileScreen';
import Dashboard from '@views/Dashboard';
import AboutDaraScreen from '@views/AboutDaraScreen';
import EntertainmentStorytellingScreen from '@views/EntertainmentStorytellingScreen';
import SubscriptionScreen from '@views/SubscriptionScreen';
import SettingsScreen from '@views/SettingsScreen';
import ManageChildControlScreen from '@views/ManageChildControlScreen';
import ContentPerformanceScreen from '@views/ContentPerformanceScreen';
import ChildWhoWatchingScreen from 'childsScreen/ChildWhoWatchingScreen';
import LearningContentScreen from '@views/LearningContentScreen';
import PlaylistDetailsScreen from '@views/PlaylistDetailsScreen';
import ContentPlaybackHistory from '@views/ContentPlaybackHistory';
import FavouriteScreen from '@views/FavouriteScreen';
import FeedbackSupportScreen from '@views/FeedbackSupportScreen';
import SuccessScreen from '@views/SuccessScreen';
import ProductDetailScreen from '@views/ProductDetailScreen';
import AddAvatar from 'childsScreen/AddAvatar';
import EditAvatar from 'childsScreen/EditAvatar';
import ChildProfile from 'childsScreen/ChildProfile';
import ChooseIconScreen from 'childsScreen/ChooseIconScreen';
import DollScreen from 'childsScreen/DollScreen';
import SupportChatScreen from '@views/FeedbackSupportScreen/SupportChatScreen';
import { navigationRef } from './NavigationService';
import { useNetwork } from '@utils/NetworkContext';
import NoInternetModal from '@components/NoInternetModal';
import NotificationScreen from '@views/Notifications';
import NotificationSettingsScreen from '@views/Notifications/NotificationSettingsScreen';
import NewWhoIsWatching from '@views/WhoIsWatchingScreen/NewWhoIsWatching';
import NewChildProfile from '@views/ProfileScreen/NewChildProfile';
import NewEditProfile from '@views/ProfileScreen/EditProfileScreen';
import Bluethooth from '@views/BluethoothPairing/Bluethooth';
import ExistingSession from '@views/ExistingSession/ExistingSession';
import SetSchedule from '@views/ExistingSession/SetSchedule';
import LanguageToggleScreen from '@views/Authorization/SelectPreferenceScreen/LanguageToggleScreen';
import ContentSettingsScreen from '@views/ContentSettingsScreen/ContentSettingsScreen';
import ProgressScreen from '@views/ProgressScreen/ProgressScreen';
import RewardsScreen from '@views/Rewards/RewardsScreen';
import TermsAndConditionsScreen from '@views/TermsAndConditions/TermsAndConditionsScreen';
import HelpAndSupportScreen from '@views/HelpandSupport/HelpAndSupportScreen';
import BluetoothTroubleshooting from '@views/BluetoothTroubleshooting/BluetoothTroubleshooting';
import ViewProgress from '@views/ViewProgress/ViewProgress';
import ProfileSettings from '@views/ProfileScreen/ProfileSetting';
import UserNotification from '@views/Notifications/UserNotification';
import EditExistingScreen from '@views/ExistingSession/EditExistingScreen';
import VolumeDeviceSettingScreen from '@views/VolumeDeviceSettingScreen/VolumeDeviceSettingScreen';
import AppUpdateAvailableScreen from '@views/AppUpdateAvailableScreen/AppUpdateAvailableScreen';
import HomeScreen from 'childsScreen/Home/HomeScreen';
import ContentListScreen from 'childsScreen/ContentListScreen';
import AudioPlayerScreen from 'childsScreen/ChildProfile/AudioPlayerScreen';
import SearchScreen from 'childsScreen/SearchScreen';
import AudioTroubleShoot from '@views/AudioTroubleShoot/AudioTroubleShoot';
import LessonTroubleShoot from '@views/LessonTroubleShoot/LessonTroubleShoot';
import EmailSupportScreen from '@views/EmailSupportScreen/EmailSupportScreen';
import CallSupportScreen from '@views/callSupport/CallSupport';

const Stack = createNativeStackNavigator();
const Routes: React.FC = () => {
  const { isConnected } = useNetwork();
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{ animation: 'ios_from_right' }}
      >
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="IntroSwiper"
          component={IntroSwiper}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OTPVerify"
          component={OTPVerifyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SetupPin"
          component={SetupPinScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerifyPin"
          component={VerifyPinScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPinOtp"
          component={ResetPinOtpVerify}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPin"
          component={ResetPinScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Bluethooth"
          component={Bluethooth}
          options={{ headerShown: false }}
        />
        {/* <Stack.Screen
          name="Bluethooth"
          component={BluetoothScreen}
          options={{ headerShown: false }}
        /> */}
        <Stack.Screen
          name="VerifyForgotPasswordOtp"
          component={VerifyForgotPasswordOtp}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreatePasswordScreen"
          component={CreatePasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SelectPreferenceScreen"
          component={SelectPreferenceScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="WhosWatching"
          component={WhosWatchingScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="AddNewProfile"
          component={AddNewProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditNewProfile"
          component={EditNewProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EntertainmentStorytellingScreen"
          component={EntertainmentStorytellingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AboutDaraScreen"
          component={AboutDaraScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="SubscriptionScreen"
          component={SubscriptionScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ProfileScreen"
          component={ProfileSettings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notification"
          component={NotificationScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ContentPerformanceScreen"
          component={ContentPerformanceScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManageChildControlScreen"
          component={ManageChildControlScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChildWhoWatchingScreen"
          component={ChildWhoWatchingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LearningContentScreen"
          component={LearningContentScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PlaylistDetailsScreen"
          component={PlaylistDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContentPlaybackHistory"
          component={ContentPlaybackHistory}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FavouriteScreen"
          component={FavouriteScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OurProductsScreen"
          component={OurProductsScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="OurProducts"
          component={OurProductsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FeedbackSupportScreen"
          component={FeedbackSupportScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SupportChat"
          component={SupportChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SuccessScreen"
          component={SuccessScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ProductDetailScreen"
          component={ProductDetailScreen}
          options={{ headerShown: false }}
        />
        {/* // child Screen  */}

        <Stack.Screen
          name="AddAvatar"
          component={AddAvatar}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditAvatar"
          component={EditAvatar}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChildProfile"
          component={ChildProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChooseIconScreen"
          component={ChooseIconScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="DollScreen"
          component={DollScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ContentListScreen"
          component={ContentListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        {/* VIkash added Screen  */}
        <Stack.Screen
          name="NewWhoIsWatching"
          component={NewWhoIsWatching}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NewChildProfile"
          component={NewChildProfile}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ExistingSession"
          component={ExistingSession}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditExistingScreen"
          component={EditExistingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NewEditProfile"
          component={NewEditProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SetSchedule"
          component={SetSchedule}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LanguageToggle"
          component={LanguageToggleScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContentSettingsScreen"
          component={ContentSettingsScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ProgressScreen"
          component={ProgressScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="RewardsScreen"
          component={RewardsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TermsAndConditionsScreen"
          component={TermsAndConditionsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HelpAndSupportScreen"
          component={HelpAndSupportScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BluetoothTroubleshooting"
          component={BluetoothTroubleshooting}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ViewProgress"
          component={ViewProgress}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="UserNotification"
          component={UserNotification}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="VolumeDeviceSettingScreen"
          component={VolumeDeviceSettingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AppUpdateAvailableScreen"
          component={AppUpdateAvailableScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AudioPlayerScreen"
          component={AudioPlayerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SearchScreen"
          component={SearchScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AudioTroubleShoot"
          component={AudioTroubleShoot}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LessonTroubleShoot"
          component={LessonTroubleShoot}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmailSupportScreen"
          component={EmailSupportScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CallSupportScreen"
          component={CallSupportScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      <NoInternetModal visible={!isConnected} />
      <GlobalToast />
    </NavigationContainer>
  );
};

export default Routes;
