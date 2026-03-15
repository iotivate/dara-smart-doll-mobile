/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomTextInput from '@components/CustomTextInput';
import CustomVectorIcons from '@components/CustomVectorIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '@components/CustomHeader';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import HTML from 'react-native-render-html';
import { useSelector } from 'react-redux';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HelpAndSupportScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  const [selectedTab, setSelectedTab] = useState('Help');

  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [faqData, setFaqData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // FAQ API Call
  const fetchFaqData = async (pageNumber = 1) => {
    try {
      setLoading(true);

      // API URL: {{LIVE_URL}}/cms/users/faqs?page=1&size=10
      const url = `${ApiURL.faq}?page=${pageNumber}&size=10`;

      const response = await apiRequest(url, 'GET', null, true);

      console.log('FAQ API Response:', response);

      if (!response?.error && response?.data?.list) {
        const newFaqs = response.data.list;

        if (pageNumber === 1) {
          setFaqData(newFaqs);
        } else {
          setFaqData(prev => [...prev, ...newFaqs]);
        }

        // Check if there are more pages
        const totalItems = response.data.total || 0;
        const itemsPerPage = response.data.size || 10;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        setHasMore(pageNumber < totalPages);
        setPage(pageNumber);
      } else {
        Alert.alert('Error', response?.message || 'Failed to fetch FAQs');
      }
    } catch (error) {
      console.log('FAQ API Error:', error);
      Alert.alert('Error', 'Failed to load FAQs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load FAQs when component mounts
  useEffect(() => {
    fetchFaqData(1);
  }, []);

  const queryCategories = ['Technical', 'Payment', 'Content', 'General'];
  const [selectedCategory, setSelectedCategory] = useState('Technical');
  const [queryDesc, setQueryDesc] = useState('');

  const toggleExpand = index => {
    LayoutAnimation.easeInEaseOut();
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const onSelectCategory = (item: string) => {
    setSelectedCategory(item);
    setShowCategoryDropdown(false);
  };

  // Function to strip HTML tags for description preview
  const stripHtml = html => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  };

  // Function to truncate text for preview
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Render FAQ items from API
  const renderApiFaqs = () => {
    if (loading && faqData.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.themeColor} />
          <Text style={styles.loadingText}>Loading FAQs...</Text>
        </View>
      );
    }

    if (faqData.length === 0 && !loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {languageData?.no_faqs || 'No FAQs available at the moment.'}
          </Text>
        </View>
      );
    }

    return faqData.map((item, index) => (
      <View key={`faq-${index}`} style={styles.faqBox}>
        <TouchableOpacity
          onPress={() => toggleExpand(index)}
          style={styles.faqHeader}
        >
          <Text style={styles.faqTitle}>
            {item.title || languageData?.untitled_faq || 'Untitled FAQ'}
          </Text>
          <CustomVectorIcons
            name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
            iconSet="Feather"
            size={moderateScale(18)}
            color={theme.text}
          />
        </TouchableOpacity>

        {expandedIndex === index && (
          <View style={styles.faqContentContainer}>
            {/* Display HTML content safely */}
            <HTML
              source={{
                html:
                  item.content ||
                  languageData?.no_content_html ||
                  '<p>No content available.</p>',
              }}
              baseStyle={styles.htmlContent}
              tagsStyles={{
                p: { color: theme.textSub, fontSize: moderateScale(13) },
                h1: { color: theme.text, fontSize: moderateScale(16) },
                h2: { color: theme.text, fontSize: moderateScale(15) },
                h3: { color: theme.text, fontSize: moderateScale(14) },
                ul: { color: theme.textSub, fontSize: moderateScale(13) },
                li: { color: theme.textSub, fontSize: moderateScale(13) },
              }}
              contentWidth={moderateScale(300)}
            />

            {/* Show preview of plain text */}
            <Text style={styles.faqDescription}>
              {truncateText(stripHtml(item.content))}
            </Text>
          </View>
        )}
      </View>
    ));
  };

  // Load more FAQs function
  const loadMoreFaqs = () => {
    if (!loading && hasMore) {
      fetchFaqData(page + 1);
    }
  };

  return (
    <View
      style={{
        backgroundColor: theme.background,
        flex: 1,
        marginTop: moderateScale(20),
      }}
    >
      <StatusBar
        backgroundColor={'rgba(0,0,0,0.5)'}
        barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        showBackButton={true}
        showNotifications={false}
        backButtonText={languageData?.help_support || 'Help & Support'}
      />

      {/* -------- TOP TABS -------- */}
      <View style={styles.tabRow}>
        {['Help', 'Contact us', 'Query'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tabButton}
            onPress={() => {
              if (tab === 'Query') {
                navigation.navigate('FeedbackSupportScreen');
              } else {
                setSelectedTab(tab);
              }
            }}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: selectedTab === tab ? theme.themeColor : theme.textSub,
                  fontFamily:
                    selectedTab === tab
                      ? FontFamily.KhulaBold
                      : FontFamily.KhulaSemiBold,
                },
              ]}
            >
              {tab}
            </Text>

            {selectedTab === tab && (
              <View
                style={[
                  styles.activeIndicator,
                  { backgroundColor: theme.themeColor },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* -------- CONTENT -------- */}
      <ScrollView
        style={{ flex: 1 }}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 50;

          if (
            isCloseToBottom &&
            selectedTab === 'Help' &&
            hasMore &&
            !loading
          ) {
            loadMoreFaqs();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* ========== HELP TAB (FAQ from API) ========== */}
        {selectedTab === 'Help' && (
          <View style={styles.sectionContainer}>
            {/* API FAQs Section */}
            <Text style={styles.sectionHeader}>
              {languageData?.faq_title || 'Frequently Asked Questions'}
            </Text>

            {renderApiFaqs()}

            {/* Load More Indicator */}
            {loading && faqData.length > 0 && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={theme.themeColor} />
                <Text style={styles.loadingText}>
                  {languageData?.loading_faqs || 'Loading FAQs...'}
                </Text>
              </View>
            )}

            {/* Static Troubleshoot Section (You can keep this or make it dynamic too) */}
            <Text style={styles.troubleshootHeader}>
              {languageData?.troubleshoot || 'Troubleshoot'}
            </Text>

            {[
              {
                title:
                  languageData?.bluetooth_connectivity ||
                  'Bluetooth Connectivity',
                screen: 'BluetoothTroubleshooting',
              },
              {
                title: languageData?.audio_not_playing || 'Audio not playing',
                screen: 'AudioTroubleShoot',
              },
              {
                title:
                  languageData?.lesson_not_starting ||
                  'Lessons not starting on schedule',
                screen: 'LessonTroubleShoot',
              },
            ].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.troubleshootItem}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Text style={styles.troubleshootText}>{item.title}</Text>
                <CustomVectorIcons
                  name="chevron-right"
                  iconSet="Feather"
                  size={moderateScale(18)}
                  color={theme.text}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ========== CONTACT US TAB ========== */}
        {selectedTab === 'Contact us' && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={styles.contactBox}
              onPress={() => navigation.navigate('EmailSupportScreen')}
            >
              <Text style={styles.contactTitle}>
                {languageData?.email_support || 'Email support'}
              </Text>

              <View style={styles.contactRow}>
                <Text style={styles.contactSub}>
                  {languageData?.email_support_desc ||
                    'Tap to get support via mail'}
                </Text>

                <CustomVectorIcons
                  name="chevron-right"
                  iconSet="Feather"
                  size={moderateScale(18)}
                  color={theme.text}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactBox}
              onPress={() => navigation.navigate('CallSupportScreen')}
            >
              <Text style={styles.contactTitle}>
                {languageData?.call_support || 'Call support'}
              </Text>

              <View style={styles.contactRow}>
                <Text style={styles.contactSub}>
                  {languageData?.call_support_desc ||
                    'Tap to get support via call'}
                </Text>

                <CustomVectorIcons
                  name="chevron-right"
                  iconSet="Feather"
                  size={moderateScale(18)}
                  color={theme.text}
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ========== QUERY TAB ========== */}
        {selectedTab === 'Query' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.label}>
              {languageData?.select_category || 'Select Category'}
            </Text>

            <TouchableOpacity
              style={styles.dropdownBox}
              onPress={() => setShowCategoryDropdown(true)}
            >
              <Text style={styles.dropdownText}>{selectedCategory}</Text>
              <CustomVectorIcons
                name="chevron-down"
                iconSet="Feather"
                size={moderateScale(20)}
                color={theme.text}
              />
            </TouchableOpacity>

            {/* -------- CATEGORY DROPDOWN -------- */}
            <Modal
              visible={showCategoryDropdown}
              transparent
              animationType="fade"
            >
              <TouchableOpacity
                style={styles.modalBackdrop}
                onPress={() => setShowCategoryDropdown(false)}
              >
                <View style={styles.modalBox}>
                  {queryCategories.map((item, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.modalOption}
                      onPress={() => onSelectCategory(item)}
                    >
                      <Text style={styles.modalOptionText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>

            {/* -------- DESCRIPTION WITH BIG HEIGHT -------- */}
            <View style={styles.descriptionContainer}>
              <CustomTextInput
                title={languageData?.description || 'Description'}
                placeholder={
                  languageData?.write_query || 'Write your query here...'
                }
                numberOfLines={8}
                multiline={true}
                value={queryDesc}
                onChangeText={setQueryDesc}
                style={{ height: moderateScale(150) }}
              />

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { backgroundColor: theme.themeColor },
                ]}
              >
                <Text style={styles.submitText}>
                  {languageData?.submit || 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

/* -------------------- STYLES -------------------- */

const getStyles = theme =>
  StyleSheet.create({
    tabRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: moderateScale(10),
      paddingBottom: moderateScale(10),
      borderBottomWidth: 1,
      borderColor: theme.borderColorDynamic,
    },
    tabButton: {
      alignItems: 'center',
    },
    tabText: {
      fontSize: moderateScale(15),
    },
    activeIndicator: {
      width: moderateScale(45),
      height: moderateScale(2),
      marginTop: moderateScale(5),
      borderRadius: 10,
    },

    sectionContainer: {
      paddingHorizontal: moderateScale(15),
      paddingVertical: moderateScale(10),
    },

    sectionHeader: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginBottom: moderateScale(15),
      marginTop: moderateScale(5),
    },

    faqBox: {
      backgroundColor: theme.themeLight,
      padding: moderateScale(15),
      borderRadius: moderateScale(12),
      marginBottom: moderateScale(10),
    },
    faqHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    faqTitle: {
      fontSize: moderateScale(15),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      flex: 1,
      marginRight: moderateScale(10),
    },
    faqContentContainer: {
      marginTop: moderateScale(10),
    },
    htmlContent: {
      fontSize: moderateScale(13),
      color: theme.textSub,
      fontFamily: FontFamily.KhulaRegular,
      lineHeight: moderateScale(18),
    },
    faqDescription: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.textSub,
      marginTop: moderateScale(8),
      lineHeight: moderateScale(18),
    },

    loadingContainer: {
      alignItems: 'center',
      paddingVertical: moderateScale(40),
    },
    loadingText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.textSub,
      marginTop: moderateScale(10),
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: moderateScale(40),
    },
    emptyText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.textSub,
      textAlign: 'center',
    },
    loadMoreContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: moderateScale(20),
    },
    loadMoreText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.textSub,
      marginLeft: moderateScale(10),
    },

    troubleshootHeader: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      marginTop: moderateScale(25),
      marginBottom: moderateScale(10),
      color: theme.text,
    },

    troubleshootItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: moderateScale(15),
      borderBottomWidth: 1,
      borderColor: theme.borderColorDynamic,
    },
    troubleshootText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },

    contactBox: {
      backgroundColor: theme.themeLight,
      padding: moderateScale(18),
      borderRadius: moderateScale(12),
      marginBottom: moderateScale(12),
    },
    contactRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: moderateScale(5),
    },
    contactTitle: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },
    contactSub: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.textSub,
    },

    label: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      marginBottom: moderateScale(8),
      marginTop: moderateScale(10),
    },

    dropdownBox: {
      borderWidth: 1,
      borderColor: theme.borderColorDynamic,
      padding: moderateScale(15),
      borderRadius: moderateScale(12),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    dropdownText: {
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(14),
      color: theme.text,
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      paddingHorizontal: moderateScale(20),
    },

    modalBox: {
      backgroundColor: theme.mainBackground,
      borderRadius: moderateScale(12),
      paddingVertical: moderateScale(10),
    },

    modalOption: {
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(15),
      borderBottomWidth: 1,
      borderColor: theme.borderColorDynamic,
    },
    modalOptionText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },

    descriptionContainer: {
      marginTop: moderateScale(20),
      backgroundColor: theme.themeLight,
      padding: moderateScale(15),
      borderRadius: moderateScale(12),
    },

    submitBtn: {
      width: moderateScale(100),
      paddingVertical: moderateScale(10),
      borderRadius: moderateScale(12),
      alignItems: 'center',
      alignSelf: 'flex-end',
      marginTop: moderateScale(10),
    },
    submitText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaBold,
      color: theme.white,
    },
  });

export default HelpAndSupportScreen;
