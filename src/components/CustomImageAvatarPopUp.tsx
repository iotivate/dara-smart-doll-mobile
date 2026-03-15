/* eslint-disable react-native/no-inline-styles */
import { useTheme } from '@theme/themeContext';
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal, Portal, RadioButton } from 'react-native-paper';
import { moderateScale } from 'react-native-size-matters';
import CustomButton from './CustomButton';
import { useSelector } from 'react-redux';

interface CustomImageAvatarPopUpProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (option: 'avatar' | 'gallery') => void;
}

const CustomImageAvatarPopUp: React.FC<CustomImageAvatarPopUpProps> = ({
  visible,
  onDismiss,
  onConfirm,
}) => {
  const { theme } = useTheme();
  const languageData = useSelector((state: any) => state?.data?.languageData);
  const styles = getStyles(theme);

  const [selectedOption, setSelectedOption] = useState<'avatar' | 'gallery'>(
    'avatar',
  );

  const handleConfirm = () => {
    onConfirm(selectedOption);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Text style={styles.title}>
          {languageData?.choose_image_source || 'Choose Image Source'}
        </Text>

        <View style={styles.radioGroup}>
          <View style={styles.radioItem}>
            <RadioButton
              value="avatar"
              status={selectedOption === 'avatar' ? 'checked' : 'unchecked'}
              onPress={() => setSelectedOption('avatar')}
              color={theme.themeColor}
            />
            <Text style={styles.radioLabel}>
              {languageData?.image_source_avatar || 'Avatar'}
            </Text>
          </View>

          <View style={styles.radioItem}>
            <RadioButton
              value="gallery"
              status={selectedOption === 'gallery' ? 'checked' : 'unchecked'}
              onPress={() => setSelectedOption('gallery')}
              color={theme.themeColor}
            />
            <Text style={styles.radioLabel}>
              {languageData?.image_source_gallery || 'From Gallery'}
            </Text>
          </View>
        </View>

        <CustomButton
          text={languageData?.Confirm || 'Confirm'}
          backgroundColor={theme.themeColor}
          onPress={handleConfirm}
          height={moderateScale(45)}
          style={{
            alignSelf: 'center',
            borderRadius: moderateScale(12),
          }}
        />
      </Modal>
    </Portal>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    modalContainer: {
      backgroundColor: 'white',
      marginHorizontal: moderateScale(25),
      borderRadius: 12,
      padding: moderateScale(20),
    },
    title: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: moderateScale(15),
    },
    radioGroup: {
      marginBottom: moderateScale(15),
    },
    radioItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 5,
    },
    radioLabel: {
      fontSize: moderateScale(14),
      color: theme.boxbackground,
    },
    confirmButton: {
      marginTop: moderateScale(10),
      borderRadius: 8,
    },
  });

export default CustomImageAvatarPopUp;
