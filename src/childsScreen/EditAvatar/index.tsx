import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import CustomLucideIcon from '@components/CustomLucideIcon';
import FontFamily from '@assets/fonts/FontFamily';
import IMAGES from '@assets/images';
import CustomHeader from '@components/CustomHeader';

const avatarData = [
  {
    id: '1',
    name: 'Carlos carlton',
    image: IMAGES.user4,
  },
  {
    id: '2',
    name: 'Emily Jack',
    image: IMAGES.user4,
  },
  {
    id: '3',
    name: 'Kids',
    image: IMAGES.user4,
  },
  {
    id: '4',
    name: 'Jennifer',
    image: IMAGES.user4,
  },
];

const EditAvatar = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <CustomHeader showBackButton={true} showNotifications={false} />

      {/* Gradient Header Background */}
      <View style={styles.title}>
        <Text style={styles.pageTitle}>Set your Avatar</Text>
      </View>

      {/* Avatar List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.avatarGrid}>
          {avatarData.map(item => (
            <TouchableOpacity key={item.id} style={styles.avatarItem}>
              <View style={styles.avatarWrapper}>
                <Image source={item.image} style={styles.avatarImage} />

                <TouchableOpacity
                  style={styles.editIcon}
                  onPress={() => navigation.navigate('ChildProfile')}
                >
                  <CustomLucideIcon
                    name="Pencil"
                    size={16}
                    color={theme.white}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.avatarName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
    },
    title: {
      alignItems: 'center',
      marginTop: moderateScale(18),
    },
    pageTitle: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaBold,
      color: theme.black,
    },
    scrollContent: {
      paddingVertical: moderateScale(20),
      paddingHorizontal: moderateScale(16),
    },
    avatarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      rowGap: moderateScale(20),
      columnGap: moderateScale(10),
    },
    avatarItem: {
      width: '40%',
      alignItems: 'center',
    },
    avatarWrapper: {
      position: 'relative',
      backgroundColor: theme.themeLight,
      borderRadius: moderateScale(60),
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarImage: {
      width: moderateScale(100),
      height: moderateScale(100),
      borderRadius: moderateScale(50),
    },
    editIcon: {
      position: 'absolute',
      bottom: moderateScale(6),
      right: moderateScale(6),
      backgroundColor: theme.themeColor,
      borderRadius: moderateScale(16),
      padding: moderateScale(6),
    },
    avatarName: {
      marginTop: moderateScale(8),
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.black,
      textAlign: 'center',
    },
  });

export default EditAvatar;
