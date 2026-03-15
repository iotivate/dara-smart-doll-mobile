import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomVectorIcons from '@components/CustomVectorIcons';
import IMAGES from '@assets/images';

// Types for the component
export type VideoItem = {
  id: string;
  image: string;
  title?: string;
  description?: string;
  duration?: string;
  [key: string]: any; // Allow additional properties
};

export type CategoryItem = {
  id: string;
  title: string;
  videos: VideoItem[];
  onViewAllPress?: () => void;
  [key: string]: any; // Allow additional properties
};

export type FavouriteChannelProps = {
  // Data
  categories?: CategoryItem[];
  childName?: string;

  // Layout & Visibility
  showHeader?: boolean;
  headerTitle?: string;
  backgroundColor?: string;
  showCategoryHeaders?: boolean;
  showViewAllButtons?: boolean;

  // Video Item Configuration
  videoWidth?: number;
  videoHeight?: number;
  videoBorderRadius?: number;
  videoSpacing?: number;

  // Callbacks
  onVideoPress?: (video: VideoItem, category: CategoryItem) => void;
  onViewAllPress?: (category: CategoryItem) => void;
  onCategoryPress?: (category: CategoryItem) => void;

  // Custom Rendering
  renderVideoItem?: (
    video: VideoItem,
    category: CategoryItem,
  ) => React.ReactNode;
  renderCategoryHeader?: (category: CategoryItem) => React.ReactNode;
  renderEmptyState?: (childName?: string) => React.ReactNode;

  // States
  loading?: boolean;
  loadingComponent?: React.ReactNode;

  // Styles
  containerStyle?: object;
  categoryContainerStyle?: object;
  videoContainerStyle?: object;

  // Empty State
  emptyStateIcon?: string;
  emptyStateIconSet?: string;
  emptyStateIconSize?: number;
  emptyStateIconColor?: string;
  emptyStateText?: string;
};

