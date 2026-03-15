/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import createBasicStyles from 'styles';
import CustomButton from '@components/CustomButton';
import CustomHeader from '@components/CustomHeader';
import { useSelector } from 'react-redux';

const BluetoothTroubleshootingScreen = () => {
  const { theme } = useTheme();
  const basicStyles = createBasicStyles(theme);
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  const troubleshootingSteps = [
    {
      number: 1,
      title: languageData?.bt_step_1_title || 'Turn Bluetooth Off & On',
      description:
        languageData?.bt_step_1_desc ||
        'Try toggling Bluetooth off and then back on to refresh the connection.',
    },
    {
      number: 2,
      title: languageData?.bt_step_2_title || 'Bring Device Close',
      description:
        languageData?.bt_step_2_desc ||
        'Keep your phone and the device within 1-2 meters for stable pairing.',
    },
    {
      number: 3,
      title: languageData?.bt_step_3_title || 'Restart Your Device',
      description:
        languageData?.bt_step_3_desc ||
        'Restart both your phone and the Bluetooth device.',
    },
    {
      number: 4,
      title: languageData?.bt_step_4_title || 'Check Battery Level',
      description:
        languageData?.bt_step_4_desc ||
        'Ensure your Bluetooth device has sufficient battery.',
    },
    {
      number: 5,
      title: languageData?.bt_step_5_title || 'Forget & Re-pair Device',
      description:
        languageData?.bt_step_5_desc ||
        'Forget the device from Bluetooth settings and pair it again.',
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
          {languageData?.troubleshooting_steps || 'Troubleshooting Steps'}
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

export default BluetoothTroubleshootingScreen;
