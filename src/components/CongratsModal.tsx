/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import CustomVectorIcons from '@components/CustomVectorIcons';
import createBasicStyles from 'styles';
import { useSelector } from 'react-redux';

interface CongratsModalProps {
  visible: boolean;
  starsEarned: number;
  onClose: () => void;
}

const CongratsModal: React.FC<CongratsModalProps> = ({
  visible,
  starsEarned,
  onClose,
}) => {
  const { theme } = useTheme();
  const basicStyles = createBasicStyles(theme);
  const styles = getStyles(theme);
  const languageData = useSelector((state: any) => state?.data?.languageData);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.white }]}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel={
              languageData?.congrats_modal_accessibility_close || 'Close modal'
            }
            accessibilityRole="button"
          >
            <CustomVectorIcons
              name="x"
              iconSet="Feather"
              size={moderateScale(20)}
              color={theme.textSub}
            />
          </TouchableOpacity>

          {/* Stars row */}
          <View style={styles.starsContainer}>
            {[...Array(starsEarned)].map((_, index) => (
              <CustomVectorIcons
                key={index}
                name="star"
                type="FontAwesome"
                size={moderateScale(32)}
                color="#FFD700"
                style={styles.starIcon}
              />
            ))}
          </View>

          {/* Message */}
          <Text style={[basicStyles.textStyleMedium, styles.message]}>
            {(languageData?.congrats_modal_message || '').replace(
              '{{count}}',
              String(starsEarned),
            )}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: moderateScale(20),
    },
    modalContainer: {
      width: '100%',
      borderRadius: moderateScale(20),
      padding: moderateScale(15),
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: moderateScale(15),
        },
        android: {
          elevation: 10,
        },
      }),
    },
    closeButton: {
      position: 'absolute',
      top: moderateScale(-9),
      right: moderateScale(-8),
      width: moderateScale(30),
      height: moderateScale(30),
      borderRadius: moderateScale(15),
      backgroundColor: theme.themeColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    starsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: moderateScale(15),
    },
    starIcon: {
      marginHorizontal: moderateScale(4),
    },

    message: {
      color: theme.textSub,
      textAlign: 'center',
      marginBottom: moderateScale(5),
      fontSize: moderateScale(16),
      includeFontPadding: false,
    },
  });

export default CongratsModal;
