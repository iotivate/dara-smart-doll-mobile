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
import CustomDropdown from './CustomDropdown';
import { useSelector } from 'react-redux';

interface CountryCustomTextInputProps extends TextInputProps {
  title?: string;
  placeholder?: string;
  countryCode?: string;
  icon?: any;
  secureTextEntry?: boolean;
  onIconPress?: () => void;
  showBorderOnFocus?: boolean;
  defaultBorderColor?: string;
  focusBorderColor?: string;
  focusOuterBorderColor?: string;
  errorMessage?: any;
  onFocusClearError?: () => void;
  OnpressCountery?: () => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  // Add new props for country selection
  selectedCountry?: any;
  onCountryChange?: (country: any) => void;
  countries?: any[];
  countryApiAvailable?: boolean;
}

const CountryCustomTextInput = forwardRef<
  TextInput,
  CountryCustomTextInputProps
>(
  (
    {
      title,
      placeholder,
      value,
      onChangeText,
      secureTextEntry = false,
      icon,
      onIconPress,
      showBorderOnFocus = true,
      defaultBorderColor = '#8EAD5D',
      focusBorderColor = '#5f259f',
      focusOuterBorderColor = '#e0cbd7',
      errorMessage = '',
      onFocusClearError,
      style,
      inputStyle,
      errorStyle,
      onSubmitEditing,
      keyboardType,
      returnKeyType,
      autoCapitalize,
      countryCode = '91',
      OnpressCountery,
      // New props
      selectedCountry,
      onCountryChange,
      countries = [],
      countryApiAvailable = true,
      ...textInputProps
    },
    ref,
  ) => {
    const { theme, isDark }: any = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(!secureTextEntry);
    const styles = getStyles(theme, isDark);
    const languageData = useSelector((state: any) => state?.data?.languageData);

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

    // Format country data for dropdown
    const getCountryData = () => {
      if (!countries || countries.length === 0) {
        return [{ label: '🇮🇳 +91', value: '🇮🇳 +91' }];
      }
      return countries.map(country => ({
        label: `${country.emoji} ${country.dialCode}`,
        value: country.dialCode,
        country: country,
      }));
    };

    // Get current selected value
    const getSelectedValue = () => {
      if (selectedCountry) {
        return {
          label: `${selectedCountry.emoji} ${selectedCountry.dialCode}`,
          value: selectedCountry.dialCode,
        };
      }
      return { label: '🇮🇳 +91', value: '+91' };
    };

    const handleCountrySelect = (item: any) => {
      if (onCountryChange && item.country) {
        onCountryChange(item.country);
      }
    };

    return (
      <View style={[styles.container, style]}>
        {title && (
          <Text style={styles.title}>
            {languageData?.[title] || title}
            <Text style={styles.required}> *</Text>
          </Text>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              borderColor: hasError
                ? theme.themeRed
                : showBorderOnFocus && isFocused
                ? focusBorderColor
                : defaultBorderColor,
            },
          ]}
        >
          {countryApiAvailable ? (
            <CustomDropdown
              data={getCountryData()}
              placeholder={''}
              value={getSelectedValue()}
              onChange={handleCountrySelect}
              customDropdownContainerStyle={{
                width: '30%',
              }}
              disabled={countries.length === 0}
            />
          ) : (
            <TouchableOpacity
              style={styles.countrySelector}
              onPress={OnpressCountery}
              disabled={!OnpressCountery}
            >
              <Text style={styles.countryText}>{getSelectedValue().label}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.separator} />

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
            keyboardType={keyboardType || 'phone-pad'}
            returnKeyType={returnKeyType}
            secureTextEntry={!showPassword}
            {...textInputProps}
          />

          {secureTextEntry && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <CustomVectorIcons
                name={showPassword ? 'eye-off' : 'eye'}
                size={moderateScale(25)}
                color={theme.grayLight}
                iconSet="Ionicons"
              />
            </TouchableOpacity>
          )}
        </View>

        {hasError && (
          <Text style={[styles.errorText, errorStyle]}>{errorMessage}</Text>
        )}
      </View>
    );
  },
);

const getStyles = (theme: any, isDark: any) =>
  StyleSheet.create({
    container: {},
    title: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      marginBottom: moderateScale(5),
      color: theme.text,
    },
    required: {
      color: theme.themeRed,
      fontSize: moderateScale(16),
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
      borderColor: theme.themeColor,
      borderRadius: moderateScale(10),
      height: moderateScale(50),
      paddingHorizontal: moderateScale(5),
      backgroundColor: theme.white,
      elevation: 0,
    },
    countrySelector: {
      width: '30%',
      paddingHorizontal: moderateScale(10),
      justifyContent: 'center',
    },
    countryText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },
    separator: {
      width: 1,
      height: '70%',
      backgroundColor: theme.grayLight,
      marginRight: moderateScale(10),
    },
    input: {
      flex: 1,
      height: moderateScale(45),
      paddingVertical: 0,
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.textInput,
      marginHorizontal: moderateScale(5),
    },
    errorText: {
      marginTop: moderateScale(2),
      fontSize: moderateScale(14),
      color: theme.themeRed,
      fontFamily: FontFamily.KhulaSemiBold,
    },
  });

export default CountryCustomTextInput;
