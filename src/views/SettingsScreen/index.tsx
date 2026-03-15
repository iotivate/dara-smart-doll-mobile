import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomVectorIcons from '@components/CustomVectorIcons';
import createBasicStyles from 'styles';
import CustomHeader from '@components/CustomHeader';

const SettingsScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const basicStyles = createBasicStyles(theme);

  const settingsOptions = [
    {
      title: 'Manage Child Control',
      onPress: () => navigation.navigate('ManageChildControlScreen'),
    },
    {
      title: 'Content Preferences',
      onPress: () => navigation.navigate('ContentPerformanceScreen'),
    },
    {
      title: 'Content playback history',
      onPress: () => navigation.navigate('ContentPlaybackHistory'),
    },
    {
      title: 'Support & Feedback',
      onPress: () => navigation.navigate('FeedbackSupportScreen'),
    },
  ];

  return (
    <SafeAreaView style={{ backgroundColor: theme.background, flex: 1 }}>
      <StatusBar
        backgroundColor={theme.transparent} // Matches the image background style
        barStyle={'light-content'}
      />
      <CustomHeader goBack={true} title="Settings" />

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Setting Options</Text>

        {settingsOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionCard}
            activeOpacity={0.8}
            onPress={item.onPress}
          >
            <Text style={styles.optionText}>{item.title}</Text>
            <CustomVectorIcons
              name="chevron-right"
              iconSet="Feather"
              size={moderateScale(20)}
              color={theme.text}
            />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: moderateScale(20),
      paddingTop: moderateScale(20),
    },
    sectionTitle: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginBottom: moderateScale(20),
    },
    optionCard: {
      backgroundColor: theme.mainBackground,
      borderRadius: moderateScale(10),
      paddingVertical: moderateScale(15),
      paddingHorizontal: moderateScale(15),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: moderateScale(15),
    },
    optionText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },
  });

export default SettingsScreen;