const FavouriteChannel: React.FC<FavouriteChannelProps> = ({
  // Data
  categories = [],
  childName,

  // Layout & Visibility
  showHeader = true,
  headerTitle = 'Favorite Channel',
  backgroundColor,
  showCategoryHeaders = true,
  showViewAllButtons = true,

  // Video Item Configuration
  videoWidth = moderateScale(160),
  videoHeight = moderateScale(110),
  videoBorderRadius = moderateScale(12),
  videoSpacing = moderateScale(12),

  // Callbacks
  onVideoPress,
  onViewAllPress,
  onCategoryPress,

  // Custom Rendering
  renderVideoItem,
  renderCategoryHeader,
  renderEmptyState,

  // States
  loading = false,
  loadingComponent,

  // Styles
  containerStyle,
  categoryContainerStyle,
  videoContainerStyle,

  // Empty State
  emptyStateIcon = 'heart',
  emptyStateIconSet = 'Feather',
  emptyStateIconSize = moderateScale(40),
  emptyStateIconColor,
  emptyStateText,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Get theme-based colors
  const iconColor = emptyStateIconColor || theme.textSub;
  const bgColor = backgroundColor || theme.white;
  const containerBgColor = backgroundColor || theme.background || '#F5F5F5';

  // Render default video item
  const renderDefaultVideoItem = (video: VideoItem) => (
    <TouchableOpacity
      style={[
        styles.videoCard,
        {
          width: videoWidth,
          height: videoHeight,
          borderRadius: videoBorderRadius,
          marginRight: videoSpacing,
        },
        videoContainerStyle,
      ]}
      onPress={() =>
        onVideoPress?.(
          video,
          categories.find(c => c.videos.includes(video)) || categories[0],
        )
      }
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: video.image }}
        style={[
          styles.videoImage,
          {
            width: videoWidth,
            height: videoHeight,
            borderRadius: videoBorderRadius,
          },
        ]}
        defaultSource={IMAGES.user4}
      />
      {video.title && (
        <View style={styles.videoTitleContainer}>
          <Text style={styles.videoTitle} numberOfLines={1}>
            {video.title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render default category header
  const renderDefaultCategoryHeader = (category: CategoryItem) => (
    <View style={styles.categoryHeader}>
      <Text style={styles.categoryTitle}>{category.title}</Text>
      {showViewAllButtons && (
        <TouchableOpacity onPress={() => onViewAllPress?.(category)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render category section
  const renderCategorySection = ({
    item: category,
  }: {
    item: CategoryItem;
  }) => (
    <TouchableOpacity
      style={[
        styles.categorySection,
        { backgroundColor: bgColor },
        categoryContainerStyle,
      ]}
      onPress={() => onCategoryPress?.(category)}
      activeOpacity={0.9}
      disabled={!onCategoryPress}
    >
      {showCategoryHeaders &&
        (renderCategoryHeader
          ? renderCategoryHeader(category)
          : renderDefaultCategoryHeader(category))}

      {category.videos.length > 0 ? (
        <FlatList
          data={category.videos}
          renderItem={({ item: video }) =>
            renderVideoItem
              ? renderVideoItem(video, category)
              : renderDefaultVideoItem(video)
          }
          keyExtractor={video => video.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.videoList}
        />
      ) : (
        <View style={styles.emptyCategoryContainer}>
          <Text style={styles.emptyCategoryText}>
            No videos in this category
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render default empty state
  const renderDefaultEmptyState = () => (
    <View style={[styles.emptyStateContainer, { backgroundColor: bgColor }]}>
      <CustomVectorIcons
        name={emptyStateIcon}
        iconSet={emptyStateIconSet}
        size={emptyStateIconSize}
        color={iconColor}
      />
      <Text style={styles.emptyStateText}>
        {emptyStateText ||
          `No favorite channels available for ${childName || 'this child'}`}
      </Text>
    </View>
  );

  // Render loading state
  const renderLoadingState = () => {
    if (loadingComponent) {
      return loadingComponent;
    }

    return (
      <View style={[styles.emptyStateContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={theme.themeColor} />
        <Text style={styles.loadingText}>Loading favorite channels...</Text>
      </View>
    );
  };

  // Calculate if we have any videos across all categories
  const hasAnyVideos = categories.some(category => category.videos?.length > 0);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: containerBgColor },
        containerStyle,
      ]}
    >
      {showHeader && (
        <View style={[styles.titleContainer, { backgroundColor: bgColor }]}>
          <Text style={styles.pageTitle}>{headerTitle}</Text>
        </View>
      )}

      {loading ? (
        renderLoadingState()
      ) : hasAnyVideos ? (
        <FlatList
          data={categories}
          renderItem={renderCategorySection}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        />
      ) : renderEmptyState ? (
        renderEmptyState(childName)
      ) : (
        renderDefaultEmptyState()
      )}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    titleContainer: {
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(16),
    },
    pageTitle: {
      fontSize: moderateScale(22),
      fontFamily: FontFamily.KhulaBold,
      color: theme.black,
      textAlign: 'center',
    },
    contentContainer: {
      paddingBottom: moderateScale(20),
    },
    categorySection: {
      marginTop: moderateScale(20),
      paddingVertical: moderateScale(16),
    },
    categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: moderateScale(16),
      marginBottom: moderateScale(12),
    },
    categoryTitle: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
    },
    viewAllText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.gray,
    },
    videoList: {
      paddingHorizontal: moderateScale(16),
    },
    videoCard: {
      overflow: 'hidden',
      position: 'relative',
    },
    videoImage: {
      resizeMode: 'cover',
    },
    videoTitleContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(4),
    },
    videoTitle: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.white,
    },
    emptyCategoryContainer: {
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(20),
      alignItems: 'center',
    },
    emptyCategoryText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      fontStyle: 'italic',
    },
    emptyStateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: moderateScale(40),
      borderRadius: moderateScale(12),
      marginHorizontal: moderateScale(16),
      marginTop: moderateScale(20),
      borderWidth: 1,
      borderColor: theme.themeLight,
      borderStyle: 'dashed',
    },
    emptyStateText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      textAlign: 'center',
      marginTop: moderateScale(12),
      paddingHorizontal: moderateScale(20),
    },
    loadingText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      textAlign: 'center',
      marginTop: moderateScale(12),
    },
  });

export default FavouriteChannel;
