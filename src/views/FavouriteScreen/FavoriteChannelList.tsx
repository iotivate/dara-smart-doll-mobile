/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Pass the favorite users as props
const FavoriteChannelList = ({ data }: any) => {
  const usersToShow = data.slice(0, 5); // show only first 5

  // Calculate width for each image
  const containerPadding = 20; // padding inside the box
  const spacing = 10; // space between images
  const itemWidth =
    (width - containerPadding - spacing * (usersToShow.length - 1)) /
    usersToShow.length;

  return (
    <View style={styles.container}>
      {usersToShow.map((item: any) => (
        <Image
          key={item.id}
          source={item.img}
          style={[styles.image, { width: itemWidth, height: itemWidth }]}
          resizeMode="cover"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#EFE7FF', // single background
    borderRadius: 12,
    padding: 10,
    justifyContent: 'space-between',
    marginVertical: 10,
    marginRight: 10,
  },
  image: {
    borderRadius: 24,
  },
});

export default FavoriteChannelList;
