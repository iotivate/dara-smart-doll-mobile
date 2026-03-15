/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import { moderateScale } from 'react-native-size-matters';
import CustomVectorIcons from '@components/CustomVectorIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '@components/CustomHeader';

// --- Types ---
interface AlbumItem {
  id: string;
  image: string;
  color: string;
}

interface TrendingItem {
  id: string;
  image: string;
}

interface RecentSongItem {
  id: string;
  title: string;
  duration: string;
  image: string;
}

// --- Component Data ---
const albumsData: AlbumItem[] = [
  {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
    color: '#4A148C',
  },
  {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop',
    color: '#FFC107',
  },
  {
    id: '3',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
    color: '#00BCD4',
  },
  {
    id: '4',
    image:
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop',
    color: '#E91E63',
  },
];

const trendingData: TrendingItem[] = [
  {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300&h=400&fit=crop',
  },
  {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=400&fit=crop',
  },
  {
    id: '3',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop',
  },
];

const recentSongsData: RecentSongItem[] = [
  {
    id: '1',
    title: 'Katy Perry - Roar',
    duration: '3:20',
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
  },
  {
    id: '2',
    title: 'Ed Sheeran - Shape of You',
    duration: '4:15',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  },
  {
    id: '3',
    title: 'Billie Eilish - Bad Guy',
    duration: '3:45',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  },
];

// --- Component Props ---
interface AlbumItemProps {
  item: AlbumItem;
  onPress?: () => void;
}

interface TrendingItemProps {
  item: TrendingItem;
  onPress?: () => void;
}

interface RecentSongItemProps {
  item: RecentSongItem;
  onPress?: () => void;
}

// --- Sub Components ---

// --- Main Component ---
const LearningContentScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme);

  const handleAlbumPress = (item: AlbumItem) => {
    console.log('Album pressed:', item.id);
    // navigation.navigate('AlbumDetails', { albumId: item.id });
  };

  const handleTrendingPress = (item: TrendingItem) => {
    console.log('Trending pressed:', item.id);
    // navigation.navigate('TrendingDetails', { trendingId: item.id });
  };

  const handleSongPress = (item: RecentSongItem) => {
    navigation.navigate('PlaylistScreen');
    // Handle play logic
  };

  const handlePlayPress = (item: RecentSongItem) => {
    console.log('Play pressed:', item.id);
    // Handle play button logic
  };

  const AlbumItem = ({ item, onPress }: AlbumItemProps) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
      <TouchableOpacity
        style={styles.albumItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.image }} style={styles.albumImage} />
      </TouchableOpacity>
    );
  };

  const TrendingItem = ({ item, onPress }: TrendingItemProps) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
      <TouchableOpacity
        style={styles.trendingItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.image }} style={styles.trendingImage} />
      </TouchableOpacity>
    );
  };

  const RecentSongItem = ({ item, onPress }: RecentSongItemProps) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
      <View style={styles.recentSongItem}>
        <Image source={{ uri: item.image }} style={styles.recentSongImage} />
        <View style={styles.recentSongInfo}>
          <Text style={styles.recentSongTitle}>{item.title}</Text>
        </View>
        <Text style={styles.recentSongDuration}>{item.duration}</Text>
        <TouchableOpacity
          style={styles.playButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <CustomVectorIcons
            name="play"
            iconSet="Feather"
            size={moderateScale(16)}
            color={theme.white}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.transparent} // Matches the image background style
        barStyle={'light-content'}
      />
      <CustomHeader showBackButton={true} showNotifications={false} />
      <ScrollView>
        <View style={styles.content}>
          {/* Albums Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Albums</Text>
              <TouchableOpacity>
                <CustomVectorIcons
                  name="chevron-right"
                  iconSet="Feather"
                  size={moderateScale(24)}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={albumsData}
              renderItem={({ item }) => (
                <AlbumItem item={item} onPress={() => handleAlbumPress(item)} />
              )}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* Trending Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending</Text>
            </View>
            <FlatList
              data={trendingData}
              renderItem={({ item }) => (
                <TrendingItem
                  item={item}
                  onPress={() => handleTrendingPress(item)}
                />
              )}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* Recent Songs Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent songs</Text>
              <TouchableOpacity>
                <CustomVectorIcons
                  name="chevron-right"
                  iconSet="Feather"
                  size={moderateScale(24)}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentSongsData}
              renderItem={({ item }) => (
                <RecentSongItem
                  item={item}
                  onPress={() => handleSongPress(item)}
                />
              )}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
        <View style={{ height: moderateScale(50) }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles with Theme ---
const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
    },
    section: {
      marginTop: moderateScale(24),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: moderateScale(16),
      marginBottom: moderateScale(12),
    },
    sectionTitle: {
      fontSize: moderateScale(20),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },
    horizontalList: {
      paddingHorizontal: moderateScale(16),
    },
    albumItem: {
      marginRight: moderateScale(16),
    },
    albumImage: {
      width: moderateScale(80),
      height: moderateScale(80),
      borderRadius: moderateScale(12),
    },
    trendingItem: {
      marginRight: moderateScale(16),
    },
    trendingImage: {
      width: moderateScale(120),
      height: moderateScale(160),
      borderRadius: moderateScale(12),
    },
    recentSongItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(8),
      backgroundColor: theme.card,
      marginHorizontal: moderateScale(16),
      marginBottom: moderateScale(12),
      borderRadius: moderateScale(12),
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      //   elevation: 2,
    },
    recentSongImage: {
      width: moderateScale(60),
      height: moderateScale(60),
      borderRadius: moderateScale(8),
    },
    recentSongInfo: {
      flex: 1,
      marginLeft: moderateScale(12),
    },
    recentSongTitle: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaMedium,
      color: theme.text,
    },
    recentSongDuration: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
      marginRight: moderateScale(12),
    },
    playButton: {
      width: moderateScale(25),
      height: moderateScale(25),
      borderRadius: moderateScale(18),
      backgroundColor: theme.mainBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default LearningContentScreen;
