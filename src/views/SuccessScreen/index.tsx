import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import { moderateScale } from 'react-native-size-matters';
import CustomButton from '@components/CustomButton';
import IMAGES from '@assets/images';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { useSelector } from 'react-redux';

const SuccessScreen = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  // State to hold the access mode (Parent or Child)
  const [accessMode, setAccessMode] = useState<number | null>(null);

  useEffect(() => {
    // Fetch the access mode saved during login
    const getAccessMode = async () => {
      try {
        const mode = await AsyncStorage.getItem('accessMode');
        console.log('Fetched access mode:', mode);
        if (mode) {
          setAccessMode(parseInt(mode, 10));
        }
      } catch (error) {
        console.log('Error fetching access mode:', error);
      }
    };

    getAccessMode();
  }, []);

  const handleDone = () => {
    if (accessMode === 4) {
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    } else {
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />

      {/* Gradient Background */}
      <LinearGradient
        colors={[theme.background, theme.mainBackground]}
        style={styles.gradientBackground}
      >
        <View style={styles.card}>
          <Image
            source={IMAGES.daraDoll}
            style={styles.avatar}
            resizeMode="contain"
          />

          <Text style={styles.title}>
            {languageData?.congratulations || 'Congratulations'}
          </Text>

          <Text style={styles.subtitle}>
            {languageData?.success_welcome_message ||
              'Welcome to the world of learning from smart way, we are providing you the best way to learn the module'}
          </Text>

          <View style={{ width: '100%' }}>
            <CustomButton
              text={languageData?.done || 'Done'}
              backgroundColor={theme.themeColor}
              onPress={handleDone}
              height={moderateScale(45)}
              style={styles.button}
              textStyle={{
                fontSize: moderateScale(14),
                fontFamily: FontFamily.KhulaBold,
              }}
            />
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    gradientBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: theme.mainBackground,
      borderRadius: moderateScale(20),
      padding: moderateScale(20),
      width: '85%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 5,
    },
    avatar: {
      width: moderateScale(100),
      height: moderateScale(120),
      marginBottom: moderateScale(15),
    },
    title: {
      fontSize: moderateScale(20),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginBottom: moderateScale(10),
    },
    subtitle: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
      textAlign: 'center',
      marginBottom: moderateScale(20),
    },
    button: {
      width: '100%',
      borderRadius: moderateScale(10),
    },
  });

export default SuccessScreen;
