import FontFamily from '@assets/fonts/FontFamily';
import IMAGES from '@assets/images';
import { useTheme } from '@theme/themeContext';
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const NoInternetModal = ({ visible = false }) => {
  const insets = useSafeAreaInsets();

  const { theme } = useTheme();
  const languageData = useSelector((state: any) => state?.data?.languageData);
  const styles = getStyles(theme);
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={[styles.overlay, { paddingTop: insets.top + 20 }]}>
        <View style={styles.modalContainer}>
          <Image
            source={IMAGES.no_wifi}
            style={{
              height: moderateScale(120),
              width: moderateScale(120),
              tintColor: theme.themeColor,
            }}
          />
          <Text style={styles.title}>
            {languageData?.no_internet_title || 'No Internet Connection'}
          </Text>

          <Text style={styles.message}>
            {languageData?.no_internet_message ||
              'Please check your internet connection and try again.'}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default NoInternetModal;

const getStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: width * 0.8,
      backgroundColor: theme.background,
      borderRadius: moderateScale(16),
      padding: moderateScale(24),
      alignItems: 'center',
    },
    title: {
      fontSize: moderateScale(20),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      textAlign: 'center',
      marginTop: moderateScale(10),
    },
    message: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      textAlign: 'center',
      marginTop: moderateScale(6),
    },
  });
