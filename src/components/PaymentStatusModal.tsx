/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from '@theme/themeContext';
import IMAGES from '@assets/images';
import FontFamily from '@assets/fonts/FontFamily';
import { useSelector } from 'react-redux';

interface Props {
  visible: boolean;
  type: 'success' | 'failed' | 'pending';
  title: string;
  message: string;
  onClose: () => void;
}

const PaymentStatusModal: React.FC<Props> = ({
  visible,
  type = 'failed',
  title,
  message,
  onClose,
}) => {
  const { theme } = useTheme();
  const languageData = useSelector((state: any) => state?.data?.languageData);
  const styles = getStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* LOTTIE */}
          <LottieView
            source={
              type === 'success'
                ? IMAGES.Payment_Successful
                : type === 'failed'
                ? IMAGES.Payment_Failed
                : type === 'pending'
                ? IMAGES.Sandy_Loading
                : IMAGES.Sandy_Loading
            }
            autoPlay
            loop={true}
            style={styles.lottie}
          />

          {/* TEXT */}
          <Text style={styles.title}>{languageData?.[title] || title}</Text>

          <Text style={styles.message}>
            {languageData?.[message] || message}
          </Text>

          {/* BUTTON */}
          {type === 'pending' ? null : (
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor:
                    type === 'success' ? theme.themeColor : theme.themeRed,
                },
              ]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>
                {languageData?.done || 'Done'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '95%',
      backgroundColor: theme.background,
      borderRadius: 16,
      alignItems: 'center',
      padding: 20,
      shadowColor: theme.black,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    lottie: {
      width: 350,
      height: 350,
    },
    title: {
      fontSize: 18,
      fontFamily: FontFamily.KhulaBold,
      marginTop: 10,
      color: theme.text,
      textAlign: 'center',
    },
    message: {
      fontSize: 14,
      color: theme.textSub,
      textAlign: 'center',
      marginVertical: 10,
      fontFamily: FontFamily.KhulaRegular,
      lineHeight: 20,
    },
    button: {
      marginTop: 15,
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 8,
      minWidth: 120,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    buttonText: {
      color: theme.white,
      fontFamily: FontFamily.KhulaBold,
      fontSize: 16,
    },
  });

export default PaymentStatusModal;
