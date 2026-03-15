/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Platform,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomHeader from '@components/CustomHeader';
import CustomVectorIcons from '@components/CustomVectorIcons';
import IMAGES from '@assets/images';
import createBasicStyles from 'styles';
import { useDispatch, useSelector } from 'react-redux';
import { getbanner, getProfile } from '@utils/Redux_api_fun';
import ChildBottomBar from '@components/ChildBottomBar';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { useSocket } from 'context/SocketContext';
import { useFocusEffect } from '@react-navigation/native';
import { useBluetooth } from '@components/BluetoothContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { isBluetoothEnabled, connectionStatus, bleReady }: any =
    useBluetooth();
  const dispatch = useDispatch<any>();
  const [favoriteCategories, setFavoriteCategories] = useState([]);
  const socketRef = useSocket();
  const [learningCategories, setLearningCategories] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [bannerAutoPlay, setBannerAutoPlay] = useState(true);
  const [loading, setLoading] = useState({
    favorites: false,
    learning: false,
    notifications: false,
  });

  const { getprofiledata, getbannerData } = useSelector(
    (state: any) => state.data,
  );

  console.log(
    'getprofiledatagetprofiledatagetprofiledatagetprofiledatagetprofiledata',
    getprofiledata,
  );

  useEffect(() => {
    const initializeData = async () => {
      try {
        dispatch(getbanner());
        dispatch(getProfile());
        await fetchFavoriteCategories();
        await fetchLearningModule();
        await fetchNotificationCount();
      } catch (error) {
        console.log('Error initializing data:', error);
      }
    };

    initializeData();
  }, []);

  // Socket connection handling
  useEffect(() => {
    if (!socketRef?.current) {
      console.log('🔌 Socket not initialized');
      return;
    }

    const onConnect = () => {
      console.log('✅ Socket connected');
    };

    const onDisconnect = (reason: any) => {
      console.log('❌ Socket disconnected:', reason);
    };

    socketRef.current.on('connect', onConnect);
    socketRef.current.on('disconnect', onDisconnect);

    return () => {
      socketRef.current?.off('connect', onConnect);
      socketRef.current?.off('disconnect', onDisconnect);
    };
  }, [socketRef]);

  // Banner auto-slide effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (bannerAutoPlay && getbannerData && getbannerData.length > 1) {
      interval = setInterval(() => {
        setCurrentBannerIndex(prev =>
          prev === getbannerData.length - 1 ? 0 : prev + 1,
        );
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bannerAutoPlay, getbannerData]);

  const { theme } = useTheme();
  const styles = getStyles(theme);
  const basicStyles = createBasicStyles(theme);

  const fetchFavoriteCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, favorites: true }));
      const url = `${ApiURL.favouriteChannel}?page=1&size=50`;
      const res = await apiRequest(url, 'GET', null, true);

      if (!res?.error && res?.data?.list) {
        console.log('favuoritecontent');
        setFavoriteCategories(res.data.list || []);
      } else {
        setFavoriteCategories([]);
      }
    } catch (error) {
      console.log('Error fetching favorite categories:', error);
      setFavoriteCategories([]);
    } finally {
      setLoading(prev => ({ ...prev, favorites: false }));
    }
  };

  const fetchLearningModule = async () => {
    try {
      setLoading(prev => ({ ...prev, learning: true }));
      const url = `${ApiURL.categories_users_list}?page=1&size=10`;
      const res = await apiRequest(url, 'GET', null, true);

      if (!res?.error && res?.data?.list) {
        console.log(
          'es?.data?.listes?.data?.listes?.data?.list',
          res?.data?.list,
        );
        setLearningCategories(res.data.list || []);
      } else {
        setLearningCategories([]);
      }
    } catch (error) {
      console.log('Error fetching learning categories:', error);
      setLearningCategories([]);
    } finally {
      setLoading(prev => ({ ...prev, learning: false }));
    }
  };

  const fetchNotificationCount = async () => {
    try {
      setLoading(prev => ({ ...prev, notifications: true }));
      const res = await apiRequest(
        ApiURL.getNotificationsCount,
        'GET',
        null,
        true,
      );

      if (!res?.error && typeof res?.data === 'number') {
        setNotificationCount(res.data);
      } else {
        setNotificationCount(0);
      }
    } catch (error) {
      console.log('❌ Notification count error:', error);
      setNotificationCount(0);
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotificationCount();
    }, []),
  );

  // Handle banner manual navigation
  const handleBannerScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (width - 32));
    setCurrentBannerIndex(index);
    setBannerAutoPlay(false);

    setTimeout(() => {
      setBannerAutoPlay(true);
    }, 10000);
  };

  // Function to render banner dots
  const renderBannerDots = () => {
    if (!getbannerData || getbannerData.length <= 1) return null;

    return (
      <View style={styles.bannerDotsContainer}>
        {getbannerData.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.bannerDot,
              currentBannerIndex === index && styles.activeBannerDot,
            ]}
            onPress={() => {
              setCurrentBannerIndex(index);
              if (bannerRef.current) {
                bannerRef.current.scrollToOffset({
                  offset: (width - 32) * index,
                  animated: true,
                });
              }
            }}
          />
        ))}
      </View>
    );
  };

  const bannerRef = React.useRef<FlatList>(null);

  // Function to get visible favorite items count
  const getVisibleFavoritesCount = () => {
    if (showAllFavorites) return favoriteCategories.length;
    return Math.min(favoriteCategories.length, 5);
  };

  // Calculate favorite box height dynamically
  const getFavoriteBoxHeight = () => {
    const visibleCount = getVisibleFavoritesCount();
    if (visibleCount === 0) return moderateScale(100); // Empty state height

    const itemsPerRow = 5;
    const rows = Math.ceil(visibleCount / itemsPerRow);
    const itemHeight = moderateScale(90); // Avatar + text + margin
    return rows * itemHeight + moderateScale(32); // Add padding
  };

  // Function to insert banner after every two learning cards
  const renderLearningContent = () => {
    const content: any = [];

    if (learningCategories.length === 0 && !loading.learning) {
      return (
        <View style={styles.emptyLearning}>
          <CustomVectorIcons
            name="book-open"
            iconSet="Feather"
            size={moderateScale(40)}
            color={theme.gray}
          />
          <Text style={styles.emptyLearningText}>
            No learning modules available
          </Text>
        </View>
      );
    }

    learningCategories.forEach((item, index) => {
      const hasContent = item?.contents?.length > 0;

      // Add learning card
      content.push(
        <TouchableOpacity
          key={`card-${item?._id}`}
          style={[styles.card, !hasContent && styles.comingSoonCard]}
          activeOpacity={hasContent ? 0.8 : 1}
          onPress={() => {
            if (hasContent) {
              navigation.navigate('ContentListScreen', {
                categoryId: item._id,
                title: item.title,
              });
            }
          }}
        >
          {/* Thumbnail */}
          {item?.thumbnailUrl ? (
            <View style={styles.thumbnailContainer}>
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={styles.categoryThumbnail}
                resizeMode="cover"
              />
              {!hasContent && (
                <View style={styles.comingSoonOverlay}>
                  <Text style={styles.comingSoonText}>COMING SOON</Text>
                </View>
              )}
            </View>
          ) : (
            <View
              style={[styles.categoryThumbnail, styles.placeholderThumbnail]}
            >
              <CustomVectorIcons
                name="image"
                iconSet="Feather"
                size={moderateScale(40)}
                color={theme.gray}
              />
            </View>
          )}

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              {item?.title || 'Untitled Category'}
            </Text>

            <Text
              style={[
                styles.cardSubTitle,
                !hasContent && styles.comingSoonSubtitle,
              ]}
            >
              {hasContent
                ? `${item.contents.length} Activities`
                : 'Coming Soon'}
            </Text>

            {hasContent ? (
              <TouchableOpacity
                style={styles.playButton}
                onPress={() =>
                  navigation.navigate('ContentListScreen', {
                    categoryId: item._id,
                    title: item.title,
                  })
                }
              >
                <Text style={styles.playText}>Start Learning</Text>
                <CustomVectorIcons
                  name="play-circle"
                  iconSet="FontAwesome"
                  size={moderateScale(18)}
                  color={theme.white}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.comingSoonButton}>
                <Text style={styles.comingSoonButtonText}>Available Soon</Text>
                <CustomVectorIcons
                  name="clock"
                  iconSet="Feather"
                  size={moderateScale(18)}
                  color={theme.gray}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>,
      );

      // Insert banner after every 2 cards, but not after the last card
      if (
        (index + 1) % 2 === 0 &&
        index < learningCategories.length - 1 &&
        getbannerData &&
        getbannerData.length > 0
      ) {
        content.push(
          <View
            key={`banner-after-${index}`}
            style={styles.bannerCarouselContainer}
          >
            <FlatList
              ref={bannerRef}
              data={getbannerData}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.bannerItem} activeOpacity={0.9}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.bannerImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              keyExtractor={(item, bannerIndex) => `banner-${bannerIndex}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleBannerScroll}
              scrollEventThrottle={16}
              onScrollBeginDrag={() => setBannerAutoPlay(false)}
              onMomentumScrollEnd={event => {
                const contentOffsetX = event.nativeEvent.contentOffset.x;
                const bannerIndex = Math.round(contentOffsetX / (width - 32));
                setCurrentBannerIndex(bannerIndex);
              }}
            />
            {renderBannerDots()}
          </View>,
        );
      }
    });

    return content;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <CustomHeader
        type="profileSearch"
        userName={getprofiledata?.username || 'User'}
        showProfile
        onSearchPress={() => navigation.navigate('SearchScreen')}
        onProfilePress={() => navigation.navigate('ChildProfile')}
        showNotifications
        notificationBadgeCount={notificationCount}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 🔵 BLUETOOTH STATUS MESSAGE */}
        {/* {!isBluetoothEnabled && (
          <View style={styles.bluetoothWarning}>
            <CustomVectorIcons
              name="bluetooth-off"
              iconSet="Feather"
              size={moderateScale(18)}
              color="#fff"
            />
            <Text style={styles.bluetoothWarningText}>
              Bluetooth is OFF. Please turn on Bluetooth to connect Dara Buddy.
            </Text>
          </View>
        )} */}

        {/* 🔵 BLUETOOTH STATUS MESSAGE */}
        {bleReady && !isBluetoothEnabled && (
          <View style={styles.bluetoothWarning}>
            <CustomVectorIcons
              name="bluetooth-off"
              iconSet="Feather"
              size={moderateScale(18)}
              color="#fff"
            />
            <Text style={styles.bluetoothWarningText}>
              Bluetooth is OFF. Please turn on Bluetooth to connect Dara Buddy.
            </Text>
          </View>
        )}

        {bleReady && isBluetoothEnabled && connectionStatus !== 'connected' && (
          <View style={styles.bluetoothInfo}>
            <CustomVectorIcons
              name="bluetooth"
              iconSet="Feather"
              size={moderateScale(18)}
              color="#fff"
            />
            <Text style={styles.bluetoothInfoText}>
              Dara Buddy not connected. Tap to connect.
            </Text>
          </View>
        )}

        {/* {isBluetoothEnabled && connectionStatus !== 'connected' && (
          <View style={styles.bluetoothInfo}>
            <CustomVectorIcons
              name="bluetooth"
              iconSet="Feather"
              size={moderateScale(18)}
              color="#fff"
            />
            <Text style={styles.bluetoothInfoText}>
              Dara Buddy not connected. Tap to connect.
            </Text>
          </View>
        )} */}

        {/* CONNECTED CARD */}
        <TouchableOpacity
          style={styles.connectedCard}
          onPress={() => navigation.navigate('Bluethooth')}
        >
          <View style={styles.connectedInfo}>
            <Text style={styles.connectedTitle}>Smart Dara Buddy</Text>

            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      isBluetoothEnabled && connectionStatus === 'connected'
                        ? '#4CAF50'
                        : '#FB8C00',
                  },
                ]}
              />
              <Text style={styles.connectedStatus}>
                {!isBluetoothEnabled
                  ? 'Bluetooth OFF'
                  : connectionStatus === 'connected'
                  ? 'Connected'
                  : 'Not Connected'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* FAVORITE CHANNEL */}
        <View style={styles.favoriteChannelSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favorite Channel</Text>
            {favoriteCategories?.length > 5 && (
              <TouchableOpacity
                onPress={() => setShowAllFavorites(!showAllFavorites)}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>
                  {showAllFavorites
                    ? 'Show Less'
                    : `See All (${favoriteCategories.length})`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View
            style={[
              styles.favoriteChannelBox,
              { height: getFavoriteBoxHeight() },
            ]}
          >
            {loading.favorites ? (
              <ActivityIndicator size="small" color={theme.white} />
            ) : favoriteCategories?.length > 0 ? (
              <View style={styles.favoriteGrid}>
                {favoriteCategories
                  .filter((_, index) => (showAllFavorites ? true : index < 5))
                  .map((item, index) => (
                    <View key={item?._id || index} style={styles.channelItem}>
                      <Image
                        source={
                          item?.thumbnailUrl
                            ? { uri: item.thumbnailUrl }
                            : IMAGES.user4
                        }
                        style={styles.channelAvatar}
                        defaultSource={IMAGES.user4}
                      />
                      <Text style={styles.channelName} numberOfLines={1}>
                        {item?.title || 'Channel'}
                      </Text>
                    </View>
                  ))}
              </View>
            ) : (
              <View style={styles.emptyFavorite}>
                <CustomVectorIcons
                  name="heart-off"
                  iconSet="MaterialCommunityIcons"
                  size={moderateScale(28)}
                  color={theme.white}
                />
                <Text style={styles.emptyFavoriteText}>
                  No Favourite Channel
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* LEARNING CATEGORIES WITH BANNERS INSERTED */}
        <View style={styles.learningSection}>
          {loading.learning ? (
            <ActivityIndicator
              size="small"
              color={theme.themeColor}
              style={styles.loadingIndicator}
            />
          ) : (
            renderLearningContent()
          )}
        </View>

        {/* TRY OUR AI BANNER (Only show if there are learning categories) */}
        {learningCategories.length > 0 && (
          <TouchableOpacity
            style={styles.aiBanner}
            // onPress={() => navigation.navigate('AIScreen')}
          >
            <View style={styles.aiIconLeft}>
              <Image source={IMAGES.child2} style={styles.aiEmoji2} />
            </View>
            <Text style={styles.aiBannerText}>TRY OUR AI</Text>
            <View style={styles.aiIconRight}>
              <Image source={IMAGES.child1} style={styles.aiEmoji} />
            </View>
          </TouchableOpacity>
        )}

        {/* REWARDS BUTTON */}
        <View style={styles.reward}>
          <TouchableOpacity
            style={[styles.rewardsBox, { backgroundColor: theme.themeColor }]}
            onPress={() => navigation.navigate('RewardsScreen')}
            activeOpacity={0.7}
            accessibilityLabel="View your rewards"
            accessibilityRole="button"
          >
            <Image source={IMAGES.star} style={styles.star} />

            <Text
              style={[basicStyles.textStyleMediumBold, styles.rewardsLabel]}
            >
              Your Rewards
            </Text>

            <View style={[styles.viewBtn, { backgroundColor: theme.white }]}>
              <Text
                style={[
                  basicStyles.textStyleSmallBold,
                  styles.viewText,
                  { color: theme.themeColor },
                ]}
              >
                View
              </Text>
              <CustomVectorIcons
                name="chevron-right"
                iconSet="Feather"
                size={moderateScale(16)}
                color={theme.themeColor}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ChildBottomBar navigation={navigation} />
    </SafeAreaView>
  );
};

export default HomeScreen;

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F3F4FA',
    },
    scrollContent: {
      paddingBottom: moderateScale(80),
    },
    connectedCard: {
      backgroundColor: theme.white,
      margin: moderateScale(16),
      borderRadius: moderateScale(14),
      padding: moderateScale(14),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    connectedInfo: {
      flex: 1,
    },
    connectedTitle: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.black,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: moderateScale(4),
    },
    statusDot: {
      width: moderateScale(8),
      height: moderateScale(8),
      borderRadius: moderateScale(4),
      backgroundColor: '#4CAF50',
      marginRight: moderateScale(6),
    },
    connectedStatus: {
      fontSize: moderateScale(12),
      color: '#4CAF50',
      fontFamily: FontFamily.KhulaSemiBold,
    },
    favoriteChannelSection: {
      marginTop: moderateScale(20),
      marginHorizontal: moderateScale(16),
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: moderateScale(12),
    },
    sectionTitle: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaBold,
      color: theme.black,
    },
    seeAllText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.themeColor,
    },
    favoriteChannelBox: {
      paddingVertical: moderateScale(16),
      paddingHorizontal: moderateScale(12),
      borderRadius: moderateScale(20),
      backgroundColor: theme.themeColor,
      minHeight: moderateScale(100),
    },
    favoriteGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    channelItem: {
      alignItems: 'center',
      width: (width - 64) / 5,
      marginBottom: moderateScale(8),
    },
    channelAvatar: {
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      marginBottom: moderateScale(4),
      backgroundColor: theme.white,
    },
    channelName: {
      fontSize: moderateScale(10),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.white,
      textAlign: 'center',
    },
    learningSection: {
      marginTop: moderateScale(10),
    },
    card: {
      backgroundColor: theme.white,
      marginHorizontal: moderateScale(16),
      marginBottom: moderateScale(16),
      borderRadius: moderateScale(16),
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: moderateScale(6),
        },
        android: {
          elevation: 2,
        },
      }),
    },
    comingSoonCard: {
      opacity: 0.7,
    },
    thumbnailContainer: {
      position: 'relative',
    },
    categoryThumbnail: {
      width: '100%',
      height: moderateScale(160),
    },
    placeholderThumbnail: {
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    comingSoonOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    comingSoonText: {
      color: theme.white,
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaBold,
      letterSpacing: 1,
    },
    cardContent: {
      padding: moderateScale(16),
    },
    cardTitle: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaBold,
      color: theme.black,
      marginBottom: moderateScale(4),
    },
    cardSubTitle: {
      fontSize: moderateScale(14),
      color: theme.textSub,
      fontFamily: FontFamily.KhulaRegular,
      marginBottom: moderateScale(16),
    },
    comingSoonSubtitle: {
      color: theme.orange || '#FF9800',
    },
    playButton: {
      backgroundColor: theme.themeColor,
      borderRadius: moderateScale(10),
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(16),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playText: {
      color: theme.white,
      fontFamily: FontFamily.KhulaBold,
      fontSize: moderateScale(14),
      marginRight: moderateScale(8),
    },
    comingSoonButton: {
      backgroundColor: theme.lightGray || '#f5f5f5',
      borderRadius: moderateScale(10),
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(16),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    comingSoonButtonText: {
      color: theme.gray || '#9e9e9e',
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(14),
      marginRight: moderateScale(8),
    },
    aiBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.themeColor,
      marginHorizontal: moderateScale(16),
      marginBottom: moderateScale(20),
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(20),
      borderRadius: moderateScale(12),
    },
    aiIconLeft: {
      width: moderateScale(60),
      height: moderateScale(60),
      borderRadius: moderateScale(20),
      backgroundColor: theme.white,
      justifyContent: 'center',
      alignItems: 'center',
    },
    aiIconRight: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      backgroundColor: theme.white,
      justifyContent: 'center',
      alignItems: 'center',
    },
    aiEmoji: {
      width: moderateScale(25),
      height: moderateScale(25),
    },
    aiEmoji2: {
      width: moderateScale(57),
      height: moderateScale(57),
    },
    aiBannerText: {
      fontSize: moderateScale(20),
      fontFamily: FontFamily.KhulaBold,
      color: theme.white,
      letterSpacing: moderateScale(2),
    },
    bannerCarouselContainer: {
      marginHorizontal: moderateScale(16),
      marginBottom: moderateScale(20),
      borderRadius: moderateScale(12),
      overflow: 'hidden',
      position: 'relative',
    },
    bannerItem: {
      width: width - 32,
      height: moderateScale(140),
    },
    bannerImage: {
      width: '100%',
      height: '100%',
      borderRadius: moderateScale(12),
    },
    bannerDotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: moderateScale(10),
      left: 0,
      right: 0,
    },
    bannerDot: {
      width: moderateScale(8),
      height: moderateScale(8),
      borderRadius: moderateScale(4),
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      marginHorizontal: moderateScale(4),
    },
    activeBannerDot: {
      backgroundColor: theme.white,
      width: moderateScale(20),
    },
    rewardsBox: {
      marginTop: moderateScale(18),
      padding: moderateScale(16),
      borderRadius: moderateScale(14),
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateScale(25),
      ...Platform.select({
        ios: {
          shadowColor: theme.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: moderateScale(5),
        },
        android: {
          elevation: 3,
        },
      }),
    },
    rewardsLabel: {
      marginLeft: moderateScale(12),
      flex: 1,
      color: theme.white,
    },
    viewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(8),
      borderRadius: moderateScale(8),
    },
    viewText: {
      marginRight: moderateScale(4),
    },
    reward: {
      marginHorizontal: moderateScale(16),
    },
    star: {
      width: 54,
      height: 53,
    },
    emptyFavorite: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: moderateScale(20),
    },
    emptyFavoriteText: {
      marginTop: moderateScale(6),
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.white,
    },
    emptyLearning: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: moderateScale(40),
      marginHorizontal: moderateScale(16),
    },
    emptyLearningText: {
      marginTop: moderateScale(12),
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.gray,
    },
    loadingIndicator: {
      marginVertical: moderateScale(20),
    },
    bluetoothWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#E53935', // red
      marginHorizontal: moderateScale(16),
      marginTop: moderateScale(10),
      padding: moderateScale(12),
      borderRadius: moderateScale(10),
    },

    bluetoothWarningText: {
      color: '#fff',
      marginLeft: moderateScale(8),
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaSemiBold,
    },

    bluetoothInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FB8C00', // orange
      marginHorizontal: moderateScale(16),
      marginTop: moderateScale(10),
      padding: moderateScale(12),
      borderRadius: moderateScale(10),
    },

    bluetoothInfoText: {
      color: '#fff',
      marginLeft: moderateScale(8),
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaSemiBold,
    },
  });
