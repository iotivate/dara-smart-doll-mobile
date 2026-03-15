import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ModalProps,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomVectorIcons from '@components/CustomVectorIcons';
import { useSelector } from 'react-redux';

export interface DeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  title?: string;
  subtitle?: string;
  deleteButtonText?: string;
  closeButtonText?: string;
  showCancelButton?: boolean;
  loading?: boolean;
  animationType?: ModalProps['animationType'];
  transparent?: boolean;
  closeOnOverlayPress?: boolean;
  iconName?: string;
  iconType?: string;
  iconSize?: number;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  visible,
  onClose,
  onDelete,
  title = 'Delete?',
  subtitle = 'This action cannot be undone.',
  deleteButtonText = 'Delete',
  closeButtonText = 'Cancel',
  showCancelButton = true,
  loading = false,
  animationType = 'fade',
  transparent = true,
  closeOnOverlayPress = true,
  iconName = 'warning',
  iconType = 'AntDesign',
  iconSize = 48,
}) => {
  const { theme } = useTheme();
  const languageData = useSelector((state: any) => state?.data?.languageData);
  const styles = getStyles(theme);

  const handleOverlayPress = () => {
    if (closeOnOverlayPress && !loading) {
      onClose();
    }
  };

  const handleDelete = () => {
    if (!loading) {
      onDelete();
    }
  };

  return (
    <Modal
      transparent={transparent}
      animationType={animationType}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleOverlayPress}
        disabled={loading}
      >
        <TouchableOpacity
          style={styles.modalBox}
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
          disabled={loading}
        >
          {/* Top-right close button */}
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={onClose}
            disabled={loading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CustomVectorIcons
              name="close"
              type="AntDesign"
              size={moderateScale(25)}
              color={theme.white}
            />
          </TouchableOpacity>

          {/* Danger/Warning icon */}
          <View style={styles.dangerIconContainer}>
            <CustomVectorIcons
              name={iconName}
              type={iconType}
              size={moderateScale(iconSize)}
              color={theme.themeRed}
            />
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>
            {languageData?.[title] || title}
          </Text>

          {/* Subtitle */}
          <Text style={styles.modalSubtitle}>
            {languageData?.[subtitle] || subtitle}
          </Text>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            {showCancelButton && (
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>
                  {languageData?.[closeButtonText] || closeButtonText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.white} size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>
                  {languageData?.[deleteButtonText] || deleteButtonText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: moderateScale(20),
    },
    modalBox: {
      width: '100%',
      maxWidth: moderateScale(320),
      backgroundColor: theme.white,
      borderRadius: moderateScale(16),
      paddingVertical: moderateScale(25),
      paddingHorizontal: moderateScale(20),
      alignItems: 'center',
      position: 'relative',
      shadowColor: theme.black,
      shadowOffset: {
        width: 0,
        height: moderateScale(4),
      },
      shadowOpacity: 0.25,
      shadowRadius: moderateScale(8),
      elevation: 10,
    },
    modalCloseBtn: {
      position: 'absolute',
      top: moderateScale(-12),
      right: moderateScale(-12),
      backgroundColor: theme.themeColor,
      borderRadius: moderateScale(20),
      width: moderateScale(40),
      height: moderateScale(40),
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      shadowColor: theme.black,
      shadowOffset: {
        width: 0,
        height: moderateScale(2),
      },
      shadowOpacity: 0.2,
      shadowRadius: moderateScale(3),
      elevation: 4,
    },
    dangerIconContainer: {
      width: moderateScale(70),
      height: moderateScale(70),
      borderRadius: moderateScale(35),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: moderateScale(10),
    },
    modalTitle: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.themeRed,
      textAlign: 'center',
      marginBottom: moderateScale(6),
    },
    modalSubtitle: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub || '#666666',
      textAlign: 'center',
      marginBottom: moderateScale(20),
      lineHeight: moderateScale(20),
    },
    buttonContainer: {
      flexDirection: 'row',
      width: '100%',
      gap: moderateScale(12),
    },
    modalButton: {
      flex: 1,
      paddingVertical: moderateScale(14),
      borderRadius: moderateScale(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: theme.grayBox || '#F3F4F6',
      borderWidth: moderateScale(1),
      borderColor: theme.borderColor || '#E5E7EB',
    },
    deleteButton: {
      backgroundColor: theme.themeColor,
    },
    cancelButtonText: {
      color: theme.text || '#374151',
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
    },
    deleteButtonText: {
      color: theme.white,
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
    },
  });

export default DeleteModal;
