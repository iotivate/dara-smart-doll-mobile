/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomButton from '@components/CustomButton';
import IMAGES from '@assets/images';
import CustomHeader from '@components/CustomHeader';
import CustomVectorIcons from '@components/CustomVectorIcons';

const NewWhoIsWatching = (props: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [profiles, setProfiles] = useState([
    { id: 1, name: 'Carlos carlton', avatar: IMAGES.user4, isActive: true },
    { id: 2, name: 'Emily Jack', avatar: IMAGES.user5, isActive: false },
    { id: 3, name: 'Kids', avatar: IMAGES.user6, isActive: false },
  ]);

  // NEW: popup control
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const toggleProfile = (id: number) => {
    setProfiles(
      profiles.map(profile =>
        profile.id === id
          ? { ...profile, isActive: !profile.isActive }
          : profile,
      ),
    );
  };

  const openDeletePopup = (profile: any) => {
    setSelectedProfile(profile);
    setDeletePopupVisible(true);
  };

  const closeDeletePopup = () => {
    setDeletePopupVisible(false);
  };

  const renderProfileCard = (profile: any) => {
    return (
      <View
        key={profile.id}
        style={[
          styles.profileCard,
          !profile.isActive && styles.profileCardInactive,
        ]}
      >
        <View style={styles.profileHeader}>
          <Text
            style={[
              styles.statusText,
              profile.isActive ? styles.activeText : styles.inactiveText,
            ]}
          >
            {profile.isActive ? 'Active' : 'Inactive'}
          </Text>

          <Switch
            value={profile.isActive}
            onValueChange={() => toggleProfile(profile.id)}
            trackColor={{
              false: theme.grayBox,
              true: theme.themeColor,
            }}
            thumbColor={theme.white}
            ios_backgroundColor={theme.grayBox}
          />
        </View>

        <View style={styles.avatarContainer}>
          <Image source={profile.avatar} style={styles.avatar} />
        </View>

        <Text style={styles.profileName}>{profile.name}</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.iconButton, styles.editButton]}
            onPress={() =>
              props.navigation.navigate('NewEditProfile', { profile })
            }
          >
            <CustomVectorIcons
              name="edit"
              iconSet="Feather"
              size={moderateScale(18)}
              color={theme.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.deleteButton]}
            onPress={() => openDeletePopup(profile)}
          >
            <CustomVectorIcons
              name="delete"
              type="MaterialIcons"
              size={moderateScale(18)}
              color={theme.themeRed}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.transparent}
        barStyle={'light-content'}
      />

      <CustomHeader showBackButton={true} showNotifications={false} />

      <View style={styles.content}>
        <Text style={styles.title}>Who's watching?</Text>

        <View style={styles.profilesGrid}>
          {profiles.map(profile => renderProfileCard(profile))}
        </View>

        <CustomButton
          text={'Add New Profile'}
          backgroundColor={theme.themeColor}
          onPress={() => props.navigation.navigate('NewChildProfile')}
          height={moderateScale(55)}
          style={{
            alignSelf: 'center',
            borderRadius: moderateScale(12),
            marginTop: moderateScale(30),
          }}
        />
      </View>

      {/* ------------------------------------------------------
           DELETE POPUP MODAL
      ------------------------------------------------------- */}
      <Modal
        transparent
        animationType="fade"
        visible={deletePopupVisible}
        onRequestClose={closeDeletePopup}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* Top-right close */}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={closeDeletePopup}
            >
              <CustomVectorIcons
                name="close"
                type="AntDesign"
                size={moderateScale(25)}
                color={theme.white}
              />
            </TouchableOpacity>

            {/* Danger icon */}
            <View style={styles.dangerIconContainer}>
              <CustomVectorIcons
                name="warning"
                type="AntDesign"
                size={moderateScale(48)}
                color={theme.themeRed}
              />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Delete Profile?</Text>

            {/* Subtitle */}
            <Text style={styles.modalSubtitle}>
              This action cannot be undone.
            </Text>

            {/* Delete Button */}
            <TouchableOpacity style={styles.modalDeleteButton}>
              <Text style={styles.modalDeleteButtonText}>Delete Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
    },
    content: {
      flex: 1,
      paddingHorizontal: moderateScale(20),
      paddingTop: moderateScale(20),
    },
    title: {
      fontSize: moderateScale(20),
      fontFamily: FontFamily.KhulaBold,
      color: theme.black,
      textAlign: 'center',
      marginBottom: moderateScale(25),
    },
    profilesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    profileCard: {
      width: '48%',
      backgroundColor: theme.white,
      borderRadius: moderateScale(12),
      padding: moderateScale(10),
      marginBottom: moderateScale(15),
      borderWidth: moderateScale(1),
      borderColor: theme.borderColor || '#E5E7EB',
      shadowColor: theme.black,
      shadowOffset: {
        width: 0,
        height: moderateScale(2),
      },
      shadowOpacity: 0.1,
      shadowRadius: moderateScale(4),
      elevation: 3,
    },
    profileCardInactive: {
      opacity: 0.6,
    },
    profileHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: moderateScale(15),
    },
    statusText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaSemiBold,
    },
    activeText: {
      color: '#10B981',
    },
    inactiveText: {
      color: '#9CA3AF',
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: moderateScale(10),
    },
    avatar: {
      width: moderateScale(60),
      height: moderateScale(60),
      borderRadius: moderateScale(30),
    },
    profileName: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
      textAlign: 'center',
      marginBottom: moderateScale(12),
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: moderateScale(8),
    },
    iconButton: {
      flex: 1,
      height: moderateScale(36),
      borderRadius: moderateScale(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: theme.themeColor,
    },
    deleteButton: {
      backgroundColor: '#FFFFFF',
      borderColor: theme.themeRed,
      borderWidth: 1,
    },
    /* -------------------- MODAL -------------------- */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    modalBox: {
      width: '80%',
      backgroundColor: theme.white,
      borderRadius: moderateScale(14),
      paddingVertical: moderateScale(15),
      paddingHorizontal: moderateScale(20),
      alignItems: 'center',
      position: 'relative',
      shadowColor: theme.black,
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },

    modalCloseBtn: {
      position: 'absolute',
      top: moderateScale(-8),
      right: moderateScale(-5),
      padding: moderateScale(6),
      backgroundColor: theme.themeColor,
      borderRadius: 20,
      height: moderateScale(35),
      width: moderateScale(35),
    },

    dangerIconContainer: {
      width: moderateScale(60),
      height: moderateScale(60),
      borderRadius: moderateScale(30),
      // backgroundColor: theme.themeRed + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: moderateScale(5),
    },

    modalTitle: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.themeRed,
    },

    modalSubtitle: {
      fontSize: moderateScale(13),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.themeRed,
      marginBottom: moderateScale(10),
      textAlign: 'center',
    },

    modalDeleteButton: {
      backgroundColor: theme.themeColor,
      width: '100%',
      paddingVertical: moderateScale(12),
      borderRadius: moderateScale(10),
      alignItems: 'center',
    },

    modalDeleteButtonText: {
      color: theme.white,
      fontSize: moderateScale(15),
      fontFamily: FontFamily.KhulaSemiBold,
      fontWeight: 800,
    },
  });

export default NewWhoIsWatching;
