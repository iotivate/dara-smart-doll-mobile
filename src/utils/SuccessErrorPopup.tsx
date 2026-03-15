/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import CustomVectorIcons from '../components/CustomVectorIcons';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import { moderateScale } from 'react-native-size-matters';
import FastImage from '@d11/react-native-fast-image';
import IMAGES from '@assets/images';
import createBasicStyles from 'styles';

interface SuccessErrorPopupProps {
  popupOpen: boolean;
  closePopup: (event?: GestureResponderEvent) => void;
  title?: string;
  message: string;
  type: 'Success' | 'Error';
  ok?: boolean;
  btnText?: string;
}

const SuccessErrorPopup: React.FC<SuccessErrorPopupProps> = ({
  popupOpen,
  closePopup = () => {},

  message,
  type,
  ok,
  btnText,
}) => {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const basicStyles = createBasicStyles(theme);

  const renderIcon = () => {
    if (type === 'Error') {
      return (
        <CustomVectorIcons
          name="emoji-sad"
          iconSet="Entypo"
          size={35}
          color={theme.themeRed}
        />
      );
    } else {
      return (
        <FastImage
          source={IMAGES.success}
          style={{ width: moderateScale(100), height: moderateScale(100) }}
          resizeMode="contain"
        />
      );
    }
  };

  const renderTitle = () => (
    <Text
      style={[
        styles.title,
        {
          color: type === 'Error' ? theme.themeRed : theme.themeColor,
          fontFamily: FontFamily.KhulaExtraBold,
        },
      ]}
    >
      {type.toUpperCase()}
    </Text>
  );

  const renderMessage = () => (
    <>
      <Text
        style={{
          color: isDark ? theme.white : '#555',
          fontSize: moderateScale(16),
          fontFamily: FontFamily.KhulaExtraBold,
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
    </>
  );

  const renderButton = () => {
    if (!ok) return null;

    const buttonColor = type === 'Error' ? theme.themeRed : theme.themeGreen;
    const buttonLabel =
      btnText ?? (type === 'Error' ? 'Try Again' : 'Continue');

    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={closePopup}
          style={[styles.button, { backgroundColor: buttonColor }]}
        >
          <Text
            style={{
              color: theme.white,
              fontSize: moderateScale(14),
              textAlign: 'center',
              fontFamily: FontFamily.KhulaExtraBold,
            }}
          >
            {buttonLabel}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={popupOpen}
      animationType="fade"
      onRequestClose={closePopup}
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>{renderIcon()}</View>
          <View style={{ marginVertical: 5 }}>{renderTitle()}</View>
          <View style={{ marginVertical: 8 }}>{renderMessage()}</View>
          {renderButton()}
        </View>
      </View>
    </Modal>
  );
};

export default SuccessErrorPopup;

const getStyles = (theme: any, isDark: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
    },
    container: {
      padding: 15,
      paddingVertical: 20,
      borderRadius: 20,
      width: '90%',
      marginTop: 20,
      backgroundColor: isDark ? theme.pageBackgroundColor : '#FFF',
    },
    iconContainer: {
      marginVertical: 5,
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      alignSelf: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 13,
    },
    button: {
      borderRadius: 8,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      width: '50%',
      elevation: 5,
    },
  });
