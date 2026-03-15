/* eslint-disable react-native/no-inline-styles */
import FontFamily from '@assets/fonts/FontFamily';
import { useTheme } from '@theme/themeContext';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CustomLucideIcon from './CustomLucideIcon';
import moment from 'moment';

const CustomDateTimePicker: React.FC<any> = ({
  title,
  onChangeDate,
  iconName = 'CalendarDays',
  iconColor,
  iconSize = moderateScale(24),
  mode = 'date', // accepts 'date' | 'time' | 'datetime'
  placeholder = 'Select Date',
  customDropdownStyle,
  customDropdownContainerStyle,
  titleStyle,
  errorMessage,
  textStyle,
  is24Hour,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  // const handleConfirm = (date: Date) => {
  //   let fDate = getFormattedDate(date);
  //   console.log('date', fDate);
  //   setSelectedDate(fDate);
  //   hideDatePicker();
  //   onChangeDate?.(fDate); // emit date to parent if passed
  // };

  // // Format display based on mode
  // const getFormattedDate = (cDate?: any) => {
  //   let selectedDateFinal = cDate || selectedDate;

  //   if (!selectedDateFinal) return placeholder;

  //   const timeFormat = is24Hour ? 'HH:mm' : 'hh:mm A';
  //   const dateFormat = 'DD MMM YYYY';

  //   if (mode === 'time') return moment(selectedDateFinal).format(timeFormat);
  //   if (mode === 'datetime')
  //     return moment(selectedDateFinal).format(`${dateFormat} - ${timeFormat}`);

  //   return moment(selectedDateFinal).format(dateFormat); // default: date only
  // };

  const handleConfirm = (date: Date) => {
    setSelectedDate(date); // store actual Date object
    hideDatePicker();

    const formatted = getFormattedDate(date);
    console.log('📅 Selected Date:', formatted);

    onChangeDate?.(formatted); // emit formatted string to parent if passed
  };

  // Format display based on mode
  const getFormattedDate = (inputDate?: Date | string) => {
    const dateToFormat = inputDate || selectedDate;
    if (!dateToFormat) return placeholder;

    const timeFormat = is24Hour ? 'HH:mm' : 'hh:mm A';
    const dateFormat = 'DD MMM YYYY';

    switch (mode) {
      case 'time':
        return moment(dateToFormat).format(timeFormat);
      case 'datetime':
        return moment(dateToFormat).format(`${dateFormat} - ${timeFormat}`);
      default:
        return moment(dateToFormat).format(dateFormat); // date only
    }
  };

  return (
    <View style={[styles.container, customDropdownContainerStyle]}>
      {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}

      <TouchableOpacity
        onPress={showDatePicker}
        activeOpacity={0.6}
        style={[
          styles.pickerContainer,
          { backgroundColor: theme.white },
          customDropdownStyle,
        ]}
      >
        <Text
          style={[
            selectedDate ? styles.selectedText : styles.placeholder,
            textStyle,
          ]}
        >
          {getFormattedDate()}
        </Text>

        {iconName && (
          <CustomLucideIcon
            name={iconName}
            size={iconSize}
            color={iconColor || theme.iconColor}
            style={{ marginRight: moderateScale(5) }}
          />
        )}
      </TouchableOpacity>
      {errorMessage && (
        <Text
          style={{
            marginTop: moderateScale(2),
            fontSize: moderateScale(14),
            color: theme.themeRed,
            fontFamily: FontFamily.KhulaSemiBold,
          }}
        >
          {errorMessage}
        </Text>
      )}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode={mode}
        date={selectedDate || new Date()}
        is24Hour={is24Hour}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    title: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaSemiBold,
      marginBottom: moderateScale(5),
      color: theme.authentTitle,
    },
    pickerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.themeColor,
      borderRadius: moderateScale(10),
      height: moderateScale(50),
      paddingHorizontal: moderateScale(5),
      backgroundColor: theme.white,
      // elevation: 5
    },
    placeholder: {
      color: theme.grayLight,
      fontSize: moderateScale(15),
      fontFamily: FontFamily.KhulaBold,
    },
    selectedText: {
      fontSize: moderateScale(14),
      color: theme.black,
      fontFamily: FontFamily.KhulaSemiBold,
    },
  });

export default CustomDateTimePicker;
