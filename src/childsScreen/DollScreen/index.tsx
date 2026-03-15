import React from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomLucideIcon from '@components/CustomLucideIcon';
import IMAGES from '@assets/images';
import { Navigation } from 'lucide-react-native';
import CustomHeader from '@components/CustomHeader';

const DollScreen = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.themeColor} />
      {/* <CustomHeader showBackButton={true} showNotifications={false} /> */}
      <CustomHeader
        type="dashboard"
        showProfile
        userName="Zery"
        greetingText="Hi"
        notificationBadgeCount={0}
        showIconCircles
        showDropdown
      />

      {/* Top Section with greeting */}
      {/* <View style={styles.header}>
        <Image source={IMAGES.doll} style={styles.profileImage} />
        <Text style={styles.greetingText}>
          Hi{'\n'}
          <Text style={styles.nameText}>Zery!</Text>
        </Text>
      </View> */}

      {/* Search Bar */}
      {/* <View style={styles.searchContainer}>
        <CustomLucideIcon name="Search" size={20} color={theme.gray} />
        <TextInput
          placeholder="Search"
          placeholderTextColor={theme.gray}
          style={styles.searchInput}
        />
      </View> */}

      {/* Character Image */}
      <View style={styles.characterContainer}>
        <Image
          source={IMAGES.doll1}
          style={styles.characterImage}
          resizeMode="contain"
        />
      </View>

      {/* Description Text */}
      <Text style={styles.descriptionText}>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry.
      </Text>

      {/* Mic Button */}
      <View style={styles.bottomMicContainer}>
        <TouchableOpacity
          style={styles.micButton}
          onPress={() => props.navigation.navigate('CartoonVideoScreen')}
        >
          <CustomLucideIcon name="Mic" size={28} color={theme.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: moderateScale(10),
    },
    profileImage: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      marginRight: moderateScale(12),
    },
    greetingText: {
      fontSize: moderateScale(14),
      color: theme.gray,
      fontFamily: FontFamily.KhulaRegular,
    },
    nameText: {
      fontSize: moderateScale(16),
      color: theme.black,
      fontFamily: FontFamily.KhulaBold,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F0F0F0',
      borderRadius: moderateScale(12),
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(10),
      marginTop: moderateScale(16),
    },
    searchInput: {
      marginLeft: moderateScale(10),
      flex: 1,
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.black,
    },
    characterContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    characterImage: {
      width: moderateScale(200),
      height: moderateScale(300),
    },
    descriptionText: {
      textAlign: 'center',
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.gray,
      marginBottom: moderateScale(80),
    },
    bottomMicContainer: {
      position: 'absolute',
      bottom: moderateScale(30),
      alignSelf: 'center',
    },
    micButton: {
      backgroundColor: theme.themeColor,
      width: moderateScale(60),
      height: moderateScale(60),
      borderRadius: moderateScale(30),
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
    },
  });

export default DollScreen;
