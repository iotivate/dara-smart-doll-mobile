/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import CustomVectorIcons from './CustomVectorIcons';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import { moderateScale } from 'react-native-size-matters';
import CustomLucideIcon from './CustomLucideIcon';
import { useSelector } from 'react-redux';

interface CustomTextInputProps extends TextInputProps {
  title?: string;
  placeholder?: string;
  icon?: any;
  icon2?: any;
  secureTextEntry?: boolean;
  onIconPress?: () => void;
  showBorderOnFocus?: boolean;
  defaultBorderColor?: string;
  focusBorderColor?: string;
  errorMessage?: string;
  onFocusClearError?: () => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  customInputContainerStyle?: StyleProp<TextStyle>;
  titleStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

const CustomTextInput = forwardRef<TextInput, CustomTextInputProps>(
  (
    {
      title,
      placeholder,
      value,
      onChangeText,
      secureTextEntry = false,
      icon,
      icon2,
      onIconPress,
      showBorderOnFocus = true,
      defaultBorderColor = null,
      focusBorderColor = null,
      errorMessage = '',
      onFocusClearError,
      style,
      inputStyle,
      customInputContainerStyle,
      errorStyle,
      onSubmitEditing,
      keyboardType,
      returnKeyType,
      autoCapitalize,
      titleStyle,
      ...textInputProps
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const languageData = useSelector((state: any) => state?.data?.languageData);
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(!secureTextEntry);
    const styles = getStyles(theme);

    const handleFocus = () => {
      setIsFocused(true);
      if (onFocusClearError) {
        onFocusClearError();
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const hasError = !!errorMessage;

    let defaultBorderColors = defaultBorderColor || theme.textBoxBorder;
    let focusBorderColors = focusBorderColor || theme.textBoxBorder;

    return (
      <View style={[styles.container, style]}>
        {title && (
          <Text style={[styles.title, titleStyle]}>
            {languageData?.[title] || title}
          </Text>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.textBoxBackground,
              borderColor: hasError
                ? theme.themeRed
                : showBorderOnFocus && isFocused
                ? focusBorderColors
                : defaultBorderColors,
            },
            customInputContainerStyle,
          ]}
        >
          {icon}
          <TextInput
            style={[styles.input, inputStyle]}
            placeholder={
              placeholder
                ? languageData?.[placeholder] || placeholder
                : undefined
            }
            placeholderTextColor={theme.grayLight}
            value={value}
            ref={ref}
            onSubmitEditing={onSubmitEditing}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            returnKeyType={returnKeyType}
            secureTextEntry={!showPassword}
            {...textInputProps}
          />
          {secureTextEntry && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <CustomLucideIcon
                name={showPassword ? 'Eye' : 'EyeOff'}
                size={moderateScale(25)}
                color={theme.themeColor}
                style={{ marginRight: moderateScale(5) }}
              />
            </TouchableOpacity>
          )}

          {icon2}
        </View>

        {hasError && (
          <Text style={[styles.errorText, errorStyle]}>
            {languageData?.[errorMessage] || errorMessage}
          </Text>
        )}
      </View>
    );
  },
);

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {},
    title: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      marginBottom: moderateScale(2),
      color: theme.text,
    },
    outerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.black,
      borderRadius: moderateScale(10),
      backgroundColor: theme.background,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: moderateScale(10),
      height: moderateScale(50),
      paddingHorizontal: moderateScale(5),
      backgroundColor: theme.white,
      elevation: 0,
    },
    input: {
      flex: 1,
      height: moderateScale(45),
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.textInput,
      marginHorizontal: moderateScale(5),
      textAlignVertical: 'center',
    },
    errorText: {
      marginTop: moderateScale(2),
      fontSize: moderateScale(14),
      color: theme.themeRed,
      fontFamily: FontFamily.KhulaSemiBold,
    },
  });

export default CustomTextInput;
