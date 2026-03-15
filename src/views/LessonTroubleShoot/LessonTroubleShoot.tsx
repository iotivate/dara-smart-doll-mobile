/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import createBasicStyles from 'styles';
import CustomButton from '@components/CustomButton';
import CustomHeader from '@components/CustomHeader';
import { useSelector } from 'react-redux';

const LessonTroubleShoot = (props: any) => {
  const { theme } = useTheme();
  const basicStyles = createBasicStyles(theme);
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  const troubleshootingSteps = [
    {
      number: 1,
      title:
        languageData?.lesson_step_1_title || 'Check Your Internet Connection',
      description:
        languageData?.lesson_step_1_desc ||
        'Ensure you have a stable Wi-Fi or mobile data connection.',
    },
    {
      number: 2,
      title: languageData?.lesson_step_2_title || 'Refresh the App',
      description:
        languageData?.lesson_step_2_desc ||
        'Close the app completely and reopen it to reload the schedule.',
    },
    {
      number: 3,
      title: languageData?.lesson_step_3_title || 'Verify Scheduled Time',
      description:
        languageData?.lesson_step_3_desc ||
        'Check that the lesson time and your device time match correctly.',
    },
    {
      number: 4,
      title: languageData?.lesson_step_4_title || 'Sync Device Time',
      description:
        languageData?.lesson_step_4_desc ||
        'Turn on automatic date and time in your phone settings.',
    },
    {
      number: 5,
      title: languageData?.lesson_step_5_title || 'Restart the App or Device',
      description:
        languageData?.lesson_step_5_desc ||
        'Restart your app or phone if the lesson is still not starting.',
    },
  ];

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
        backButtonText={languageData?.help_support || 'Help & Support'}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Title */}
        <Text style={[basicStyles.textStyleExtraLargeBold, styles.mainTitle]}>
          {languageData?.lesson_troubleshooting_steps ||
            'Lesson Troubleshooting Steps'}
        </Text>

        {/* Steps Container */}
        <View style={styles.stepsContainer}>
          {troubleshootingSteps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              {/* Number Circle */}
              <View style={styles.numberCircle}>
                <Text style={styles.stepNumber}>{step.number}</Text>
              </View>

              {/* Step Content */}
              <View style={styles.stepContent}>
                <Text
                  style={[
                    basicStyles.textStyleMediumBold,
                    styles.stepTitle,
                    { color: theme.text },
                  ]}
                >
                  {step.title}
                </Text>

                <Text
                  style={[
                    basicStyles.textStyleRegular,
                    styles.stepDescription,
                    { color: theme.grayLight },
                  ]}
                >
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ marginTop: moderateScale(60) }} />
        <CustomButton
          text={languageData?.got_it || 'Got it'}
          backgroundColor={theme.themeColor}
          height={moderateScale(52)}
          // onPress={() => props.navigation.navigate('')}
        />
        <View />
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
    marginBottom: moderateScale(25),
  },
  stepsContainer: {
    marginBottom: moderateScale(30),
  },
  stepCard: {
    flexDirection: 'row',
    borderRadius: moderateScale(12),
    padding: moderateScale(15),
    marginBottom: moderateScale(15),
    borderWidth: 1,
    alignItems: 'flex-start',
  },

  stepTitle: {
    marginBottom: moderateScale(4),
    fontSize: moderateScale(14),
  },
  stepDescription: {
    lineHeight: moderateScale(18),
    fontSize: moderateScale(13),
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: moderateScale(18),
  },

  numberCircle: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),

    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },

  stepNumber: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#000',
  },

  stepContent: {
    flex: 1,
  },
});

export default LessonTroubleShoot;
