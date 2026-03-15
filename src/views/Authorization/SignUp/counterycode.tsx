import FontFamily from '@assets/fonts/FontFamily';
import { useTheme } from '@theme/themeContext';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  error?: string;
  keyboardType?:
    | 'default'
    | 'number-pad'
    | 'email-address'
    | 'phone-pad'
    | 'numeric';
  onPressCountryCode?: () => void;
  counterySelect?: {
    name?: string;
    dialCode?: string;
    shortName?: string;
    emoji?: string;
  };

  maxLength?: number;
}

export const InputBox: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  onFocus,
  error,
  keyboardType,
  counterySelect,
  onPressCountryCode,
  maxLength,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View>
      {/* <View style={[styles.inputContainer, error && styles.inputError]}>
  
        <Text onPress={onPressCountryCode} style={styles.countryCode}>
          {counterySelect}
        </Text>

  
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          onFocus={onFocus}
          keyboardType={keyboardType}
          placeholderTextColor={theme.themeGrayDark}
        />
      </View> */}
      <View style={[styles.inputContainer, !!error ? styles.inputError : null]}>
        <TouchableOpacity
          onPress={onPressCountryCode}
          activeOpacity={0.7}
          style={styles.countryCodeContainer}
        >
          <Text style={styles.countryCodeText}>
            {counterySelect?.emoji
              ? `${counterySelect.emoji} ${counterySelect.dialCode}`
              : counterySelect?.dialCode}
          </Text>

          <Text style={styles.separatorText}> | </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          onFocus={onFocus}
          keyboardType={keyboardType}
          placeholderTextColor={theme.themeGrayDark}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 55,
      borderWidth: 1,
      borderColor: theme.borderColorDynamic || '#00000040',
      borderRadius: 8,
      backgroundColor: theme.textBoxBackground,
      paddingHorizontal: 12,
    },

    countryCodeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    countryCodeText: {
      fontSize: moderateScale(15),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
    },

    separatorText: {
      marginHorizontal: 8,
      fontSize: moderateScale(16),
      color: theme.textSub,
      fontFamily: FontFamily.KhulaRegular,
    },

    input: {
      flex: 1,
      fontSize: moderateScale(15),
      fontFamily: FontFamily.KhulaLight,
      color: theme.text,

      // 🔥 PLACEHOLDER FIX
      paddingVertical: 0,
      lineHeight: moderateScale(20),
      textAlignVertical: 'center',

      ...(Platform.OS === 'android' && {
        includeFontPadding: false,
      }),
    },

    inputError: {
      borderColor: theme.themeRed,
      backgroundColor: theme.themeRed + '10',
    },

    errorText: {
      marginTop: moderateScale(4),
      fontSize: moderateScale(13),
      color: theme.themeRed,
      fontFamily: FontFamily.KhulaSemiBold,
    },
  });
