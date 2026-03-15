/* eslint-disable react-native/no-inline-styles */
import FontFamily from '@assets/fonts/FontFamily';
import { useTheme } from '@theme/themeContext';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { moderateScale } from 'react-native-size-matters';

const CustomDropdown: React.FC<any> = ({
  title,
  data = [],
  onChange,
  value,
  placeholder,
  marginTop,
  maxHeight = 300,
  errorMessage,
  search = true,
  customDropdownStyle,
  customDropdownContainerStyle,
  onFocus,
  titleStyle,
  errorStyle,
  multiSelect = false,
}) => {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme);

  /** 🔹 local state for multi-select */
  const [selectedValues, setSelectedValues] = useState<any[]>(
    multiSelect && Array.isArray(value) ? value : [],
  );

  /** 🔹 sync external value */
  useEffect(() => {
    if (multiSelect && Array.isArray(value)) {
      setSelectedValues(value);
    }
  }, [value, multiSelect]);

  /** 🔹 on select */
  const handleChange = (item: any) => {
    if (!item || item.value === undefined) return;

    if (multiSelect) {
      const updatedValues = selectedValues.includes(item.value)
        ? selectedValues.filter(v => v !== item.value)
        : [...selectedValues, item.value];

      setSelectedValues(updatedValues);
      onChange && onChange(updatedValues);
    } else {
      onChange && onChange(item.value);
    }
  };

  /** 🔹 dropdown list item */
  const renderItem = (item: any) => {
    const isSelected = multiSelect
      ? selectedValues.includes(item.value)
      : value === item.value;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: moderateScale(10),
          paddingHorizontal: moderateScale(12),
          backgroundColor: isSelected ? theme.themeColor + '22' : 'transparent',
        }}
      >
        {/* FLAG */}
        <Text style={{ fontSize: 20, marginRight: 10 }}>{item.flag}</Text>

        {/* NAME + CODE */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: moderateScale(14),
              fontFamily: FontFamily.KhulaSemiBold,
              color: theme.black,
            }}
          >
            {item.label}
          </Text>
          <Text
            style={{
              fontSize: moderateScale(12),
              color: theme.grayLight,
            }}
          >
            {item.value}
          </Text>
        </View>

        {isSelected && (
          <Text style={{ color: theme.themeColor, fontSize: 16 }}>✓</Text>
        )}
      </View>
    );
  };

  /** 🔹 selected item view */
  const renderSelectedItem = (item: any) => {
    console.log('itemitemitemitemitem', item);
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, marginRight: 6 }}>{item.flag}</Text>
        <Text style={styles.selectedText}>{item.value}</Text>
      </View>
    );
  };

  return (
    <View
      style={[
        { width: '100%', marginTop: marginTop ?? 0 },
        customDropdownContainerStyle,
      ]}
    >
      {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}

      <Dropdown
        data={data}
        search={search}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        searchPlaceholder="Search country"
        maxHeight={maxHeight}
        value={multiSelect ? null : value}
        onFocus={onFocus}
        onChange={handleChange}
        renderItem={renderItem}
        renderSelectedItem={!multiSelect ? renderSelectedItem : undefined}
        style={[styles.dropdown, customDropdownStyle]}
        selectedTextStyle={styles.selectedText}
        placeholderStyle={styles.placeholder}
        containerStyle={styles.container}
        itemContainerStyle={{
          backgroundColor: isDark ? theme.background : theme.white,
        }}
      />

      {errorMessage && (
        <Text style={[styles.errorText, errorStyle]}>{errorMessage}</Text>
      )}

      {/* 🔹 Multi-select chips */}
      {multiSelect && selectedValues.length > 0 && (
        <View style={styles.chipContainer}>
          {selectedValues.map(val => {
            const item = data.find(i => i.value === val);
            return (
              <View key={val} style={styles.chip}>
                <Text style={styles.chipText}>
                  {item?.flag} {item?.value}
                </Text>
                <Text
                  style={styles.chipRemove}
                  onPress={() => handleChange({ value: val })}
                >
                  ✕
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    title: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      marginBottom: 6,
      color: theme.authentTitle,
    },
    dropdown: {
      height: moderateScale(45),
      borderRadius: 10,
      backgroundColor: theme.textBoxBackground,
      paddingHorizontal: 10,
    },
    container: {
      backgroundColor: theme.background,
      borderRadius: 10,
      width: '88%',
    },
    placeholder: {
      color: theme.grayLight,
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
    },
    selectedText: {
      fontSize: moderateScale(14),
      color: theme.black,
      fontFamily: FontFamily.KhulaSemiBold,
    },
    errorText: {
      marginTop: 4,
      fontSize: moderateScale(13),
      color: theme.themeRed,
      fontFamily: FontFamily.KhulaSemiBold,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.themeColor + '22',
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginRight: 6,
      marginBottom: 6,
    },
    chipText: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },
    chipRemove: {
      marginLeft: 6,
      fontSize: 14,
      color: theme.themeColor,
    },
  });

export default CustomDropdown;
