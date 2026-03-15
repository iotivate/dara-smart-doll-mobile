/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  View,
  Animated,
  Easing,
} from 'react-native';
import React, { useRef, useState } from 'react';
import CustomButton from '@components/CustomButton';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import IMAGES from '@assets/images';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import CustomSwiperFlatlist from '@components/CustomSwiperFlatlist';

const SwiperScreens: React.FC = (props: any) => {
  const { theme, isDark } = useTheme();

  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  const imageData = [
    {
      id: '1',
      source: IMAGES.swiper1,
      content:
        'Simplify and accelerate your rent payment with our user-friendly app',
    },
    {
      id: '2',
      source: IMAGES.swiper2,
      content:
        'Simplify and accelerate your rent payment with our user-friendly app',
    },
    {
      id: '3',
      source: IMAGES.swiper2,
      content:
        'Simplify and accelerate your rent payment with our user-friendly app',
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.white }}>
      <StatusBar backgroundColor={theme.white} barStyle={'dark-content'} />

      <View style={{ height: moderateScale(120) }} />

      <CustomSwiperFlatlist
        ref={swiperRef}
        data={imageData}
        onIndexChanged={(index: number) => setActiveIndex(index)}
      />

      {activeIndex < 3 ? (
        <View
          style={{
            marginTop: hp('2%'),
            marginHorizontal: wp('5%'),
            width: '65%',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          <CustomButton
            text={'Next'}
            backgroundColor={theme.themeColor}
            onPress={() => {
              swiperRef.current?.scrollToNext();
              setTimeout(() => {
                setActiveIndex(prevIndex => prevIndex + 1);
              }, 300);
            }}
            height={moderateScale(55)}
            style={{
              alignSelf: 'center',
              marginTop: moderateScale(25),
              borderRadius: moderateScale(10),
            }}
          />
        </View>
      ) : (
        <View
          style={{
            marginTop: hp('2%'),
            marginHorizontal: wp('5%'),
            gap: hp('2%'),
            width: '65%',
            alignSelf: 'center',
          }}
        >
          <CustomButton
            text={'Get Started'}
            backgroundColor={theme.themeColor}
            onPress={() => {
              handleNavigate('Login');
            }}
            height={moderateScale(55)}
            style={{
              alignSelf: 'center',
              marginTop: moderateScale(25),
              borderRadius: moderateScale(10),
            }}
          />
        </View>
      )}

      <Animated.View
        style={{
          position: 'absolute',
          width: 20,
          height: 20,
          borderRadius: 50,
          backgroundColor: theme.themeColor,
          alignSelf: 'center',
          bottom: 200,
          transform: [{ scale: scaleAnim }],
        }}
      />
    </SafeAreaView>
  );
};

export default SwiperScreens;
