/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import CustomLucideIcon from './CustomLucideIcon';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import { Shadow } from 'react-native-shadow-2';
import FontFamily from '@assets/fonts/FontFamily';
import { useSelector } from 'react-redux';

const { width: adjustWidth } = Dimensions.get('window');
const width = adjustWidth;

const CustomBottomBar = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const languageData = useSelector((state: any) => state?.data?.languageData);

  return (
    <View style={styles.container}>
      <View style={styles.svgContainer}>
        <Shadow
          distance={10}
          startColor="rgba(0,0,0,0.10)"
          offset={[0, 8]}
          radius={20}
          corners={{
            topLeft: true,
            topRight: true,
            bottomLeft: true,
            bottomRight: true,
          }}
          containerViewStyle={{ borderRadius: 0 }}
        >
          <Svg
            width={width}
            height={moderateScale(75)}
            viewBox={`0 0 ${width} 60`}
          >
            <Path
              fill={theme.themeColor}
              d={`
              M20,0
              H${(width - 140) / 2}
              C${width / 2 - 16},0 ${width / 2 - 48},45 ${width / 2},48
              C${width / 2 + 48},45 ${width / 2 + 16},0 ${
                width - (width - 140) / 2
              },0
              H${width - 18}
              A20,20 0 0 1 ${width},20
              V50
              A20,20 0 0 1 ${width - 20},80
              H20
              A20,20 0 0 1 0,50
              V20
              A20,20 0 0 1 20,0
              Z
            `}
            />
          </Svg>
        </Shadow>
      </View>

      {/* Center Floating Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          navigation.navigate('QRScanner');
        }}
      >
        <CustomLucideIcon
          name="Mic"
          color={theme.white}
          size={moderateScale(30)}
        />
      </TouchableOpacity>

      {/* Bottom Bar Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <CustomLucideIcon name="Home" color={theme.white} />
          <Text style={[styles.label, { color: theme.white }]}>
            {languageData?.bottom_bar_home || 'Home'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            navigation.navigate('OurProducts');
          }}
        >
          <CustomLucideIcon name="ShieldUser" color={theme.grayBox} />
          <Text style={[styles.label]}>
            {languageData?.bottom_bar_dara || 'Dara'}
          </Text>
        </TouchableOpacity>
        <View style={[styles.tabItem, { marginHorizontal: moderateScale(25) }]}>
          <Text style={[styles.label]}></Text>
        </View>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('SubscriptionScreen')}
        >
          <CustomLucideIcon name="ListMusic" color={theme.grayBox} />
          <Text style={[styles.label]}>
            {languageData?.bottom_bar_subscription || 'Subscription'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <CustomLucideIcon name="User" color={theme.grayBox} />
          <Text style={[styles.label]}>
            {languageData?.bottom_bar_profile || 'Profile'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomBottomBar;

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      bottom: moderateScale(0),
      width,
      height: moderateScale(70),
      alignItems: 'center',
      alignSelf: 'center',
    },
    svgContainer: {
      position: 'absolute',
      bottom: 0,
    },
    floatingButton: {
      position: 'absolute',
      bottom: moderateScale(24),
      backgroundColor: theme.themeColor,
      borderRadius: moderateScale(35),
      width: moderateScale(60),
      height: moderateScale(60),
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      zIndex: 2,
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width,
      height: moderateScale(80),
      alignItems: 'center',
      paddingHorizontal: moderateScale(20),
    },
    tabItem: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaBold,
      color: theme.grayBox,
      marginTop: moderateScale(4),
    },
  });
