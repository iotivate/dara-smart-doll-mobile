/* eslint-disable react-native/no-inline-styles */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import createBasicStyles from 'styles';
import CustomHeader from '@components/CustomHeader';

// Static avatar images - you can replace these with your IMAGES imports
const AVATARS = [
  { id: '1', uri: 'https://cdn-icons-png.flaticon.com/512/194/194938.png' },
  { id: '2', uri: 'https://cdn-icons-png.flaticon.com/512/194/194935.png' },
  { id: '3', uri: 'https://cdn-icons-png.flaticon.com/512/194/194936.png' },
  { id: '4', uri: 'https://cdn-icons-png.flaticon.com/512/194/194937.png' },
  { id: '5', uri: 'https://cdn-icons-png.flaticon.com/512/194/194939.png' },
  { id: '6', uri: 'https://cdn-icons-png.flaticon.com/512/194/194940.png' },
  { id: '7', uri: 'https://cdn-icons-png.flaticon.com/512/194/194941.png' },
  { id: '8', uri: 'https://cdn-icons-png.flaticon.com/512/194/194942.png' },
  { id: '9', uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333609.png' },
  { id: '10', uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333610.png' },
  { id: '11', uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333611.png' },
  { id: '12', uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333612.png' },
  { id: '13', uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333613.png' },
  { id: '14', uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333614.png' },
  { id: '15', uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333615.png' },
  { id: '16', uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333616.png' },
  { id: '17', uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333617.png' },
  { id: '18', uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333618.png' },
  { id: '19', uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333619.png' },
  { id: '20', uri: 'https://cdn-icons-png.flaticon.com/512/4333/4333620.png' },
];

const ChooseIconScreen = (props: any) => {
  const { theme } = useTheme();
  const basicStyles = createBasicStyles(theme);
  const styles = getStyles(theme);

  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const handleAvatarSelect = useCallback(
    (avatarId: string) => {
      setSelectedAvatar(avatarId);
      // Pass the selected avatar back to EditProfile screen
      if (props.route.params?.onAvatarSelect) {
        props.route.params.onAvatarSelect(avatarId);
      }
      // Navigate back after selection
      setTimeout(() => {
        props.navigation.goBack();
      }, 300);
    },
    [props.navigation, props.route.params],
  );

  // Group avatars into rows of 4 for better layout
  const avatarRows = [];
  for (let i = 0; i < AVATARS.length; i += 4) {
    avatarRows.push(AVATARS.slice(i, i + 4));
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.white }]}>
      <StatusBar
        backgroundColor={theme.themeColor}
        barStyle="light-content"
        translucent={false}
      />

      <CustomHeader showBackButton={true} showNotifications={false} />

      {/* Scrollable avatar grid */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={[basicStyles.textStyleExtraLargeBold, styles.title]}>
            Choose Icon
          </Text>
          <Text style={[basicStyles.textStyleMediumBold, styles.watchingText]}>
            Who's watching?
          </Text>
        </View>

        {avatarRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.avatarRow}>
            {row.map(avatar => (
              <TouchableOpacity
                key={avatar.id}
                style={[
                  styles.avatarBox,
                  selectedAvatar === avatar.id && styles.avatarBoxSelected,
                  { backgroundColor: theme.themeLight },
                ]}
                onPress={() => handleAvatarSelect(avatar.id)}
                activeOpacity={0.7}
                accessibilityLabel={`Select avatar ${avatar.id}`}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedAvatar === avatar.id }}
              >
                <Image
                  source={{ uri: avatar.uri }}
                  style={styles.avatarImage}
                  accessibilityLabel="User avatar"
                />
                {selectedAvatar === avatar.id && (
                  <View style={styles.selectedIndicator}>
                    <View style={styles.selectedCheck}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {/* Fill empty spaces if row has less than 4 items */}
            {row.length < 4 &&
              Array(4 - row.length)
                .fill(null)
                .map((_, index) => (
                  <View key={`empty-${index}`} style={styles.emptyBox} />
                ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerBackground: {
      alignItems: 'center',
      paddingVertical: moderateScale(20),
      borderBottomLeftRadius: moderateScale(25),
      borderBottomRightRadius: moderateScale(25),
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: moderateScale(8),
        },
        android: {
          elevation: 4,
        },
      }),
    },
    title: {
      color: theme.text,
      includeFontPadding: false,
      textAlign: 'center',
      marginBottom: moderateScale(4),
    },
    sectionHeader: {
      paddingHorizontal: moderateScale(16),
      marginTop: moderateScale(20),
      marginBottom: moderateScale(20),
    },
    watchingText: {
      color: theme.textSub,
      includeFontPadding: false,
      textAlign: 'left',
    },
    scrollContent: {
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(10),
      paddingBottom: moderateScale(40),
    },
    avatarRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: moderateScale(16),
      paddingHorizontal: moderateScale(0),
    },
    avatarBox: {
      borderRadius: moderateScale(12),
      padding: moderateScale(8),
      alignItems: 'center',
      justifyContent: 'center',
      width: moderateScale(78),
      height: moderateScale(78),
      borderWidth: 1,
      borderColor: 'transparent',
      position: 'relative',
      marginHorizontal: moderateScale(2),
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
    avatarBoxSelected: {
      borderColor: theme.themeColor,
      borderWidth: 2,
      backgroundColor: theme.themeLight,
    },
    avatarImage: {
      width: moderateScale(52),
      height: moderateScale(52),
      borderRadius: moderateScale(10),
    },
    selectedIndicator: {
      position: 'absolute',
      top: -moderateScale(6),
      right: -moderateScale(6),
      backgroundColor: theme.white,
      borderRadius: moderateScale(10),
      padding: moderateScale(1),
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: moderateScale(2),
        },
        android: {
          elevation: 3,
        },
      }),
    },
    selectedCheck: {
      width: moderateScale(18),
      height: moderateScale(18),
      borderRadius: moderateScale(9),
      backgroundColor: theme.themeColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkText: {
      color: theme.white,
      fontSize: moderateScale(10),
      fontWeight: 'bold',
    },
    emptyBox: {
      width: moderateScale(78),
      height: 0,
    },
  });

export default ChooseIconScreen;
