/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  ActivityIndicator,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import CustomHeader from '@components/CustomHeader';
import CustomButton from '@components/CustomButton';
import IMAGES from '@assets/images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { storeData } from '@utils/CustomAsyncStorage';
import { useDispatch, useSelector } from 'react-redux';
import { getLanguageSetting } from '@utils/Redux_api_fun';

type Lang = string;

const STORAGE_KEY_LANG = '@app_language_settings_v1';
interface LanguageResponse {
  data?: {
    token?: string;
    [key: string]: any;
  };
  message: string;
  error: boolean;
  code?: number;
}

interface ApiSupportedLanguage {
  name: string;
  code: string;
  nativeName?: string;
}

// ✅ SIMPLE SUCCESS MODAL COMPONENT
interface SuccessModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  languageData: any;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  message,
  onClose,
  languageData,
}) => {
  const { theme } = useTheme();
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: theme.white,
            },
          ]}
        >
          {/* Success Icon */}
          <View
            style={[
              styles.successIcon,
              { backgroundColor: theme.themeColor + '20' },
            ]}
          >
            <Text style={[styles.successIconText, { color: theme.themeColor }]}>
              ✓
            </Text>
          </View>

          {/* Success Title */}
          <Text style={[styles.successTitle, { color: theme.black }]}>
            {languageData?.success || 'Success!'}
          </Text>

          {/* Message */}
          <Text style={[styles.successMessage, { color: '#6B7280' }]}>
            {message}
          </Text>

          {/* OK Button */}
          <TouchableOpacity
            style={[
              styles.successButton,
              { backgroundColor: theme.themeColor },
            ]}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.successButtonText}>
              {languageData?.ok || 'OK'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ✅ SIMPLE ERROR MODAL COMPONENT
interface ErrorModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  languageData: any;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  message,
  onClose,
  languageData,
}) => {
  const { theme } = useTheme();
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: theme.white,
            },
          ]}
        >
          {/* Error Icon */}
          <View style={[styles.errorIcon, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.errorIconText, { color: '#DC2626' }]}>✗</Text>
          </View>

          {/* Error Title */}
          <Text style={[styles.errorTitle, { color: '#DC2626' }]}>
            {languageData?.error || 'Error'}
          </Text>

          {/* Message */}
          <Text style={[styles.errorMessage, { color: '#6B7280' }]}>
            {message}
          </Text>

          {/* OK Button */}
          <TouchableOpacity
            style={[styles.errorButton, { backgroundColor: '#DC2626' }]}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.errorButtonText}>
              {languageData?.ok || 'OK'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ✅ MAIN SCREEN COMPONENT
const LanguageToggleScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const dispatch = useDispatch();

  // Redux data
  const languageData =
    useSelector((state: any) => state?.data?.languageData) || {};
  const settingsData = useSelector((state: any) => state?.data?.settingsData);

  console.log('Language Data keys:', Object.keys(languageData).slice(0, 20));

  // State management
  const [defaultLanguageEnabled, setDefaultLanguageEnabled] =
    useState<boolean>(true);
  const [uiLanguage, setUiLanguage] = useState<Lang>('English');
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Modal states (simple)
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Available languages from API
  const [availableLanguages, setAvailableLanguages] = useState<
    ApiSupportedLanguage[]
  >([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);

  // Load settings and token on mount
  useEffect(() => {
    loadSavedSettings();

    // Fetch settings data if not available
    if (
      !settingsData ||
      (Array.isArray(settingsData) && settingsData.length === 0)
    ) {
      fetchSettingsDirectly();
    } else {
      loadLanguagesFromRedux();
    }
  }, []);

  // Watch for settingsData changes
  useEffect(() => {
    if (
      settingsData &&
      typeof settingsData === 'object' &&
      !Array.isArray(settingsData)
    ) {
      loadLanguagesFromRedux();
    }
  }, [settingsData]);

  // Helper function to get language text
  const getText = (key: string, fallback: string = '') => {
    return languageData[key] || fallback;
  };

  // Direct API call for settings
  const fetchSettingsDirectly = async () => {
    try {
      setLanguagesLoading(true);
      const response = await apiRequest(
        ApiURL.getSettingsdata,
        'GET',
        null,
        true,
        false,
      );

      if (response?.data) {
        loadLanguagesFromDirectResponse(response.data);
      } else {
        // Fallback languages
        setAvailableLanguages([
          { code: 'en', name: 'English', nativeName: 'English' },
          { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
          { code: 'yo', name: 'Yoruba', nativeName: 'Yoruba' },
          { code: 'ig', name: 'Igbo', nativeName: 'Igbo' },
        ]);
        setUiLanguage(getText('language_option_english', 'English'));
      }
    } catch (error) {
      console.log('Direct API fetch error:', error);
      // Fallback languages
      setAvailableLanguages([
        {
          code: 'en',
          name: getText('language_option_english', 'English'),
          nativeName: 'English',
        },
        {
          code: 'ha',
          name: getText('language_option_hausa', 'Hausa'),
          nativeName: 'Hausa',
        },
        {
          code: 'yo',
          name: getText('language_option_yoruba', 'Yoruba'),
          nativeName: 'Yoruba',
        },
        {
          code: 'ig',
          name: getText('language_option_igbo', 'Igbo'),
          nativeName: 'Igbo',
        },
      ]);
      setUiLanguage(getText('language_option_english', 'English'));
    } finally {
      setLanguagesLoading(false);
    }
  };

  // Load languages from direct API response
  const loadLanguagesFromDirectResponse = (data: any) => {
    try {
      const supportedLanguages = data.DARA_SUPPORTED_LANGUAGES || [];
      const defaultLanguage = data.DARA_DEFAULT_LANGUAGE || {
        code: 'en',
        name: 'English',
      };

      let allLanguages: ApiSupportedLanguage[] = [];

      if (Array.isArray(supportedLanguages)) {
        allLanguages = supportedLanguages.filter(
          (lang: any) => lang && lang.name && lang.code,
        );
      }

      // Add default language
      if (defaultLanguage && defaultLanguage.name && defaultLanguage.code) {
        const exists = allLanguages.some(
          (lang: ApiSupportedLanguage) => lang.code === defaultLanguage.code,
        );
        if (!exists) {
          allLanguages.push(defaultLanguage);
        }
      }

      // Sort alphabetically
      allLanguages.sort((a, b) => a.name.localeCompare(b.name));

      setAvailableLanguages(allLanguages);

      // Load saved language preference
      loadSavedLanguagePreference(allLanguages);
    } catch (error) {
      console.log('Error processing direct API data:', error);
    }
  };

  // Load languages from Redux store
  const loadLanguagesFromRedux = () => {
    setLanguagesLoading(true);

    try {
      // Check if settingsData is valid object
      if (!settingsData || Array.isArray(settingsData)) {
        fetchSettingsDirectly();
        return;
      }

      const supportedLanguages = settingsData.DARA_SUPPORTED_LANGUAGES || [];
      const defaultLanguage = settingsData.DARA_DEFAULT_LANGUAGE || {
        code: 'en',
        name: 'English',
      };

      let allLanguages: ApiSupportedLanguage[] = [];

      if (Array.isArray(supportedLanguages)) {
        allLanguages = supportedLanguages.filter(
          (lang: any) => lang && lang.name && lang.code,
        );
      }

      // Add default language
      if (defaultLanguage && defaultLanguage.name && defaultLanguage.code) {
        const exists = allLanguages.some(
          (lang: ApiSupportedLanguage) => lang.code === defaultLanguage.code,
        );
        if (!exists) {
          allLanguages.push(defaultLanguage);
        }
      }

      // Sort alphabetically
      allLanguages.sort((a, b) => a.name.localeCompare(b.name));

      setAvailableLanguages(allLanguages);

      // Load saved language preference
      loadSavedLanguagePreference(allLanguages);
    } catch (error) {
      console.log('Error loading languages from Redux:', error);
      fetchSettingsDirectly();
    } finally {
      setLanguagesLoading(false);
    }
  };

  const loadSavedLanguagePreference = async (
    allLanguages: ApiSupportedLanguage[],
  ) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_LANG);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.uiLanguage) {
          const savedLang = allLanguages.find(
            lang =>
              lang.name === parsed.uiLanguage ||
              lang.code === parsed.uiLanguage,
          );
          if (savedLang) {
            setUiLanguage(savedLang.name);
            return;
          }
        }
      }

      // Default to English
      const englishLang =
        allLanguages.find(l => l.code === 'en') || allLanguages[0];
      if (englishLang) {
        setUiLanguage(englishLang.name);
      }
    } catch (error) {
      console.warn('Error loading saved language:', error);
      const englishLang =
        allLanguages.find(l => l.code === 'en') || allLanguages[0];
      if (englishLang) {
        setUiLanguage(englishLang.name);
      }
    }
  };

  const loadSavedSettings = async () => {
    try {
      // Load token
      let storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        if (storedToken.startsWith('"') && storedToken.endsWith('"')) {
          try {
            storedToken = JSON.parse(storedToken);
          } catch (e) {
            console.warn('Token parsing error:', e);
          }
        }
        setToken(storedToken);
      }
    } catch (err) {
      console.warn('Load settings error', err);
    }
  };

  // Clean token for API requests
  const cleanToken = (tokenString: string | null): string | null => {
    if (!tokenString) return null;

    let cleaned = tokenString.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    cleaned = cleaned.replace(/\\"/g, '"');

    return cleaned;
  };

  // Show success modal
  const showSuccessModal = (message: string) => {
    setModalMessage(message);
    setSuccessModalVisible(true);
  };

  // Show error modal
  const showErrorModal = (message: string) => {
    setModalMessage(message);
    setErrorModalVisible(true);
  };

  // Handle language change
  const handleSetLanguage = async () => {
    setSaving(true);

    // Find language code for selected UI language
    const selectedLang = availableLanguages.find(
      lang => lang.name === uiLanguage,
    );
    if (!selectedLang) {
      showErrorModal(
        getText(
          'please_select_valid_language',
          'Please select a valid language',
        ),
      );
      setSaving(false);
      return;
    }

    const payload = {
      language: selectedLang.code,
    };

    try {
      const cleanedToken = cleanToken(token);

      if (!cleanedToken) {
        showErrorModal(
          getText(
            'language_error_no_token',
            'No valid token found. Please login again.',
          ),
        );
        setSaving(false);
        return;
      }

      const res: LanguageResponse = await apiRequest(
        ApiURL.setLanguagePreference,
        'POST',
        payload,
        true,
        false,
        cleanedToken,
      );

      setSaving(false);

      if (!res?.error) {
        // Save settings locally
        await saveLocalSettings();

        // Save new token if returned
        if (res?.data?.token) {
          const newToken = res.data.token;
          await storeData('token', newToken);
        }

        showSuccessModal(
          res?.message ||
            getText(
              'language_success_message',
              'Language preference updated successfully',
            ),
        );

        // Refresh language data
        dispatch(getLanguageSetting() as any);

        // Navigate back after 2 seconds
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        showErrorModal(
          res?.message ||
            getText(
              'language_update_failed',
              'Failed to update language preference',
            ),
        );
      }
    } catch (error: any) {
      console.log('Language API Exception:', error);
      setSaving(false);
      showErrorModal(
        error.message || getText('network_error', 'Network error occurred'),
      );
    }
  };

  const saveLocalSettings = async () => {
    const payload = {
      defaultLanguageEnabled,
      uiLanguage,
      savedAt: new Date().toISOString(),
    };
    try {
      await AsyncStorage.setItem(STORAGE_KEY_LANG, JSON.stringify(payload));
    } catch (err) {
      console.warn('Save local settings failed', err);
    }
  };

  // Handle play sample
  const handlePlaySample = () => {
    console.log('Playing sample audio in:', uiLanguage);
    // Implement actual audio playback logic here
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader
          showBackButton={true}
          backButtonText={getText('language_toggle_title', 'Language Settings')}
          showNotifications={false}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ✅ DEFAULT LANGUAGE SECTION */}
          <View style={styles.sectionTop}>
            <Text style={styles.sectionTitle}>
              {getText('language_default_title', 'Default Language')}
            </Text>

            <View style={styles.defaultRow}>
              <Text style={styles.defaultLabel}>
                {defaultLanguageEnabled
                  ? getText('language_option_english', 'English')
                  : getText('custom_language', 'Custom Language')}
              </Text>
              <Switch
                value={defaultLanguageEnabled}
                onValueChange={setDefaultLanguageEnabled}
                trackColor={{ false: '#D1D1D1', true: theme.themeColor }}
                thumbColor={defaultLanguageEnabled ? theme.themeColor : '#fff'}
              />
            </View>
          </View>

          {/* ✅ LANGUAGE SELECTION BOX */}
          <View style={styles.box}>
            <Text style={styles.boxTitle}>
              {getText('language_select_title', 'Select Language')}
            </Text>

            {languagesLoading ? (
              <View style={styles.loadingLanguages}>
                <ActivityIndicator size="large" color={theme.themeColor} />
                <Text style={styles.loadingText}>
                  {getText('loading_languages', 'Loading languages...')}
                </Text>
              </View>
            ) : (
              <View style={styles.languagesList}>
                {availableLanguages.map(language => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageItem,
                      uiLanguage === language.name &&
                        styles.selectedLanguageItem,
                    ]}
                    onPress={() => setUiLanguage(language.name)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioContainer}>
                      <View
                        style={[
                          styles.radioOuter,
                          uiLanguage === language.name && {
                            borderColor: theme.themeColor,
                          },
                        ]}
                      >
                        {uiLanguage === language.name && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                      <Text style={styles.languageName}>{language.name}</Text>
                    </View>

                    {language.nativeName &&
                      language.nativeName !== language.name && (
                        <Text style={styles.nativeName}>
                          ({language.nativeName})
                        </Text>
                      )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* ✅ AUDIO PREVIEW SECTION */}
          <View style={styles.sampleCard}>
            <Image source={IMAGES.user4} style={styles.sampleImage} />
            <View style={styles.sampleContent}>
              <Text style={styles.sampleTitle}>
                {getText('language_sample_title', 'BABY SHARK')}
              </Text>
              <Text style={styles.sampleSub}>
                {getText('language_sample_subtitle', 'WB Kids')}
              </Text>
              <View style={styles.sampleProgress}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: '35%' }]} />
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.playBtn}
              disabled={saving}
              onPress={handlePlaySample}
            >
              <Text style={styles.playText}>
                {getText('language_play_sample', 'PLAY SAMPLE')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ✅ SAVE BUTTON */}
          <View style={styles.buttonContainer}>
            <CustomButton
              text={
                saving
                  ? getText('language_saving_button', 'SAVING...')
                  : getText('language_save_button', 'SAVE')
              }
              backgroundColor={theme.themeColor}
              height={moderateScale(52)}
              style={styles.saveBtn}
              onPress={handleSetLanguage}
              disabled={
                saving || languagesLoading || availableLanguages.length === 0
              }
              isLoading={saving}
            />
          </View>
        </ScrollView>

        {/* ✅ SIMPLE SUCCESS MODAL */}
        <SuccessModal
          visible={successModalVisible}
          message={modalMessage}
          onClose={() => setSuccessModalVisible(false)}
          languageData={languageData}
        />

        {/* ✅ SIMPLE ERROR MODAL */}
        <ErrorModal
          visible={errorModalVisible}
          message={modalMessage}
          onClose={() => setErrorModalVisible(false)}
          languageData={languageData}
        />
      </View>
    </SafeAreaView>
  );
};

