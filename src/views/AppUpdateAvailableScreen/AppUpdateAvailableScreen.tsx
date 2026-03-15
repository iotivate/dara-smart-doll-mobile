/* eslint-disable react-native/no-inline-styles */
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import CustomVectorIcons from '@components/CustomVectorIcons';
import FontFamily from '@assets/fonts/FontFamily';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AppUpdateAvailableScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Gradient Header Background */}
      <View style={styles.headerBackground} />

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backRow}
          onPress={() => navigation?.goBack?.()}
        >
          <CustomVectorIcons
            name="chevron-left"
            iconSet="Feather"
            size={moderateScale(20)}
            color={theme.white}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Content Card */}
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>App Update Available</Text>
          <Text style={styles.time}>Today, 1:45 PM</Text>
        </View>

        <Text style={styles.description}>
          Take advantage of our exclusive weekend offer and earn 5% cashback on
          all your grocery purchases! Whether you're stocking up on essentials
          or indulging in your favorite treats, now is the perfect time to enjoy
          extra savings. With this limited-time promotion, every dollar you
          spend on groceries will earn you cashback rewards, allowing you to
          stretch your budget further and make the most of your shopping
          experience.
          {'\n\n'}
          Make your weekend grocery shopping even more rewarding by
          participating in this special offer. Simply shop at your favorite
          grocery stores, swipe your registered card, and watch the cashback
          rewards accumulate. Don't miss out on this opportunity to save while
          you shop for your household needs. Hurry and start earning cashback
          today!
        </Text>
      </View>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85} style={styles.button}>
          <Text style={styles.buttonText}>Got it</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ===== Styles =====
const HEADER_HEIGHT = moderateScale(120);

const getStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    headerBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: HEADER_HEIGHT,
      backgroundColor: theme.themeColor,
      borderBottomLeftRadius: moderateScale(28),
      borderBottomRightRadius: moderateScale(28),
      opacity: 0.95,
    },
    headerRow: {
      paddingHorizontal: moderateScale(16),
      paddingTop: Platform.OS === 'ios' ? moderateScale(10) : moderateScale(30),
      height: HEADER_HEIGHT,
      justifyContent: 'flex-start',
    },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backText: {
      marginLeft: moderateScale(6),
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(14),
      color: theme.white,
    },
    card: {
      marginTop: -moderateScale(20),
      marginHorizontal: moderateScale(16),
      backgroundColor: theme.white,
      borderRadius: moderateScale(18),
      padding: moderateScale(16),
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        },
        android: { elevation: 4 },
      }),
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: moderateScale(10),
    },
    title: {
      flex: 1,
      fontFamily: FontFamily.KhulaExtraBold,
      fontSize: moderateScale(16),
      color: theme.text,
    },
    time: {
      marginLeft: moderateScale(8),
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(11),
      color: theme.textSub,
    },
    description: {
      fontFamily: FontFamily.KhulaRegular,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(18),
      color: theme.textSub,
    },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: moderateScale(20),
      paddingHorizontal: moderateScale(16),
    },
    button: {
      backgroundColor: theme.themeColor,
      borderRadius: moderateScale(14),
      paddingVertical: moderateScale(14),
      alignItems: 'center',
    },
    buttonText: {
      fontFamily: FontFamily.KhulaExtraBold,
      fontSize: moderateScale(14),
      color: theme.white,
    },
  });

export default AppUpdateAvailableScreen;
