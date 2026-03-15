/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import createBasicStyles from 'styles';
import CustomButton from '@components/CustomButton';
import CustomHeader from '@components/CustomHeader';

const SUPPORT_EMAIL = 'info@darabuddy.com';

const EmailSupportScreen = () => {
  const { theme } = useTheme();
  const basicStyles = createBasicStyles(theme);

  const openEmail = () => {
    const subject = 'Support Needed';
    const body = `Hello Support Team,%0D%0A%0D%0A
Please help me with the following issue:%0D%0A%0D%0A
Device: ${Platform.OS}%0D%0A%0D%0A
Issue Details:%0D%0A`;

    const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    Linking.openURL(mailUrl);
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
          Contact Support
        </Text>

        {/* Description */}
        <Text
          style={[
            basicStyles.textStyleRegular,
            styles.description,
            { color: theme.grayLight },
          ]}
        >
          If you're facing any issues, our support team is here to help you.
          Please send us an email with your issue details.
        </Text>

        {/* Email Section */}
        <View style={styles.card}>
          <Text
            style={[
              basicStyles.textStyleMediumBold,
              { color: theme.text, marginBottom: 6 },
            ]}
          >
            📧 Email us at:
          </Text>

          <Text
            style={[basicStyles.textStyleRegular, { color: theme.themeColor }]}
          >
            {SUPPORT_EMAIL}
          </Text>
        </View>

        {/* What to include */}
        <View style={styles.card}>
          <Text
            style={[
              basicStyles.textStyleMediumBold,
              { color: theme.text, marginBottom: 8 },
            ]}
          >
            Please include:
          </Text>

          <Text
            style={[basicStyles.textStyleRegular, { color: theme.grayLight }]}
          >
            • Your registered email{'\n'}• Description of the issue{'\n'}•
            Screenshots (if any){'\n'}• Your device (Android / iOS)
          </Text>
        </View>

        <View style={{ marginTop: moderateScale(40) }} />

        <CustomButton
          text="Email Support"
          backgroundColor={theme.themeColor}
          height={moderateScale(52)}
          onPress={openEmail}
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

export default EmailSupportScreen;
