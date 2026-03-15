/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomButton from '@components/CustomButton';
import IMAGES from '@assets/images';
import CustomHeader from '@components/CustomHeader';
import CustomVectorIcons from '@components/CustomVectorIcons';

const AddAvatar = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={'rgba(0,0,0,0.5)'}
        barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'}
      />

      <CustomHeader showBackButton={true} showNotifications={false} />

      <View style={styles.content}>
        <Text style={styles.title}>Set Your Avatar</Text>

        <View style={styles.profileContainer}>
          <View style={styles.profileBox}>
            <Image source={IMAGES.doll} style={styles.avatar} />
            <Text style={styles.profileName}>Kids</Text>
          </View>
          <View style={styles.profileBox}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.newAvatarCircle}
              onPress={() => {
                props.navigation.navigate('HomeScreen');
              }}
            >
              <CustomVectorIcons
                name="plus"
                iconSet="Entypo"
                size={moderateScale(36)}
                color={theme.gray}
              />
            </TouchableOpacity>

            <Text style={styles.profileName}>New</Text>
          </View>
        </View>

        <CustomButton
          text={'Edit Profile'}
          backgroundColor={theme.themeColor}
          onPress={() => {
            props.navigation.navigate('EditAvatar');
          }}
          height={moderateScale(45)}
          width={300}
          style={{
            alignSelf: 'center',
            borderRadius: moderateScale(12),
            marginTop: moderateScale(100),
          }}
        />

        <CustomButton
          text={'Learn More'}
          backgroundColor={theme.themeColor}
          onPress={() => {
            props.navigation.navigate('EntertainmentStorytellingScreen');
          }}
          height={moderateScale(45)}
          width={300}
          style={{
            alignSelf: 'center',
            borderRadius: moderateScale(12),
            marginTop: moderateScale(10),
            // marginBottom: moderateScale(10),
          }}
        />
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
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: moderateScale(20),
      paddingTop: moderateScale(40),
    },
    title: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaBold,
      color: theme.black,
      marginBottom: moderateScale(25),
    },
    profileContainer: {
      flexDirection: 'row', // Make them side by side
      justifyContent: 'space-between', // Add space between them
      width: '100%', // Ensure full width
      paddingHorizontal: moderateScale(20),
      marginBottom: moderateScale(30),
    },

    profileBox: {
      alignItems: 'center',
      flex: 1,
    },

    avatar: {
      width: moderateScale(80),
      height: moderateScale(80),
      borderRadius: moderateScale(40),
      marginBottom: moderateScale(10),
    },
    profileName: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
    },
    button: {
      width: '80%',
      marginVertical: moderateScale(8),
      borderRadius: moderateScale(10),
    },
    newAvatarCircle: {
      width: moderateScale(80),
      height: moderateScale(80),
      borderRadius: moderateScale(40),
      backgroundColor: theme.lightGray || '#E5E5E5',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: moderateScale(10),
    },
  });

export default AddAvatar;
