import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import { moderateScale } from 'react-native-size-matters';
import CustomVectorIcons from '@components/CustomVectorIcons';
import LinearGradient from 'react-native-linear-gradient';
import IMAGES from '@assets/images';

const ChildWhoWatchingScreen = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.white }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'}
      />

      {/* Header */}
      <LinearGradient
        colors={['#B084FF', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => props.navigation.goBack()}
        >
          <CustomVectorIcons
            name="chevron-left"
            iconSet="Feather"
            size={moderateScale(22)}
            color={theme.white}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.container}>
        <Text style={styles.title}>Who’s watching?</Text>

        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Image
              source={IMAGES.avatarSample}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.nameText}>Carlos Carlton</Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#6D28D9' }]}
        >
          <Text style={styles.buttonText}>Learn More</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    headerContainer: {
      height: moderateScale(100),
      justifyContent: 'flex-end',
      paddingHorizontal: moderateScale(20),
      paddingBottom: moderateScale(10),
      borderBottomLeftRadius: moderateScale(20),
      borderBottomRightRadius: moderateScale(20),
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backText: {
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(15),
      color: theme.white,
      marginLeft: moderateScale(5),
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: moderateScale(20),
      marginTop: moderateScale(-30),
    },
    title: {
      fontFamily: FontFamily.KhulaBold,
      fontSize: moderateScale(18),
      color: theme.black,
      marginBottom: moderateScale(25),
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: moderateScale(30),
    },
    avatarCircle: {
      width: moderateScale(90),
      height: moderateScale(90),
      borderRadius: moderateScale(45),
      backgroundColor: '#C4B5FD',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: moderateScale(8),
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: moderateScale(45),
    },
    nameText: {
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(14),
      color: theme.black,
    },
    button: {
      backgroundColor: '#8B5CF6',
      width: '80%',
      height: moderateScale(48),
      borderRadius: moderateScale(10),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: moderateScale(15),
    },
    buttonText: {
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(14),
      color: theme.white,
    },
  });

export default ChildWhoWatchingScreen;
