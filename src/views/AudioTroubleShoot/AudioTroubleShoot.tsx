/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import createBasicStyles from 'styles';
import CustomButton from '@components/CustomButton';
import CustomHeader from '@components/CustomHeader';
import { useSelector } from 'react-redux';

const AudioTroubleShoot = () => {
  const { theme } = useTheme();
  const basicStyles = createBasicStyles(theme);
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  const troubleshootingSteps = [
    {
      number: 1,
      title: languageData?.audio_step_1_title || 'Check Volume Level',
      description:
        languageData?.audio_step_1_desc ||
        'Make sure the volume on both your phone and Bluetooth device is not muted or too low.',
    },
    {
      number: 2,
      title:
        languageData?.audio_step_2_title || 'Select Bluetooth Audio Output',
      description:
        languageData?.audio_step_2_desc ||
        'Go to audio settings and ensure your Bluetooth device is selected as the output.',
    },
    {
      number: 3,
      title: languageData?.audio_step_3_title || 'Reconnect the Device',
      description:
        languageData?.audio_step_3_desc ||
        'Disconnect and reconnect your Bluetooth audio device from settings.',
    },
    {
      number: 4,
      title: languageData?.audio_step_4_title || 'Check Media Permissions',
      description:
        languageData?.audio_step_4_desc ||
        'Ensure the app has permission to play audio via Bluetooth.',
    },
    {
      number: 5,
      title: languageData?.audio_step_5_title || 'Forget & Pair Again',
      description:
        languageData?.audio_step_5_desc ||
        'Forget the device and pair it again for a fresh connection.',
    },
    {
      number: 6,
      title: languageData?.audio_step_6_title || 'Restart Phone & Device',
      description:
        languageData?.audio_step_6_desc ||
        'Restart both your phone and the Bluetooth audio device.',
    },
    {
      number: 7,
      title: languageData?.audio_step_7_title || 'Check Battery Level',
      description:
        languageData?.audio_step_7_desc ||
        'Low battery can cause unstable or no audio connection.',
    },
    {
      number: 8,
      title:
        languageData?.audio_step_8_title || 'Disable Other Bluetooth Devices',
      description:
        languageData?.audio_step_8_desc ||
        'Turn off other connected Bluetooth devices that may conflict.',
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
          {languageData?.audio_troubleshooting_steps ||
            'Audio Troubleshooting Steps'}
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

export default AudioTroubleShoot;