// ✅ COMMON MODAL STYLES (outside getStyles)
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  modalContainer: {
    width: '85%',
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  successIcon: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  successIconText: {
    fontSize: moderateScale(32),
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: moderateScale(20),
    fontFamily: FontFamily.KhulaBold,
    marginBottom: moderateScale(12),
  },
  successMessage: {
    fontSize: moderateScale(15),
    fontFamily: FontFamily.KhulaRegular,
    textAlign: 'center',
    marginBottom: moderateScale(24),
    lineHeight: moderateScale(22),
  },
  successButton: {
    paddingHorizontal: moderateScale(32),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(10),
    minWidth: moderateScale(120),
    alignItems: 'center',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontFamily: FontFamily.KhulaSemiBold,
  },
  errorIcon: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  errorIconText: {
    fontSize: moderateScale(32),
    fontWeight: 'bold',
  },
  errorTitle: {
    fontSize: moderateScale(20),
    fontFamily: FontFamily.KhulaBold,
    marginBottom: moderateScale(12),
  },
  errorMessage: {
    fontSize: moderateScale(15),
    fontFamily: FontFamily.KhulaRegular,
    textAlign: 'center',
    marginBottom: moderateScale(24),
    lineHeight: moderateScale(22),
  },
  errorButton: {
    paddingHorizontal: moderateScale(32),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(10),
    minWidth: moderateScale(120),
    alignItems: 'center',
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontFamily: FontFamily.KhulaSemiBold,
  },
});

