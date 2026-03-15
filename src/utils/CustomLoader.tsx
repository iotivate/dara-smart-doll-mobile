/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { useWindowDimensions, View, StyleSheet, Text } from 'react-native';

// import ball_bounce from '@assets/lottie/ball_bounce.json';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import { ActivityIndicator } from 'react-native-paper';
import { useTheme } from '@theme/themeContext';
import { useSelector } from 'react-redux';

type CustomLoaderProps = {
  visible?: boolean;
};

const CustomLoader: React.FC<CustomLoaderProps> = ({ visible = false }) => {
  const { theme, isDark } = useTheme();

  const languageData = useSelector((state: any) => state?.data?.languageData);
  const { width, height } = useWindowDimensions();
  const overlayHeight = height + 100;

  // const messages: string[] = [
  //   languageData?.loader_fetching || 'Fetching your data...',
  //   languageData?.loader_wait || 'Just a moment...',
  //   languageData?.loader_almost || 'Almost there...',
  // ];

  // const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // setCurrentMsgIndex(prev => (prev + 1) % messages?.length);
  //   }, 2000);

  //   return () => clearInterval(interval);
  // }, []);

  if (!visible) return null;

  return (
    <View style={[styles.container, { height: overlayHeight, width }]}>
      <View style={styles.lottieWrapper}>
        <ActivityIndicator size={'large'} color={theme.white} />
        <Text
          style={{
            color: '#fff',
            fontFamily: FontFamily.KhulaExtraBold,
            fontSize: moderateScale(14),
            marginTop: moderateScale(15),
          }}
        >
          {languageData?.Loading || 'Loading...'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    top: 0,
    bottom: 0,
    position: 'absolute',
    zIndex: 1050,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieWrapper: {
    marginTop: moderateScale(-50),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
});

export default CustomLoader;
