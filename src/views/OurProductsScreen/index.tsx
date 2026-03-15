/* eslint-disable react-native/no-inline-styles */
import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import { moderateScale } from 'react-native-size-matters';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomImageComponent from '@components/CustomImageComponent';
import CustomVectorIcons from '@components/CustomVectorIcons';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '@components/CustomButton';
import CustomHeader from '@components/CustomHeader';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { showErrorToast } from '@utils/CustomToast';
import { useFocusEffect } from '@react-navigation/native';
import CustomLoader from '@utils/CustomLoader';
import { useSelector } from 'react-redux';

const CARD_WIDTH = moderateScale(250);
const CARD_MARGIN = moderateScale(10);
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 4;

const OurProductsScreen = ({ navigation }: any) => {
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [activeIndex, setActiveIndex] = useState(0);
  const [Loader, setLoader] = useState(false);
  const [productsData, setProductsData] = useState([]);

  const scrollX = useRef(new Animated.Value(0)).current;

  scrollX.addListener(({ value }) => {
    const index = Math.round(value / SNAP_INTERVAL);
    setActiveIndex(index);
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    }, []),
  );

  async function fetchProducts() {
    setLoader(true);

    try {
      const res = await apiRequest(ApiURL.getModelsList, 'GET', null, true);

      setLoader(false);
      if (!res?.error) {
        setProductsData(res?.data);
      } else {
        const errorMsg =
          res?.message || 'Registration failed. Please try again.';
        showErrorToast(errorMsg);
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoader(false);
      showErrorToast(
        error.message ||
          languageData?.unexpected_error ||
          'Unexpected error occurred',
      );
    }
  }

  const renderItem = ({ item, index }) => (
    <View style={styles.cardContainer}>
      {index === activeIndex ? (
        <LinearGradient
          colors={[
            // theme.themeColorDark,
            theme.themeColor,
            theme.themeColorMid,
            theme.themeLight,
            theme.transparent,
          ]}
          start={{ x: 0.5, y: 0.6 }}
          end={{ x: 0.5, y: 0 }}
          style={[styles.cardBackground, {}]}
        >
          <View style={styles.imageWrapper}>
            <CustomImageComponent
              source={item?.thumbnail}
              style={styles.cardImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.radioButton}>
            <CustomVectorIcons
              name="radio-button-on-outline"
              iconSet="Ionicons"
              size={moderateScale(15)}
              color={theme.white}
            />
          </View>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.cardBackground,
            index === activeIndex
              ? { backgroundColor: theme.themeColor }
              : { backgroundColor: theme.transparent },
          ]}
        >
          <View style={styles.imageWrapper}>
            <CustomImageComponent
              source={item?.thumbnail}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar
        backgroundColor={theme.themeColor}
        barStyle={'light-content'}
      />
      <CustomHeader showBackButton={true} showNotifications={false} />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.versionTag}>
            <Text style={styles.versionText}>
              {productsData &&
                productsData[activeIndex]?.name
                  ?.split(' ')
                  ?.slice(0, 2)
                  ?.join(' ')}{' '}
              {productsData && productsData[activeIndex]?.version}
            </Text>
          </View>
          <Text style={styles.mainTitle}>
            {productsData &&
              productsData[activeIndex]?.name
                ?.split(' ')
                ?.slice(0, 2)
                ?.join(' ')}
          </Text>
          <Text style={styles.subtitle} numberOfLines={3}>
            {productsData && productsData[activeIndex]?.description
              ? productsData[activeIndex].description
              : languageData?.no_description_available ||
                'No description available'}
          </Text>
        </View>

        <Animated.FlatList
          data={productsData}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SNAP_INTERVAL}
          decelerationRate="fast"
          snapToAlignment="center"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal:
              (Dimensions.get('window').width - CARD_WIDTH) / 2 - CARD_MARGIN,
          }}
        />
        <View style={styles.buttonContainer}>
          <CustomButton
            text={languageData?.proceed_button || 'Proceed'}
            backgroundColor={theme.themeColor}
            onPress={() => {
              navigation.navigate('ProductDetailScreen', {
                prevData: productsData[activeIndex],
              });
            }}
            height={moderateScale(55)}
            width={'80%'}
            style={{
              alignSelf: 'center',
              borderRadius: moderateScale(12),
            }}
          />
        </View>
      </View>
      <CustomLoader visible={Loader} />
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
      marginTop: moderateScale(20),
    },
    container: {
      flex: 1,
    },
    headerContainer: {
      alignItems: 'center',
      marginTop: moderateScale(20),
      paddingHorizontal: moderateScale(20),
    },
    versionTag: {
      backgroundColor: theme.green,
      borderRadius: moderateScale(10),
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(5),
      // marginBottom: moderateScale(10),
    },
    versionText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },
    mainTitle: {
      fontSize: moderateScale(36),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: moderateScale(15),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      marginBottom: moderateScale(10),
      textAlign: 'center',
      // marginTop: moderateScale(10),
      lineHeight: moderateScale(22),
    },
    cardContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: CARD_MARGIN / 2,
    },
    cardBackground: {
      width: CARD_WIDTH,
      height: moderateScale(350),
      borderRadius: moderateScale(30),
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    imageWrapper: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardImage: {
      width: '100%',
      height: '90%',
    },
    radioButton: {
      position: 'absolute',
      bottom: moderateScale(15),
      right: moderateScale(15),
      width: moderateScale(25),
      height: moderateScale(25),
      borderRadius: moderateScale(12.5),
      backgroundColor: theme.themeColor,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: moderateScale(2),
      borderColor: theme.white,
    },
    buttonContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingBottom: moderateScale(5),
      // marginTop: 30,
    },
  });

export default OurProductsScreen;
