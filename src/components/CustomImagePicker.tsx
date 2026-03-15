/* eslint-disable react-native/no-inline-styles */
import FontFamily from '@assets/fonts/FontFamily';
import { useTheme } from '@theme/themeContext';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import CustomLucideIcon from './CustomLucideIcon';
import { openImage_Picker } from '@utils/PickerServices';
import { useSelector } from 'react-redux';

const CustomImagePicker: React.FC<any> = ({
  placeholder,
  title,
  customDropdownStyle,
  customDropdownContainerStyle,
  iconName = 'Upload',
  iconColor,
  iconSize = moderateScale(24),
}) => {
  const { theme } = useTheme();
  const languageData = useSelector((state: any) => state?.data?.languageData);
  const styles = getStyles(theme);

  const [fileName, setFileName] = useState<string | null>(null);

  const shortenFileName = (name: string) => {
    const [base, ext] = name.split('.');
    if (base.length <= 10) return name; // Don't shorten small names

    const short = `${base.slice(0, 4)}...${base.slice(-4)}.${ext}`;
    return short;
  };

  const handleImagePick = async () => {
    const response = await openImage_Picker();
    if (response?.filename) {
      const shortName = shortenFileName(response.filename);
      setFileName(shortName);
    }
  };

  return (
    <View style={[styles.container, customDropdownContainerStyle]}>
      {title && (
        <Text style={styles.title}>{languageData?.[title] || title}</Text>
      )}

      <TouchableOpacity
        onPress={handleImagePick}
        activeOpacity={0.6}
        style={[
          styles.pickerContainer,
          customDropdownStyle,
          { backgroundColor: theme.white },
        ]}
      >
        <Text style={fileName ? styles.selectedText : styles.placeholder}>
          {fileName ||
            (placeholder ? languageData?.[placeholder] || placeholder : '')}
        </Text>

        <CustomLucideIcon
          name={iconName}
          size={iconSize}
          color={iconColor || theme.iconColor}
          style={{ marginRight: moderateScale(5) }}
        />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: moderateScale(24),
    },
    title: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.PoppinsMedium,
      marginBottom: moderateScale(5),
      color: theme.authentTitle,
    },
    pickerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.gray,
      borderRadius: moderateScale(10),
      height: moderateScale(51),
      paddingHorizontal: moderateScale(5),
      backgroundColor: theme.white,
    },
    placeholder: {
      color: theme.grayLight,
      fontSize: moderateScale(14),
      fontFamily: FontFamily.PoppinsMedium,
    },
    selectedText: {
      fontSize: moderateScale(14),
      color: theme.black,
      fontFamily: FontFamily.PoppinsMedium,
    },
  });

export default CustomImagePicker;
