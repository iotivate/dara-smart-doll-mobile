/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { useTheme } from '@theme/themeContext';
import CustomHeader from '@components/CustomHeader';
import { moderateScale } from 'react-native-size-matters';
import CustomLucideIcon from '@components/CustomLucideIcon';

const ContentListScreen = ({ route, navigation }: any) => {
  const { categoryId, title } = route.params;
  const { theme } = useTheme();

  const [contentList, setContentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContentByCategory();
  }, []);

  const toggleFavorite = async (contentId: string) => {
    try {
      // Optimistic UI update
      setContentList(prev =>
        prev.map(item =>
          item._id === contentId
            ? { ...item, isFavorite: !item.isFavorite }
            : item,
        ),
      );

      await apiRequest(
        ApiURL.ToggleFavoriteContent,
        'POST',
        { contentId },
        true,
      );
    } catch (error) {
      console.log('Favorite toggle error', error);

      // Rollback UI if API fails
      setContentList(prev =>
        prev.map(item =>
          item._id === contentId
            ? { ...item, isFavorite: !item.isFavorite }
            : item,
        ),
      );
    }
  };

  const fetchContentByCategory = async () => {
    try {
      setLoading(true);

      const url = `${ApiURL.ExistingSession}?keyWord=&categoryId=${categoryId}&page=1&size=10`;

      const res = await apiRequest(url, 'GET', null, true);

      setLoading(false);

      if (!res?.error) {
        setContentList(res?.data?.list || []);
      }
    } catch (error) {
      setLoading(false);
      console.log('Content fetch error', error);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={{
        marginBottom: moderateScale(16),
        backgroundColor: theme.white,
        borderRadius: moderateScale(12),
        overflow: 'hidden',
      }}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate('AudioPlayerScreen', {
          audioUrl: item.audioUrl,
          thumbnail: item.thumbnailUrls?.[0],
          title: item.title,
          description: item.description,
          audioId: item?.audioId || `${item?._id}_${item?.language}`,
        })
      }
    >
      {/* Thumbnail */}
      <View>
        <Image
          source={{ uri: item.thumbnailUrls?.[0] }}
          style={{
            width: '100%',
            height: moderateScale(160),
          }}
        />

        {/* Play Button */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.25)',
          }}
        >
          <CustomLucideIcon name="Play" size={moderateScale(48)} color="#fff" />
        </View>

        {/* ❤️ Favorite Button */}
        <TouchableOpacity
          onPress={() => toggleFavorite(item._id)}
          activeOpacity={0.7}
          style={{
            position: 'absolute',
            top: moderateScale(10),
            right: moderateScale(10),
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: moderateScale(20),
            padding: moderateScale(6),
          }}
        >
          <CustomLucideIcon
            name="Heart"
            size={moderateScale(18)}
            color={item.isFavorite ? theme.themeRed : theme.white}
            fill={item.isFavorite ? theme.themeRed : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Text Content */}
      <View style={{ padding: moderateScale(12) }}>
        <Text
          style={{
            fontSize: moderateScale(16),
            fontWeight: '600',
            color: theme.black,
          }}
        >
          {item.title}
        </Text>

        <Text
          style={{
            fontSize: moderateScale(13),
            color: theme.textSub,
            marginTop: 4,
          }}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  console.log('contentListcontentList', contentList);
  return (
    <View style={{ flex: 1, marginTop: moderateScale(25) }}>
      <CustomHeader
        showBackButton={true}
        showNotifications={false}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={contentList}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: moderateScale(16) }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ContentListScreen;
