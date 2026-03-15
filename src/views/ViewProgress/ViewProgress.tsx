/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useMemo, useCallback, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  FlatList,
  // Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import CustomVectorIcons from '@components/CustomVectorIcons';
import IMAGES from '@assets/images';
import CustomHomeHeader from '@components/CustomHomeHeader';
import createBasicStyles from 'styles';
import CustomLucideIcon from '@components/CustomLucideIcon';
import { useDispatch, useSelector } from 'react-redux';
import { getChildrenProfiles } from '@utils/Redux_api_fun';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ViewProgress = ({ navigation }: any) => {
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  const { theme } = useTheme();
  const basicStyles = createBasicStyles(theme);
  const styles = getStyles(theme);
  const dispatch = useDispatch();
  const { childrenList = [] } = useSelector((state: any) => state.data);

  const [selectedChild, setSelectedChild] = useState<any>(null);
  // const [favoriteCategories, setFavoriteCategories] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [screenTimeData, setScreenTimeData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [mostPlayedData, setMostPlayedData] = useState<any[]>([]);
  const [screenTimeLoading, setScreenTimeLoading] = useState(false);

  // Screen time tab state
  const [tab, setTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    dispatch(getChildrenProfiles());
  }, []);

  useEffect(() => {
    if (childrenList.length > 0 && !selectedChild) {
      const firstChild = childrenList[0];
      setSelectedChild(firstChild);
      fetchChildData(firstChild?._id);
    }
  }, [childrenList]);

  // Fetch screen time data when tab changes
  useEffect(() => {
    if (selectedChild?._id) {
      fetchScreenTime(selectedChild._id, tab);
    }
  }, [tab, selectedChild]);

  const fetchChildData = async (childId: string) => {
    try {
      setLoading(true);
      await Promise.all([
        fetchHistory(childId),
        fetchScreenTime(childId, tab),
        fetchProgress(childId),
        fetchMostPlayed(childId),
      ]);
    } catch (error) {
      console.log('Error fetching child data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchHistory = async (childId: string) => {
    try {
      setHistoryLoading(true);
      const url = `${ApiURL.childPlayHistory}?childId=${childId}&page=1&size=10`;
      const res = await apiRequest(url, 'GET', null, true);
      console.log('History data--', res);

      if (!res?.error && res?.data?.list) {
        setHistoryData(res.data.list);
      } else {
        setHistoryData([]);
      }
    } catch (error) {
      console.log('Error fetching history:', error);
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch screen time data from API
  const fetchScreenTime = async (
    childId: string,
    period: 'daily' | 'weekly' | 'monthly',
  ) => {
    try {
      setScreenTimeLoading(true);
      const url = `${ApiURL.screenTime}?childId=${childId}&type=${period}`;
      const res = await apiRequest(url, 'GET', null, true);
      console.log(`Screen time data for ${period}:`, res);

      if (!res?.error && res?.data) {
        setScreenTimeData(res.data);
      } else {
        // Set default empty data structure
        setScreenTimeData({
          labels: getDefaultLabels(period),
          datasets: [
            {
              label: 'Screen Time (hours)',
              data: Array(getDefaultLabels(period).length).fill(0),
            },
          ],
          totalHours: 0,
          fetchedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.log(`Error fetching ${period} screen time:`, error);
      // Set default data on error
      setScreenTimeData({
        labels: getDefaultLabels(period),
        datasets: [
          {
            label: 'Screen Time (hours)',
            data: Array(getDefaultLabels(period).length).fill(0),
          },
        ],
        totalHours: 0,
        fetchedAt: new Date().toISOString(),
      });
    } finally {
      setScreenTimeLoading(false);
    }
  };

  // Helper function to get default labels based on period
  const getDefaultLabels = (period: 'daily' | 'weekly' | 'monthly') => {
    switch (period) {
      case 'daily':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'weekly':
        // Generate last 4 weeks labels
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i * 7);
          const weekNumber = getWeekNumber(date);
          weeks.push(
            `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`,
          );
        }
        return weeks;
      case 'monthly':
        return [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
      default:
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
  };

  // Helper function to get week number
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const fetchProgress = async (childId: string) => {
    try {
      const url = `${ApiURL.progress}?childId=${childId}`;
      const res = await apiRequest(url, 'GET', null, true);
      console.log('progressdata', res);

      if (!res?.error && Array.isArray(res?.data)) {
        setProgressData(res.data);
      } else {
        setProgressData([]);
      }
    } catch (error) {
      console.log('Error fetching progress:', error);
      setProgressData([]);
    }
  };

  const fetchMostPlayed = async (childId: string) => {
    try {
      console.log('Fetching MOST PLAYED for child:', childId);

      const url = `${ApiURL.mostPlayed}?childId=${childId}`;

      const res = await apiRequest(url, 'GET', null, true);

      // console.log("Most Played API response:", res);

      if (!res?.error && Array.isArray(res?.data)) {
        setMostPlayedData(res.data);
      } else {
        setMostPlayedData([]);
      }
    } catch (error) {
      console.log('Most Played API error:', error);
      setMostPlayedData([]);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (selectedChild) {
      fetchChildData(selectedChild._id);
    }
  }, [selectedChild]);

  const handleNameSelect = useCallback((child: any) => {
    setSelectedChild(child);
    console.log('Selected child:', child);
    fetchChildData(child._id);
  }, []);

  const handleTabPress = useCallback(
    (tabKey: 'daily' | 'weekly' | 'monthly') => {
      setTab(tabKey);
      // Screen time data will be fetched automatically via useEffect
    },
    [selectedChild],
  );

  // Format screen time data for display
  const formatScreenTimeForDisplay = useCallback(() => {
    if (!screenTimeData) return { totalTime: '0h 0m', dataPoints: [] };

    // Convert total hours to hours and minutes
    const totalHours = screenTimeData.totalHours || 0;
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    const totalTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Prepare data points for bar chart
    const dataPoints =
      screenTimeData.labels?.map((label: string, index: number) => {
        const value = screenTimeData.datasets?.[0]?.data?.[index] || 0;
        return {
          label,
          value: value * 60, // Convert hours to minutes for bar height calculation
          hours: value, // Store original value in hours
        };
      }) || [];

    return { totalTime, dataPoints };
  }, [screenTimeData]);

  // Get bar data for chart based on current tab and screenTimeData
  const barData = useMemo(() => {
    if (!screenTimeData) {
      // Return default data if no screen time data
      return [
        { label: 'Mon', value: 0, hours: 0 },
        { label: 'Tue', value: 0, hours: 0 },
        { label: 'Wed', value: 0, hours: 0 },
        { label: 'Thu', value: 0, hours: 0 },
        { label: 'Fri', value: 0, hours: 0 },
        { label: 'Sat', value: 0, hours: 0 },
        { label: 'Sun', value: 0, hours: 0 },
      ];
    }

    // Get formatted data for display
    const { dataPoints } = formatScreenTimeForDisplay();

    // For weekly and monthly views, we might have fewer data points
    // Ensure we always have some data to display
    if (dataPoints.length === 0) {
      return getDefaultLabels(tab).map(label => ({
        label,
        value: 0,
        hours: 0,
      }));
    }

    return dataPoints;
  }, [screenTimeData, tab, formatScreenTimeForDisplay]);

  // Find maximum value for bar chart scaling
  const maxBarValue = useMemo(() => {
    if (barData.length === 0) return 100; // Default max
    const max = Math.max(...barData.map(item => item.value));
    return max > 0 ? max : 100; // Ensure we have a non-zero max for scaling
  }, [barData]);

  const renderProgressIcon = useCallback(
    (status: string) => {
      switch (status) {
        case 'Completed':
          return (
            <CustomVectorIcons
              name="check"
              iconSet="Feather"
              size={moderateScale(18)}
              color={theme.themeColor}
              accessibilityLabel="Completed"
            />
          );
        case 'Ongoing':
          return (
            <CustomVectorIcons
              name="circle"
              iconSet="Feather"
              size={moderateScale(18)}
              color={theme.themeColor}
              accessibilityLabel="Ongoing"
            />
          );
        case 'Pending':
          return (
            <CustomVectorIcons
              name="clock"
              iconSet="Feather"
              size={moderateScale(18)}
              color={theme.textSub}
              accessibilityLabel="Pending"
            />
          );
        default:
          return null;
      }
    },
    [theme],
  );

  const renderHistoryItem = useCallback(
    ({ item }) => (
      <View
        style={styles.playCard}
        accessibilityLabel={`History item: ${item.title}`}
      >
        <TouchableOpacity activeOpacity={0.7} accessibilityRole="button">
          <Image
            source={{
              uri:
                item.thumbnailUrls?.[0] ||
                item.categoryId?.thumbnailUrl ||
                IMAGES.user4,
            }}
            style={styles.playImage}
            accessibilityLabel={`Thumbnail for ${item.title}`}
          />
        </TouchableOpacity>

        <View style={styles.playInfoContainer}>
          <View style={styles.playTextContainer}>
            <Text
              style={[basicStyles.textStyleSmallBold, styles.playTitleText]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.title}
            </Text>
            <Text
              style={[basicStyles.textStyleExtraSmall, styles.playChannelText]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.categoryId?.title || 'Category'}
            </Text>
            <Text
              style={[basicStyles.textStyleExtraSmall, styles.playTimeText]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Played: {formatDate(item.playedAt)} •{' '}
              {Math.floor(item.playedDuration / 60)} min
            </Text>
          </View>
        </View>
      </View>
    ),
    [theme, basicStyles],
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Format last updated time from fetchedAt
  const formatLastUpdated = (fetchedAt: string) => {
    if (!fetchedAt) return 'Just now';

    const date = new Date(fetchedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.white }]}>
        <ActivityIndicator size="large" color={theme.themeColor} />
        <Text
          style={[
            basicStyles.textStyleMedium,
            { color: theme.text, marginTop: 12 },
          ]}
        >
          {languageData?.loading_progress || 'Loading progress...'}
        </Text>
      </View>
    );
  }

  const { totalTime } = formatScreenTimeForDisplay();

  return (
    <View style={[styles.container, { backgroundColor: theme.white }]}>
      <StatusBar
        backgroundColor={theme.themeColor}
        barStyle="light-content"
        translucent={false}
      />

      {/* Custom Header without search bar */}
      <View style={{ marginTop: moderateScale(-32) }}>
        <CustomHomeHeader
          onBack={() => navigation.goBack()}
          avatar={
            selectedChild?.profilePictureUrl ||
            selectedChild?.avatar ||
            IMAGES.user5
          }
          username={selectedChild?.username}
          dropdownItems={childrenList}
          onNameSelect={handleNameSelect}
          showSearch={false}
          title={languageData?.progress_title || 'Progress'}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.themeColor]}
            tintColor={theme.themeColor}
          />
        }
      >
        {/* Tabs with background color - Wrapped in View */}
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsContainer}>
            {[
              languageData?.tab_daily || 'Daily',
              languageData?.tab_weekly || 'Weekly',
              languageData?.tab_monthly || 'Monthly',
            ].map(item => {
              const key = item.toLowerCase() as 'daily' | 'weekly' | 'monthly';
              const isActive = tab === key;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => handleTabPress(key)}
                  activeOpacity={0.7}
                  style={[
                    styles.tabButton,
                    { backgroundColor: theme.themeColor },
                    isActive && [
                      styles.tabButtonActive,
                      { backgroundColor: theme.boxBackground },
                    ],
                  ]}
                  accessibilityLabel={`${item} tab`}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text
                    style={[
                      basicStyles.textStyleSmall,
                      { color: theme.textSub, includeFontPadding: false },
                      isActive && { color: theme.themeColorDark },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Screen Time Card */}
        <View style={[styles.card, { backgroundColor: theme.themeLight }]}>
          <View style={styles.screenTimeHeader}>
            <Text style={[basicStyles.textStyleLargeBold, styles.sectionTitle]}>
              {languageData?.screen_time_title || 'Screen Time'}
            </Text>

            {screenTimeLoading && (
              <ActivityIndicator size="small" color={theme.themeColor} />
            )}
          </View>

          <View style={styles.dateRow}>
            <Text
              style={[basicStyles.textStyleSmallBold, { color: theme.text }]}
            >
              {tab === 'daily'
                ? languageData?.today_label || 'Today, '
                : tab === 'weekly'
                ? languageData?.this_week_label || 'This Week, '
                : languageData?.this_month_label || 'This Month, '}

              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text
              style={[
                basicStyles.textStyleExtraSmall,
                { color: theme.textSub },
              ]}
            >
              {languageData?.updated_label || 'Updated'}{' '}
              {screenTimeData
                ? formatLastUpdated(screenTimeData.fetchedAt)
                : languageData?.just_now || 'just now'}
            </Text>
          </View>

          <Text
            style={[basicStyles.textStyleExtraLargeBold, { color: theme.text }]}
          >
            {totalTime}
          </Text>

          {/* Bar Chart */}
          {screenTimeLoading ? (
            <View style={styles.barChartLoadingContainer}>
              <ActivityIndicator size="large" color={theme.themeColor} />
              <Text
                style={[
                  basicStyles.textStyleSmall,
                  { color: theme.textSub, marginTop: 8 },
                ]}
              >
                {languageData?.loading_chart || 'Loading chart data...'}
              </Text>
            </View>
          ) : (
            <View style={styles.barChartRow}>
              {barData.map(bar => {
                // Calculate bar height (max 100px height for visualization)
                const height =
                  bar.value > 0
                    ? Math.max(
                        4,
                        (bar.value / maxBarValue) * moderateScale(100),
                      )
                    : 4;

                return (
                  <View style={styles.singleBarWrapper} key={bar.label}>
                    <View style={styles.barValueContainer}>
                      <Text
                        style={[
                          basicStyles.textStyleExtraSmall,
                          styles.barValueText,
                        ]}
                      >
                        {bar.hours > 0 ? bar.hours.toFixed(1) : 0}h
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.bar,
                        {
                          height,
                          backgroundColor:
                            bar.value > 0
                              ? theme.themeColor
                              : theme.textBoxBackground,
                        },
                      ]}
                      accessibilityLabel={`${bar.label}: ${bar.hours.toFixed(
                        1,
                      )} hours`}
                    />
                    <Text
                      style={[
                        basicStyles.textStyleExtraSmall,
                        { color: theme.text, marginTop: 4 },
                      ]}
                    >
                      {bar.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Period Summary */}
          {screenTimeData && (
            <View style={styles.periodSummary}>
              <Text
                style={[basicStyles.textStyleSmall, { color: theme.textSub }]}
              >
                {tab === 'daily'
                  ? languageData?.daily_average || 'Daily average'
                  : tab === 'weekly'
                  ? languageData?.weekly_total || 'Weekly total'
                  : languageData?.monthly_total || 'Monthly total'}
                :{' '}
                <Text
                  style={[
                    basicStyles.textStyleSmallBold,
                    { color: theme.themeColor },
                  ]}
                >
                  {screenTimeData.totalHours.toFixed(2)} hours
                </Text>
              </Text>
            </View>
          )}
        </View>

        {/* Most Played */}
        <View style={[styles.card, { backgroundColor: theme.themeLight }]}>
          <Text style={[basicStyles.textStyleLargeBold, styles.sectionTitle]}>
            {languageData?.most_played_title || 'Most Played'}
          </Text>

          {mostPlayedData.length > 0 ? (
            <FlatList
              data={mostPlayedData}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: moderateScale(12) }}
              renderItem={({ item }) => {
                const thumbnail =
                  item.thumbnailUrls?.[0] ||
                  item.categoryId?.thumbnailUrl ||
                  IMAGES.user4;

                // 👉 seconds → minutes conversion
                const playedMinutes = Math.max(
                  1,
                  Math.round(item.totalPlayedDuration / 60),
                );

                return (
                  <View
                    style={{
                      width: moderateScale(100),
                      marginRight: moderateScale(10),
                      alignItems: 'center',
                    }}
                  >
                    <Image
                      source={{ uri: thumbnail }}
                      style={{
                        width: moderateScale(80),
                        height: moderateScale(80),
                        borderRadius: moderateScale(10),
                        backgroundColor: theme.textBoxBackground,
                      }}
                    />

                    <Text
                      numberOfLines={1}
                      style={[
                        basicStyles.textStyleExtraSmallBold,
                        {
                          color: theme.text,
                          marginTop: 6,
                          textAlign: 'center',
                          width: '100%',
                        },
                      ]}
                    >
                      {item.title}
                    </Text>

                    {/* ✅ Minutes below title */}
                    <Text
                      style={[
                        basicStyles.textStyleExtraSmall,
                        { color: theme.textSub, marginTop: 2 },
                      ]}
                    >
                      {languageData?.minutes_played?.replace(
                        '{{count}}',
                        playedMinutes,
                      ) || `${playedMinutes} min played`}
                    </Text>
                  </View>
                );
              }}
            />
          ) : (
            <Text style={{ color: theme.textSub, textAlign: 'center' }}>
              {languageData?.no_most_played || 'No most played data available'}
            </Text>
          )}
        </View>

        {/* Progress */}
        <View style={[styles.card, { backgroundColor: theme.themeLight }]}>
          <Text style={[basicStyles.textStyleLargeBold, styles.sectionTitle]}>
            {languageData?.progress_section_title || 'Progress'}
          </Text>

          {progressData && progressData.length > 0 ? (
            progressData.map((item: any) => (
              <View
                key={item.categoryId}
                style={[styles.progressItem, { backgroundColor: theme.white }]}
              >
                <Image
                  source={{ uri: item.thumbnailUrl || IMAGES.book }}
                  style={styles.progressIcon}
                />

                <View style={styles.progressContent}>
                  <Text
                    style={[
                      basicStyles.textStyleMediumBold,
                      { color: theme.themeColor },
                    ]}
                  >
                    {item.title}
                  </Text>

                  {/* Progress bar */}
                  <View style={styles.itemProgressContainer}>
                    <View style={styles.itemProgressBarBackground}>
                      <View
                        style={[
                          styles.itemProgressBarFill,
                          {
                            width: `${item.progressPercent}%`,
                            backgroundColor:
                              item.status === 'Completed'
                                ? theme.themeColor
                                : item.status === 'Ongoing'
                                ? theme.themeColor
                                : theme.textSub,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        basicStyles.textStyleExtraSmallBold,
                        styles.progressPercentage,
                        {
                          color:
                            item.status === 'Completed'
                              ? theme.themeColor
                              : item.status === 'Ongoing'
                              ? theme.themeColor
                              : theme.textSub,
                        },
                      ]}
                    >
                      {item.progressPercent}%
                    </Text>
                  </View>
                </View>

                <View style={styles.statusContainer}>
                  <Text
                    style={[
                      basicStyles.textStyleExtraSmallBold,
                      {
                        color:
                          item.status === 'Completed'
                            ? theme.themeColor
                            : item.status === 'Ongoing'
                            ? theme.themeColor
                            : theme.textSub,
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                  {renderProgressIcon(item.status)}
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: theme.textSub, textAlign: 'center' }}>
              {languageData?.no_progress || 'No progress available'}
            </Text>
          )}
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                basicStyles.textStyleLargeBold,
                { color: theme.themeColor },
              ]}
            >
              {languageData?.history_title || 'History'}
            </Text>
          </View>

          {historyLoading ? (
            <View style={styles.historyLoadingContainer}>
              <ActivityIndicator size="small" color={theme.themeColor} />
            </View>
          ) : historyData.length > 0 ? (
            <FlatList
              data={historyData}
              renderItem={renderHistoryItem}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              snapToInterval={moderateScale(180) + moderateScale(12)}
              decelerationRate="fast"
              bounces={false}
            />
          ) : (
            <View style={styles.emptyHistoryContainer}>
              <CustomLucideIcon
                name="History"
                size={moderateScale(48)}
                color={theme.textSub}
              />
              <Text
                style={[
                  basicStyles.textStyleSmall,
                  { color: theme.textSub, marginTop: 12 },
                ]}
              >
                {languageData?.no_history_for_child ||
                  `No history available for ${
                    selectedChild?.username || 'this child'
                  }`}

                {selectedChild?.username || 'this child'}
              </Text>
            </View>
          )}
        </View>

        {/* Export Button */}
        {/* <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.exportBtn, { backgroundColor: theme.themeColor }]}
          onPress={() => {
            // Handle export functionality
            console.log('Export progress for:', selectedChild?.username);
          }}
          accessibilityLabel="Export as PDF"
          accessibilityRole="button"
        >
          <Text style={[basicStyles.textStyleMediumBold, styles.exportText]}>
            Export as PDF
          </Text>
        </TouchableOpacity> */}
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: moderateScale(30),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabsWrapper: {
      backgroundColor: theme.themeColor,
      paddingVertical: moderateScale(12),
      borderRadius: moderateScale(12),
      marginLeft: moderateScale(10),
      marginRight: moderateScale(10),
      marginTop: moderateScale(22),
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
    tabsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginHorizontal: moderateScale(16),
      gap: moderateScale(8),
    },
    tabButton: {
      paddingVertical: moderateScale(8),
      paddingHorizontal: moderateScale(24),
      borderRadius: moderateScale(20),
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: moderateScale(2),
        },
        android: {
          elevation: 1,
        },
      }),
    },
    tabButtonActive: {
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: moderateScale(3),
        },
        android: {
          elevation: 2,
        },
      }),
    },
    scrollContent: {
      paddingBottom: moderateScale(30),
    },
    card: {
      marginHorizontal: moderateScale(16),
      marginTop: moderateScale(12),
      padding: moderateScale(16),
      borderRadius: moderateScale(16),
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: moderateScale(4),
        },
        android: {
          elevation: 2,
        },
      }),
    },
    screenTimeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: moderateScale(12),
    },
    sectionTitle: {
      marginBottom: moderateScale(12),
      includeFontPadding: false,
    },
    dateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: moderateScale(8),
    },
    barChartRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginTop: moderateScale(24),
      height: moderateScale(140),
      paddingHorizontal: moderateScale(4),
    },
    barChartLoadingContainer: {
      height: moderateScale(140),
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: moderateScale(24),
    },
    singleBarWrapper: {
      alignItems: 'center',
      flex: 1,
      position: 'relative',
    },
    barValueContainer: {
      position: 'absolute',
      top: -moderateScale(20),
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    barValueText: {
      color: theme.text,
      fontWeight: '600',
      fontSize: moderateScale(9),
    },
    bar: {
      width: moderateScale(16),
      borderRadius: moderateScale(8),
      minHeight: moderateScale(4),
    },
    periodSummary: {
      marginTop: moderateScale(16),
      paddingTop: moderateScale(12),
      borderTopWidth: 1,
      borderTopColor: theme.textBoxBorder,
      alignItems: 'center',
    },
    mostPlayedRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: moderateScale(12),
    },
    mostPlayedItem: {
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(12),
      borderRadius: moderateScale(12),
      flex: 1,
      marginHorizontal: moderateScale(4),
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: moderateScale(2),
        },
        android: {
          elevation: 1,
        },
      }),
    },
    progressItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: moderateScale(12),
      padding: moderateScale(12),
      borderRadius: moderateScale(12),
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: moderateScale(2),
        },
        android: {
          elevation: 1,
        },
      }),
    },
    progressIcon: {
      width: moderateScale(40),
      height: moderateScale(40),
      resizeMode: 'contain',
      marginRight: moderateScale(12),
    },
    progressContent: {
      flex: 1,
      marginRight: moderateScale(8),
    },
    itemProgressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: moderateScale(4),
    },
    itemProgressBarBackground: {
      flex: 1,
      height: moderateScale(4),
      backgroundColor: theme.textBoxBackground,
      borderRadius: moderateScale(2),
      marginRight: moderateScale(8),
      overflow: 'hidden',
    },
    itemProgressBarFill: {
      height: '100%',
      borderRadius: moderateScale(2),
    },
    progressPercentage: {
      minWidth: moderateScale(32),
      textAlign: 'right',
      includeFontPadding: false,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(8),
    },
    historySection: {
      marginTop: moderateScale(20),
      marginHorizontal: moderateScale(16),
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: moderateScale(12),
    },
    historyLoadingContainer: {
      height: moderateScale(140),
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyHistoryContainer: {
      height: moderateScale(140),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.themeLight,
      borderRadius: moderateScale(12),
      padding: moderateScale(16),
    },
    horizontalList: {
      paddingRight: moderateScale(16),
    },
    playCard: {
      width: moderateScale(180),
      marginRight: moderateScale(12),
      borderRadius: moderateScale(12),
    },
    playImage: {
      width: moderateScale(180),
      height: moderateScale(100),
      borderRadius: moderateScale(8),
      backgroundColor: theme.textBoxBackground,
    },
    playInfoContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: moderateScale(8),
      justifyContent: 'space-between',
    },
    playTextContainer: {
      flex: 1,
      marginRight: moderateScale(8),
    },
    playTitleText: {
      color: theme.grayLight,
      includeFontPadding: false,
    },
    playChannelText: {
      color: theme.textSub,
      marginTop: moderateScale(2),
      includeFontPadding: false,
    },
    playTimeText: {
      color: theme.textSub,
      marginTop: moderateScale(2),
      fontSize: moderateScale(10),
      includeFontPadding: false,
    },
    menuButton: {
      padding: moderateScale(4),
    },
    exportBtn: {
      height: moderateScale(48),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: moderateScale(12),
      marginHorizontal: moderateScale(16),
      marginTop: moderateScale(24),
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: moderateScale(6),
        },
        android: {
          elevation: 4,
        },
      }),
    },
    exportText: {
      color: theme.white,
      includeFontPadding: false,
    },
  });

export default ViewProgress;
