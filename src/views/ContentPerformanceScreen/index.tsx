/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import { moderateScale } from 'react-native-size-matters';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import CustomVectorIcons from '@components/CustomVectorIcons';
import CustomHeader from '@components/CustomHeader';

const screenWidth = Dimensions.get('window').width;

const ContentPerformanceScreen = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [selectedTab, setSelectedTab] = useState<'week' | 'today'>('today');

  const mostUsed = [
    {
      id: 1,
      title: 'Study',
      icon: 'book',
      iconSet: 'Ionicons',
      time: '2h 20m',
    },
    {
      id: 2,
      title: 'Music',
      icon: 'musical-notes',
      iconSet: 'Ionicons',
      time: '2h 20m',
    },
    {
      id: 3,
      title: 'Entertainment',
      icon: 'tv',
      iconSet: 'Feather',
      time: '2h 20m',
    },
    {
      id: 4,
      title: 'Music',
      icon: 'musical-notes',
      iconSet: 'Ionicons',
      time: '2h 20m',
    },
    {
      id: 5,
      title: 'Entertainment',
      icon: 'tv',
      iconSet: 'Feather',
      time: '2h 20m',
    },
  ];

  const chartData = {
    labels: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    datasets: [
      {
        data: [400, 300, 350, 280, 320, 500, 100],
        colors: [
          () => theme.themeColor,
          () => '#C68BFF',
          () => '#8B5CF6',
          () => '#A78BFA',
          () => '#C084FC',
          () => '#D8B4FE',
          () => '#E9D5FF',
        ],
      },
    ],
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        backgroundColor={theme.transparent} // Matches the image background style
        barStyle={'light-content'}
      />
      <CustomHeader showBackButton={true} showNotifications={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header Switch */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setSelectedTab('week')}
            style={[styles.tab, selectedTab === 'week' && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'week' && styles.activeTabText,
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('today')}
            style={[styles.tab, selectedTab === 'today' && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'today' && styles.activeTabText,
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>
        </View>

        {/* Screen Time */}
        <View style={styles.card}>
          <Text style={styles.dateText}>Today, 22 August</Text>
          <Text style={styles.totalTime}>6h 15m</Text>

          <BarChart
            data={chartData}
            width={screenWidth - 60}
            height={220}
            fromZero
            chartConfig={{
              backgroundColor: theme.mainBackground,
              backgroundGradientFrom: theme.mainBackground,
              backgroundGradientTo: theme.mainBackground,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.themeColorDark,
              labelColor: () => theme.text,
              barPercentage: 0.6,
            }}
            withInnerLines={false}
            showBarTops={false}
            style={styles.chartStyle}
          />

          <View style={styles.categoryRow}>
            <Text style={[styles.categoryText, { color: theme.text }]}>
              Social <Text style={styles.categoryTime}>3h</Text>
            </Text>
            <Text style={[styles.categoryText, { color: theme.text }]}>
              Entertainment <Text style={styles.categoryTime}>2h 22m</Text>
            </Text>
            <Text style={[styles.categoryText, { color: theme.text }]}>
              Utilities <Text style={styles.categoryTime}>44m</Text>
            </Text>
          </View>

          <Text style={styles.updateText}>Updated today at 6:17 PM</Text>
        </View>

        {/* Most Used */}
        <View style={{ marginTop: moderateScale(20) }}>
          <Text style={styles.sectionTitle}>MOST USED</Text>

          {mostUsed.map((item, index) => (
            <View key={index} style={styles.usageCard}>
              <View style={styles.usageRow}>
                <View style={styles.iconContainer}>
                  <CustomVectorIcons
                    name={item.icon}
                    iconSet={item.iconSet}
                    size={moderateScale(20)}
                    color={theme.themeColor}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.usageTitle}>{item.title}</Text>
                  <View style={styles.progressBarBackground}>
                    <View style={styles.progressBarFill} />
                  </View>
                </View>
                <Text style={styles.usageTime}>{item.time}</Text>
                <CustomVectorIcons
                  name="chevron-down"
                  iconSet="Feather"
                  size={moderateScale(18)}
                  color={theme.gray}
                  style={{ marginLeft: moderateScale(8) }}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    scrollContainer: {
      paddingHorizontal: moderateScale(20),
      paddingBottom: moderateScale(30),
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: theme.themeColorDark,
      borderRadius: moderateScale(12),
      marginTop: moderateScale(20),
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: moderateScale(10),
      borderRadius: moderateScale(12),
    },
    activeTab: {
      backgroundColor: theme.text,
      elevation: 3,
    },
    tabText: {
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(14),
      color: theme.text,
    },
    activeTabText: {
      color: theme.black,
    },
    card: {
      backgroundColor: theme.mainBackground,
      borderRadius: moderateScale(15),
      marginTop: moderateScale(25),
      padding: moderateScale(15),
    },
    dateText: {
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(13),
      color: theme.text,
    },
    totalTime: {
      fontFamily: FontFamily.KhulaBold,
      fontSize: moderateScale(24),
      color: theme.text,
      marginBottom: moderateScale(10),
    },
    chartStyle: {
      marginVertical: moderateScale(10),
      borderRadius: moderateScale(10),
      alignSelf: 'center',
    },
    categoryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: moderateScale(10),
    },
    categoryText: {
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(12),
    },
    categoryTime: {
      color: theme.text,
    },
    updateText: {
      marginTop: moderateScale(10),
      fontFamily: FontFamily.KhulaRegular,
      fontSize: moderateScale(11),
      color: theme.text,
    },
    sectionTitle: {
      fontFamily: FontFamily.KhulaBold,
      fontSize: moderateScale(14),
      color: theme.text,
      marginBottom: moderateScale(10),
    },
    usageCard: {
      backgroundColor: theme.mainBackground,
      borderRadius: moderateScale(12),
      padding: moderateScale(12),
      marginBottom: moderateScale(10),
    },
    usageRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      backgroundColor: theme.mainBackground,
      borderRadius: moderateScale(10),
      padding: moderateScale(8),
      marginRight: moderateScale(10),
    },
    usageTitle: {
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(13),
      color: theme.text,
      marginBottom: moderateScale(4),
    },
    progressBarBackground: {
      width: '100%',
      height: moderateScale(6),
      backgroundColor: '#E9D5FF',
      borderRadius: moderateScale(5),
    },
    progressBarFill: {
      width: '85%',
      height: '100%',
      backgroundColor: theme.themeColor,
      borderRadius: moderateScale(5),
    },
    usageTime: {
      fontFamily: FontFamily.KhulaSemiBold,
      fontSize: moderateScale(13),
      color: theme.text,
      marginLeft: moderateScale(8),
    },
  });

export default ContentPerformanceScreen;
