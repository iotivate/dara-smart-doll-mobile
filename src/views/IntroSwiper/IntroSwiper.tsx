/* eslint-disable react-native/no-inline-styles */
import {
  StatusBar,
  View,
  Animated,
  Easing,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import React, { useRef, useState } from 'react';
import IMAGES from '@assets/images';
import { useTheme } from '@theme/themeContext';
import CustomSwiperFlatlist from '@components/CustomSwiperFlatlist';
import { moderateScale } from 'react-native-size-matters';
import CustomImageComponent from '@components/CustomImageComponent';

import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';

const IntroSwiper: React.FC = (props: any) => {
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { theme, currentTheme } = useTheme();

  const scaleAnim = useRef(new Animated.Value(0)).current;

  const imageData = [
    {
      id: '1',
      source: IMAGES.introSwiper0,
      heading: 'Learn Through Play',
      content:
        'Meet our interactive, culturally-themed dolls that brings stories and lessons to life.',
    },
    {
      id: '2',
      source:
        currentTheme === 'custom'
          ? IMAGES.introSwiper1_custom
          : currentTheme === 'dark'
          ? IMAGES.introSwiper1_dark
          : IMAGES.introSwiper1_light,
      heading: 'Smart Learning \n Experience',
      content:
        'Meet our interactive, culturally-themed dolls that brings stories and lessons to life.',
    },
    {
      id: '3',
      source:
        currentTheme === 'custom'
          ? IMAGES.introSwiper2_custom
          : currentTheme === 'dark'
          ? IMAGES.introSwiper2_dark
          : IMAGES.introSwiper2_light,
      heading: 'Parental Control',
      content:
        'Meet our interactive, culturally-themed dolls that brings stories and lessons to life.',
    },
    {
      id: '4',
      source: IMAGES.introSwiper3,
      heading: 'Earn Rewards',
      content:
        'Master your challenges, embrace simplicity,\nand enjoy a fulfilling life.',
    },
  ];

  const handleNavigate = (screen: string) => {
    Animated.timing(scaleAnim, {
      toValue: 80,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      props.navigation.navigate(screen);
      // setTimeout(() => {
      scaleAnim.setValue(0);
      // }, 100);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ImageBackground
        source={
          currentTheme === 'custom'
            ? IMAGES.swiperBackground_custom
            : currentTheme === 'dark'
            ? IMAGES.swiperBackground_Dark
            : IMAGES.swiperBackground_light
        }
        style={{ flex: 1 }}
      >
        <StatusBar
          translucent
          backgroundColor={'transparent'}
          barStyle={'dark-content'}
        />
        <View style={{}}>
          {currentTheme !== 'dark' ? (
            <CustomImageComponent
              source={
                currentTheme === 'custom'
                  ? IMAGES.bg_card_secondary
                  : IMAGES.bg_card_primary
              }
              width={'100%'}
              height={moderateScale(180)}
              resizeMode="stretch"
              style={{
                marginTop: moderateScale(-35),
              }}
            />
          ) : (
            <View
              style={{
                marginTop: moderateScale(-30),

                width: '100%',
                height: moderateScale(180),
                backgroundColor: theme.themeColor,
              }}
            />
          )}

          <MaskedView
            style={styles.blurContainer}
            maskElement={
              <LinearGradient
                colors={['white', 'white', 'transparent', 'transparent']}
                locations={[0, 0.3, 0.7, 1]}
                start={{ x: 0.5, y: 0.6 }}
                end={{ x: 0.5, y: 0 }}
                style={styles.horizontalMask}
              />
            }
          >
            <BlurView
              blurType="light"
              blurAmount={1}
              style={StyleSheet.absoluteFill}
            />
          </MaskedView>
        </View>

        <CustomSwiperFlatlist
          ref={swiperRef}
          data={imageData}
          onIndexChanged={(index: number) => setActiveIndex(index)}
          onNextTap={() => {
            if (activeIndex < 4) {
              swiperRef.current?.scrollToNext();
              setTimeout(() => {
                setActiveIndex(prevIndex => prevIndex + 1);
              }, 300);
            } else {
              handleNavigate('Login');
            }
          }}
        />
      </ImageBackground>
    </View>
  );
};

export default IntroSwiper;

const styles = StyleSheet.create({
  blurContainer: {
    position: 'absolute',
    top: '50%', // moves it to face level
    width: '100%',
    height: 90, // thickness of blur strip
  },
  horizontalMask: {
    width: '100%',
    height: '100%',
  },
});
