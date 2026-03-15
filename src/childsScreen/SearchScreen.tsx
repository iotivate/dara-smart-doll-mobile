/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import CustomHeader from '@components/CustomHeader';
import { moderateScale } from 'react-native-size-matters';
import CustomLucideIcon from '@components/CustomLucideIcon';
import IMAGES from '@assets/images';

const SearchScreen = ({ navigation }: any) => {
  const { theme } = useTheme();

  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLearningModule();
  }, []);

  // 🔹 FETCH CATEGORIES
  const fetchLearningModule = async () => {
    try {
      // setLoading(true);
      const url = `${ApiURL.categories_users_list}?page=1&size=10`;
      const res = await apiRequest(url, 'GET', null, true);

      if (!res?.error) {
        const convertData = res?.data?.list?.filter(
          (ele: any) => ele?.contents?.length > 0,
        );
        setCategories(convertData);
        console.log('resresresresres', convertData);
      }
    } catch (error) {
      console.log('Error fetching learning categories:', error);
    } finally {
      // setLoading(false);
    }
  };

  // 🔹 SEARCH FILTER (CLIENT SIDE)
  //   const filteredCategories = categories.filter((item:any) =>
  //     item.title?.toLowerCase().includes(search.toLowerCase()),
  //   );
  const filteredCategories = Array.isArray(categories)
    ? categories?.filter((item: any) =>
        (item?.title || '').toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={{
        backgroundColor: theme.white,
        borderRadius: moderateScale(12),
        marginBottom: moderateScale(16),
        overflow: 'hidden',
      }}
      onPress={() => {
        navigation.navigate('ContentListScreen', {
          categoryId: item?._id,
          title: item?.title,
        });
      }}
    >
      <Image
        source={item?.thumbnailUrl ? { uri: item?.thumbnailUrl } : IMAGES.user4}
        style={{
          width: '100%',
          height: moderateScale(160),
        }}
      />

      <View style={{ padding: moderateScale(12) }}>
        <Text
          style={{
            fontSize: moderateScale(16),
            fontWeight: '600',
            color: theme.black,
          }}
        >
          {item?.title || 'Untitled Category'}
        </Text>

        <Text
          numberOfLines={2}
          style={{
            fontSize: moderateScale(13),
            color: theme.textSub,
            marginTop: 4,
          }}
        >
          {item?.description || 'No description available'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CustomHeader
        showBackButton
        backButtonText="Search"
        showNotifications={false}
      />

      {/* 🔍 SEARCH INPUT */}
      <View
        style={{
          margin: moderateScale(16),
          backgroundColor: theme.white,
          borderRadius: moderateScale(12),
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: moderateScale(12),
        }}
      >
        <CustomLucideIcon name="Search" size={18} color={theme.gray} />
        <TextInput
          placeholder="Search categories..."
          value={search}
          onChangeText={setSearch}
          style={{
            flex: 1,
            padding: moderateScale(10),
            color: theme.black,
          }}
        />
      </View>

      {/* 📚 CATEGORY LIST */}
      <FlatList
        data={filteredCategories}
        keyExtractor={(item: any) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: moderateScale(16) }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;
