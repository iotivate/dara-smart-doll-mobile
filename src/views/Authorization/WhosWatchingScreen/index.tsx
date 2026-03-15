/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';

import FontFamily from '@assets/fonts/FontFamily';

import CustomButton from '@components/CustomButton';
import CustomVectorIcons from '@components/CustomVectorIcons';
import CustomLoader from '@utils/CustomLoader';
import { useFocusEffect } from '@react-navigation/native';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import CustomImageComponent from '@components/CustomImageComponent';
import IMAGES from '@assets/images';
import { showErrorToast } from '@utils/CustomToast';
import {
  getProfile,
  getSettingsdata,
  getChildrenProfiles,
} from '@utils/Redux_api_fun';
import { useDispatch, useSelector } from 'react-redux';
import CustomHeader from '@components/CustomHeader';

const WhosWatchingScreen = (props: any) => {
  const { theme } = useTheme();
  const languageData = useSelector((state: any) => state?.data?.languageData);
  const styles = getStyles(theme);
  // const basicStyles = createBasicStyles(theme);
  const dispatch = useDispatch<any>();
  const [loading, setLoading] = useState(false);
  const [parentProfileData, setParentProfileData] = useState(null);
  const [profileData, setProfileData] = useState([]);
  const [errorMessage, seterrorMessage] = useState('');
  // const [FailedModalState, setFailedModalState] = useState(false);

  // Delete modal states
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  // Password update modal states
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete operation states
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);

  // 🔹 Local UI-only active/inactive state
  const [profileActiveMap, setProfileActiveMap] = useState<{
    [key: string]: boolean;
  }>({});

  // View profile modal
  const [viewProfileVisible, setViewProfileVisible] = useState(false);
  const [viewProfileData, setViewProfileData] = useState<any>(null);

  // Get children list from Redux store
  const childrenList = useSelector((state: any) => state?.data?.childrenList);

  let myData = useSelector((state: any) => state?.data);
  let { getprofiledata, settingsData } = myData;

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
      fetchProfileAndOthers();
      fetchCommonSettings();
    }, []),
  );

  React.useEffect(() => {
    // Initialize profileActiveMap from API data
    const map: any = {};
    childrenList?.forEach((item: any) => {
      map[item._id] = item.isActive === true;
    });
    setProfileActiveMap(map);
  }, [childrenList]);

  // Function to toggle profile active status via API
  const toggleProfileActive = async (id: string) => {
    try {
      const currentStatus = profileActiveMap[id];
      const newStatus = !currentStatus;

      // Prepare payload for API
      const payload = {
        _id: id,
        isActive: newStatus,
      };

      console.log('Updating profile status:', payload);

      // Call API to update isActive status
      const response = await apiRequest(
        ApiURL.toggleChildActiveStatus,
        'POST',
        payload,
        true,
      );

      if (!response?.error) {
        // Update local state if API call is successful
        setProfileActiveMap(prev => ({
          ...prev,
          [id]: newStatus,
        }));

        // Show success message
        Alert.alert(
          languageData?.success || 'Success',
          newStatus
            ? languageData?.profile_activated_success
            : languageData?.profile_deactivated_success,
        );

        // Refresh the children list to get updated data
        await dispatch(getChildrenProfiles());
      } else {
        Alert.alert(
          'Error',
          response?.message || 'Failed to update profile status',
        );
      }
    } catch (error: any) {
      console.log('Error updating profile status:', error);
      Alert.alert(
        languageData?.error || 'Error',
        languageData?.network_error || 'Network error occurred',
      );
    }
  };

  const openViewProfile = (profile: any) => {
    setViewProfileData(profile);
    setViewProfileVisible(true);
  };

  const closeViewProfile = () => {
    setViewProfileVisible(false);
    setViewProfileData(null);
  };

  const handleEditProfile = (profile: any) => {
    props.navigation.navigate('VerifyPin', {
      mode: 'CONFIRM_PIN',
      onSuccess: () => {
        props.navigation.navigate('EditNewProfile', {
          prevData: profile,
        });
      },
    });
  };

  /**
   * Fetch profile data including parent and children
   */
  async function fetchProfileAndOthers() {
    setLoading(true);
    try {
      // 1️⃣ Fetch parent profile
      const parentRes = await apiRequest(ApiURL.getProfile, 'GET', null, true);
      await dispatch(getProfile());

      if (parentRes?.error)
        showErrorToast(parentRes?.message || 'Failed to fetch profile');

      const parentData = parentRes.data;
      setParentProfileData(parentData);

      // 2️⃣ Fetch children profiles using Redux action
      await dispatch(getChildrenProfiles());

      // 3️⃣ Set children data
      setProfileData([...childrenList]);
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      seterrorMessage(error.message || 'Unexpected error occurred');
      // setFailedModalState(true);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCommonSettings() {
    setLoading(true);

    try {
      // Dispatch Redux action to fetch settings
      await dispatch(getSettingsdata());

      setLoading(false);
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoading(false);
      seterrorMessage(error.message || 'Unexpected error occurred');
      // setFailedModalState(true);
    }
  }

  async function fetchProfile() {
    setLoading(true);

    try {
      dispatch(getProfile());

      setLoading(false);
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoading(false);
      seterrorMessage(error.message || 'Unexpected error occurred');
      // setFailedModalState(true);
    }
  }

  /**
   * Validate password for update
   */
  const validatePassword = () => {
    if (!password.trim()) {
      setPasswordError(
        languageData?.password_required || 'Password is required',
      );
      return false;
    }

    if (password.length < 6) {
      setPasswordError(
        languageData?.password_min_length ||
          'Password must be at least 6 characters',
      );
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError(
        languageData?.password_mismatch || 'Passwords do not match',
      );
      return false;
    }

    setPasswordError('');
    return true;
  };

  /**
   * Handle password update API call
   */
  const handleUpdatePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    if (!selectedProfile?._id) {
      Alert.alert('Error', 'No child selected for password update');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const payload = {
        _id: selectedProfile._id,
        password: password,
        confirmPassword: confirmPassword,
      };

      console.log('Update password payload:', payload);

      const url = ApiURL.childUpdatePassword;
      const res = await apiRequest(url, 'POST', payload, true);

      if (!res?.error) {
        Alert.alert('Success', 'Password updated successfully');

        // Reset form and close modal
        setPassword('');
        setConfirmPassword('');
        setPasswordModalVisible(false);
        setSelectedProfile(null);

        console.log('Password updated successfully:', res);
      } else {
        Alert.alert('Error', res?.message || 'Failed to update password');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Network error occurred');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /**
   * Open password update modal
   */
  const openPasswordModal = (profile: any) => {
    props.navigation.navigate('VerifyPin', {
      mode: 'CONFIRM_PIN',
      onSuccess: () => {
        setSelectedProfile(profile);
        setPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setPasswordModalVisible(true);
      },
    });
  };

  /**
   * Close password update modal
   */
  const closePasswordModal = () => {
    setPasswordModalVisible(false);
    setSelectedProfile(null);
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  /**
   * Open delete confirmation modal with PIN verification
   */
  const openDeleteConfirmation = (profile: any) => {
    props.navigation.navigate('VerifyPin', {
      mode: 'CONFIRM_PIN',
      onSuccess: () => {
        // After PIN verification, show delete confirmation
        setSelectedProfile(profile);
        setDeletePopupVisible(true);
      },
    });
  };

  /**
   * Close delete confirmation modal
   */
  const closeDeletePopup = () => {
    setDeletePopupVisible(false);
    setSelectedProfile(null);
  };

  /**
   * Handle delete child profile API call
   */
  const handleDeleteProfile = async () => {
    if (!selectedProfile?._id) {
      Alert.alert('Error', 'No child selected for deletion');
      return;
    }

    setIsDeletingProfile(true);
    try {
      const payload = {
        _id: selectedProfile._id,
      };

      console.log('Delete profile payload:', payload);

      // Call API to delete child profile
      const response = await apiRequest(
        ApiURL.deleteChild,
        'DELETE',
        payload,
        true,
      );

      if (!response?.error) {
        Alert.alert('Success', 'Profile deleted successfully');

        // Close modal
        closeDeletePopup();

        // Refresh children list
        await dispatch(getChildrenProfiles());

        // Update local state
        const updatedChildren = childrenList.filter(
          (child: any) => child._id !== selectedProfile._id,
        );
        setProfileData(updatedChildren);

        // Remove from active map
        setProfileActiveMap(prev => {
          const newMap = { ...prev };
          delete newMap[selectedProfile._id];
          return newMap;
        });
      } else {
        Alert.alert('Error', response?.message || 'Failed to delete profile');
      }
    } catch (error: any) {
      console.log('Error deleting profile:', error);
      Alert.alert('Error', error.message || 'Network error occurred');
    } finally {
      setIsDeletingProfile(false);
    }
  };

  /**
   * Render profile card for each child
   * Now includes Edit, Password, and Delete icons in a single row
   */
  const renderProfileCard = ({ item }: any) => {
    const isActive = profileActiveMap[item._id] ?? item?.isActive ?? true;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        key={item?.id}
        style={[styles.profileCard, !isActive && styles.profileCardInactive]}
        onPress={() => openViewProfile(item)}
      >
        <View style={styles.profileHeader}>
          <Text
            style={[
              styles.statusText,
              isActive ? styles.activeText : styles.inactiveText,
            ]}
          >
            {isActive
              ? languageData?.active || 'Active'
              : languageData?.inactive || 'Inactive'}
          </Text>

          <TouchableOpacity
            style={[
              styles.toggleSwitch,
              isActive ? styles.toggleOn : styles.toggleOff,
            ]}
            onPress={() => toggleProfileActive(item._id)}
          >
            <View
              style={[
                styles.toggleKnob,
                isActive ? styles.knobRight : styles.knobLeft,
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Eye icon placed at top right corner */}
        <TouchableOpacity
          style={styles.eyeIconButton}
          onPress={() => openViewProfile(item)}
        >
          <CustomVectorIcons
            name="eye"
            iconSet="Feather"
            size={moderateScale(16)}
            color={theme.gray}
          />
        </TouchableOpacity>

        {/* Profile Image */}
        <CustomImageComponent
          source={
            item?.profilePictureUrl ? item?.profilePictureUrl : IMAGES.user4
          }
          height={moderateScale(60)}
          width={moderateScale(60)}
          style={{
            borderRadius: moderateScale(30),
            alignSelf: 'center',
            marginBottom: moderateScale(6),
          }}
        />

        <Text style={styles.profileName}>{item?.username}</Text>

        {/* Action buttons row - Edit, Password, Delete */}
        <View style={styles.actionButtonsRow}>
          {/* Edit Button */}
          <TouchableOpacity
            style={[styles.iconButton, styles.editButton]}
            onPress={() => handleEditProfile(item)}
          >
            <CustomVectorIcons
              name="edit"
              iconSet="Feather"
              size={moderateScale(18)}
              color={theme.white}
            />
          </TouchableOpacity>

          {/* Password Update Button */}
          <TouchableOpacity
            style={[styles.iconButton, styles.passwordButton]}
            onPress={() => openPasswordModal(item)}
          >
            <CustomVectorIcons
              name="password"
              iconSet="MaterialIcons"
              size={moderateScale(18)}
              color={theme.white}
            />
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.iconButton, styles.deleteButton]}
            onPress={() => openDeleteConfirmation(item)}
          >
            <CustomVectorIcons
              name="delete"
              iconSet="MaterialIcons"
              size={moderateScale(18)}
              color={theme.white}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const handleAddNewProfile = () => {
    props.navigation.navigate('VerifyPin', {
      mode: 'CONFIRM_PIN',
      nextScreen: 'AddNewProfile',
    });
  };

  const hasChildren = Array.isArray(childrenList) && childrenList.length > 0;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        marginTop: moderateScale(20),
      }}
    >
      <StatusBar
        barStyle={Platform.OS === 'android' ? 'dark-content' : 'dark-content'}
        translucent={true}
      />

      <CustomHeader showBackButton={true} showNotifications={false} />

      <View style={styles.container}>
        <Text style={styles.title}>
          {languageData?.whos_watching || 'Who’s watching?'}
        </Text>

        {hasChildren ? (
          <FlatList
            data={childrenList}
            renderItem={renderProfileCard}
            keyExtractor={item => item?._id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={() => (
              <View style={styles.styleBtn}>
                <CustomButton
                  width={'100%'}
                  text={languageData?.add_new_child || 'Add New Child'}
                  backgroundColor={theme.themeColor}
                  onPress={handleAddNewProfile}
                  height={moderateScale(55)}
                  style={{
                    alignSelf: 'center',
                    borderRadius: moderateScale(12),
                    marginTop: moderateScale(30),
                    marginBottom: moderateScale(20),
                  }}
                />
              </View>
            )}
          />
        ) : (
          // 🧒 EMPTY STATE
          <View style={styles.emptyStateContainer}>
            <CustomImageComponent
              source={IMAGES.user5 || IMAGES.user4}
              height={moderateScale(120)}
              width={moderateScale(120)}
              style={{ marginBottom: moderateScale(15) }}
            />

            <Text style={styles.emptyStateTitle}>
              {languageData?.no_child_found || 'No child found'}
            </Text>

            <Text style={styles.emptyStateSubtitle}>
              {languageData?.no_child_profiles_desc ||
                'You haven’t added any child profiles yet.'}
            </Text>

            <View style={styles.styleBtn}>
              <CustomButton
                width={'100%'}
                text={languageData?.add_new_child || 'Add New Child'}
                backgroundColor={theme.themeColor}
                onPress={handleAddNewProfile}
                height={moderateScale(55)}
                style={{
                  marginTop: moderateScale(20),
                  borderRadius: moderateScale(12),
                  // width: '80%',
                }}
              />
            </View>
          </View>
        )}
      </View>

      {/* Delete Profile Confirmation Modal */}
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
            <Text style={styles.modalTitle}>
              {languageData?.delete_profile_title || 'Delete Profile?'}
            </Text>

            {/* Subtitle */}
            <Text style={styles.modalSubtitle}>
              {languageData?.delete_profile_desc ||
                'Are you sure you want to delete this profile? This action cannot be undone.'}
            </Text>

            {/* Action Buttons */}
            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeDeletePopup}
                disabled={isDeletingProfile}
              >
                <Text style={styles.cancelButtonText}>
                  {languageData?.cancel || 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButtonModal]}
                onPress={handleDeleteProfile}
                disabled={isDeletingProfile}
              >
                <Text style={styles.deleteButtonText}>
                  {isDeletingProfile
                    ? languageData?.deleting || 'Deleting...'
                    : languageData?.delete || 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Update Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={passwordModalVisible}
        onRequestClose={closePasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModalBox}>
            {/* Modal Header with close button */}
            <View style={styles.modalHeader}>
              <Text style={styles.passwordModalTitle}>
                {languageData?.update_password || 'Update Password'}
              </Text>

              <TouchableOpacity onPress={closePasswordModal}>
                <CustomVectorIcons
                  name="x"
                  iconSet="Feather"
                  size={moderateScale(24)}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>

            {/* Profile info */}
            {selectedProfile && (
              <View style={styles.profileInfo}>
                <Text style={styles.profileInfoText}>
                  {languageData?.update_password_for || 'Updating password for'}
                </Text>
                <Text style={styles.profileNameText}>
                  {selectedProfile.username}
                </Text>
              </View>
            )}

            {/* Password Input Fields */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {languageData?.new_password || 'New Password'}
              </Text>

              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={
                  languageData?.enter_new_password || 'Enter new password'
                }
                placeholderTextColor={theme.gray}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {languageData?.confirm_password || 'Confirm Password'}
              </Text>

              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={
                  languageData?.confirm_new_password || 'Confirm new password'
                }
                placeholderTextColor={theme.gray}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Error message */}
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closePasswordModal}
                disabled={isUpdatingPassword}
              >
                <Text style={styles.cancelButtonText}>
                  {languageData?.cancel || 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.updateButton]}
                onPress={handleUpdatePassword}
                disabled={isUpdatingPassword}
              >
                <Text style={styles.updateButtonText}>
                  {isUpdatingPassword
                    ? languageData?.updating || 'Updating...'
                    : languageData?.update || 'Update'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Profile Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={viewProfileVisible}
        onRequestClose={closeViewProfile}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModalBox}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.passwordModalTitle, { color: theme.text }]}>
                {languageData?.child_profile || 'Child Profile'}
              </Text>
              <TouchableOpacity onPress={closeViewProfile}>
                <CustomVectorIcons
                  name="x"
                  iconSet="Feather"
                  size={moderateScale(24)}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>

            {viewProfileData && (
              <>
                {/* Avatar */}
                <CustomImageComponent
                  source={
                    viewProfileData.profilePictureUrl
                      ? viewProfileData.profilePictureUrl
                      : IMAGES.user4
                  }
                  height={moderateScale(80)}
                  width={moderateScale(80)}
                  style={{
                    borderRadius: moderateScale(40),
                    alignSelf: 'center',
                    marginBottom: moderateScale(15),
                  }}
                />

                {/* Info */}
                <View style={{ gap: moderateScale(10) }}>
                  <Text style={[styles.profileInfoText, { color: theme.text }]}>
                    <Text style={{ fontFamily: FontFamily.KhulaSemiBold }}>
                      {languageData?.username || 'Username'}:{' '}
                    </Text>
                    {viewProfileData.username}
                  </Text>

                  {/* <Text style={[styles.profileInfoText, { color: theme.text }]}>
                    <Text style={{ fontFamily: FontFamily.KhulaSemiBold }}>
                      Email:{' '}
                    </Text>
                    {viewProfileData.email || 'N/A'}
                  </Text> */}

                  <Text>
                    <Text style={{ fontFamily: FontFamily.KhulaSemiBold }}>
                      {languageData?.age_range || 'Age Range'}:{' '}
                    </Text>
                    {viewProfileData.ageRange || 'N/A'}
                  </Text>

                  <Text>
                    <Text style={{ fontFamily: FontFamily.KhulaSemiBold }}>
                      {languageData?.gender || 'Gender'}:{' '}
                    </Text>
                    {viewProfileData.gender || 'N/A'}
                  </Text>

                  <Text style={{ fontFamily: FontFamily.KhulaSemiBold }}>
                    {languageData?.language || 'Language'}:{' '}
                  </Text>
                  {viewProfileData.languagePreference || 'N/A'}

                  <Text>
                    <Text style={{ fontFamily: FontFamily.KhulaSemiBold }}>
                      {languageData?.status || 'Status'}:{' '}
                    </Text>
                    {viewProfileData.isActive
                      ? languageData?.active
                      : languageData?.inactive}
                  </Text>

                  {/* <Text style={[styles.profileInfoText, { color: theme.text }]}>
                    <Text style={{ fontFamily: FontFamily.KhulaSemiBold }}>
                      Last Active:{' '}
                    </Text>
                    {viewProfileData.lastActiveAt
                      ? new Date(
                          viewProfileData.lastActiveAt,
                        ).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </Text> */}

                  <Text>
                    <Text style={{ fontFamily: FontFamily.KhulaSemiBold }}>
                      {languageData?.device_id || 'Device ID'}:{' '}
                    </Text>
                    {viewProfileData.bleDeviceId || 'N/A'}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <CustomLoader visible={loading} />
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.mainBackground,
      marginHorizontal: moderateScale(20),
      padding: moderateScale(10),
      borderRadius: 10,
      marginTop: 10,
    },
    title: {
      fontSize: moderateScale(22),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      textAlign: 'center',
      marginVertical: moderateScale(10),
    },
    listContainer: {
      paddingVertical: moderateScale(20),
      flexGrow: 1,
    },
    columnWrapper: {
      justifyContent: 'space-between',
      marginBottom: moderateScale(10),
    },
    profileCard: {
      width: '48%',
      backgroundColor: theme.background,
      borderRadius: moderateScale(12),
      padding: moderateScale(15),
      marginBottom: moderateScale(15),
      borderWidth: moderateScale(1),
      borderColor: theme.borderColorDynamic,
      shadowColor: theme.black,
      shadowOffset: {
        width: 0,
        height: moderateScale(2),
      },
      shadowOpacity: 0.1,
      shadowRadius: moderateScale(4),
      elevation: 3,
      alignItems: 'center',
      position: 'relative',
    },
    profileCardInactive: {
      opacity: 0.4,
    },
    eyeIconButton: {
      position: 'absolute',
      top: moderateScale(45),
      right: moderateScale(20),
      padding: moderateScale(4),
      backgroundColor: theme.background,
      borderRadius: moderateScale(20),
      // borderWidth: 1,
      // borderColor: theme.borderColorDynamic,
    },
    profileName: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      textAlign: 'center',
      marginTop: moderateScale(10),
      marginBottom: moderateScale(10),
    },
    profileHeader: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: moderateScale(8),
    },
    statusText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaSemiBold,
    },
    activeText: {
      color: '#10B981', // Success green - static color
    },
    inactiveText: {
      color: '#9CA3AF', // Gray - static color
    },
    toggleSwitch: {
      width: moderateScale(40),
      height: moderateScale(22),
      borderRadius: moderateScale(11),
      padding: 2,
    },
    toggleOn: {
      backgroundColor: '#10B981', // Success green - static color
    },
    toggleOff: {
      backgroundColor: '#D1D5DB', // Gray - static color
    },
    toggleKnob: {
      width: moderateScale(18),
      height: moderateScale(18),
      borderRadius: moderateScale(9),
      backgroundColor: theme.white,
    },
    knobRight: {
      alignSelf: 'flex-end',
    },
    knobLeft: {
      alignSelf: 'flex-start',
    },
    /* Action buttons row - Edit, Password, Delete in single line */
    actionButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: moderateScale(8),
      marginTop: moderateScale(5),
      width: '100%',
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
    passwordButton: {
      backgroundColor: theme.themeColor,
    },
    deleteButton: {
      backgroundColor: theme.themeRed,
    },
    /* -------------------- MODAL OVERLAY -------------------- */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    /* -------------------- DELETE MODAL -------------------- */
    modalBox: {
      width: '80%',
      backgroundColor: theme.background,
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    dangerIconContainer: {
      width: moderateScale(60),
      height: moderateScale(60),
      borderRadius: moderateScale(30),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: moderateScale(5),
    },
    modalTitle: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      marginTop: moderateScale(10),
      marginBottom: moderateScale(5),
    },
    modalSubtitle: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      marginBottom: moderateScale(20),
      textAlign: 'center',
      lineHeight: moderateScale(20),
    },
    modalActionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: moderateScale(12),
    },
    modalButton: {
      flex: 1,
      padding: moderateScale(12),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: theme.boxBackground,
    },
    deleteButtonModal: {
      backgroundColor: theme.themeRed,
    },
    cancelButtonText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },
    deleteButtonText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.white,
    },
    /* -------------------- PASSWORD UPDATE MODAL -------------------- */
    passwordModalBox: {
      width: '85%',
      backgroundColor: theme.background,
      borderRadius: moderateScale(16),
      padding: moderateScale(20),
      maxWidth: moderateScale(400),
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: moderateScale(15),
    },
    passwordModalTitle: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
    },
    profileInfo: {
      marginBottom: moderateScale(15),
      paddingBottom: moderateScale(10),
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColorDynamic,
    },
    profileInfoText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
      lineHeight: moderateScale(22),
    },
    profileNameText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      marginTop: moderateScale(4),
    },
    inputContainer: {
      marginBottom: moderateScale(16),
    },
    inputLabel: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.text,
      marginBottom: moderateScale(8),
    },
    input: {
      borderWidth: 1,
      borderColor: theme.borderColorDynamic,
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      backgroundColor: theme.textBoxBackground,
    },
    errorText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.themeRed,
      marginTop: moderateScale(-8),
      marginBottom: moderateScale(12),
    },
    modalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: moderateScale(10),
      gap: moderateScale(12),
    },
    updateButton: {
      backgroundColor: theme.themeColor,
    },
    updateButtonText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.white,
    },
    /* Status colors for view modal */
    activeStatusText: {
      color: '#10B981', // Static success green
    },
    inactiveStatusText: {
      color: '#9CA3AF', // Static gray
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: moderateScale(40),
    },

    emptyStateTitle: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginBottom: moderateScale(6),
    },

    emptyStateSubtitle: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.textSub,
      textAlign: 'center',
      marginBottom: moderateScale(10),
    },
    styleBtn: {
      width: '100%',
    },
  });

export default WhosWatchingScreen;
