import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

import FontFamily from '@assets/fonts/FontFamily';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';

interface CustomButtonProps {
  text?: string;
  backgroundColor?: any;
  textColor?: string;
  icon?: any;
  onPress: any;
  width?: any;
  height?: any;
  style?: any;
  btnTxtStyle?: any;
  marginTop?: number;
  disable?: any;
  loading?: any;
  styleBtn?: any;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  backgroundColor,
  textColor = '#FFFFFF',
  icon,
  marginTop,
  onPress,
  width = '100%',
  height = moderateScale(45),
  style,
  btnTxtStyle,
  disable = false,
  styleBtn,
}) => {
  const { theme, currentTheme } = useTheme();
  const styles = getStyles(theme);
  const languageData = useSelector((state: any) => state?.data?.languageData);

  return currentTheme === 'custom' ? (
    <TouchableOpacity
      disabled={disable}
      onPress={onPress}
      activeOpacity={0.8}
      style={styleBtn}
    >
      <LinearGradient
        colors={[theme.gradientTwo, theme.gradientOne]} // You can tweak the gradient colors
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, { width, height, marginTop }, style]}
      >
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, { color: textColor }, btnTxtStyle]}>
            {text ? languageData?.[text] || text : ''}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, width, height, marginTop },
        style,
      ]}
      disabled={disable}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {icon}
        <Text style={[styles.text, { color: textColor }, btnTxtStyle]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    button: {
      borderRadius: moderateScale(12),
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      marginBottom: moderateScale(-3),
    },
  });

export default CustomButton;
