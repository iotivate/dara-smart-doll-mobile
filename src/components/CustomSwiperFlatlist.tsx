/* eslint-disable react-native/no-inline-styles */
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
} from 'react-native';
import FontFamily from '@assets/fonts/FontFamily';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '@theme/themeContext';
import CustomLucideIcon from './CustomLucideIcon';
import { moderateScale } from 'react-native-size-matters';

interface SwiperItem {
  id: string;
  source: any;
  heading: string;
  content: string;
}

interface CustomSwiperFlatlistProps {
  data: SwiperItem[];
  onIndexChanged: (index: number) => void;
  onNextTap: () => void;
}

const SCREEN_WIDTH = wp('100%');

const CustomSwiperFlatlist = forwardRef(
  ({ data, onIndexChanged, onNextTap }: CustomSwiperFlatlistProps, ref) => {
    const { theme } = useTheme();

    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    useImperativeHandle(ref, () => ({
      scrollToNext: () => {
        scrollX.stopAnimation(value => {
          const currentIndex = Math.round(value / SCREEN_WIDTH);
          const nextIndex = Math.min(data.length - 1, currentIndex + 1);
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        });
      },
    }));

    return (
      <View
        style={{
          height: hp('80%'),
          width: '100%',
          position: 'absolute',
          zIndex: 200,
          top: 100,
        }}
      >
        <Animated.FlatList
          ref={flatListRef}
          horizontal
          pagingEnabled
          data={data}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={e => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
            );
            onIndexChanged(index);
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )}
          renderItem={({ item, index }) => (
            <SwiperItemComponent
              item={item}
              index={index}
              scrollX={scrollX}
            />
          )}
        />

        {/* Pagination + Next */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginHorizontal: moderateScale(20),
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            {data.map((_, index) => {
              const inputRange = [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ];

              const width = scrollX.interpolate({
                inputRange,
                outputRange: [8, 25, 8],
                extrapolate: 'clamp',
              });

              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.8, 1.2, 0.8],
                extrapolate: 'clamp',
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.5, 1, 0.5],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={index}
                  style={{
                    height: 8,
                    borderRadius: 5,
                    backgroundColor: theme.themeColor,
                    marginHorizontal: 5,
                    width,
                    opacity,
                    transform: [{ scale }],
                  }}
                />
              );
            })}
          </View>

          <Pressable onPress={onNextTap}>
            <CustomLucideIcon
              name="ArrowRightCircle"
              color={theme.themeColor}
              size={moderateScale(45)}
            />
          </Pressable>
        </View>
      </View>
    );
  },
);

const SwiperItemComponent = ({
  item,
  index,
  scrollX,
}: {
  item: SwiperItem;
  index: number;
  scrollX: Animated.Value;
}) => {
  const { theme } = useTheme();

  const scale = scrollX.interpolate({
    inputRange: [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ],
    outputRange: [0.85, 1, 0.85],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        width: SCREEN_WIDTH,
        height: hp('60%'),
        transform: [{ scale }],
      }}
    >
      <Image
        source={item.source}
        style={{ width: '100%', height: '90%', resizeMode: 'contain' }}
      />

      <Text
        style={{
          fontSize: 26,
          fontFamily: FontFamily.KhulaExtraBold,
          color: theme.black,
          textAlign: 'center',
          marginVertical: hp('1.5%'),
        }}
      >
        {item.heading}
      </Text>

      <Text
        style={{
          fontSize: 15,
          fontFamily: FontFamily.KhulaRegular,
          textAlign: 'center',
          color: theme.black,
          width: '85%',
          alignSelf: 'center',
        }}
      >
        {item.content}
      </Text>
    </Animated.View>
  );
};

export default CustomSwiperFlatlist;
