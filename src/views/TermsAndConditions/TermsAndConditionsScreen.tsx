/* eslint-disable no-catch-shadow */
/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomHeader from '@components/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { showSuccessToast, showErrorToast } from '@utils/CustomToast';
import RenderHtml from 'react-native-render-html'; // You'll need to install this package
import { useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';

// Types for our data
interface CMSData {
  title: string;
  content: string;
}

type TabType = 'terms' | 'privacy';

const TermsAndConditionsScreen = () => {
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );
  const scrollRef = useRef<ScrollView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('terms');
  const [termsData, setTermsData] = useState<CMSData | null>(null);
  const [privacyData, setPrivacyData] = useState<CMSData | null>(null);
  const { width } = useWindowDimensions();

  // Fetch data when tab changes
  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab: TabType) => {
    try {
      setLoading(true);
      setError(false);

      const endpoint =
        tab === 'terms' ? ApiURL.TermsAndConditions : ApiURL.PrivacyPolicy;

      console.log(`📥 Fetching ${tab} data from:`, endpoint);

      const res = await apiRequest(endpoint, 'GET', {}, false);

      console.log(`✅ ${tab.toUpperCase()} API Response:`, res);

      if (!res?.error && res?.data) {
        if (tab === 'terms') {
          setTermsData(res.data);
        } else {
          setPrivacyData(res.data);
        }
      } else {
        const errorMsg =
          res?.message ||
          `Failed to load ${
            tab === 'terms' ? 'terms and conditions' : 'privacy policy'
          }`;
        console.warn(`❌ ${tab.toUpperCase()} Error:`, errorMsg);
        setError(true);
        showErrorToast(errorMsg);
      }
    } catch (error: any) {
      console.log(`🔥 ${activeTab.toUpperCase()} API Exception:`, error);
      setError(true);
      showErrorToast(
        error.message ||
          `Network error loading ${
            activeTab === 'terms' ? 'terms' : 'privacy policy'
          }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = (tab: TabType) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      // Reset scroll position when switching tabs
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  // Handle accept button press
  const handleAcceptTerms = async () => {
    try {
      // If you have an API to mark terms as accepted, call it here
      // Example: await apiRequest(ApiURL.AcceptTerms, 'POST', {}, true);

      showSuccessToast(
        activeTab === 'terms'
          ? 'Terms accepted successfully'
          : 'Privacy policy acknowledged',
      );

      // You might want to navigate back or to next screen
      // navigation.goBack();
    } catch (error) {
      console.log('Error:', error);
      showErrorToast('Failed to process your request');
    }
  };

  // Render HTML content with fallback to plain text
  const renderContent = (data: CMSData | null) => {
    if (!data?.content) {
      return (
        <Text style={styles.clauseText}>
          No content available at the moment.
        </Text>
      );
    }

    // Check if content contains HTML tags
    const hasHtmlTags = /<[^>]*>/.test(data.content);

    if (hasHtmlTags) {
      // Use RenderHtml for HTML content
      const source = {
        html: data.content,
      };

      return (
        <View style={styles.htmlContainer}>
          <RenderHtml
            contentWidth={width - moderateScale(40)} // Account for padding
            source={source}
            baseStyle={styles.htmlBaseStyle}
            tagsStyles={{
              p: styles.htmlParagraph,
              span: styles.htmlSpan,
              h1: styles.htmlHeading,
              h2: styles.htmlHeading,
              h3: styles.htmlHeading,
              ul: styles.htmlList,
              li: styles.htmlListItem,
              strong: styles.htmlBold,
              em: styles.htmlItalic,
            }}
          />
        </View>
      );
    } else {
      // Plain text content
      return <Text style={styles.clauseText}>{data.content}</Text>;
    }
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    return activeTab === 'terms' ? termsData : privacyData;
  };

  // Get last updated date (you might want to get this from API response)
  const getLastUpdatedDate = () => {
    // If your API returns a date, use it here
    // For now, using a placeholder
    return activeTab === 'terms'
      ? 'Last updated on 5/12/2022'
      : 'Last updated on 5/12/2022';
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#6A4DD6" />
        <Text style={{ marginTop: 10, color: '#4F4F4F' }}>
          Loading{' '}
          {activeTab === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}...
        </Text>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          marginTop: moderateScale(20),
        }}
      >
        <CustomHeader
          showBackButton={true}
          showNotifications={false}
          backButtonText={activeTab === 'terms' ? 'T&C' : 'Privacy'}
        />

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={
              activeTab === 'terms' ? styles.activeTab : styles.inactiveTab
            }
            onPress={() => handleTabPress('terms')}
          >
            <Text
              style={
                activeTab === 'terms'
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              {languageData?.terms_of_use || 'Terms of Use'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              activeTab === 'privacy' ? styles.activeTab : styles.inactiveTab
            }
            onPress={() => handleTabPress('privacy')}
          >
            <Text
              style={
                activeTab === 'privacy'
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              {languageData?.privacy_policy || 'Privacy Policy'}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              fontSize: moderateScale(16),
              color: '#FF3B30',
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            Failed to load{' '}
            {activeTab === 'terms'
              ? languageData?.terms_load_failed ||
                'Failed to load terms and conditions'
              : languageData?.privacy_load_failed ||
                'Failed to load privacy policy'}
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => fetchData(activeTab)}
          >
            <Text style={styles.primaryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentData = getCurrentData();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        marginTop: moderateScale(20),
      }}
    >
      <StatusBar
        backgroundColor={'rgba(0,0,0,0.2)'}
        barStyle={Platform.OS === 'android' ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        showBackButton={true}
        showNotifications={false}
        backButtonText={
          activeTab === 'terms'
            ? languageData?.terms_short || 'T&C'
            : languageData?.privacy_short || 'Privacy'
        }
      />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={activeTab === 'terms' ? styles.activeTab : styles.inactiveTab}
          onPress={() => handleTabPress('terms')}
        >
          <Text
            style={
              activeTab === 'terms'
                ? styles.activeTabText
                : styles.inactiveTabText
            }
          >
            Terms of Use
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            activeTab === 'privacy' ? styles.activeTab : styles.inactiveTab
          }
          onPress={() => handleTabPress('privacy')}
        >
          <Text
            style={
              activeTab === 'privacy'
                ? styles.activeTabText
                : styles.inactiveTabText
            }
          >
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Scroll */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollArea}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>
          {currentData?.title ||
            (activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy')}
        </Text>
        <Text style={styles.lastUpdated}>{getLastUpdatedDate()}</Text>

        {/* Render the content */}
        {renderContent(currentData)}

        <View style={{ height: moderateScale(120) }} />
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleAcceptTerms}>
          <Text style={styles.primaryBtnText}>
            {activeTab === 'terms'
              ? languageData?.accept_continue || 'Accept & Continue'
              : languageData?.acknowledge || 'Acknowledge'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        >
          <Text style={styles.outlineBtnText}>
            {' '}
            {languageData?.scroll_to_top || 'Scroll to Top'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#6A4DD6',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(25),
  },
  activeTabText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.KhulaExtraBold,
    color: '#6A4DD6',
  },
  inactiveTab: {
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(25),
  },
  inactiveTabText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.KhulaSemiBold,
    color: '#999999',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(15),
    paddingBottom: moderateScale(20),
  },
  pageTitle: {
    fontSize: moderateScale(18),
    fontFamily: FontFamily.KhulaExtraBold,
    color: '#000',
    marginBottom: moderateScale(5),
  },
  lastUpdated: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.KhulaSemiBold,
    color: '#707070',
    marginBottom: moderateScale(20),
  },
  clauseText: {
    fontSize: moderateScale(13),
    fontFamily: FontFamily.KhulaRegular,
    color: '#4F4F4F',
    lineHeight: moderateScale(18),
  },
  htmlContainer: {
    marginTop: moderateScale(10),
  },
  htmlBaseStyle: {
    fontSize: moderateScale(13),
    color: '#4F4F4F',
    fontFamily: FontFamily.KhulaRegular,
  },
  htmlParagraph: {
    marginBottom: moderateScale(10),
    lineHeight: moderateScale(18),
  },
  htmlSpan: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  htmlHeading: {
    fontSize: moderateScale(16),
    fontFamily: FontFamily.KhulaExtraBold,
    color: '#000',
    marginTop: moderateScale(15),
    marginBottom: moderateScale(5),
  },
  htmlList: {
    marginLeft: moderateScale(15),
    marginBottom: moderateScale(10),
  },
  htmlListItem: {
    marginBottom: moderateScale(5),
    lineHeight: moderateScale(18),
  },
  htmlBold: {
    fontFamily: FontFamily.KhulaSemiBold,
  },
  htmlItalic: {
    fontStyle: 'italic',
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: moderateScale(25),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#6A4DD6',
    paddingVertical: moderateScale(12),
    width: '70%',
    borderRadius: moderateScale(25),
    alignItems: 'center',
    marginBottom: moderateScale(10),
  },
  primaryBtnText: {
    color: '#fff',
    fontFamily: FontFamily.KhulaExtraBold,
    fontSize: moderateScale(14),
  },
  outlineBtn: {
    width: '60%',
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(25),
    borderWidth: 2,
    borderColor: '#6A4DD6',
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#6A4DD6',
    fontFamily: FontFamily.KhulaExtraBold,
    fontSize: moderateScale(14),
  },
});

export default TermsAndConditionsScreen;
