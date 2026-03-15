import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import createBasicStyles from 'styles';
import CustomHeader from '@components/CustomHeader';

const categoriesData = [
  {
    id: '1',
    title: 'Educational',
    videos: [
      {
        id: '1-1',
        image:
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
      },
      {
        id: '1-2',
        image:
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop',
      },
      {
        id: '1-3',
        image:
          'https://images.unsplash.com/photo-1574267432644-f610a5099f10?w=300&h=200&fit=crop',
      },
    ],
  },
  {
    id: '2',
    title: 'Content',
    videos: [
      {
        id: '2-1',
        image:
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
      },
      {
        id: '2-2',
        image:
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
      },
      {
        id: '2-3',
        image:
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop',
      },
    ],
  },
  {
    id: '3',
    title: 'Nursery',
    videos: [
      {
        id: '3-1',
        image:
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
      },
      {
        id: '3-2',
        image:
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
      },
      {
        id: '3-3',
        image:
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop',
      },
    ],
  },
  {
    id: '4',
    title: 'Rhymes & Music',
    videos: [
      {
        id: '4-1',
        image:
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop',
      },
      {
        id: '4-2',
        image:
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
      },
      {
        id: '4-3',
        image:
          'https://images.unsplash.com/photo-1574267432644-f610a5099f10?w=300&h=200&fit=crop',
      },
    ],
  },
  {
    id: '5',
    title: 'Entertainment & Storytelling',
    videos: [
      {
        id: '5-1',
        image:
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
      },
      {
        id: '5-2',
        image:
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop',
      },
      {
        id: '5-3',
        image:
          'https://images.unsplash.com/photo-1574267432644-f610a5099f10?w=300&h=200&fit=crop',
      },
    ],
  },
];

const FavouriteScreen = props => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const basicStyles = createBasicStyles(theme);

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity style={styles.videoCard}>
      <Image source={{ uri: item.image }} style={styles.videoImage} />
    </TouchableOpacity>
  );

  const renderCategorySection = ({ item }) => (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{item.title}</Text>
        <TouchableOpacity
          onPress={() =>
            props.navigation.navigate('EntertainmentStorytellingScreen')
          }
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={item.videos}
        renderItem={renderVideoItem}
        keyExtractor={video => video.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.videoList}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.transparent} // Matches the image background style
        barStyle={'light-content'}
      />
      <CustomHeader showBackButton={true} showNotifications={false} />

      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>Favorite Channel</Text>
      </View>

      <FlatList
        data={categoriesData}
        renderItem={renderCategorySection}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    titleContainer: {
      backgroundColor: theme.background,
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(16),
    },
    pageTitle: {
      fontSize: moderateScale(22),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      textAlign: 'center',
    },
    contentContainer: {
      paddingBottom: moderateScale(20),
    },
    categorySection: {
      marginTop: moderateScale(20),
      backgroundColor: theme.background,
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
      color: theme.text,
    },
    viewAllText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
    },
    videoList: {
      paddingHorizontal: moderateScale(16),
    },
    videoCard: {
      marginRight: moderateScale(12),
      borderRadius: moderateScale(12),
      overflow: 'hidden',
    },
    videoImage: {
      width: moderateScale(160),
      height: moderateScale(110),
      borderRadius: moderateScale(12),
    },
  });

export default FavouriteScreen;
