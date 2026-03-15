import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import createBasicStyles from 'styles';
import CustomLoader from '@utils/CustomLoader';
import IMAGES from '@assets/images';
import { Navigation } from 'lucide-react-native';
import CustomHeader from '@components/CustomHeader';

const EntertainmentStorytellingScreen = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const basicStyles = createBasicStyles(theme);
  const [loading, setLoading] = useState(false);

  const cardImages = [IMAGES.doll, IMAGES.doll, IMAGES.doll, IMAGES.doll];
  const smallImages = [IMAGES.doll, IMAGES.doll, IMAGES.doll, IMAGES.doll];

  const entertainmentItems = [
    { id: '1', title: 'Talking Dara Hero', subtitle: 'Dash' },
    { id: '2', title: 'Talking Dara Hero', subtitle: 'Dash' },
    { id: '3', title: 'Talking Dara Hero', subtitle: 'Dash' },
    { id: '4', title: 'Talking Dara Hero', subtitle: 'Dash' },
  ];

  const handleItemSelect = (item: any) => {
    props.navigation.navigate('CartoonVideoScreen');
   };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => handleItemSelect(item)}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={cardImages[index % cardImages.length]}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.bottomOverlay}>
          <Image
            source={smallImages[index % smallImages.length]}
            style={styles.smallImage}
            resizeMode="contain"
          />
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        backgroundColor={theme.transparent} // Matches the image background style
        barStyle={'light-content'}
      />
      <CustomHeader showBackButton={true} showNotifications={false} />

      <View style={styles.container}>
        <Text style={styles.title}>Entertainment & Storytelling</Text>

        <FlatList
          data={entertainmentItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
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
      marginHorizontal: 20,
      marginTop: moderateScale(20),
    },
    title: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      textAlign: 'left',
      marginBottom: moderateScale(-30),
    },
    listContainer: {
      paddingVertical: moderateScale(10),
      flexGrow: 1,
      justifyContent: 'center',
    },
    columnWrapper: {
      justifyContent: 'space-between',
      marginBottom: moderateScale(20),
    },
    itemCard: {
      width: '48%',
      borderRadius: moderateScale(15),
      height: moderateScale(240),
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    imageBackground: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    imageStyle: {
      borderRadius: moderateScale(15),
    },
    bottomOverlay: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: moderateScale(10),
    },
    smallImage: {
      width: moderateScale(34),
      height: moderateScale(34),
      borderRadius: moderateScale(6),
      marginRight: moderateScale(10),
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    itemTitle: {
      fontSize: moderateScale(10),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginBottom: moderateScale(2),
    },
    itemSubtitle: {
      fontSize: moderateScale(10),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },
  });

export default EntertainmentStorytellingScreen;