// ✅ SCREEN STYLES
const getStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.white,
    },
    container: {
      flex: 1,
      backgroundColor: theme.white,
    },
    scrollContent: {
      paddingBottom: moderateScale(40),
      paddingTop: moderateScale(6),
    },

    // DEFAULT LANGUAGE SECTION STYLES
    sectionTop: {
      marginHorizontal: moderateScale(18),
      marginTop: moderateScale(12),
    },
    sectionTitle: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
      marginBottom: moderateScale(8),
    },
    defaultRow: {
      backgroundColor: theme.white,
      borderRadius: moderateScale(12),
      padding: moderateScale(14),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#F1F5F9',
      shadowColor: theme.black,
      shadowOpacity: 0.06,
      shadowRadius: moderateScale(6),
      elevation: 3,
    },
    defaultLabel: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.black,
    },

    // LANGUAGE SELECTION BOX STYLES
    box: {
      marginHorizontal: moderateScale(18),
      marginTop: moderateScale(18),
      backgroundColor: '#FFFFFF',
      borderRadius: moderateScale(12),
      padding: moderateScale(20),
      borderWidth: 1,
      borderColor: '#F1F5F9',
    },
    boxTitle: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
      marginBottom: moderateScale(20),
    },
    languagesList: {
      // Simple list layout
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: moderateScale(15),
      paddingHorizontal: moderateScale(12),
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9',
    },
    selectedLanguageItem: {
      backgroundColor: theme.themeColor + '10',
      borderRadius: moderateScale(8),
      borderBottomWidth: 0,
    },
    radioContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    radioOuter: {
      width: moderateScale(22),
      height: moderateScale(22),
      borderRadius: moderateScale(12),
      borderWidth: 2,
      borderColor: '#D1D5DB',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: moderateScale(15),
    },
    radioInner: {
      width: moderateScale(12),
      height: moderateScale(12),
      borderRadius: moderateScale(8),
      backgroundColor: theme.themeColor,
    },
    languageName: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
    },
    nativeName: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: '#6B7280',
      fontStyle: 'italic',
    },
    loadingLanguages: {
      padding: moderateScale(40),
      alignItems: 'center',
    },
    loadingText: {
      fontSize: moderateScale(14),
      color: '#6B7280',
      fontFamily: FontFamily.KhulaRegular,
      marginTop: moderateScale(10),
    },

    // AUDIO PREVIEW SECTION STYLES
    sampleCard: {
      marginHorizontal: moderateScale(18),
      marginTop: moderateScale(18),
      backgroundColor: theme.themeColor,
      borderRadius: moderateScale(12),
      padding: moderateScale(16),
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: theme.black,
      shadowOpacity: 0.1,
      shadowRadius: moderateScale(8),
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    sampleImage: {
      width: moderateScale(60),
      height: moderateScale(60),
      borderRadius: moderateScale(10),
      marginRight: moderateScale(16),
    },
    sampleContent: {
      flex: 1,
    },
    sampleTitle: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.white,
    },
    sampleSub: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.white,
      marginTop: moderateScale(4),
      opacity: 0.9,
    },
    sampleProgress: {
      marginTop: moderateScale(12),
      width: '90%',
    },
    progressBarBg: {
      height: moderateScale(6),
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: moderateScale(6),
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.white,
      borderRadius: moderateScale(6),
    },
    playBtn: {
      marginLeft: moderateScale(12),
      backgroundColor: theme.white,
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(10),
      borderRadius: moderateScale(10),
      minWidth: moderateScale(100),
      alignItems: 'center',
    },
    playText: {
      color: theme.themeColor,
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaSemiBold,
    },

    // SAVE BUTTON STYLES
    buttonContainer: {
      marginHorizontal: moderateScale(18),
      marginTop: moderateScale(24),
      marginBottom: moderateScale(20),
    },
    saveBtn: {
      borderRadius: moderateScale(12),
      shadowColor: theme.black,
      shadowOpacity: 0.1,
      shadowRadius: moderateScale(8),
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
  });

export default LanguageToggleScreen;
