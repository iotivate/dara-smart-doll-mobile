import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomButton from '@components/CustomButton';
import IMAGES from '@assets/images';
import CustomHeader from '@components/CustomHeader';
import CustomVectorIcons from '@components/CustomVectorIcons';

const NewChildProfile = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [name, setName] = useState('David Smith');
  const [age, setAge] = useState('06');
  const [learningLevel, setLearningLevel] = useState('Beginner');
  const [gender, setGender] = useState('Male');
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [showLearningDropdown, setShowLearningDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  const ageOptions = ['03', '04', '05', '06', '07', '08', '09'];
  const learningLevelOptions = ['Beginner', 'Intermediate', 'Advanced'];
  const genderOptions = ['Male', 'Female', 'Other'];

  const renderDropdown = (
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    onClose: () => void,
  ) => {
    return (
      <View style={styles.dropdownMenu}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dropdownItem,
              selectedValue === option && styles.dropdownItemSelected,
            ]}
            onPress={() => {
              onSelect(option);
              onClose();
            }}
          >
            <Text
              style={[
                styles.dropdownItemText,
                selectedValue === option && styles.dropdownItemTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSaveProfile = () => {
    const profileData = {
      name,
      age,
      learningLevel,
      gender,
    };
    // Handle save logic
    // props.navigation.navigate('NewEditProfile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.transparent}
        barStyle={'light-content'}
      />
      <CustomHeader goBack={true} title="Back" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Add new child profile</Text>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <CustomVectorIcons
                name="person"
                type="MaterialIcons"
                size={moderateScale(50)}
                color={theme.white}
              />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <CustomVectorIcons
                name="edit"
                type="MaterialIcons"
                size={moderateScale(14)}
                color={theme.black}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor={theme.placeholder || '#9CA3AF'}
            />
            {name.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setName('')}
              >
                <CustomVectorIcons
                  name="close"
                  type="MaterialIcons"
                  size={moderateScale(18)}
                  color={theme.textSecondary || '#6B7280'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Age Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age</Text>
          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setShowAgeDropdown(!showAgeDropdown)}
          >
            <Text style={styles.dropdownText}>{age}</Text>
            <CustomVectorIcons
              name={
                showAgeDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
              }
              type="MaterialIcons"
              size={moderateScale(24)}
              color={theme.textSecondary || '#6B7280'}
            />
          </TouchableOpacity>
          {showAgeDropdown &&
            renderDropdown(ageOptions, age, setAge, () =>
              setShowAgeDropdown(false),
            )}
        </View>

        {/* Learning Level Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Learning Level</Text>
          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setShowLearningDropdown(!showLearningDropdown)}
          >
            <Text style={styles.dropdownText}>{learningLevel}</Text>
            <CustomVectorIcons
              name={
                showLearningDropdown
                  ? 'keyboard-arrow-up'
                  : 'keyboard-arrow-down'
              }
              type="MaterialIcons"
              size={moderateScale(24)}
              color={theme.iconColor}
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

        {/* Gender Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Gender <Text style={styles.optionalText}>(Optional)</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdownContainer}
            onPress={() => setShowGenderDropdown(!showGenderDropdown)}
          >
            <Text style={styles.dropdownText}>{gender}</Text>
            <CustomVectorIcons
              name={
                showGenderDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
              }
              type="MaterialIcons"
              size={moderateScale(24)}
              color={theme.iconColor}
            />
          </TouchableOpacity>
          {showGenderDropdown &&
            renderDropdown(genderOptions, gender, setGender, () =>
              setShowGenderDropdown(false),
            )}
        </View>

        {/* Save Button */}
        <CustomButton
          text={'Save Profile'}
          backgroundColor={theme.themeColor}
          onPress={handleSaveProfile}
          height={moderateScale(55)}
          style={{
            alignSelf: 'center',
            borderRadius: moderateScale(12),
            marginTop: moderateScale(10),
            marginBottom: moderateScale(20),
          }}
        />
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

    scrollView: {
      flex: 1,
    },

    content: {
      paddingHorizontal: moderateScale(20),
      paddingTop: moderateScale(10),
      paddingBottom: moderateScale(30),
    },

    title: {
      fontSize: moderateScale(20),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      textAlign: 'center',
      marginBottom: moderateScale(20),
    },

    /* -------------------------------------------------------------
      AVATAR SECTION
    ------------------------------------------------------------- */
    avatarSection: {
      alignItems: 'center',
      marginBottom: moderateScale(15),
    },

    avatarContainer: {
      position: 'relative',
    },

    avatarPlaceholder: {
      width: moderateScale(100),
      height: moderateScale(100),
      borderRadius: moderateScale(50),
      backgroundColor: theme.grayLight ?? '#ecececff',
      justifyContent: 'center',
      alignItems: 'center',
    },

    editAvatarButton: {
      position: 'absolute',
      bottom: moderateScale(0),
      right: moderateScale(0),
      width: moderateScale(32),
      height: moderateScale(32),
      borderRadius: moderateScale(16),
      backgroundColor: theme.white,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: moderateScale(2),
      borderColor: theme.borderColorDynamic,
      shadowColor: theme.black,
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 4,
    },

    /* -------------------------------------------------------------
      INPUTS & LABELS
    ------------------------------------------------------------- */
    inputGroup: {
      marginBottom: moderateScale(20),
    },

    label: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      marginBottom: moderateScale(2),
    },

    optionalText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
    },

    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.boxBackground,
      borderRadius: moderateScale(10),
      borderWidth: moderateScale(1),
      borderColor: theme.borderColorDynamic,
      paddingHorizontal: moderateScale(15),
      height: moderateScale(50),
    },

    input: {
      flex: 1,
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
    },

    clearButton: {
      padding: moderateScale(5),
    },

    /* -------------------------------------------------------------
      DROPDOWN
    ------------------------------------------------------------- */
    dropdownContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.boxBackground,
      borderRadius: moderateScale(10),
      borderWidth: moderateScale(1),
      borderColor: theme.borderColorDynamic,
      paddingHorizontal: moderateScale(15),
      height: moderateScale(50),
    },

    dropdownText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
    },

    dropdownMenu: {
      backgroundColor: theme.white,
      borderRadius: moderateScale(10),
      borderWidth: moderateScale(1),
      borderColor: theme.borderColorDynamic,
      marginTop: moderateScale(5),
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: moderateScale(4),
      elevation: 5,
    },

    dropdownItem: {
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(15),
      borderBottomWidth: moderateScale(1),
      borderBottomColor: theme.borderColorDynamic,
    },

    dropdownItemSelected: {
      backgroundColor: theme.themeColor + '10',
    },

    dropdownItemText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
    },

    dropdownItemTextSelected: {
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.themeColor,
    },
  });

export default NewChildProfile;
