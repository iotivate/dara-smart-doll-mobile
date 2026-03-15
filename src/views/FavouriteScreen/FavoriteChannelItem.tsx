// import React from 'react';
// import { Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
// import FontFamily from '@assets/fonts/FontFamily';

// const FavoriteChannelItem = ({ item }: any) => {
//   return (
//     <TouchableOpacity style={styles.container}>
//       <Image source={item.img} style={styles.image} />
//       <Text style={styles.name}>{item.name}</Text>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#EFE7FF',
//     borderRadius: 12,
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 8,
//     marginRight: 12,
//     width: 78,
//   },

//   image: {
//     width: 38,
//     height: 38,
//     borderRadius: 24,
//   },

//   name: {
//     marginTop: 6,
//     fontSize: 10,
//     fontFamily: FontFamily.KhulaRegular,
//     color: '#7A6CCF',
//     textAlign: 'center',
//   },
// });

// export default FavoriteChannelItem;

import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import IMAGES from '@assets/images';

const { width } = Dimensions.get('window');

const favUsers = [
  { id: '1', img: IMAGES.user4, name: 'Jason Tan' },
  { id: '2', img: IMAGES.user5, name: 'Lydia Ross' },
  { id: '3', img: IMAGES.user6, name: 'Joseph Elen' },
  { id: '4', img: IMAGES.user5, name: 'Noorie' },
  { id: '5', img: IMAGES.user4, name: 'Linden Press' },
];

const ITEM_COUNT = 5;
const ITEM_SIZE = (width - 40) / ITEM_COUNT;

const FavoriteChannelRow = () => {
  return (
    <View style={styles.container}>
      {favUsers.map(item => (
        <Image
          key={item.id}
          source={item.img}
          style={styles.image}
          resizeMode="cover"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#EFE7FF',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  image: {
    width: ITEM_SIZE - 10,
    height: ITEM_SIZE - 10,
    borderRadius: 24,
  },
});

export default FavoriteChannelRow;
