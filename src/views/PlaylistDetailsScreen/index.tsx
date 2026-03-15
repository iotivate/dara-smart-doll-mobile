import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import CustomVectorIcons from '@components/CustomVectorIcons';
import CustomHeader from '@components/CustomHeader';
import FontFamily from '@assets/fonts/FontFamily';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { useSelector } from 'react-redux';

interface PlaylistItem {
  _id: string;
  title: string;
  description: string;
  audioUrl: string;
  thumbnailUrls: string[];
  categoryId?: {
    title: string;
  };
  audioId: string;
  language: string;
}

/* ================= FEATURED CARD ================= */

const FeaturedCard = ({
  item,
  onPress,
}: {
  item: PlaylistItem;
  onPress: () => void;
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.featuredWrapper}
      onPress={onPress}
    >
      <Image
        source={{ uri: item.thumbnailUrls?.[0] }}
        style={styles.featuredImage}
      />

      <View style={styles.featuredOverlay} />

      <View style={styles.featuredContent}>
        <Text style={styles.featuredBadge}>
          {languageData?.featured || 'FEATURED'}
        </Text>

        <Text style={styles.featuredTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.featuredSubtitle} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.playButton}>
          <CustomVectorIcons
            name="play"
            iconSet="Ionicons"
            size={26}
            color="#fff"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

/* ================= LIST CARD ================= */

const PlaylistCard = ({
  item,
  onPress,
}: {
  item: PlaylistItem;
  onPress: () => void;
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.thumbWrapper}>
        <Image
          source={{ uri: item.thumbnailUrls?.[0] }}
          style={styles.thumbnail}
        />
        <View style={styles.smallPlay}>
          <CustomVectorIcons
            name="play"
            iconSet="Ionicons"
            size={14}
            color="#fff"
          />
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {!!item.categoryId?.title && (
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{item.categoryId.title}</Text>
          </View>
        )}

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <CustomVectorIcons
        name="chevron-forward"
        iconSet="Ionicons"
        size={18}
        color={theme.subText}
      />
    </TouchableOpacity>
  );
};

/* ================= SCREEN ================= */

export default function PlaylistDetailsScreen({ navigation }: any) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  const [featuredItem, setFeaturedItem] = useState<PlaylistItem | null>(null);
  const [listData, setListData] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaylist = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        keyWord: '',
        page: '1',
        size: '10',
      }).toString();

      const response = await apiRequest(
        `${ApiURL.ExistingSession}?${query}`,
        'GET',
        null,
        true,
      );

      if (!response?.error) {
        const list = response?.data?.list ?? [];
        setFeaturedItem(list[0] || null);
        setListData(list.slice(1));
      }
    } catch (e) {
      console.log('Playlist error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, []);

  const handlePress = (item: PlaylistItem) => {
    console.log('itemitemitemitem', item);
    navigation.navigate('AudioPlayerScreen', {
      audioUrl: item.audioUrl,
      thumbnail: item.thumbnailUrls?.[0],
      title: item.title,
      description: item.description,
      audioId: item?.audioId || `${item?._id}_${item?.language}`,
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <CustomHeader
        showBackButton
        title="Audio Playlist"
        showNotifications={false}
      />

      <FlatList
        data={listData}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          featuredItem ? (
            <FeaturedCard
              item={featuredItem}
              onPress={() => handlePress(featuredItem)}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <PlaylistCard item={item} onPress={() => handlePress(item)} />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : (
            <Text style={styles.emptyText}>
              {languageData?.no_content_available || 'No content available'}
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const getStyles = (theme: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },

    listContent: {
      padding: moderateScale(16),
      paddingBottom: moderateScale(40),
    },

    /* ========== FEATURED ========== */

    featuredWrapper: {
      borderRadius: 22,
      overflow: 'hidden',
      marginBottom: moderateScale(24),
      elevation: 6,
      backgroundColor: '#000',
    },

    featuredImage: {
      width: '100%',
      height: moderateScale(220),
    },

    featuredOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.35)',
    },

    featuredContent: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      right: 16,
    },

    featuredBadge: {
      backgroundColor: theme.primary,
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      fontSize: 10,
      color: '#fff',
      fontFamily: FontFamily.KhulaBold,
      marginBottom: 6,
    },

    featuredTitle: {
      fontFamily: FontFamily.KhulaBold,
      fontSize: 18,
      color: '#fff',
      marginBottom: 4,
    },

    featuredSubtitle: {
      fontFamily: FontFamily.KhulaRegular,
      fontSize: 13,
      color: '#ddd',
      marginBottom: 12,
    },

    playButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },

    /* ========== CARD ========== */

    card: {
      flexDirection: 'row',
      backgroundColor: theme.mainBackground,
      borderRadius: 16,
      padding: moderateScale(12),
      marginBottom: moderateScale(14),
      alignItems: 'center',
      elevation: 3,
    },

    thumbWrapper: {
      width: 92,
      height: 56,
      borderRadius: 12,
      overflow: 'hidden',
      marginRight: 12,
    },

    thumbnail: {
      width: '100%',
      height: '100%',
    },

    smallPlay: {
      position: 'absolute',
      bottom: 6,
      right: 6,
      backgroundColor: theme.primary,
      borderRadius: 14,
      padding: 4,
    },

    cardContent: {
      flex: 1,
    },

    title: {
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: 14,
      color: theme.text,
      marginBottom: 4,
    },

    categoryChip: {
      alignSelf: 'flex-start',
      backgroundColor: theme.lightPurple,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginBottom: 4,
    },

    categoryText: {
      fontSize: 10,
      fontFamily: FontFamily.KhulaMedium,
      color: theme.primary,
    },

    description: {
      fontFamily: FontFamily.KhulaRegular,
      fontSize: 11,
      color: theme.subText,
      lineHeight: 16,
    },

    emptyText: {
      textAlign: 'center',
      marginTop: 40,
      fontFamily: FontFamily.KhulaMedium,
      color: theme.subText,
    },
  });
