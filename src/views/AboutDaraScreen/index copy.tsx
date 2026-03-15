import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Switch,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import createBasicStyles from 'styles';
import CustomVectorIcons from '@components/CustomVectorIcons';
import CustomLucideIcon from '@components/CustomLucideIcon';
import CustomLoader from '@utils/CustomLoader';
import FastImage from '@d11/react-native-fast-image';
import IMAGES from '@assets/images';
import CustomHeader from '@components/CustomHeader';

const screenWidth = Dimensions.get('window').width;

const AboutDaraScreen = (props: any) => {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const basicStyles = createBasicStyles(theme);

  const [loading, setLoading] = useState(false);
  const [locationTracking, setLocationTracking] = useState(true);
  const [daraSwitch, setDaraSwitch] = useState(true);

  const customPurple = '#8B5CF6';
  const customLightPurple = '#B8A4F7';

  const ListItem = ({
    title,
    showSwitch = false,
    value,
    onToggle,
    onPress,
  }: {
    title: string;
    showSwitch?: boolean;
    value?: boolean;
    onToggle?: (value: boolean) => void;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={onPress}
      disabled={showSwitch}
      activeOpacity={0.8}
    >
      <Text style={styles.listItemText}>{title}</Text>
      {showSwitch ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: theme.border, true: theme.themeColor }}
          thumbColor={theme.white}
        />
      ) : (
        <CustomVectorIcons
          name="chevron-right"
          iconSet="Feather"
          size={moderateScale(20)}
          color={theme.text}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        backgroundColor={theme.transparent} // Matches the image background style
        barStyle={'light-content'}
      />
      <CustomHeader goBack={true} title="Back" />

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: moderateScale(100) }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>About Dara</Text>

          {/* Boxes Row */}
          <View style={styles.boxesRow}>
            {/* Dara 0.1 Box */}
            <View style={[styles.daraBox, { backgroundColor: customPurple }]}>
              <FastImage
                source={IMAGES.doll}
                style={styles.daraImage}
                resizeMode="cover"
              />
              <Text style={styles.daraTitle}>Dara 0.1</Text>
              <Switch
                value={daraSwitch}
                onValueChange={setDaraSwitch}
                trackColor={{ false: theme.gray, true: theme.themeColor }}
                thumbColor={theme.white}
                style={{
                  transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
                  marginTop: moderateScale(10),
                }}
              />
            </View>

            {/* Right Side Boxes */}
            <View style={styles.rightBoxesColumn}>
              <View
                style={[styles.rightBox, { backgroundColor: customPurple }]}
              >
                <View style={styles.rightBoxHeader}>
                  <CustomLucideIcon
                    name="BatteryCharging"
                    size={moderateScale(30)}
                    color={theme.white}
                  />
                  <View style={{ marginLeft: moderateScale(10) }}>
                    <Text style={styles.percentage}>28%</Text>
                    <Text style={styles.time}>4h 30 min.</Text>
                  </View>
                </View>
                <Text style={styles.rightBoxTitle}>Battery</Text>
              </View>

              <View
                style={[
                  styles.rightBox,
                  {
                    backgroundColor: customLightPurple,
                    marginTop: moderateScale(15),
                  },
                ]}
              >
                <View style={styles.rightBoxHeader}>
                  <CustomLucideIcon
                    name="Volume2"
                    size={moderateScale(30)}
                    color={theme.white}
                  />
                  <View style={{ marginLeft: moderateScale(10) }}>
                    <Text style={styles.percentage}>10%</Text>
                  </View>
                </View>
                <Text style={styles.rightBoxTitle}>Sound</Text>
              </View>
            </View>
          </View>

          {/* List Section */}
          <View style={{ marginTop: moderateScale(30) }}>
            <ListItem
              title="Voice style"
              onPress={() => props.navigation.navigate('VoiceStyleScreen')}
            />

            <ListItem
              title="Subscription/Premium"
              onPress={() => props.navigation.navigate('SubscriptionScreen')}
            />

            <ListItem
              title="Location Tracking"
              showSwitch={true}
              value={locationTracking}
              onToggle={setLocationTracking}
            />

            <ListItem
              title="Setting"
              onPress={() => props.navigation.navigate('SettingsScreen')}
            />
          </View>
        </View>
      </ScrollView>

      <CustomLoader visible={loading} />
    </SafeAreaView>
  );
};

const getStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      marginHorizontal: 20,
      marginTop: moderateScale(20),
    },
    title: {
      fontSize: moderateScale(22),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginBottom: moderateScale(10),
    },
    boxesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    daraBox: {
      width: screenWidth * 0.45,
      height: moderateScale(250),
      borderRadius: moderateScale(16),
      padding: moderateScale(15),
      alignItems: 'center',
      justifyContent: 'space-between',
      elevation: 8,
    },
    daraImage: {
      width: moderateScale(100),
      height: moderateScale(150),
      borderRadius: moderateScale(8),
      marginBottom: moderateScale(10),
      marginTop: moderateScale(10),
    },
    daraTitle: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaBold,
      color: theme.white,
    },
    rightBoxesColumn: {
      flex: 1,
      marginLeft: moderateScale(15),
    },
    rightBox: {
      flex: 1,
      borderRadius: moderateScale(16),
      padding: moderateScale(15),
      justifyContent: 'space-between',
      elevation: 4,
    },
    rightBoxHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rightBoxTitle: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.white,
      position: 'absolute',
      bottom: moderateScale(15),
      left: moderateScale(15),
    },
    percentage: {
      fontSize: moderateScale(24),
      fontFamily: FontFamily.KhulaBold,
      color: theme.white,
    },
    time: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.white,
      opacity: 0.8,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.mainBackground,
      borderRadius: moderateScale(16),
      padding: moderateScale(18),
      marginBottom: moderateScale(10),
      borderWidth: 1,
      borderColor: theme.border,
      minHeight: moderateScale(60),
    },
    listItemText: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
    },
  });

export default AboutDaraScreen;
