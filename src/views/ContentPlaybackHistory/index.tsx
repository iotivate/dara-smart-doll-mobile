import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import CustomHeader from '@components/CustomHeader';

const filterTabs = [
  { id: '1', label: 'All' },
  { id: '2', label: 'Video' },
  { id: '3', label: 'Shorts' },
  { id: '4', label: 'Music' },
  { id: '5', label: 'Podcasts' },
];

const todayData = [
  {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
    title: 'Cute Puppy',
  },
  {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop',
    title: 'Kids Show',
  },
  {
    id: '3',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    title: 'Animation',
  },
  {
    id: '4',
    image:
      'https://images.unsplash.com/photo-1574267432644-f610a5099f10?w=300&h=200&fit=crop',
    title: 'Unicorn',
  },
];

const yesterdayTopData = [
  {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=250&h=350&fit=crop',
    title: 'Minecraft Adventures',
    channel: 'Gaming Bros',
  },
  {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=250&h=350&fit=crop',
    title: 'Character Animation',
    channel: 'Art Studio',
  },
  {
    id: '3',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=350&fit=crop',
    title: 'Kids Tutorial',
    channel: 'Learn Fun',
  },
];

const yesterdayBottomData = [
  {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop',
    title: 'Game Time',
  },
  {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop',
    title: 'Cartoon Fun',
  },
  {
    id: '3',
    image:
      'https://images.unsplash.com/photo-1574267432644-f610a5099f10?w=300&h=200&fit=crop',
    title: 'Magic Show',
  },
];

const ContentPlaybackHistory = () => {
  const [selectedFilter, setSelectedFilter] = useState('1');
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const renderFilterTab = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        selectedFilter === item.id && styles.filterTabActive,
      ]}
      onPress={() => setSelectedFilter(item.id)}
    >
      <Text
        style={[
          styles.filterTabText,
          selectedFilter === item.id && styles.filterTabTextActive,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderTodayItem = ({ item }) => (
    <TouchableOpacity style={styles.todayItem}>
      <Image source={{ uri: item.image }} style={styles.todayImage} />
    </TouchableOpacity>
  );

  const renderYesterdayTopItem = ({ item }) => (
    <TouchableOpacity style={styles.yesterdayTopItem}>
      <Image source={{ uri: item.image }} style={styles.yesterdayTopImage} />
      <View style={styles.channelBadge}>
        <View style={styles.channelAvatar} />
        <Text style={styles.channelText}>{item.channel}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderYesterdayBottomItem = ({ item }) => (
    <TouchableOpacity style={styles.yesterdayBottomItem}>
      <Image source={{ uri: item.image }} style={styles.yesterdayBottomImage} />
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.transparent} // Matches the image background style
        barStyle={'light-content'}
      />
      <CustomHeader showBackButton={true} showNotifications={false} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* History Title */}
        <Text style={styles.historyTitle}>History</Text>

        {/* Filter Tabs */}
        <FlatList
          data={filterTabs}
          renderItem={renderFilterTab}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />

        {/* Today Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          <FlatList
            data={todayData}
            renderItem={renderTodayItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Yesterday Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yesterday</Text>

          {/* Top Row - Vertical Cards */}
          <FlatList
            data={yesterdayTopData}
            renderItem={renderYesterdayTopItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />

          {/* Bottom Row - Horizontal Cards */}
          <FlatList
            data={yesterdayBottomData}
            renderItem={renderYesterdayBottomItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.horizontalList,
              styles.bottomRowList,
            ]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    historyTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
    },
    filterList: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    filterTab: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#E5E7EB',
      marginRight: 8,
    },
    filterTabActive: {
      backgroundColor: theme.themeColorDark,
    },
    filterTabText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#666',
    },
    filterTabTextActive: {
      color: theme.text,
    },
    section: {
      marginTop: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    horizontalList: {
      paddingHorizontal: 16,
    },
    bottomRowList: {
      marginTop: 12,
    },
    todayItem: {
      marginRight: 12,
    },
    todayImage: {
      width: 140,
      height: 100,
      borderRadius: 12,
    },
    yesterdayTopItem: {
      marginRight: 12,
      position: 'relative',
    },
    yesterdayTopImage: {
      width: 130,
      height: 180,
      borderRadius: 12,
    },
    channelBadge: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    channelAvatar: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#FFF',
      marginRight: 6,
    },
    channelText: {
      fontSize: 11,
      color: '#FFF',
      fontWeight: '500',
    },
    yesterdayBottomItem: {
      marginRight: 12,
    },
    yesterdayBottomImage: {
      width: 140,
      height: 100,
      borderRadius: 12,
    },
    progressBar: {
      width: '100%',
      height: 3,
      backgroundColor: '#E5E7EB',
      borderRadius: 2,
      marginTop: 4,
    },
    progressFill: {
      width: '40%',
      height: '100%',
      backgroundColor: '#EF4444',
      borderRadius: 2,
    },
  });

export default ContentPlaybackHistory;
