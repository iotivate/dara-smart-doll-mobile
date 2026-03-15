/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import createBasicStyles from 'styles';
import CustomButton from '@components/CustomButton';
import CustomHeader from '@components/CustomHeader';

const SUPPORT_NUMBER = '+91 98765 43210'; // <-- Replace with your real support number

const CallSupportScreen = () => {
  const { theme } = useTheme();
  const basicStyles = createBasicStyles(theme);

  const makeCall = () => {
    const phoneNumber =
      Platform.OS === 'android'
        ? `tel:${SUPPORT_NUMBER}`
        : `telprompt:${SUPPORT_NUMBER}`;

    Linking.openURL(phoneNumber);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.white,
        marginTop: moderateScale(20),
      }}
    >
      <CustomHeader
        showBackButton={true}
        showNotifications={false}
        backButtonText="Help & Support"
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title */}
        <Text style={[basicStyles.textStyleExtraLargeBold, styles.mainTitle]}>
          Call Support
        </Text>

        {/* Description */}
        <Text
          style={[
            basicStyles.textStyleRegular,
            styles.description,
            { color: theme.grayLight },
          ]}
        >
          If you need immediate assistance, you can call our support team
          directly. We are available during business hours.
        </Text>

        {/* Phone Card */}
        <View style={styles.card}>
          <Text
            style={[
              basicStyles.textStyleMediumBold,
              { color: theme.text, marginBottom: 6 },
            ]}
          >
            📞 Support Number:
          </Text>

          <Text
            style={[basicStyles.textStyleRegular, { color: theme.themeColor }]}
          >
            {SUPPORT_NUMBER}
          </Text>
        </View>

        {/* Availability Card */}
        <View style={styles.card}>
          <Text
            style={[
              basicStyles.textStyleMediumBold,
              { color: theme.text, marginBottom: 8 },
            ]}
          >
            Availability:
          </Text>

          <Text
            style={[basicStyles.textStyleRegular, { color: theme.grayLight }]}
          >
            • Monday – Friday{'\n'}• 9:00 AM – 6:00 PM{'\n'}• Excluding public
            holidays
          </Text>
        </View>

        <View style={{ marginTop: moderateScale(40) }} />

        <CustomButton
          text="Call Support"
          backgroundColor={theme.themeColor}
          height={moderateScale(52)}
          onPress={makeCall}
        />

        <View style={{ marginBottom: moderateScale(20) }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(30),
  },
  mainTitle: {
    textAlign: 'center',
    marginTop: moderateScale(15),
    marginBottom: moderateScale(12),
  },
  description: {
    textAlign: 'center',
    marginBottom: moderateScale(20),
    lineHeight: moderateScale(20),
  },
  card: {
    borderRadius: moderateScale(12),
    padding: moderateScale(15),
    marginBottom: moderateScale(15),
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F9F9F9',
  },
});

export default CallSupportScreen;
