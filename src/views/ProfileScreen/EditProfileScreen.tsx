/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomButton from '@components/CustomButton';
import IMAGES from '@assets/images';
import CustomVectorIcons from '@components/CustomVectorIcons';
import createBasicStyles from 'styles';
import CustomHeader from '@components/CustomHeader';

// Mock avatar data - replace with your actual images
const AVATAR_MAP = {
  '1': 'https://cdn-icons-png.flaticon.com/512/194/194938.png',
  '2': 'https://cdn-icons-png.flaticon.com/512/194/194935.png',
  '3': 'https://cdn-icons-png.flaticon.com/512/194/194936.png',
  '4': 'https://cdn-icons-png.flaticon.com/512/194/194937.png',
  '5': 'https://cdn-icons-png.flaticon.com/512/194/194939.png',
  '6': 'https://cdn-icons-png.flaticon.com/512/194/194940.png',
  '7': 'https://cdn-icons-png.flaticon.com/512/194/194941.png',
  '8': 'https://cdn-icons-png.flaticon.com/512/194/194942.png',
};

const NewEditProfile = (props: any) => {
  const { theme } = useTheme();
  const basicStyles = createBasicStyles(theme);
  const styles = getStyles(theme);

  const [name, setName] = useState('David Smith');
  const [age, setAge] = useState('06');
  const [learningLevel, setLearningLevel] = useState('Beginner');
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [showLearningDropdown, setShowLearningDropdown] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState('1');

  const ageOptions = ['03', '04', '05', '06', '07', '08', '09'];
  const learningLevelOptions = ['Beginner', 'Intermediate', 'Advanced'];

  // Get the selected avatar URI
  const selectedAvatarUri = AVATAR_MAP[selectedAvatarId] || AVATAR_MAP['1'];

  // Listen for avatar selection from ChooseIconScreen
  useEffect(() => {
    if (props.route.params?.selectedAvatar) {
      setSelectedAvatarId(props.route.params.selectedAvatar);
    }
  }, [props.route.params?.selectedAvatar]);

  const handleChooseIcon = useCallback(() => {
    props.navigation.navigate('ChooseIconScreen', {
      onAvatarSelect: (avatarId: string) => {
        setSelectedAvatarId(avatarId);
      },
    });
  }, [props.navigation]);

  const handleBackPress = useCallback(() => {
    props.navigation.goBack();
  }, [props.navigation]);

  const renderDropdown = useCallback(
    (
      options: string[],
      selectedValue: string,
      onSelect: (value: string) => void,
      onClose: () => void,
    ) => {
      return (
        <View
          style={[
            styles.dropdownMenu,
            {
              backgroundColor: theme.white,
              borderColor: theme.borderColorDynamic,
            },
          ]}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dropdownItem,
                { borderBottomColor: theme.borderColorDynamic },
                selectedValue === option && {
                  backgroundColor: theme.themeLight,
                },
              ]}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
              activeOpacity={0.7}
              accessibilityLabel={`Select ${option}`}
              accessibilityRole="menuitem"
            >
              <Text
                style={[
                  basicStyles.textStyleSmall,
                  styles.dropdownItemText,
                  { color: theme.text },
                  selectedValue === option && styles.dropdownItemTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    },
    [theme, basicStyles, styles],
  );

  const handleSaveChanges = useCallback(() => {
    const profileData = {
      name,
      age,
      learningLevel,
      avatarId: selectedAvatarId,
    };
    console.log('Profile saved:', profileData);
    props.navigation.navigate('ExistingSession');
  }, [name, age, learningLevel, selectedAvatarId, props.navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <StatusBar
        backgroundColor={theme.transparent}
        barStyle={'light-content'}
        translucent={false}
      />

      {/* HEADER - Same as ProfileScreen */}
      <View style={{ marginBottom: -90, marginTop: 30 }}>
        <CustomHeader
          type="dashboard"
          showBackButton={true}
          backButtonText="Back"
          showNotifications={false}
          notificationBadgeCount={3}
          showSettings={false}
          showIconCircles={false}
          showProfile={false}
          title=" Profile" // Title for the screen
          onBackPress={handleBackPress}
        />
      </View>

      <ScrollView
        style={{ flex: 1, paddingBottom: moderateScale(150) }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentWrapper}>
          {/* Profile Image - Same as ProfileScreen */}
          <View style={styles.profileImageWrapper}>
            <Image
              source={{ uri: selectedAvatarUri }}
              style={styles.profileImage}
              defaultSource={IMAGES.doll}
              accessibilityLabel="User profile avatar"
            />
            <TouchableOpacity
              style={styles.editIconWrapper}
              onPress={handleChooseIcon}
              activeOpacity={0.7}
              accessibilityLabel="Change profile icon"
              accessibilityRole="button"
            >
              <CustomVectorIcons
                iconSet="Feather"
                name="edit-3"
                size={moderateScale(14)}
                color={theme.black}
              />
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  basicStyles.textStyleSmallBold,
                  styles.label,
                  { color: theme.text },
                ]}
              >
                Name
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.textBoxBackground,
                    borderColor: theme.textBoxBorder,
                  },
                ]}
              >
                <TextInput
                  style={[
                    basicStyles.textStyleSmall,
                    styles.input,
                    { color: theme.text },
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter name"
                  placeholderTextColor={theme.grayLight}
                  accessibilityLabel="Name input"
                  accessibilityRole="text"
                />
                {name.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => setName('')}
                    activeOpacity={0.7}
                    accessibilityLabel="Clear name"
                    accessibilityRole="button"
                  >
                    <CustomVectorIcons
                      name="close"
                      type="MaterialIcons"
                      size={moderateScale(18)}
                      color={theme.gray}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Age Dropdown */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  basicStyles.textStyleSmallBold,
                  styles.label,
                  { color: theme.text },
                ]}
              >
                Age
              </Text>
              <TouchableOpacity
                style={[
                  styles.dropdownContainer,
                  {
                    backgroundColor: theme.textBoxBackground,
                    borderColor: theme.textBoxBorder,
                  },
                ]}
                onPress={() => {
                  setShowAgeDropdown(!showAgeDropdown);
                  setShowLearningDropdown(false);
                }}
                activeOpacity={0.7}
                accessibilityLabel="Age dropdown"
                accessibilityRole="combobox"
                accessibilityState={{ expanded: showAgeDropdown }}
              >
                <Text
                  style={[
                    basicStyles.textStyleSmall,
                    styles.dropdownText,
                    { color: theme.text },
                  ]}
                >
                  {age}
                </Text>
                <CustomVectorIcons
                  name={
                    showAgeDropdown
                      ? 'keyboard-arrow-up'
                      : 'keyboard-arrow-down'
                  }
                  type="MaterialIcons"
                  size={moderateScale(24)}
                  color={theme.gray}
                />
              </TouchableOpacity>
              {showAgeDropdown &&
                renderDropdown(ageOptions, age, setAge, () =>
                  setShowAgeDropdown(false),
                )}
            </View>

            {/* Learning Level Dropdown */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  basicStyles.textStyleSmallBold,
                  styles.label,
                  { color: theme.text },
                ]}
              >
                Learning Level
              </Text>
              <TouchableOpacity
                style={[
                  styles.dropdownContainer,
                  {
                    backgroundColor: theme.textBoxBackground,
                    borderColor: theme.textBoxBorder,
                  },
                ]}
                onPress={() => {
                  setShowLearningDropdown(!showLearningDropdown);
                  setShowAgeDropdown(false);
                }}
                activeOpacity={0.7}
                accessibilityLabel="Learning level dropdown"
                accessibilityRole="combobox"
                accessibilityState={{ expanded: showLearningDropdown }}
              >
                <Text
                  style={[
                    basicStyles.textStyleSmall,
                    styles.dropdownText,
                    { color: theme.text },
                  ]}
                >
                  {learningLevel}
                </Text>
                <CustomVectorIcons
                  name={
                    showLearningDropdown
                      ? 'keyboard-arrow-up'
                      : 'keyboard-arrow-down'
                  }
                  type="MaterialIcons"
                  size={moderateScale(24)}
                  color={theme.gray}
                />
              </TouchableOpacity>
              {showLearningDropdown &&
                renderDropdown(
                  learningLevelOptions,
                  learningLevel,
                  setLearningLevel,
                  () => setShowLearningDropdown(false),
                )}
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <CustomButton
              text={'Save Changes'}
              backgroundColor={theme.themeColor}
              onPress={handleSaveChanges}
              height={moderateScale(45)}
              style={{
                borderRadius: moderateScale(12),
              }}
              accessibilityLabel="Save profile changes"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingBottom: moderateScale(20),
    },
    contentWrapper: {
      alignItems: 'center',
      paddingHorizontal: moderateScale(20),
      marginTop: moderateScale(20),
    },
    // Profile Image Styles - Same as ProfileScreen
    profileImageWrapper: {
      marginBottom: moderateScale(20),
    },
    profileImage: {
      width: moderateScale(120),
      height: moderateScale(120),
      borderRadius: 60,
    },
    editIconWrapper: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.white,
      borderRadius: 20,
      padding: moderateScale(6),
      elevation: 4,
    },
    formSection: {
      width: '100%',
      backgroundColor: theme.white,
      paddingHorizontal: moderateScale(20),
      paddingTop: moderateScale(20),
      paddingBottom: moderateScale(30),
      borderRadius: moderateScale(15),
      marginTop: moderateScale(10),
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: moderateScale(4),
        },
        android: {
          elevation: 3,
        },
      }),
    },
    inputGroup: {
      marginBottom: moderateScale(20),
    },
    label: {
      marginBottom: moderateScale(8),
      includeFontPadding: false,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: moderateScale(10),
      borderWidth: moderateScale(1),
      paddingHorizontal: moderateScale(15),
      height: moderateScale(50),
    },
    input: {
      flex: 1,
      includeFontPadding: false,
    },
    clearButton: {
      padding: moderateScale(5),
    },
    dropdownContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: moderateScale(10),
      borderWidth: moderateScale(1),
      paddingHorizontal: moderateScale(15),
      height: moderateScale(50),
    },
    dropdownText: {
      includeFontPadding: false,
    },
    dropdownMenu: {
      borderRadius: moderateScale(10),
      borderWidth: moderateScale(1),
      marginTop: moderateScale(5),
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: moderateScale(2) },
          shadowOpacity: 0.1,
          shadowRadius: moderateScale(4),
        },
        android: {
          elevation: 5,
        },
      }),
    },
    dropdownItem: {
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(15),
      borderBottomWidth: moderateScale(1),
    },
    dropdownItemText: {
      includeFontPadding: false,
    },
    dropdownItemTextSelected: {
      color: theme.themeColor,
      fontWeight: '600',
    },
    buttonContainer: {
      width: '100%',
      marginTop: moderateScale(30),
      marginBottom: moderateScale(20),
    },
  });

export default NewEditProfile;
