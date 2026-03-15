/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@theme/themeContext';
import CustomVectorIcons from '@components/CustomVectorIcons';
import IMAGES from '@assets/images';
import CustomBottomBar from '@components/CustomBottomBar';
import createBasicStyles from 'styles';
import CustomHomeHeader from '@components/CustomHomeHeader';
import { useDispatch, useSelector } from 'react-redux';
import { ApiURL } from '@services/ApiConstants';
import { apiRequest } from '@services/ApiServices';

const ProgressScreen = (props: any) => {
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );
  const { theme } = useTheme();
  const basicStyles = createBasicStyles(theme);
  const styles = getStyles(theme);
  const dispatch = useDispatch();
  const { childrenList = [] } = useSelector((state: any) => state?.data);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState({
    favorites: false,
    categories: false,
  });
  const [favoriteCategories, setFavoriteCategories] = useState([]);
  const [learningCategories, setLearningCategories] = useState([]);

  // Use ref to track the last successfully fetched data
  const fetchedDataCache = useRef<{
    [key: string]: { favorites: any[]; categories: any[] };
  }>({});

  const fetchFavoriteCategories = async (childId: string) => {
    try {
      console.log('Fetching favorite categories for childId:', childId);
      setLoading(prev => ({ ...prev, favorites: true }));

      // Check cache first
      if (fetchedDataCache.current[childId]?.favorites) {
        console.log('Using cached favorite data for child:', childId);
        setFavoriteCategories(fetchedDataCache.current[childId].favorites);
        setLoading(prev => ({ ...prev, favorites: false }));
        return;
      }

      // If no childId is available
      if (!childId) {
        console.log('No childId provided');
        setFavoriteCategories([]);
        fetchedDataCache.current[childId] = {
          ...fetchedDataCache.current[childId],
          favorites: [],
        };
        return;
      }

      const url = `${ApiURL.favouriteChannel}?childId=${childId}&page=1&size=50`;
      console.log('Favorite API URL:', url);

      const res = await apiRequest(url, 'GET', null, true);
      console.log('Favorite API Response:', res);

      if (!res?.error && res?.data?.list) {
        console.log('Favorite categories found:', res.data.list.length);

        let favoritesData = [];

        if (res?.data?.list?.length === 0) {
          console.log('No favorite channels for this child');
          favoritesData = [];
        } else {
          // Transform API response to match your component structure
          favoritesData = res?.data?.list.map((item: any, index: number) => ({
            id: item._id || item.id || `fav-${index}`,
            img: getImageForFavorite(item) || IMAGES.user4,
            name:
              item.name ||
              item.title ||
              item.channelName ||
              `User ${index + 1}`,
            ...item,
          }));
        }

        setFavoriteCategories(favoritesData);
        // Cache the data
        fetchedDataCache.current[childId] = {
          ...fetchedDataCache.current[childId],
          favorites: favoritesData,
        };
      } else {
        console.log('No favorite categories found or error:', res?.error);
        setFavoriteCategories([]);
        // Cache empty data
        fetchedDataCache.current[childId] = {
          ...fetchedDataCache.current[childId],
          favorites: [],
        };
      }
    } catch (error) {
      console.log('Error fetching favorite categories:', error);
      setFavoriteCategories([]);
      // Cache empty data on error
      if (selectedChild?._id) {
        fetchedDataCache.current[selectedChild._id] = {
          ...fetchedDataCache.current[selectedChild._id],
          favorites: [],
        };
      }
    } finally {
      setLoading(prev => ({ ...prev, favorites: false }));
    }
  };

  const fetchLearningModule = async (childId: string) => {
    try {
      console.log('Fetching learning modules for childId:', childId);
      setLoading(prev => ({ ...prev, categories: true }));

      // Check cache first
      if (fetchedDataCache.current[childId]?.categories) {
        console.log('Using cached learning data for child:', childId);
        setLearningCategories(fetchedDataCache.current[childId].categories);
        setLoading(prev => ({ ...prev, categories: false }));
        return;
      }

      // If no childId is available
      if (!childId) {
        console.log('No childId provided');
        setLearningCategories([]);
        fetchedDataCache.current[childId] = {
          ...fetchedDataCache.current[childId],
          categories: [],
        };
        return;
      }

      const url = `${ApiURL.categories_users_list}?childId=${childId}&page=1&size=10`;
      console.log('Learning API URL:', url);

      const res = await apiRequest(url, 'GET', null, true);
      console.log('Learning API Response:', res);

      if (!res?.error && res?.data?.list) {
        console.log('Learning categories found:', res.data.list.length);

        let categoriesData = [];

        if (res.data.list.length === 0) {
          console.log('No learning categories for this child');
          categoriesData = [];
        } else {
          // Transform API response to match your component structure
          categoriesData = res.data.list.map((item: any) => ({
            id: item._id || `cat-${Math.random()}`,
            icon: item.thumbnailUrl
              ? { uri: item.thumbnailUrl }
              : getIconForCategory(item),
            title: item.title || 'Untitled Category',
            subtitle: getCategorySubtitle(item),
            progress: calculateCategoryProgress(item),
            screen: getScreenForCategory(item.title),
            thumbnailUrl: item.thumbnailUrl,
            contents: item.contents || [],
            ...item,
          }));
        }

        setLearningCategories(categoriesData);
        // Cache the data
        fetchedDataCache.current[childId] = {
          ...fetchedDataCache.current[childId],
          categories: categoriesData,
        };
      } else {
        console.log('No learning categories found or error:', res?.error);
        setLearningCategories([]);
        // Cache empty data
        fetchedDataCache.current[childId] = {
          ...fetchedDataCache.current[childId],
          categories: [],
        };
      }
    } catch (error) {
      console.log('Error fetching learning categories:', error);
      setLearningCategories([]);
      // Cache empty data on error
      if (selectedChild?._id) {
        fetchedDataCache.current[selectedChild._id] = {
          ...fetchedDataCache.current[selectedChild._id],
          categories: [],
        };
      }
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  // Helper function to get category subtitle
  const getCategorySubtitle = (category: any) => {
    const contentCount = category.contents?.length || 0;

    if (contentCount === 0) {
      return 'No content available';
    } else if (contentCount === 1) {
      return '1 learning activity';
    } else {
      return `${contentCount} learning activities`;
    }
  };

  // Helper function to calculate category progress
  const calculateCategoryProgress = (category: any) => {
    const contents = category.contents || [];

    if (contents.length === 0) return 0;

    // Count favorite items as progress
    const favoriteCount = contents.filter(
      (content: any) => content.isFavorite,
    ).length;

    // If there are favorites, show some progress
    if (favoriteCount > 0) {
      return Math.min(0.3 + (favoriteCount / contents.length) * 0.7, 0.9);
    }

    // Default progress based on content count
    return Math.min(contents.length * 0.1, 0.8);
  };

  // Helper function to get appropriate icon based on category type
  const getIconForCategory = (category: any) => {
    const title = (category.title || '').toLowerCase();

    if (
      title.includes('alphabet') ||
      title.includes('literacy') ||
      title.includes('phonics')
    ) {
      return IMAGES.abc;
    } else if (
      title.includes('number') ||
      title.includes('math') ||
      title.includes('cognitive')
    ) {
      return IMAGES.number;
    } else if (
      title.includes('song') ||
      title.includes('music') ||
      title.includes('rhyme')
    ) {
      return IMAGES.songs;
    } else if (
      title.includes('story') ||
      title.includes('telling') ||
      title.includes('book')
    ) {
      return IMAGES.book;
    } else if (title.includes('shape') || title.includes('geometry')) {
      return IMAGES.abc;
    } else if (title.includes('vocabulary') || title.includes('language')) {
      return IMAGES.abc;
    } else if (
      title.includes('science') ||
      title.includes('stem') ||
      title.includes('curiosity')
    ) {
      return IMAGES.abc;
    }

    return IMAGES.abc; // Default icon
  };

  // Helper function to get appropriate image for favorite
  const getImageForFavorite = (item: any) => {
    // Check if item has image properties
    if (item.imageUrl) return { uri: item.imageUrl };
    if (item.profilePicture) return { uri: item.profilePicture };
    if (item.avatar) return { uri: item.avatar };
    if (item.thumbnailUrl) return { uri: item.thumbnailUrl };

    // Fallback to default image
    return IMAGES.user4;
  };

  // Helper function to determine screen based on category
  const getScreenForCategory = (title: string = '') => {
    const lowerTitle = title.toLowerCase();

    if (
      lowerTitle.includes('alphabet') ||
      lowerTitle.includes('letter') ||
      lowerTitle.includes('abc')
    ) {
      return 'AlphabetScreen';
    }
    if (
      lowerTitle.includes('number') ||
      lowerTitle.includes('count') ||
      lowerTitle.includes('math')
    ) {
      return 'NumberScreen';
    }
    if (lowerTitle.includes('shape') || lowerTitle.includes('geometry')) {
      return 'ShapesScreen';
    }
    if (
      lowerTitle.includes('song') ||
      lowerTitle.includes('music') ||
      lowerTitle.includes('rhyme')
    ) {
      return 'ListenSongsScreen';
    }
    if (
      lowerTitle.includes('story') ||
      lowerTitle.includes('telling') ||
      lowerTitle.includes('book')
    ) {
      return 'StoriesScreen';
    }

    return 'AlphabetScreen'; // Default screen
  };

  // Fetch data when selectedChild changes
  useEffect(() => {
    if (selectedChild?._id) {
      const childId = selectedChild._id;
      console.log('Selected child changed, fetching data for:', childId);

      // Always fetch fresh data when child changes
      fetchFavoriteCategories(childId);
      fetchLearningModule(childId);
    }
  }, [selectedChild]);

  useEffect(() => {
    if (childrenList.length > 0 && !selectedChild) {
      const firstChild = childrenList[0];
      setSelectedChild(firstChild);

      // Fetch data for the first child
      const childId = firstChild._id;
      if (childId) {
        console.log('Initial fetch for child:', childId);
        fetchFavoriteCategories(childId);
        fetchLearningModule(childId);
      }
    }
  }, [childrenList]);

  const handleCategoryPress = useCallback(
    (screen: string, category: any) => {
      console.log('Category pressed:', category.title);
      if (props.navigation) {
        // You can pass category data to the next screen if needed
        props.navigation.navigate(screen, { category });
      }
    },
    [props.navigation],
  );

  const handleChildSelect = (child: any) => {
    console.log('Child selected from dropdown:', child);
    setSelectedChild(child);
  };

  console.log('Current state:', {
    selectedChildName: selectedChild?.username,
    selectedChildId: selectedChild?._id,
    favoritesCount: favoriteCategories.length,
    learningCount: learningCategories.length,
    cacheKeys: Object.keys(fetchedDataCache.current),
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.white }]}
      edges={['left', 'right', 'bottom']}
    >
      <StatusBar
        backgroundColor={theme.themeColor}
        barStyle="light-content"
        translucent={false}
      />

      <CustomHomeHeader
        onBack={() => props.navigation.goBack()}
        avatar={
          selectedChild?.profilePictureUrl ||
          selectedChild?.avatar ||
          IMAGES.user5
        }
        username={selectedChild?.username || selectedChild?.name}
        dropdownItems={childrenList}
        onNameSelect={handleChildSelect}
        showSearch={false}
        title={languageData?.child_progress || 'Child Progress'}
      />

      {/* Content */}
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Favorite Channel */}
          <View style={styles.favouritechannel}>
            <View style={styles.sectionHeader}>
              <Text
                style={[basicStyles.textStyleMediumBold, styles.sectionTitle]}
              >
                {languageData?.favorite_channel || 'Favorite Channel'}
              </Text>
              {loading.favorites && (
                <ActivityIndicator size="small" color={theme.themeColor} />
              )}
            </View>

            {loading.favorites ? (
              <View style={styles.emptyStateContainer}>
                <ActivityIndicator size="large" color={theme.themeColor} />
                <Text
                  style={[basicStyles.textStyleSmall, styles.emptyStateText]}
                >
                  {languageData?.loading_favorites ||
                    'Loading favorite channels...'}
                </Text>
              </View>
            ) : favoriteCategories.length > 0 ? (
              <View style={styles.favRow}>
                {favoriteCategories.map((user: any) => (
                  <View
                    key={user.id}
                    style={styles.favItem}
                    accessibilityLabel={`Favorite user ${user.name}`}
                  >
                    {user.img?.uri ? (
                      <Image
                        source={user.img}
                        style={styles.favImage}
                        defaultSource={IMAGES.user4}
                      />
                    ) : (
                      <Image
                        source={user.img || IMAGES.user4}
                        style={styles.favImage}
                      />
                    )}
                    <Text
                      style={[basicStyles.textStyleExtraSmall, styles.favName]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {user.name}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
                <CustomVectorIcons
                  name="heart"
                  iconSet="Feather"
                  size={moderateScale(40)}
                  color={theme.textSub}
                />
                <Text
                  style={[basicStyles.textStyleSmall, styles.emptyStateText]}
                >
                  {languageData?.no_favorites_for_child ||
                    'No favorite channels available for this child'}

                  {selectedChild?.username || 'this child'}
                </Text>
              </View>
            )}
          </View>

          {/* Learning Categories */}
          <View style={styles.categoriesContainer}>
            <View style={styles.sectionHeader}>
              <Text
                style={[basicStyles.textStyleMediumBold, styles.sectionTitle]}
              >
                {languageData?.learning_categories || 'Learning Categories'}
              </Text>
              {loading.categories && (
                <ActivityIndicator size="small" color={theme.themeColor} />
              )}
            </View>

            {loading.categories ? (
              <View style={styles.emptyStateContainer}>
                <ActivityIndicator size="large" color={theme.themeColor} />
                <Text
                  style={[basicStyles.textStyleSmall, styles.emptyStateText]}
                >
                  {languageData?.loading_learning ||
                    'Loading learning categories...'}
                </Text>
              </View>
            ) : learningCategories.length > 0 ? (
              learningCategories.map((item: any) => (
                <View key={item.id} style={styles.categorySeparator}>
                  <TouchableOpacity
                    style={[styles.card, { backgroundColor: theme.themeLight }]}
                    // onPress={() => handleCategoryPress(item.screen, item)}
                    activeOpacity={0.7}
                    accessibilityLabel={`Go to ${item.title} learning`}
                    accessibilityRole="button"
                  >
                    {item.icon?.uri ? (
                      <Image
                        source={item.icon}
                        style={styles.cardIcon}
                        defaultSource={IMAGES.abc}
                      />
                    ) : (
                      <Image
                        source={item.icon || IMAGES.abc}
                        style={styles.cardIcon}
                      />
                    )}

                    <View style={styles.cardContent}>
                      <Text
                        style={[
                          basicStyles.textStyleMediumBold,
                          styles.cardTitle,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[basicStyles.textStyleSmall, styles.cardSub]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.subtitle}
                      </Text>

                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${item.progress * 100}%`,
                              backgroundColor: theme.themeColor,
                            },
                          ]}
                          accessibilityLabel={`${Math.round(
                            item.progress * 100,
                          )}% complete`}
                        />
                      </View>
                    </View>

                    {/* <CustomVectorIcons
                      name="chevron-right"
                      iconSet="Feather"
                      size={moderateScale(20)}
                      color={theme.themeColor}
                    /> */}
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <CustomVectorIcons
                  name="book"
                  iconSet="Feather"
                  size={moderateScale(40)}
                  color={theme.textSub}
                />
                <Text
                  style={[basicStyles.textStyleSmall, styles.emptyStateText]}
                >
                  {languageData?.no_learning_categories_available_for ||
                    ' No learning categories available for'}
                  {selectedChild?.username || 'this child'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <CustomBottomBar navigation={props.navigation} />
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      marginTop: Platform.OS === 'ios' ? moderateScale(0) : moderateScale(6),
    },
    scrollContent: {
      paddingBottom: moderateScale(20),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: moderateScale(8),
    },
    categoriesContainer: {
      paddingHorizontal: moderateScale(16),
      paddingTop: moderateScale(12),
    },
    categorySeparator: {
      marginBottom: moderateScale(14),
    },
    sectionTitle: {
      color: theme.text,
      marginTop: moderateScale(10),
      includeFontPadding: false,
    },
    favouritechannel: {
      paddingHorizontal: moderateScale(16),
      marginTop: moderateScale(10),
      minHeight: moderateScale(120),
    },
    favRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.themeColor,
      borderRadius: moderateScale(12),
      paddingVertical: moderateScale(8),
      paddingHorizontal: moderateScale(8),
    },
    favItem: {
      alignItems: 'center',
      flex: 1,
      maxWidth: moderateScale(70),
    },
    favImage: {
      width: moderateScale(50),
      height: moderateScale(50),
      borderRadius: moderateScale(25),
      borderWidth: 2,
      borderColor: theme.white,
      backgroundColor: theme.white,
    },
    favName: {
      color: theme.white,
      textAlign: 'center',
      marginTop: moderateScale(4),
      width: '100%',
      includeFontPadding: false,
    },
    card: {
      flexDirection: 'row',
      padding: moderateScale(14),
      borderRadius: moderateScale(14),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.themeLight,
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
    cardIcon: {
      width: moderateScale(52),
      height: moderateScale(52),
      borderRadius: moderateScale(10),
      marginRight: moderateScale(14),
      backgroundColor: theme.white,
    },
    cardContent: {
      flex: 1,
      marginRight: moderateScale(8),
    },
    cardTitle: {
      color: theme.themeDark,
      includeFontPadding: false,
    },
    cardSub: {
      color: theme.themeColor,
      marginTop: moderateScale(2),
      marginBottom: moderateScale(8),
      includeFontPadding: false,
    },
    progressTrack: {
      width: '100%',
      height: moderateScale(5),
      borderRadius: moderateScale(4),
      backgroundColor: theme.white,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: moderateScale(4),
    },
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: moderateScale(40),
      backgroundColor: theme.white,
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: theme.themeLight,
      borderStyle: 'dashed',
    },
    emptyStateText: {
      color: theme.textSub,
      textAlign: 'center',
      marginTop: moderateScale(12),
      paddingHorizontal: moderateScale(20),
    },
  });

export default ProgressScreen;
