/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import createBasicStyles from 'styles';
import CustomVectorIcons from '@components/CustomVectorIcons';
import CustomHeader from '@components/CustomHeader';
import IMAGES from '@assets/images';

const RewardsScreen = () => {
  const { theme } = useTheme();
  const basicStyles = createBasicStyles(theme);
  const styles = getStyles(theme);

  const progressItems = [
    {
      id: 1,
      icon: IMAGES.abc,
      title: 'Alphabet',
      progress: 100,
      status: 'completed',
    },
    {
      id: 2,
      icon: IMAGES.book,
      title: 'Stories',
      progress: 30,
      status: 'pending',
    },
    {
      id: 3,
      icon: IMAGES.number,
      title: 'Numbers',
      progress: 30,
      status: 'pending',
    },
    {
      id: 4,
      icon: IMAGES.study,
      title: 'Study',
      progress: 30,
      status: 'pending',
    },
    {
      id: 5,
      icon: IMAGES.songs,
      title: 'Songs',
      progress: 30,
      status: 'pending',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.white }}>
      <CustomHeader showBackButton={true} showNotifications={false} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Your Rewards */}
        <Text style={[basicStyles.textStyleExtraLargeBold, styles.title]}>
          Your Rewards
        </Text>

        {/* Stars Earned Today */}
        <View style={[styles.starsBox, { backgroundColor: theme.themeColor }]}>
          <Text style={[basicStyles.textStyleMediumBold, styles.starsText]}>
            ⭐ 5 stars earned today
          </Text>
        </View>

        {/* Badges Earned */}
        <Text style={[basicStyles.textStyleLargeBold, styles.badgesTitle]}>
          Badges Earned
        </Text>

        <View style={[styles.badgesRow, { backgroundColor: theme.themeColor }]}>
          <View style={styles.badgeItem}>
            <Image source={IMAGES.bronze} style={styles.badgeIcon} />
          </View>

          <View style={styles.badgeItem}>
            <Image source={IMAGES.silver} style={styles.badgeIcon} />
          </View>

          <View style={styles.badgeItem}>
            <Image source={IMAGES.gold} style={styles.badgeIcon} />
          </View>
        </View>

        {/* Progress Section */}
        <View
          style={[styles.progressCard, { backgroundColor: theme.themeLight }]}
        >
          <Text style={[basicStyles.textStyleLargeBold, styles.progressTitle]}>
            Progress
          </Text>
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: theme.themeColor,
              marginLeft: 8,
              marginBottom: 12,
              marginTop: -12,
            }}
          />

          {progressItems.map(item => {
            const isCompleted = item.status === 'completed';

            return (
              <View key={item.id} style={styles.rowItem}>
                <View style={styles.leftSection}>
                  <Image source={item.icon} style={styles.rowIcon} />
                  <View style={styles.textSection}>
                    <Text
                      style={[basicStyles.textStyleMediumBold, styles.rowTitle]}
                    >
                      {item.title}
                    </Text>
                    <View
                      style={[
                        styles.progressBarBG,
                        { backgroundColor: theme.textBoxBackground },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${item.progress}%`,
                            backgroundColor: isCompleted
                              ? theme.themeColor
                              : theme.textSub,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.rightSection}>
                  <Text
                    style={[
                      basicStyles.textStyleSmallBold,
                      isCompleted ? styles.completed : styles.pending,
                      {
                        color: isCompleted ? theme.themeColor : theme.textSub,
                      },
                    ]}
                  >
                    {isCompleted ? 'Completed' : 'Pending'}
                  </Text>
                  {isCompleted ? (
                    <CustomVectorIcons
                      name="check"
                      iconSet="Feather"
                      size={moderateScale(16)}
                      color={theme.themeColor}
                      style={styles.statusIcon}
                    />
                  ) : (
                    <CustomVectorIcons
                      name="clock"
                      iconSet="Feather"
                      size={moderateScale(14)}
                      color={theme.textSub}
                      style={styles.statusIcon}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      paddingHorizontal: moderateScale(16),
      paddingBottom: moderateScale(20),
    },
    title: {
      textAlign: 'center',
      marginTop: moderateScale(16),
      // marginBottom: moderateScale(8),
      includeFontPadding: false,
    },
    starsBox: {
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(12),
      borderRadius: moderateScale(12),
      marginTop: moderateScale(12),
      alignSelf: 'flex-start',
      width: '100%',
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: moderateScale(3),
        },
        android: {
          elevation: 2,
        },
      }),
    },
    starsText: {
      color: theme.white,
      includeFontPadding: false,
    },
    badgesTitle: {
      marginTop: moderateScale(15),
      marginBottom: moderateScale(5),
      includeFontPadding: false,
    },
    badgesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: moderateScale(16),
      borderRadius: moderateScale(12),
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: moderateScale(4),
        },
        android: {
          elevation: 3,
        },
      }),
    },
    badgeItem: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    badgeIcon: {
      width: moderateScale(48),
      height: moderateScale(48),
      resizeMode: 'contain',
    },
    progressCard: {
      marginTop: moderateScale(24),
      padding: moderateScale(16),
      borderRadius: moderateScale(16),
      marginBottom: moderateScale(10),
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: moderateScale(4),
        },
        android: {
          elevation: 2,
        },
      }),
    },
    progressTitle: {
      marginBottom: moderateScale(16),
      includeFontPadding: false,
    },
    rowItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: moderateScale(16),
      minHeight: moderateScale(48),
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    textSection: {
      flex: 1,
      marginLeft: moderateScale(12),
    },
    rowIcon: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(8),
    },
    rowTitle: {
      marginBottom: moderateScale(6),
      includeFontPadding: false,
    },
    progressBarBG: {
      height: moderateScale(6),
      borderRadius: moderateScale(3),
      overflow: 'hidden',
      width: '100%',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: moderateScale(3),
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginLeft: moderateScale(12),
      minWidth: moderateScale(90),
    },
    completed: {
      marginRight: moderateScale(6),
      textAlign: 'right',
      includeFontPadding: false,
    },
    pending: {
      marginRight: moderateScale(6),
      textAlign: 'right',
      includeFontPadding: false,
    },
    statusIcon: {
      marginLeft: moderateScale(2),
    },
  });

export default RewardsScreen;
