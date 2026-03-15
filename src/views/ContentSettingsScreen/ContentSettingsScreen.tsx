/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Switch,
  FlatList,
  Platform,
  StatusBar,
  ActivityIndicator,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import CustomVectorIcons from '@components/CustomVectorIcons';
import IMAGES from '@assets/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHomeHeader from '@components/CustomHomeHeader';
import CustomBottomBar from '@components/CustomBottomBar';
import { useDispatch, useSelector } from 'react-redux';
import { ApiURL } from '@services/ApiConstants';
import { apiRequest } from '@services/ApiServices';

const ContentSettingsScreen = ({ navigation }: any) => {
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const dispatch = useDispatch();
  const { childrenList = [] } = useSelector((state: any) => state.data);

  // const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [contentData, setContentData] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [isToggling, setIsToggling] = useState<{ [key: string]: boolean }>({});

  // Cache for fetched data
  const fetchedDataCache = useRef<{ [key: string]: any[] }>({});

  // Function to toggle content restriction
  // const toggleContentRestriction = async (
  //   childId: string,
  //   contentId: string,
  // ) => {
  //   try {
  //     const url = `${ApiURL.content_users_toggle_restrict_content}`;
  //     const body = {
  //       childId,
  //       contentId,
  //     };

  //     const response = await apiRequest(url, 'POST', body, true);
  //     return response;
  //   } catch (error) {
  //     console.log('Error toggling content restriction:', error);
  //     throw error;
  //   }
  // };
  const toggleContentRestriction = async (
    childId: string,
    contentId: string,
  ) => {
    try {
      const url = `${ApiURL.content_users_toggle_restrict_content}`;
      const body = { childId, contentId };
      const response = await apiRequest(url, 'POST', body, true);

      // Return whatever the API returns
      return response;
    } catch (error: any) {
      console.log('Error toggling content restriction:', error);

      // Extract error message from API response
      const errorMessage =
        error.response?.data?.message || error.message || 'An error occurred';

      return {
        error: true,
        message: errorMessage,
        data: null,
      };
    }
  };

  // Fetch content for selected child
  const fetchContent = async (childId: string, categoryId?: string) => {
    try {
      console.log(
        'Fetching content for childId:',
        childId,
        'category:',
        categoryId,
      );
      setLoading(true);

      const cacheKey = `${childId}-${categoryId || 'all'}`;

      // Check cache first
      if (fetchedDataCache.current[cacheKey]) {
        console.log('Using cached data for:', cacheKey);
        setContentData(fetchedDataCache.current[cacheKey]);
        setLoading(false);
        return;
      }

      if (!childId) {
        console.log('No childId provided');
        setContentData([]);
        setLoading(false);
        return;
      }

      // Build URL for content API with childId
      let url = `${ApiURL.categories_users_list}?childId=${childId}&page=1&size=20`;

      // If category is selected, filter by category
      if (categoryId && categoryId !== 'all') {
        url += `&categoryId=${categoryId}`;
      }

      console.log('Content API URL:', url);

      const res = await apiRequest(url, 'GET', null, true);
      console.log('Content API Response:', res);

      if (!res?.error && res?.data?.list) {
        console.log('Content items found:', res.data.list.length);

        if (res.data.list.length === 0) {
          console.log('No content found for this child');
          setContentData([]);
        } else {
          // Extract categories from the response
          const categories = res.data.list
            .filter((item: any) => item.title) // Only items with title
            .map((item: any) => ({
              id: item._id,
              title: item.title,
              count: item.contents?.length || 0,
            }));

          // Remove duplicates and set categories list
          const uniqueCategories = Array.from(
            new Map(categories.map(item => [item.id, item])).values(),
          );
          setCategoriesList(uniqueCategories);

          // Transform content items
          const transformedData = transformContentData(res.data.list);

          setContentData(transformedData);
          // Cache the data
          fetchedDataCache.current[cacheKey] = transformedData;
        }
      } else {
        console.log('No content found or error:', res?.error);
        setContentData([]);
        setCategoriesList([]);
      }
    } catch (error) {
      console.log('Error fetching content:', error);
      setContentData([]);
      setCategoriesList([]);
    } finally {
      setLoading(false);
    }
  };

  // Transform content data to match your component structure
  const transformContentData = (apiData: any[]) => {
    const transformed = apiData.flatMap((category: any) => {
      const contents = category.contents || [];
      return contents.map((content: any, index: number) => ({
        id: content._id || `content-${category._id}-${index}`,
        title: content.title || 'Untitled Content',
        description: content.description || '',
        img: getImageForContent(content, category),
        lang: content.language || category.language || 'English',
        age: getAgeRangeForContent(content, category),
        duration: getDurationForContent(content),
        enabled: isContentEnabled(content, selectedChild),
        categoryId: category._id,
        categoryTitle: category.title,
        contentData: content,
        categoryData: category,
        ...content,
      }));
    });

    console.log('Transformed data count:', transformed.length);
    return transformed;
  };

  // Helper functions to transform API data
  const getImageForContent = (content: any, category: any) => {
    // Use content thumbnail first, then category thumbnail
    if (content.thumbnailUrls?.[0]) {
      return { uri: content.thumbnailUrls[0] };
    }
    if (category.thumbnailUrl) {
      return { uri: category.thumbnailUrl };
    }

    // Fallback to appropriate image based on title
    const title = (content.title || '').toLowerCase();
    if (title.includes('alphabet') || title.includes('letter')) {
      return IMAGES.cartoon;
    } else if (title.includes('number') || title.includes('math')) {
      return IMAGES.cartoon2;
    } else if (title.includes('shape') || title.includes('geometry')) {
      return IMAGES.cartoon3;
    } else if (title.includes('story') || title.includes('book')) {
      return IMAGES.cartoon2;
    } else if (title.includes('song') || title.includes('music')) {
      return IMAGES.cartoon3;
    }

    return IMAGES.cartoon; // Default
  };

  const getAgeRangeForContent = (content: any, category: any) => {
    // You can adjust this based on your API data
    // For now, return a default
    const title = (content.title || category.title || '').toLowerCase();
    if (title.includes('basic') || title.includes('beginner')) {
      return '2-4 yrs';
    } else if (title.includes('advanced') || title.includes('intermediate')) {
      return '5-7 yrs';
    }
    return '3-5 yrs'; // Default
  };

  const getDurationForContent = (content: any) => {
    // You can calculate this from audioUrl length if available
    // For now, return a default
    return '5 min'; // Default
  };

  const isContentEnabled = (content: any, child: any) => {
    // Check if content is enabled for child
    // This should be determined by your API response
    // For now, return true for demo - adjust based on your API
    return !content.isRestricted || false; // Assuming API returns isRestricted field
  };

  // Toggle content enable/disable with API call
  const toggleEnabled = async (id: string) => {
    try {
      // Get the content item
      const contentItem = contentData.find(item => item.id === id);

      if (
        !contentItem ||
        !selectedChild?._id ||
        !contentItem.contentData?._id
      ) {
        console.log('Missing data for toggle:', {
          id,
          childId: selectedChild?._id,
          contentId: contentItem?.contentData?._id,
        });
        Alert.alert('Error', 'Missing required data to toggle content');
        return;
      }

      // Set toggling state for this item
      setIsToggling(prev => ({ ...prev, [id]: true }));

      // Optimistically update UI
      const newEnabledState = !contentItem.enabled;
      const newItems = contentData.map(item =>
        item.id === id ? { ...item, enabled: newEnabledState } : item,
      );
      setContentData(newItems);

      // Update cache
      if (selectedChild._id) {
        const cacheKey = `${selectedChild._id}-${selectedCategory || 'all'}`;
        fetchedDataCache.current[cacheKey] = newItems;
      }

      // Make API call to toggle content restriction
      console.log(`Toggling content ${id} for child ${selectedChild._id}`);

      const response = await toggleContentRestriction(
        selectedChild._id,
        contentItem.contentData._id,
      );

      if (response?.error) {
        // Revert UI changes
        const revertedItems = contentData.map(item =>
          item.id === id ? { ...item, enabled: !newEnabledState } : item,
        );
        setContentData(revertedItems);

        // Update cache
        if (selectedChild._id) {
          const cacheKey = `${selectedChild._id}-${selectedCategory || 'all'}`;
          fetchedDataCache.current[cacheKey] = revertedItems;
        }

        // Show the error message from server
        Alert.alert(
          'Update Failed',
          response.message || 'Failed to update content. Please try again.',
          [{ text: 'OK' }],
        );
      } else {
        // Success - invalidate cache
        if (selectedChild._id) {
          const cacheKey = `${selectedChild._id}-${selectedCategory || 'all'}`;
          delete fetchedDataCache.current[cacheKey];
        }
      }
    } catch (error: any) {
      console.log('Error in toggleEnabled:', error);

      // Revert UI on error
      const contentItem = contentData.find(item => item.id === id);
      if (contentItem) {
        const revertedItems = contentData.map(item =>
          item.id === id ? { ...item, enabled: !contentItem.enabled } : item,
        );
        setContentData(revertedItems);
      }

      // Show error message
      Alert.alert(
        'Error',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsToggling(prev => ({ ...prev, [id]: false }));
    }
  };

  const renderItem = ({ item }: any) => {
    const isItemToggling = isToggling[item.id] || false;

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          {typeof item.img === 'string' || item.img?.uri ? (
            <Image
              source={
                typeof item.img === 'string' ? { uri: item.img } : item.img
              }
              style={styles.cardImg}
              resizeMode="cover"
              defaultSource={IMAGES.cartoon}
            />
          ) : (
            <Image
              source={item.img || IMAGES.cartoon}
              style={styles.cardImg}
              resizeMode="cover"
            />
          )}
        </View>

        <View style={styles.cardMiddle}>
          <Text style={styles.cardTitle}>{item.title}</Text>

          {item.categoryTitle && (
            <View style={styles.categoryRow}>
              <Text style={styles.categoryText}>{item.categoryTitle}</Text>
            </View>
          )}

          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{item.lang}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{item.age}</Text>
            </View>
          </View>
          <View style={styles.durationFullRow}>
            <Text style={styles.durationText}>{item.duration}</Text>
            <View style={styles.durationLine} />
            <TouchableOpacity
              style={styles.playWrapper}
              onPress={() => handlePlayContent(item)}
              disabled={isItemToggling}
            >
              <CustomVectorIcons
                name="play"
                iconSet="Feather"
                size={14}
                color={theme.white}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text
            style={[
              styles.statusText,
              item.enabled ? styles.enabled : styles.disabled,
            ]}
          >
            {isItemToggling
              ? 'Updating...'
              : item.enabled
              ? 'Enabled'
              : 'Disabled'}
          </Text>

          <Switch
            value={item.enabled}
            onValueChange={() => toggleEnabled(item.id)}
            trackColor={{ true: theme.themeColor, false: theme.textBoxBorder }}
            thumbColor={item.enabled ? theme.themeColor : theme.white}
            style={{ transform: [{ scale: Platform.OS === 'ios' ? 0.9 : 1 }] }}
            disabled={isItemToggling}
          />
        </View>
      </View>
    );
  };

  // Handle child selection
  const handleChildSelect = (child: any) => {
    console.log('Child selected:', child);
    setSelectedChild(child);
    setSelectedCategory(null); // Reset category filter

    // Clear previous data when switching children
    setContentData([]);
    setCategoriesList([]);
    setIsToggling({}); // Clear toggling states

    // Fetch content for the selected child
    if (child?._id) {
      fetchContent(child._id);
    }
  };

  // Handle category selection from filter
  const handleCategorySelect = (categoryId: string | null) => {
    console.log('Category selected:', categoryId);
    setSelectedCategory(categoryId);
    setShowCategoriesModal(false);

    if (selectedChild?._id) {
      fetchContent(selectedChild._id, categoryId || undefined);
    }
  };

  // Handle play content
  const handlePlayContent = (content: any) => {
    console.log('Play content:', content.title);
    // Navigate to audio/video player
    // navigation.navigate('PlayerScreen', { content });
  };

  // Handle assign to child
  // const handleAssignToChild = () => {
  //   const enabledContent = contentData.filter(c => c.enabled);
  //   console.log('Assigning content:', enabledContent.length, 'items');

  //   if (enabledContent.length === 0) {
  //     Alert.alert(
  //       'No Content Selected',
  //       'Please enable at least one content item to assign.',
  //     );
  //     return;
  //   }

  //   // Implement your assign functionality here
  //   // This could involve another API call to assign enabled content to the child
  //   Alert.alert(
  //     'Assign Content',
  //     `Assign ${enabledContent.length} content item(s) to ${
  //       selectedChild?.username || 'child'
  //     }?`,
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Assign',
  //         onPress: () => {
  //           // Make API call to assign content
  //           console.log('Making assign API call...');
  //           // apiRequest(ApiURL.assign_content_to_child, 'POST', {
  //           //   childId: selectedChild._id,
  //           //   contentIds: enabledContent.map(c => c.contentData._id)
  //           // }, true)
  //           // .then(response => {
  //           //   if (!response.error) {
  //           //     Alert.alert('Success', 'Content assigned successfully!');
  //           //   }
  //           // });

  //           // For now, show success message
  //           Alert.alert(
  //             'Success',
  //             `Assigned ${enabledContent.length} content item(s) successfully!`,
  //           );
  //         },
  //       },
  //     ],
  //   );
  // };

  // Fetch data for initial child selection
  useEffect(() => {
    if (childrenList.length > 0 && !selectedChild) {
      const firstChild = childrenList[0];
      setSelectedChild(firstChild);

      if (firstChild._id) {
        fetchContent(firstChild._id);
      }
    }
  }, [childrenList]);

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <CustomVectorIcons
        name="folder"
        iconSet="Feather"
        size={moderateScale(40)}
        color={theme.textSub}
      />
      <Text style={styles.emptyStateText}>
        {loading
          ? 'Loading content...'
          : `No content available for ${
              selectedChild?.username || 'this child'
            }${selectedCategory ? ' in this category' : ''}`}
      </Text>
    </View>
  );

  // Close modal when back button is pressed
  useEffect(() => {
    const backHandler = navigation.addListener('beforeRemove', (e: any) => {
      if (showCategoriesModal) {
        e.preventDefault();
        setShowCategoriesModal(false);
      }
    });

    return () => {
      backHandler();
    };
  }, [showCategoriesModal, navigation]);

  // Render categories modal
  const renderCategoriesModal = () => {
    if (!showCategoriesModal) return null;

    return (
      <Modal
        visible={showCategoriesModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoriesModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCategoriesModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Category</Text>
                  <TouchableOpacity
                    onPress={() => setShowCategoriesModal(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <CustomVectorIcons
                      name="x"
                      iconSet="Feather"
                      size={24}
                      color={theme.text}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.categoriesList}
                  showsVerticalScrollIndicator={false}
                >
                  <TouchableOpacity
                    style={[
                      styles.categoryItem,
                      selectedCategory === null && styles.selectedCategoryItem,
                    ]}
                    onPress={() => handleCategorySelect(null)}
                  >
                    <Text
                      style={[
                        styles.categoryItemText,
                        selectedCategory === null &&
                          styles.selectedCategoryItemText,
                      ]}
                    >
                      All Categories
                    </Text>
                    <Text style={styles.categoryCount}>
                      ({contentData.length})
                    </Text>
                  </TouchableOpacity>

                  {categoriesList.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItem,
                        selectedCategory === category.id &&
                          styles.selectedCategoryItem,
                      ]}
                      onPress={() => handleCategorySelect(category.id)}
                    >
                      <Text
                        style={[
                          styles.categoryItemText,
                          selectedCategory === category.id &&
                            styles.selectedCategoryItemText,
                        ]}
                      >
                        {category.title}
                      </Text>
                      <Text style={styles.categoryCount}>
                        ({category.count})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
      />

      {/* Header */}
      <CustomHomeHeader
        onBack={() => navigation.goBack()}
        avatar={
          selectedChild?.profilePictureUrl ||
          selectedChild?.avatar ||
          IMAGES.user5
        }
        username={selectedChild?.username || 'Select Child'}
        dropdownItems={childrenList}
        onNameSelect={handleChildSelect}
        onSearchPress={() => navigation.navigate('SearchScreen')}
      />

      <View style={styles.contentArea}>
        <Text style={styles.screenTitle}>
          {languageData?.content_settings_title || 'Content Settings'}
        </Text>

        <Text style={styles.description}>
          {languageData?.content_settings_description?.replace(
            '{{child}}',
            selectedChild?.username || languageData?.your_child || 'your child',
          ) ||
            `Select which learning videos and audios you want ${
              selectedChild?.username || 'your child'
            } to access. Preview content before assigning to ensure it's appropriate.`}
        </Text>

        {/* Filters button row */}
        <View style={styles.filtersRow}>
          <View style={styles.filtersLeft}>
            <Text style={styles.filtersLabel}>
              {selectedCategory
                ? categoriesList.find(c => c.id === selectedCategory)?.title ||
                  languageData?.filtered_label ||
                  'Filtered'
                : languageData?.all_content_label || 'All Content'}
            </Text>
            {selectedCategory && (
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => handleCategorySelect(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CustomVectorIcons
                  name="x"
                  iconSet="Feather"
                  size={12}
                  color={theme.white}
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => {
              console.log('Filter button pressed');
              setShowCategoriesModal(true);
            }}
            disabled={loading}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CustomVectorIcons
              name="filter"
              iconSet="Ionicons"
              size={16}
              color={theme.white}
            />
          </TouchableOpacity>
        </View>

        {/* Content list or loading/empty state */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.themeColor} />
            <Text style={styles.loadingText}>
              {languageData?.loading_content_for?.replace(
                '{{child}}',
                selectedChild?.username || '',
              ) || `Loading content for ${selectedChild?.username || ''}...`}
            </Text>
          </View>
        ) : contentData.length > 0 ? (
          <FlatList
            data={contentData}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => (
              <View style={{ height: moderateScale(10) }} />
            )}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmptyState()
        )}

        {/* <View style={styles.buttonContainer}>
          <CustomButton
            text="Assign to Child"
            backgroundColor={theme.themeColor}
            height={moderateScale(48)}
            style={styles.assignBtn}
            onPress={handleAssignToChild}
            disabled={contentData.filter(c => c.enabled).length === 0}
          />
        </View> */}
      </View>

      {renderCategoriesModal()}
      <CustomBottomBar navigation={navigation} />
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    contentArea: {
      flex: 1,
      paddingHorizontal: moderateScale(14),
      marginTop: moderateScale(10),
    },
    screenTitle: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaExtraBold,
      textAlign: 'center',
      marginTop: moderateScale(6),
      color: theme.black,
    },
    description: {
      fontSize: moderateScale(9),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.themeDark,
      textAlign: 'center',
      marginBottom: moderateScale(10),
      paddingHorizontal: moderateScale(8),
    },
    filtersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: moderateScale(8),
    },
    filtersLeft: {
      flex: 1,
      backgroundColor: theme.themeColor,
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(10),
      borderRadius: moderateScale(10),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    filtersLabel: {
      color: theme.white,
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(14),
    },
    clearFilterBtn: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      width: moderateScale(20),
      height: moderateScale(20),
      borderRadius: moderateScale(10),
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterBtn: {
      marginLeft: moderateScale(10),
      backgroundColor: theme.themeColor,
      width: moderateScale(44),
      height: moderateScale(44),
      borderRadius: moderateScale(10),
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      paddingBottom: moderateScale(20),
      paddingTop: moderateScale(6),
      minHeight: moderateScale(200),
    },
    card: {
      flexDirection: 'row',
      backgroundColor: theme.white,
      borderRadius: moderateScale(12),
      padding: moderateScale(10),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#F0E9FF',
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 6,
      elevation: 1,
    },
    cardLeft: {
      width: moderateScale(70),
      height: moderateScale(70),
      borderRadius: moderateScale(8),
      overflow: 'hidden',
      marginRight: moderateScale(10),
    },
    cardImg: {
      width: '100%',
      height: '100%',
    },
    cardMiddle: { flex: 1 },
    cardTitle: {
      fontFamily: FontFamily.KhulaExtraBold,
      fontSize: moderateScale(14),
      color: '#2E2A4E',
      marginBottom: moderateScale(4),
    },
    categoryRow: {
      marginBottom: moderateScale(4),
    },
    categoryText: {
      fontFamily: FontFamily.KhulaRegular,
      fontSize: moderateScale(11),
      color: theme.themeColor,
      fontStyle: 'italic',
    },
    chipsRow: { flexDirection: 'row', alignItems: 'center' },
    chip: {
      backgroundColor: '#F3F0FF',
      paddingHorizontal: moderateScale(6),
      paddingVertical: moderateScale(4),
      borderRadius: moderateScale(6),
      marginRight: moderateScale(8),
    },
    chipText: {
      fontFamily: FontFamily.KhulaRegular,
      fontSize: moderateScale(10),
      color: '#6B4CDB',
    },
    durationFullRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: moderateScale(6),
    },
    durationText: {
      fontSize: moderateScale(11),
      color: '#6B6B80',
      fontFamily: FontFamily.KhulaRegular,
      marginRight: moderateScale(4),
    },
    durationLine: {
      flex: 1,
      height: moderateScale(2),
      backgroundColor: '#DAD2FF',
      borderRadius: moderateScale(2),
      marginRight: moderateScale(10),
    },
    playWrapper: {
      backgroundColor: '#624eb1ff',
      padding: moderateScale(5),
      borderRadius: moderateScale(8),
    },
    cardRight: {
      alignItems: 'center',
      justifyContent: 'space-between',
      height: moderateScale(70),
    },
    statusText: {
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(12),
      marginBottom: moderateScale(6),
    },
    enabled: { color: theme.themeColor },
    disabled: { color: '#B0B0C1' },
    assignBtn: {
      marginTop: moderateScale(12),
      borderRadius: moderateScale(12),
      marginHorizontal: moderateScale(10),
    },
    buttonContainer: {
      marginHorizontal: moderateScale(30),
      marginTop: moderateScale(5),
      marginLeft: moderateScale(5),
      marginBottom: moderateScale(30),
    },
    emptyStateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: moderateScale(40),
      backgroundColor: theme.white,
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: theme.themeLight,
      borderStyle: 'dashed',
      marginHorizontal: moderateScale(16),
      marginTop: moderateScale(20),
    },
    emptyStateText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      textAlign: 'center',
      marginTop: moderateScale(12),
      paddingHorizontal: moderateScale(20),
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: moderateScale(40),
    },
    loadingText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      textAlign: 'center',
      marginTop: moderateScale(12),
    },
    // Modal styles - FIXED
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: moderateScale(20),
    },
    modalContent: {
      backgroundColor: theme.white,
      borderRadius: moderateScale(16),
      width: '90%',
      maxHeight: '70%',
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: moderateScale(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.themeLight,
    },
    modalTitle: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
    },
    categoriesList: {
      maxHeight: moderateScale(300),
    },
    categoryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(16),
      borderBottomWidth: 1,
      borderBottomColor: theme.themeLight,
    },
    selectedCategoryItem: {
      backgroundColor: theme.themeLight,
    },
    categoryItemText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
      flex: 1,
    },
    selectedCategoryItemText: {
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.themeColor,
    },
    categoryCount: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      marginLeft: moderateScale(8),
    },
  });

export default ContentSettingsScreen;
