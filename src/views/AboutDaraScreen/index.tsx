import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import CustomLoader from '@utils/CustomLoader';
import CustomHeader from '@components/CustomHeader';
import {
  FilamentScene,
  FilamentView,
  DefaultLight,
  Model,
  Camera,
} from 'react-native-filament';
import { useSharedValue } from 'react-native-worklets-core';
import CustomLucideIcon from '@components/CustomLucideIcon';

const screenWidth = Dimensions.get('window').width;

const AboutDaraScreen = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [loading, setLoading] = React.useState(false);

  // 🌀 Shared rotation values (for native-thread smoothness)
  const rotation = useSharedValue<[number, number, number]>([0, 0, 0]);

  // 🖐️ Handle drag gestures to rotate model
  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const rotateSpeed = 0.002; // tweak sensitivity
        const newY = rotation.value[1] + gesture.dx * rotateSpeed;
        const newX = rotation.value[0] + gesture.dy * rotateSpeed;

        rotation.value = [newX, newY, 0]; // update rotation live
      },
    }),
  ).current;

  const renderCallback = useCallback(() => {
    'worklet';
    // You could auto-rotate or add animation logic here later
  }, []);

  const features = [
    { icon: 'ShieldUser', title: 'Type', description: 'Lorem Ipsum' },
    {
      icon: 'SlidersHorizontal',
      title: 'Frequency',
      description: 'Lorem Ipsum',
    },
    {
      icon: 'ChevronsLeftRightEllipsis',
      title: 'Range',
      description: 'Lorem Ipsum',
    },
    {
      icon: 'BatteryCharging',
      title: 'Battery Life',
      description: 'Lorem Ipsum',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        backgroundColor={theme.transparent}
        barStyle={'light-content'}
      />
      <CustomHeader goBack={true} title="Back" />

      <View style={styles.container}>
        <Text style={styles.title}>About Dara</Text>

        <View style={styles.modelContainer} {...panResponder.panHandlers}>
          <FilamentScene>
            <FilamentView
              style={styles.modelView}
              renderCallback={renderCallback}
            >
              <DefaultLight intensity={1.3} />

              <Model
                source={{
                  uri: 'https://raw.githubusercontent.com/google/filament/main/third_party/models/DamagedHelmet/DamagedHelmet.glb',
                }}
                rotate={rotation}
                scale={[2.5, 2.5, 2.5]}
                translate={[0, 0.2, 0]}
              />

              <Camera orbit={{ x: 0, y: 0, z: 3 }} fov={45} />
            </FilamentView>
          </FilamentScene>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.productName}>Dara</Text>
            <Text style={styles.versionTag}>Data V3.0</Text>
          </View>

          <Text style={styles.description}>
            Lorem Ipsum is simply dummy text
          </Text>

          <View style={styles.featureRowContainer}>
            {features.map((feature, index) => (
              <View style={styles.featureItem} key={index}>
                <View style={styles.featureIcon}>
                  <CustomLucideIcon
                    name={feature.icon as any}
                    color={theme.themeColor}
                    size={moderateScale(30)}
                  />
                </View>
                <View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Proceed Button */}
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={() => props.navigation.navigate('SuccessScreen')}
          >
            <Text style={styles.proceedText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomLoader visible={loading} />
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,

      marginTop: moderateScale(20),
    },
    title: {
      fontSize: moderateScale(22),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginBottom: moderateScale(10),
      marginHorizontal: moderateScale(20),
    },
    modelContainer: {
      flex: 1,
      // backgroundColor: '#000',
      borderRadius: moderateScale(10),
      overflow: 'hidden',
      // marginTop: moderateScale(10),
    },
    modelView: {
      flex: 1,
    },

    infoContainer: {
      padding: moderateScale(20),
      backgroundColor: theme.themeLight,
      borderRadius: moderateScale(20),
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(12),
      marginBottom: moderateScale(8),
    },
    productName: {
      fontSize: moderateScale(24),
      color: theme.text,
      fontFamily: FontFamily.KhulaBold,
    },
    versionTag: {
      backgroundColor: theme.themeColor,
      color: theme.white,
      fontSize: moderateScale(12),
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(4),
      borderRadius: moderateScale(12),
      marginTop: moderateScale(-4),
    },
    description: {
      fontSize: moderateScale(14),
      color: theme.text,
      marginBottom: moderateScale(20),
      fontFamily: FontFamily.KhulaRegular,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: moderateScale(12),
    },
    featureRowContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: moderateScale(20),
    },

    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '48%',
      gap: moderateScale(4),
    },

    featureIcon: {
      backgroundColor: theme.white,
      padding: moderateScale(8),
      borderRadius: moderateScale(8),
      marginRight: moderateScale(8),
    },

    featureTitle: {
      fontSize: moderateScale(14),
      fontWeight: '600',
      color: theme.text,
      fontFamily: FontFamily.KhulaBold,
    },

    featureDesc: {
      fontSize: moderateScale(12),
      color: theme.text,
      fontFamily: FontFamily.KhulaRegular,
    },

    proceedButton: {
      marginTop: moderateScale(24),
      backgroundColor: theme.themeColor,
      paddingVertical: moderateScale(16),
      borderRadius: moderateScale(16),
      alignItems: 'center',
      shadowColor: '#8B7BC4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    proceedText: {
      fontSize: moderateScale(16),
      fontWeight: '600',
      color: '#FFF',
    },
  });

export default AboutDaraScreen;
