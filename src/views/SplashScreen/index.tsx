/* eslint-disable react-native/no-inline-styles */
import React, { useEffect } from 'react';
import { ImageBackground, StatusBar, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import FastImage from '@d11/react-native-fast-image';

import { CommonActions } from '@react-navigation/native';

import IMAGES from '@assets/images';
import FontFamily from '@assets/fonts/FontFamily.tsx';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import createBasicStyles from 'styles';
import { getData } from '@utils/CustomAsyncStorage';

const SplashScreen: React.FC = ({ navigation }: any) => {
  const { theme, currentTheme } = useTheme();
  const basicStyles = createBasicStyles(theme);

  const checkData = async () => {
    try {
      setTimeout(async () => {
        let routeName = 'Login'; // default fallback route

        const token = await getData('token');
        const accessMode = await getData('accessMode');

        console.log('token', token, 'accessMode', accessMode);

        if (token) {
          if (accessMode === 4) {
            // Child
            routeName = 'HomeScreen';
          } else {
            // Parent or others
            routeName = 'Dashboard';
          }
        } else {
          routeName = 'IntroSwiper';
        }

        // console.log('objectobjectobjectobject', routeName);

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: routeName }],
          }),
        );
      }, 2000);
    } catch (error) {
      console.log(
        '❌ [Auth Error] Failed to read credentials from AsyncStorage:',
        error,
      );
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        }),
      );
    }
  };

  // Run check only once when component mounts
  useEffect(() => {
    checkData();
  }, []);

  return (
    <View style={basicStyles.container}>
      <ImageBackground
        source={
          currentTheme === 'light'
            ? IMAGES.bg_primary
            : currentTheme === 'dark'
            ? IMAGES.bg_dark
            : IMAGES.bg_secondary
        }
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <StatusBar
          backgroundColor="transparent"
          barStyle="dark-content"
          translucent={true}
        />
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FastImage
            source={
              currentTheme === 'light'
                ? IMAGES.logo_blk
                : currentTheme === 'dark'
                ? IMAGES.logo_white
                : IMAGES.logo_blk
            }
            style={{ width: moderateScale(220), aspectRatio: 2 / 1 }}
            resizeMode="contain"
          />

          <View style={{ position: 'absolute', bottom: 20 }}>
            <ActivityIndicator size="small" color={theme.iconColor} />
            <Text
              style={{
                fontSize: moderateScale(14),
                color: theme.text,
                fontFamily: FontFamily.KhulaRegular,
                textAlign: 'center',
                marginVertical: moderateScale(15),
              }}
            >
              App Version: 1.0
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default SplashScreen;
