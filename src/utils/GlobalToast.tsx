/* eslint-disable react-native/no-inline-styles */
import FontFamily from '@assets/fonts/FontFamily';
import { useTheme } from '@theme/themeContext';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const CustomToast = ({ text1, text2, type }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          paddingHorizontal: 15,
          borderRadius: 10,
          marginHorizontal: 20,
          marginBottom: insets.bottom,
          paddingVertical: 10,

          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 5,
        },
        type === 'success' ? styles.success : styles.error,
      ]}
    >
      {/* <Text style={styles.title}>{text1}</Text> */}
      <Text style={styles.message}>{text2}</Text>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    success: { backgroundColor: theme.black },
    error: { backgroundColor: theme.themeRed },
    title: {
      color: theme.white,
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: 16,
    },
    message: {
      color: theme.white,
      fontSize: 14,
      textAlign: 'center',
      fontFamily: FontFamily.KhulaSemiBold,
    },
  });

const toastConfig = {
  success: (props: any) => <CustomToast {...props} type="success" />,
  error: (props: any) => <CustomToast {...props} type="error" />,
};
export const GlobalToast = () => <Toast config={toastConfig} />;
