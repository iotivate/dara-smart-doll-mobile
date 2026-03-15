/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import CustomButton from '@components/CustomButton';
import FontFamily from '@assets/fonts/FontFamily';
import CustomHeader from '@components/CustomHeader';
import CustomBottomBar from '@components/CustomBottomBar';
import CustomVectorIcons from '@components/CustomVectorIcons';
import CustomImageComponent from '@components/CustomImageComponent';
import IMAGES from '@assets/images';
import CustomLucideIcon from '@components/CustomLucideIcon';
import { useDispatch, useSelector } from 'react-redux';
import {
  getbanner,
  getChildrenProfiles,
  getLanguageSetting,
  getProfile,
} from '@utils/Redux_api_fun';
import { useSocket } from 'context/SocketContext';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const Dashboard = (props: any) => {
  const languageData = useSelector((state: any) => state?.data?.languageData);
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  let myData = useSelector((state: any) => state?.data);
  let { getbannerData, getprofiledata, childrenList = [] } = myData;
  const parentName =
    getprofiledata?.username || languageData?.parent || 'Parent';

  const parentImage =
    getprofiledata?.profilePictureUrl || getprofiledata?.avatar || IMAGES.user4;

  const [childProfileModal, setChildProfileModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  // const [loader, setLoader] = useState<any>(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastPlayedData, setLastPlayedData] = useState<any>(null);
  const [learningProgress, setLearningProgress] = useState<number>(0);
  const [nextScheduledLesson, setNextScheduledLesson] = useState<any>(null);
  const [nextLessonLoading, setNextLessonLoading] = useState<boolean>(false);

  const socketRef = useSocket();

  // ============================================
  // API CALL: Fetch Next Scheduled Lesson
  // ============================================
  const fetchNextScheduledLesson = async (childId: string) => {
    try {
      if (!childId) {
        setNextScheduledLesson(null);
        return;
      }
      setNextLessonLoading(true);

      const response = await apiRequest(
        `${ApiURL.NEXT_SCHEDULED_SESSION}?childId=${childId}`,
        'GET',
        null,
        true,
      );

      console.log('Next scheduled lesson API response:', response);

      if (!response?.error && response?.data) {
        setNextScheduledLesson(response.data);
        console.log('Next scheduled lesson loaded:', response.data);
      } else {
        console.log('No upcoming scheduled lesson or error in response');
        setNextScheduledLesson(null);
      }
    } catch (error) {
      console.log('❌ Error fetching next scheduled lesson:', error);
      setNextScheduledLesson(null);
    } finally {
      setNextLessonLoading(false);
    }
  };

  // ============================================
  // Helper: Format Next Occurrence Time
  // ============================================
  const formatNextOccurrence = (timestamp: number) => {
    if (!timestamp) return 'No schedule';

    const date = new Date(timestamp);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Format time (e.g., "2:00 PM")
    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Check if it's today
    if (targetDate.getTime() === today.getTime()) {
      return `${timeString} (Today)`;
    }
    // Check if it's tomorrow
    else if (targetDate.getTime() === tomorrow.getTime()) {
      return `${timeString} (Tomorrow)`;
    }
    // Otherwise show date
    else {
      const dateString = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      return `${timeString} (${dateString})`;
    }
  };
  const getRelativeTimeDescription = (timestamp: number) => {
    if (!timestamp) return 'No upcoming lessons';

    const now = new Date().getTime();
    const diffMs = timestamp - now;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 0) {
      return 'Starting soon';
    } else if (diffMins < 60) {
      return `In ${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'}`;
    } else if (diffHours < 24) {
      return `In ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays < 7) {
      return `In ${diffDays} days`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `In ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    } else {
      return 'Next month';
    }
  };

  const fetchLastPlayedContent = async (childId: string) => {
    try {
      if (!childId) {
        console.log('No child ID provided');
        return;
      }

      console.log('Fetching last played content for child:', childId);

      const response = await apiRequest(
        `${ApiURL.lastPlayed}?childId=${childId}`,
        'GET',
        null,
        true,
      );

      console.log('22222222', response);

      if (!response?.error && response?.data) {
        setLastPlayedData(response.data);

        // Convert seconds to minutes for display
        const minutesPlayed = Math.floor(response.data.playedDuration / 60);
        setLearningProgress(minutesPlayed);

        console.log('Last played content loaded:', response.data.title);
      } else {
        console.log('No last played data available or error in response');
        setLastPlayedData(null);
        setLearningProgress(0);
      }
    } catch (error) {
      console.log('❌ Error fetching last played content:', error);
      setLastPlayedData(null);
      setLearningProgress(0);
    }
  };

  // ============================================
  // API CALL: Fetch History for Selected Child
  // ============================================
  const fetchChildHistory = async (page = 1, reset = false) => {
    try {
      if (!selectedChild?._id) {
        console.log('No child selected for history');
        return;
      }

      setHistoryLoading(true);

      console.log(
        `Fetching history for child: ${selectedChild._id}, page: ${page}`,
      );

      const response = await apiRequest(
        `${ApiURL.childPlayHistory}?childId=${selectedChild._id}&page=${page}&size=10`,
        'GET',
        null,
        true,
      );

      console.log('History API response:', response);

      if (!response?.error && response?.data?.list) {
        const historyData = response.data.list.map((item: any) => ({
          id: item._id,
          title: item.title,
          description: item.description,
          image: item.thumbnailUrls?.[0],
          duration: item.audioDuration,
          playedDuration: item.playedDuration,
          playedAt: item.playedAt,
          category: item.categoryId?.title || 'Unknown Category',
          language: item.language,
          audioUrl: item.audioUrl,
        }));

        if (reset) {
          setHistory(historyData);
        } else {
          setHistory(prev => [...prev, ...historyData]);
        }

        setHistoryPage(page);
        setHasMoreHistory(response.data.list.length === 10);

        console.log(`Loaded ${historyData.length} history items`);
      } else {
        console.log('No history data available or error in response');
        if (reset) {
          setHistory([]);
        }
      }
    } catch (error) {
      console.log('❌ Error fetching history:', error);
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // ============================================
  // Initialize Data & Auto-select First Child
  // ============================================
  useEffect(() => {
    dispatch(getProfile());
    dispatch(getChildrenProfiles());
    dispatch(getbanner());
    dispatch(getLanguageSetting());
  }, [dispatch]);

  // Auto-select first child when children list loads
  useEffect(() => {
    if (childrenList.length > 0) {
      console.log(
        'Children list loaded, selecting first child:',
        childrenList[0],
      );
      setSelectedChild(childrenList[0]);

      // Fetch analytics, history, and next scheduled lesson for the first child
      if (childrenList[0]._id) {
        fetchLastPlayedContent(childrenList[0]._id);
        fetchChildHistory(1, true);
        fetchNextScheduledLesson(childrenList[0]._id);
      }
    } else {
      console.log('No children profiles available');
      setSelectedChild(null);
    }
  }, [childrenList]);

  // Fetch analytics, history, and next scheduled lesson when selected child changes
  useEffect(() => {
    if (selectedChild && selectedChild._id) {
      console.log(
        'Selected child changed, fetching data for:',
        selectedChild._id,
      );
      fetchLastPlayedContent(selectedChild._id);
      fetchChildHistory(1, true);
      fetchNextScheduledLesson(selectedChild._id);
    } else {
      // Clear data if no child selected
      setHistory([]);
      setHistoryPage(1);
      setHasMoreHistory(true);
      setNextScheduledLesson(null);
    }
  }, [selectedChild]);

  // ============================================
  // Socket & Notification Setup
  // ============================================
  useEffect(() => {
    if (!socketRef?.current) return;

    const onAnyEvent = (data: any) => {
      console.log('🔥 Event received on dashboard', data);
    };

    socketRef.current.on('session-scheduled', onAnyEvent);
    socketRef.current.on('ticket-message', onAnyEvent);

    return () => {
      socketRef.current.off('session-scheduled', onAnyEvent);
      socketRef.current.off('ticket-message', onAnyEvent);
    };
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const res = await apiRequest(
        ApiURL.getNotificationsCount,
        'GET',
        null,
        true,
      );

      console.log('✅ Notification count response:', res);

      if (!res?.error && typeof res?.data === 'number') {
        setNotificationCount(res.data);
      } else {
        setNotificationCount(0);
      }
    } catch (error) {
      console.log('❌ Notification count error:', error);
      setNotificationCount(0);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotificationCount();
    }, []),
  );

  // ============================================
  // Dropdown Items Configuration - FIXED
  // ============================================
  const getDropdownItems = () => {
    // Create array for dropdown items - ONLY CHILDREN
    const items = [];

    // Add children profiles if available
    if (childrenList && childrenList.length > 0) {
      childrenList.forEach((child: any) => {
        items.push({
          name: child?.username || 'Child',
          image: child?.profilePictureUrl || child?.avatar || IMAGES.user5,
          childId: child?._id,
          childData: child,
          isChild: true,
        });
      });
    } else {
      // Show placeholder if no children
      items.push({
        name: 'No child profiles',
        image: parentImage,
        isNoChild: true,
        disabled: true,
      });
    }

    return items;
  };

  const dropdownItems = getDropdownItems();

  // ============================================
  // Handle Dropdown Selection
  // ============================================
  const handleDropdownSelect = (item: any) => {
    console.log('Selected profile:', item);

    if (item.isChild && item.childData) {
      // Handle child selection
      console.log('Child selected:', item.name);
      setSelectedChild(item.childData);

      // Fetch analytics, history, and next scheduled lesson for selected child
      if (item.childId) {
        fetchLastPlayedContent(item.childId);
        fetchChildHistory(1, true);
        fetchNextScheduledLesson(item.childId);
      }
    }
  };

  // ============================================
  // Helper Functions
  // ============================================
  const renderHistoryItem = ({ item }: any) => (
    <View style={styles.playCard}>
      <TouchableOpacity>
        <Image
          source={{ uri: item.image }}
          style={styles.playImage}
          defaultSource={IMAGES.user4}
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {Math.floor(item.duration / 60)}:
            {String(item.duration % 60).padStart(2, '0')}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.playInfoContainer}>
        <View style={styles.playInfoContent}>
          <Text style={styles.playTitleText} numberOfLines={1}>
            {item.title}
          </Text>
          <Text
            style={[
              styles.playTitleText,
              { color: theme.gray, fontSize: moderateScale(10) },
            ]}
            numberOfLines={1}
          >
            {item.category} • {item.language.toUpperCase()}
          </Text>
          <Text
            style={[
              styles.playTitleText,
              { color: theme.gray, fontSize: moderateScale(10) },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
          <View style={styles.historyMetaContainer}>
            <View style={styles.historyMetaItem}>
              <CustomVectorIcons
                name="clock"
                iconSet="Feather"
                size={moderateScale(10)}
                color={theme.gray}
                style={{ marginRight: moderateScale(4) }}
              />
              <Text style={[styles.historyMetaText, { color: theme.gray }]}>
                Played: {Math.floor(item.playedDuration / 60)}min
              </Text>
            </View>
            <Text style={[styles.historyMetaText, { color: theme.themeColor }]}>
              {formatPlayedTime(item.playedAt)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleHistoryItemPress(item)}
          style={styles.historyMenuButton}
        >
          <CustomLucideIcon
            name="EllipsisVertical"
            color={theme.iconColor}
            size={moderateScale(16)}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleHistoryItemPress = (item: any) => {
    Alert.alert(
      'History Item',
      `${item.title}\n\nCategory: ${item.category}\nLanguage: ${
        item.language
      }\nPlayed: ${formatPlayedTime(item.playedAt)}\nDuration: ${Math.floor(
        item.playedDuration / 60,
      )} minutes`,
      [
        { text: 'Close', style: 'cancel' },
        // { text: 'Play Again', onPress: () => console.log('Play:', item.audioUrl) },
      ],
    );
  };

  const loadMoreHistory = () => {
    if (!historyLoading && hasMoreHistory && selectedChild?._id) {
      fetchChildHistory(historyPage + 1, false);
    }
  };

  // const handleViewAllHistory = () => {
  //   if (selectedChild) {
  //     props.navigation.navigate('HistoryScreen', {
  //       childId: selectedChild._id,
  //       childName: selectedChild.username,
  //     });
  //   } else {
  //     Alert.alert(
  //       'No Child Selected',
  //       'Please select a child profile to view history',
  //     );
  //   }
  // };

  const refreshHistory = () => {
    if (selectedChild?._id) {
      fetchChildHistory(1, true);
    }
  };

  // Format played time for display
  const formatPlayedTime = (dateString: string) => {
    if (!dateString) return 'Recently';

    try {
      const playedDate = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - playedDate.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins < 1) {
        return 'Just now';
      } else if (diffMins < 60) {
        return `${diffMins} min ago`;
      } else if (diffMins < 24 * 60) {
        const hours = Math.floor(diffMins / 60);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (diffMins < 7 * 24 * 60) {
        const days = Math.floor(diffMins / (24 * 60));
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else {
        return playedDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year:
            playedDate.getFullYear() !== now.getFullYear()
              ? 'numeric'
              : undefined,
        });
      }
    } catch (error) {
      return 'Recently';
    }
  };

  // ============================================
  // Get initial dropdown selected item
  // ============================================
  const getSelectedDropdownItem = () => {
    if (selectedChild) {
      return selectedChild.username || 'Child';
    }
    return childrenList.length > 0
      ? childrenList[0]?.username || 'Select Child'
      : 'No Child Profiles';
  };

  // ============================================
  // History Section Header Component
  // ============================================
  const renderHistoryHeader = () => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        {languageData?.history || 'History'}
        {/* {selectedChild && (
          <Text style={styles.sectionSubtitle}>
            {selectedChild?.username}{' '}
            {languageData?.recent_activities || 'recent activities'}
          </Text>
        )} */}
      </View>
      {/* <TouchableOpacity onPress={handleViewAllHistory} disabled={!selectedChild}>
        <Text style={[styles.viewAllText, !selectedChild && { color: theme.gray + '80' }]}>
          View All
        </Text>
      </TouchableOpacity> */}
    </View>
  );

  // ============================================
  // History List Empty Component
  // ============================================
  const renderEmptyHistory = () => (
    <View style={styles.emptyHistoryContainer}>
      {historyLoading ? (
        <ActivityIndicator size="large" color={theme.themeColor} />
      ) : (
        <>
          <CustomVectorIcons
            name="clock"
            iconSet="Feather"
            size={moderateScale(40)}
            color={theme.gray + '80'}
            style={styles.emptyHistoryIcon}
          />
          <Text style={styles.emptyHistoryText}>
            {selectedChild
              ? languageData?.no_history_child ||
                'No history available for this child'
              : languageData?.select_child_history ||
                'Select a child profile to view history'}
          </Text>
          {selectedChild && (
            <TouchableOpacity
              onPress={refreshHistory}
              style={styles.refreshButton}
            >
              <CustomVectorIcons
                name="refresh-cw"
                iconSet="Feather"
                size={moderateScale(16)}
                color={theme.themeColor}
                style={{ marginRight: moderateScale(8) }}
              />
              <Text style={styles.refreshButtonText}>
                {languageData?.refresh || 'Refresh'}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );

  // ============================================
  // History List Footer Component
  // ============================================
  const renderHistoryFooter = () => {
    if (!historyLoading || history.length === 0) return null;

    return (
      <View style={styles.historyFooter}>
        <ActivityIndicator size="small" color={theme.themeColor} />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.themeColor}
        barStyle="light-content"
        translucent={false}
      />

      {/* ============================================
          HEADER - Shows parent name with dropdown BELOW SEARCH BAR
      ============================================ */}
      <CustomHeader
        type="dashboard"
        showProfile
        userName={parentName}
        profileImage={parentImage}
        greetingText={languageData?.hi || 'Hi'}
        showNotifications
        notificationBadgeCount={notificationCount}
        showSettings
        showIconCircles
        showDropdown={true} // Force show to test
        dropdownItems={dropdownItems}
        selectedDropdownItem={getSelectedDropdownItem()}
        dropdownImage={
          selectedChild
            ? selectedChild?.profilePictureUrl ||
              selectedChild?.avatar ||
              IMAGES.user5
            : null
        }
        onDropdownSelect={handleDropdownSelect}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refreshHistory}
            colors={[theme.themeColor]}
            tintColor={theme.themeColor}
          />
        }
      >
        {/* ============================================
            CHILD/PROFILE SELECTION CARD
        ============================================ */}
        <View
          style={{
            backgroundColor: theme.boxBackground,
            padding: moderateScale(15),
            borderRadius: moderateScale(10),
            elevation: 3,
          }}
        >
          {selectedChild ? (
            // ============================================
            // DISPLAY SELECTED CHILD PROFILE WITH ANALYTICS
            // ============================================
            <View
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            >
              <CustomImageComponent
                source={
                  selectedChild?.profilePictureUrl || selectedChild?.avatar
                    ? {
                        uri:
                          selectedChild.profilePictureUrl ||
                          selectedChild.avatar,
                      }
                    : IMAGES.user5
                }
                height={moderateScale(65)}
                width={moderateScale(65)}
                resizeMode="cover"
                style={{
                  borderRadius: moderateScale(33),
                  marginRight: moderateScale(10),
                }}
              />
              <View>
                <Text style={[styles.childProfileText]}>
                  {selectedChild?.username || 'Child'}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <CustomVectorIcons
                    name="star"
                    iconSet="FontAwesome"
                    color={theme.yellow}
                    size={moderateScale(20)}
                    style={{ marginRight: moderateScale(10) }}
                  />
                  <Text style={[styles.childProfileSubText]}>
                    5 stars earned today
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <CustomVectorIcons
                    name="clock"
                    iconSet="Feather"
                    color={theme.iconColor}
                    size={moderateScale(19)}
                    style={{ marginRight: moderateScale(10) }}
                  />
                  <Text style={[styles.childProfileSubText]}>
                    {learningProgress || 0} min learning progress
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            // ============================================
            // DISPLAY PARENT PROFILE (No child selected)
            // ============================================
            <View
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            >
              <CustomImageComponent
                source={
                  getprofiledata?.profilePictureUrl
                    ? { uri: getprofiledata?.profilePictureUrl }
                    : IMAGES?.user4
                }
                height={moderateScale(65)}
                width={moderateScale(65)}
                resizeMode="cover"
                style={{
                  borderRadius: moderateScale(33),
                  marginRight: moderateScale(10),
                }}
              />
              <View>
                <Text style={[styles.childProfileText]}>
                  {getprofiledata?.username || 'Parent'}
                </Text>
                <Text
                  style={[
                    styles.childProfileSubText,
                    { marginTop: moderateScale(5) },
                  ]}
                >
                  Parent Account
                </Text>
                <Text
                  style={[
                    styles.childProfileSubText,
                    { fontSize: moderateScale(12) },
                  ]}
                >
                  {childrenList?.length > 0
                    ? 'Select a child profile to view progress'
                    : 'No child profiles available'}
                </Text>
              </View>
            </View>
          )}

          {/* ============================================
              LAST PLAYED CONTENT (Dynamic from API)
          ============================================ */}

          <Text style={styles.lastPlayedText}>
            {languageData?.last_played || 'Last Played'}:{' '}
            <Text style={{ color: theme.themeColor }}>
              {lastPlayedData
                ? `${lastPlayedData?.title} | ${formatPlayedTime(
                    lastPlayedData?.playedAt,
                  )}`
                : languageData?.no_content_played || 'No content played yet'}
            </Text>
          </Text>
        </View>

        {/* ============================================
            MAIN DASHBOARD CONTENT
        ============================================ */}
        <View style={{ marginTop: moderateScale(20) }}>
          {/* Parent Box with Two Main Cards */}
          <View
            style={{
              backgroundColor: theme.boxBackground,
              padding: moderateScale(15),
              borderRadius: moderateScale(12),
              elevation: 1,
            }}
          >
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <TouchableOpacity
                style={styles.mainCard}
                onPress={() => props.navigation.navigate('ProgressScreen')}
              >
                <Text style={styles.mainCardTitle}>
                  {' '}
                  {languageData?.progress_report || 'Progress Report'}
                </Text>
                <CustomVectorIcons
                  name="bar-chart"
                  iconSet="Feather"
                  size={moderateScale(66)}
                  color={theme.themeColor}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mainCard}
                onPress={() => props.navigation.navigate('EditExistingScreen')}
              >
                <Text style={styles.mainCardTitle}>
                  {languageData?.next_scheduled_lesson ||
                    'Next Scheduled Lesson'}
                </Text>

                {nextLessonLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.themeColor}
                    style={{ marginTop: moderateScale(8) }}
                  />
                ) : nextScheduledLesson?.nextOccurrence ? (
                  <>
                    <Text style={styles.mainCardSubtitle}>
                      {formatNextOccurrence(nextScheduledLesson.nextOccurrence)}
                    </Text>
                    <Text style={styles.nextLessonDescription}>
                      {getRelativeTimeDescription(
                        nextScheduledLesson.nextOccurrence,
                      )}
                    </Text>
                  </>
                ) : (
                  <Text
                    style={[styles.mainCardSubtitle, { color: theme.gray }]}
                  >
                    {languageData?.no_upcoming_lessons || 'No upcoming lessons'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Banner */}
          {getbannerData && getbannerData?.length > 0 && (
            <View style={styles.fullWidthBanner}>
              <Image
                source={{ uri: getbannerData?.[1]?.image }}
                style={styles.banner}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Small Tiles (6 items) */}
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.tileCard}
              onPress={() => props.navigation.navigate('Bluethooth')}
            >
              <CustomVectorIcons
                name="bluetooth"
                iconSet="Feather"
                size={moderateScale(22)}
                color={theme.iconColor}
                style={{ marginRight: moderateScale(10) }}
              />
              <Text style={styles.tileText}>
                {languageData?.connect_device || 'Connect Device'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tileCard}
              onPress={() => props.navigation.navigate('Bluethooth')}
            >
              <CustomVectorIcons
                name="settings"
                iconSet="Feather"
                size={moderateScale(22)}
                color={theme.iconColor}
                style={{ marginRight: moderateScale(10) }}
              />
              <Text style={styles.tileText}>
                {languageData?.device_management || 'Device Management'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.tileCard}
              onPress={() => props.navigation.navigate('WhosWatching')}
            >
              <CustomVectorIcons
                name="users"
                iconSet="Feather"
                size={moderateScale(22)}
                color={theme.iconColor}
                style={{ marginRight: moderateScale(10) }}
              />
              <Text style={styles.tileText}>
                {languageData?.manage_profiles || 'Manage Profiles'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tileCard}
              onPress={() => props.navigation.navigate('ExistingSession')}
            >
              <CustomVectorIcons
                name="calendar"
                iconSet="Feather"
                size={moderateScale(22)}
                color={theme.iconColor}
                style={{ marginRight: moderateScale(10) }}
              />
              <Text style={styles.tileText}>
                {languageData?.set_schedule || 'Set Schedule'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.tileCard}
              onPress={() => props.navigation.navigate('ViewProgress')}
            >
              <CustomVectorIcons
                name="trending-up"
                iconSet="Feather"
                size={moderateScale(22)}
                color={theme.iconColor}
                style={{ marginRight: moderateScale(10) }}
              />
              <Text style={styles.tileText}>
                {languageData?.view_progress || 'View Progress'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tileCard}
              onPress={() => props.navigation.navigate('ContentSettingsScreen')}
            >
              <CustomVectorIcons
                name="settings"
                iconSet="Feather"
                size={moderateScale(22)}
                color={theme.iconColor}
                style={{ marginRight: moderateScale(10) }}
              />
              <Text style={styles.tileText}>
                {languageData?.content_settings || 'Content Settings'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Enter Child Mode Button */}
          <View style={{ marginTop: moderateScale(20) }}>
            <CustomButton
              text={languageData?.enter_child_mode || 'Enter Child Mode'}
              backgroundColor={theme.themeColor}
              onPress={() => {
                if (selectedChild) {
                  props.navigation.navigate('ProgressScreen', {
                    childId: selectedChild._id,
                    childName: selectedChild.username,
                  });
                } else {
                  setChildProfileModal(true);
                }
              }}
              height={moderateScale(45)}
              style={{ borderRadius: moderateScale(12) }}
            />
          </View>
        </View>

        {/* History Section */}
        <View style={styles.section}>
          {renderHistoryHeader()}

          {history.length > 0 ? (
            <FlatList
              data={history}
              renderItem={renderHistoryItem}
              keyExtractor={item => `history-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              ListFooterComponent={renderHistoryFooter}
              onEndReached={loadMoreHistory}
              onEndReachedThreshold={0.5}
            />
          ) : (
            renderEmptyHistory()
          )}
        </View>
      </ScrollView>

      {/* Child Selection Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={childProfileModal}
        onRequestClose={() => {
          setChildProfileModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => {
                setChildProfileModal(false);
              }}
            >
              <CustomVectorIcons
                name="close"
                type="AntDesign"
                size={moderateScale(25)}
                color={theme.white}
              />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {languageData?.select_child_modal || 'Select Child'}
            </Text>

            <FlatList
              data={childrenList}
              keyExtractor={item => `child-${item._id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.childItem}
                  onPress={() => {
                    setSelectedChild(item);
                    setChildProfileModal(false);
                    // Fetch analytics, history, and next scheduled lesson for selected child
                    if (item._id) {
                      fetchLastPlayedContent(item._id);
                      fetchChildHistory(1, true);
                      fetchNextScheduledLesson(item._id);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <CustomImageComponent
                    source={
                      item?.profilePictureUrl || item?.avatar
                        ? { uri: item.profilePictureUrl || item.avatar }
                        : IMAGES.user5
                    }
                    height={moderateScale(40)}
                    width={moderateScale(40)}
                    resizeMode="cover"
                    style={{
                      borderRadius: moderateScale(20),
                      marginRight: moderateScale(10),
                    }}
                  />
                  <Text style={styles.modalNameText}>{item?.username}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text
                  style={{
                    textAlign: 'center',
                    padding: 20,
                    color: theme.gray,
                  }}
                >
                  {languageData?.no_child_profiles ||
                    'No child profiles available'}
                </Text>
              }
            />
          </View>
        </View>
      </Modal>

      <CustomBottomBar navigation={props.navigation} />
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      marginTop: moderateScale(20),
    },
    scrollContent: {
      padding: moderateScale(20),
      paddingBottom: moderateScale(80), // Extra padding for bottom bar
    },
    editButtonWrapper: {
      alignItems: 'flex-start',
      marginTop: moderateScale(10),
    },
    childProfileText: {
      color: theme.text,
      fontSize: moderateScale(20),
      fontFamily: FontFamily.KhulaBold,
    },
    childProfileSubText: {
      color: theme.text,
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
    },
    lastPlayedText: {
      color: theme.text,
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      marginTop: moderateScale(10),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBox: {
      width: '90%',
      backgroundColor: theme.white,
      borderRadius: moderateScale(14),
      paddingVertical: moderateScale(15),
      paddingHorizontal: moderateScale(20),
      position: 'relative',
      shadowColor: theme.black,
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      maxHeight: '80%',
    },
    childItem: {
      marginVertical: moderateScale(5),
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: moderateScale(8),
    },
    modalCloseBtn: {
      position: 'absolute',
      top: moderateScale(-15),
      right: moderateScale(-10),
      padding: moderateScale(6),
      backgroundColor: theme.themeColor,
      borderRadius: 20,
      height: moderateScale(35),
      width: moderateScale(35),
    },
    modalNameText: {
      fontSize: moderateScale(14),
      color: theme.text,
      fontFamily: FontFamily.KhulaSemiBold,
    },
    modalTitle: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaBold,
      color: theme.black,
      marginBottom: moderateScale(10),
    },
    dangerIconContainer: {
      width: moderateScale(60),
      height: moderateScale(60),
      borderRadius: moderateScale(30),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: moderateScale(5),
    },
    modalSubtitle: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.themeRed,
      marginBottom: moderateScale(10),
      textAlign: 'center',
    },
    modalDeleteButton: {
      backgroundColor: theme.themeColor,
      width: '100%',
      paddingVertical: moderateScale(12),
      borderRadius: moderateScale(10),
      alignItems: 'center',
    },
    modalDeleteButtonText: {
      color: theme.white,
      fontSize: moderateScale(15),
      fontFamily: FontFamily.KhulaSemiBold,
      fontWeight: 800,
    },
    editButton: {
      width: '100%',
      borderRadius: moderateScale(12),
    },
    section: {
      marginTop: moderateScale(20),
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: moderateScale(12),
    },
    sectionTitleContainer: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
    },
    sectionSubtitle: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.gray,
      marginTop: moderateScale(2),
    },
    viewAllText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.themeColor,
    },
    horizontalList: {
      paddingRight: moderateScale(20),
    },
    playCard: {
      marginRight: moderateScale(12),
      borderRadius: moderateScale(12),
      backgroundColor: theme.boxBackground,
      padding: moderateScale(8),
      width: moderateScale(180),
      elevation: 2,
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    playImage: {
      width: '100%',
      height: moderateScale(100),
      borderRadius: moderateScale(8),
      backgroundColor: theme.gray + '20',
    },
    durationBadge: {
      position: 'absolute',
      bottom: moderateScale(8),
      right: moderateScale(8),
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: moderateScale(6),
      paddingVertical: moderateScale(2),
      borderRadius: moderateScale(4),
    },
    durationText: {
      fontSize: moderateScale(10),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.white,
    },
    playInfoContainer: {
      marginTop: moderateScale(8),
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    playInfoContent: {
      flex: 1,
    },
    playTitleText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      marginBottom: moderateScale(2),
    },
    historyMetaContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: moderateScale(4),
    },
    historyMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    historyMetaText: {
      fontSize: moderateScale(9),
      fontFamily: FontFamily.KhulaSemiBold,
    },
    historyMenuButton: {
      padding: moderateScale(4),
      marginLeft: moderateScale(4),
    },
    emptyHistoryContainer: {
      backgroundColor: theme.boxBackground,
      padding: moderateScale(40),
      borderRadius: moderateScale(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyHistoryIcon: {
      marginBottom: moderateScale(16),
    },
    emptyHistoryText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.gray,
      textAlign: 'center',
      marginBottom: moderateScale(16),
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.themeColor + '20',
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(8),
      borderRadius: moderateScale(20),
    },
    refreshButtonText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.themeColor,
    },
    historyFooter: {
      paddingVertical: moderateScale(20),
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.gray,
      marginTop: moderateScale(8),
    },
    mainCard: {
      width: '48%',
      backgroundColor: theme.white,
      padding: moderateScale(12),
      borderRadius: moderateScale(10),
      elevation: 3,
    },
    mainCardTitle: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.textSub,
    },
    mainCardSubtitle: {
      marginTop: moderateScale(8),
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.themeColor,
    },
    nextLessonDescription: {
      fontSize: moderateScale(11),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.gray,
      marginTop: moderateScale(4),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: moderateScale(15),
    },
    tileCard: {
      width: '48%',
      backgroundColor: theme.boxbackground,
      paddingVertical: moderateScale(14),
      paddingHorizontal: moderateScale(10),
      borderRadius: moderateScale(10),
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.borderColorDynamic,
    },
    tileText: {
      fontSize: moderateScale(11),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },
    subscribtion: {
      marginTop: moderateScale(12),
    },
    tileCard2: {
      width: '99%',
      backgroundColor: theme.white,
      paddingVertical: moderateScale(14),
      paddingHorizontal: moderateScale(10),
      borderRadius: moderateScale(10),
      elevation: 2,
      flexDirection: 'row',
      alignItems: 'center',
    },
    tileText2: {
      fontSize: moderateScale(15),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },
    // fullWidthBanner: {
    //   marginBottom: moderateScale(10),
    //   borderRadius: moderateScale(12),
    //   overflow: 'hidden',
    //   position: 'relative',
    //   marginTop: moderateScale(10),
    // },
    // banner: {
    //   width: '100%',
    //   height: moderateScale(100),
    // },
    fullWidthBanner: {
      marginVertical: moderateScale(10),
      borderRadius: moderateScale(12),
      overflow: 'hidden',
      width: '100%',
      alignSelf: 'center',
    },

    banner: {
      width: '100%',
      height: moderateScale(140), // ⬅️ increased height
      resizeMode: 'contain', // ⬅️ IMPORTANT
    },
  });

export default Dashboard;
