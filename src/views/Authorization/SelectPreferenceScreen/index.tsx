/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';

import FontFamily from '@assets/fonts/FontFamily';
import CustomButton from '@components/CustomButton';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { useFocusEffect } from '@react-navigation/native';
import { storeData } from '@utils/CustomAsyncStorage';
import CustomHeader from '@components/CustomHeader';

const SelectPreferenceScreen = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const prevData = props.route?.params?.prevData;

  const [loading, setLoading] = useState(false);
  const [errorMessage, seterrorMessage] = useState('');
  // const [FailedModalState, setFailedModalState] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [language, setLanguage] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchCommonSettings();
    }, []),
  );

  async function fetchCommonSettings() {
    setLoading(true);

    try {
      const res = await apiRequest(
        ApiURL.getSettingsdata,
        'GET',
        null,
        true,
        false,
        prevData?.token,
      );

      setLoading(false);

      if (!res?.error) {
        const { data } = res;

        const { DARA_SUPPORTED_LANGUAGES, DARA_DEFAULT_LANGUAGE } = data;

        const allLanguageData = [
          ...(DARA_SUPPORTED_LANGUAGES || []),
          DARA_DEFAULT_LANGUAGE,
        ]
          .filter(lang => lang && typeof lang === 'object' && lang.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        setLanguage(allLanguageData);
      } else {
        const errorMsg =
          res?.message || 'Registration failed. Please try again.';
        seterrorMessage(errorMsg);
        // setFailedModalState(true);
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoading(false);
      seterrorMessage(error.message || 'Unexpected error occurred');
      // setFailedModalState(true);
    }
  }

  async function handleLanguageSet() {
    setLoading(true);

    const payload = {
      language: selectedLanguage,
    };

    try {
      const res = await apiRequest(
        ApiURL.setLanguagePreference,
        'POST',
        payload,
        true,
        false,
        prevData?.token,
      );
      console.log('✅ API Response:', res);
      setLoading(false);

      if (!res?.error) {
        setTimeout(async () => {
          setLoading(false);
          await storeData('token', res?.data?.token);
          props.navigation.navigate('SetupPin');
        }, 1500);
      } else {
        const errorMsg = res?.message || 'Request failed. Please try again.';
        seterrorMessage(errorMsg);
        // setFailedModalState(true);
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoading(false);
      seterrorMessage(error.message || 'Unexpected error occurred');
      // setFailedModalState(true);
    }
  }

  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        backgroundColor={'rgba(0,0,0,0.5)'}
        barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'}
      />
      <CustomHeader showBackButton={true} showNotifications={false} />

      <View style={styles.container}>
        <Text style={styles.title}>Select Your Preference</Text>
        <Text style={styles.subtitle}>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry.
        </Text>

        <View style={styles.chipsWrapper}>
          {language.map((lang, index) => {
            const isSelected = lang?.code === selectedLanguage;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.chip,
                  isSelected && { backgroundColor: theme.themeColor },
                ]}
                onPress={() => handleLanguageSelect(lang?.code)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && { color: theme.white },
                  ]}
                >
                  {lang?.name}
                </Text>
                {isSelected && <Text style={styles.checkIcon}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <CustomButton
          text="Proceed"
          backgroundColor={theme.themeColor}
          onPress={() => {
            handleLanguageSet();
          }}
          height={moderateScale(55)}
          style={{
            alignSelf: 'center',
            borderRadius: moderateScale(12),
            marginTop: moderateScale(30),
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: moderateScale(20),
      backgroundColor: theme.mainBackground,
      borderRadius: 20,
      marginBottom: moderateScale(40),
    },
    title: {
      fontSize: moderateScale(20),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginTop: moderateScale(20),
    },
    subtitle: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
      marginTop: moderateScale(5),
      marginBottom: moderateScale(20),
    },
    chipsWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: moderateScale(10),
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: moderateScale(15),
      paddingVertical: moderateScale(8),
      borderRadius: moderateScale(25),
      backgroundColor: theme.themeLight,
      marginRight: moderateScale(10),
      marginBottom: moderateScale(10),
    },
    chipText: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
    },
    checkIcon: {
      marginLeft: moderateScale(8),
      fontSize: moderateScale(13),
      color: theme.white,
      fontWeight: 'bold',
    },
  });

export default SelectPreferenceScreen;
