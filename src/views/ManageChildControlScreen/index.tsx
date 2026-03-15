import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  Switch,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomTextInput from '@components/CustomTextInput';
import CustomButton from '@components/CustomButton';
import createBasicStyles from 'styles';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomHeader from '@components/CustomHeader';

const ManageChildControlScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const basicStyles = createBasicStyles(theme);

  const [isLocked, setIsLocked] = useState(true);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const [age, setAge] = useState('01 - 02 Years');
  const [doll, setDoll] = useState('Dara 2.0');
  const [gender, setGender] = useState('01 - 02 Years');

  const [playlistTags, setPlaylistTags] = useState<string[]>([
    'For Bedtime',
    'For Playtime',
    'For Learning',
    'For Study',
  ]);

  const suggestedTags = [
    'For Learning',
    'Children’s Favorites',
    'Toddler Tunes',
    '+5',
  ];

  const toggleTag = (tag: string) => {
    if (playlistTags.includes(tag)) {
      setPlaylistTags(playlistTags.filter(t => t !== tag));
    } else {
      setPlaylistTags([...playlistTags, tag]);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: theme.background, flex: 1 }}>
      <StatusBar
        backgroundColor={theme.transparent} // Matches the image background style
        barStyle={'light-content'}
      />
      <CustomHeader showBackButton={true} showNotifications={false} />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Content Manage</Text>

        {/* Toggle */}
        <View style={styles.rowBetween}>
          <Text style={styles.toggleLabel}>Profile lock/Unlock</Text>
          <Switch
            value={isLocked}
            onValueChange={value => setIsLocked(value)}
            trackColor={{ false: theme.gray, true: theme.text }}
            thumbColor={isLocked ? theme.white : theme.text}
          />
        </View>

        {/* Inputs */}
        <CustomTextInput
          title="User Name"
          placeholder="Enter name"
          value={userName}
          onChangeText={setUserName}
          style={styles.input}
        />

        <CustomTextInput
          title="Password"
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          // secureTextEntry
        />

        {/* Dropdowns - These should ideally be your custom dropdowns */}
        <CustomTextInput
          title="Age"
          placeholder="01 - 02 Years"
          value={age}
          onChangeText={setAge}
          style={styles.input}
          isDropdown
        />

        <CustomTextInput
          title="Select Smart Buddy"
          placeholder="Dara 2.0"
          value={doll}
          onChangeText={setDoll}
          style={styles.input}
          isDropdown
        />

        <CustomTextInput
          title="Gender"
          placeholder="01 - 02 Years"
          value={gender}
          onChangeText={setGender}
          style={styles.input}
          isDropdown
        />

        {/* Playlist Tags */}
        <Text style={styles.tagTitle}>Select Playlist content</Text>
        <View style={styles.tagContainer}>
          {playlistTags.map(tag => (
            <TouchableOpacity
              key={tag}
              onPress={() => toggleTag(tag)}
              style={[styles.tag, { backgroundColor: theme.text + '20' }]}
            >
              <Text style={[styles.tagText, { color: theme.text }]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Suggested */}
        <Text style={[styles.tagTitle, { marginTop: moderateScale(15) }]}>
          Suggested
        </Text>
        <View style={styles.tagContainer}>
          {suggestedTags.map(tag => (
            <View
              key={tag}
              style={[styles.tag, { backgroundColor: theme.text + '20' }]}
            >
              <Text style={[styles.tagText, { color: theme.text }]}>{tag}</Text>
            </View>
          ))}
        </View>

        <CustomButton
          text="Submit"
          backgroundColor={theme.themeColor}
          onPress={() => navigation.navigate('ContentPerformanceScreen')}
          height={moderateScale(50)}
          style={{
            marginTop: moderateScale(30),
            borderRadius: moderateScale(10),
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: moderateScale(20),
      paddingBottom: moderateScale(40),
    },
    sectionTitle: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginVertical: moderateScale(20),
    },
    input: {
      marginTop: moderateScale(20),
    },
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    toggleLabel: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },
    tagTitle: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginTop: moderateScale(25),
      marginBottom: moderateScale(10),
    },
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: moderateScale(10),
    },
    tag: {
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(6),
      borderRadius: moderateScale(20),
    },
    tagText: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaSemiBold,
    },
  });

export default ManageChildControlScreen;
