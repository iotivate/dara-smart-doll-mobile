/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from 'react-native';
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
import CustomLucideIcon from '@components/CustomLucideIcon';
import { useFocusEffect } from '@react-navigation/native';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { showErrorToast } from '@utils/CustomToast';

const { width, height } = Dimensions.get('window');

const ProductDetailScreen = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [loading, setLoading] = useState(true);

  // ============================================
  // Rotation State (Model Rotation)
  // ============================================
  const [modelRotation, setModelRotation] = useState(0);
  const [baseRotation, setBaseRotation] = useState(0);

  const [productsData, setProductsData] = useState<any>(null);
  const { prevData } = props.route?.params;
  const { _id } = prevData;

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    }, []),
  );

  async function fetchProducts() {
    setLoading(true);

    try {
      const res = await apiRequest(
        `${ApiURL.getModelDetails}?_id=${_id}`,
        'GET',
        null,
        true,
      );

      setLoading(false);

      console.log('ProductDetailScreenProductDetailScreen', res);

      if (!res?.error) {
        setProductsData(res?.data);
      } else {
        const errorMsg =
          res?.message || 'Registration failed. Please try again.';
        showErrorToast(errorMsg);
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoading(false);
      showErrorToast(error.message || 'Unexpected error occurred');
    }
  }

  const features = [
    { icon: 'ShieldUser', title: 'Type', description: productsData?.type },
    {
      icon: 'SlidersHorizontal',
      title: 'Frequency',
      description: productsData?.frequency,
    },
    {
      icon: 'ChevronsLeftRightEllipsis',
      title: 'Range',
      description: productsData?.range,
    },
    {
      icon: 'BatteryCharging',
      title: 'Battery Life',
      description: productsData?.batteryLife,
    },
  ];

  // ============================================
  // PanResponder Logic (Overlay Method)
  // ============================================
  const panResponder = React.useRef(
    PanResponder.create({
      // 1. Ask to be the responder
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,

      // 2. When User Touches Down (Start)
      onPanResponderGrant: () => {
        // Store the current rotation angle so we start from here
        setBaseRotation(modelRotation);
      },

      // 3. When User Moves Finger
      onPanResponderMove: (evt, gestureState) => {
        // Calculate new rotation based on how far user moved from start
        // gestureState.dx is horizontal movement
        const sensitivity = 0.005;

        // New rotation = where we were + how much we dragged
        const newRotation = baseRotation + gestureState.dx * sensitivity;

        setModelRotation(newRotation);
      },
    }),
  ).current;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        marginTop: moderateScale(20),
      }}
    >
      <StatusBar
        backgroundColor={theme.transparent}
        barStyle={'light-content'}
      />
      <CustomHeader showBackButton={true} showNotifications={false} />

      <View style={styles.container}>
        <Text style={styles.title}>About {prevData?.name}</Text>

        {productsData && (
          <View style={{ flex: 1 }}>
            <StatusBar hidden />

            {productsData?.liveModel ? (
              <FilamentScene>
                {/* Container for the 3D View and the Overlay */}
                <View style={{ flex: 1 }}>
                  <FilamentView style={{ flex: 1 }}>
                    <DefaultLight />
                    <Model
                      source={{ uri: productsData.liveModel }}
                      scale={[170, 170, 170]}
                      translate={[0, -1, 0]}
                      // Apply the rotation state to the Model's Y axis
                      rotate={[modelRotation, 0, 0]}
                    />
                    {/* Camera stays static, Model rotates */}
                    <Camera orbit={{ x: 0, y: 0, z: 6 }} fov={45} />
                  </FilamentView>

                  {/* 
                    FIX: Transparent Overlay View 
                    This sits ON TOP of the 3D View to capture touches.
                    Because it has pointerEvents="box-none" or auto, 
                    it gets the gesture, and PanResponder works.
                  */}
                  <View
                    style={[
                      styles.touchOverlay,
                      { backgroundColor: 'transparent' },
                    ]}
                    {...panResponder.panHandlers}
                  />
                </View>
              </FilamentScene>
            ) : (
              <Text
                style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}
              >
                Loading 3D Model...
              </Text>
            )}
          </View>
        )}

        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.productName}>{prevData?.name}</Text>
            <Text style={styles.versionTag}>
              {prevData?.name} {prevData?.version}
            </Text>
          </View>

          <Text style={styles.description}>{prevData?.description}</Text>

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
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={() => props.navigation.navigate('SuccessScreen')}
          >
            <Text style={styles.proceedText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomLoader visible={loading} />
    </View>
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
      borderRadius: moderateScale(10),
      overflow: 'hidden',
    },
    modelView: {
      flex: 1,
    },

    // New Style for the Touch Overlay
    touchOverlay: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10, // Ensure it is on top of the 3D view
    },

    infoContainer: {
      padding: moderateScale(20),
      backgroundColor: theme.themeLight,
      borderRadius: moderateScale(20),
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(2),
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

export default ProductDetailScreen;
