/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
  Keyboard,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  FlatList,
  Alert,
} from 'react-native';
import { useTheme } from '@theme/themeContext';
import CustomLoader from '@utils/CustomLoader';
import FontFamily from '@assets/fonts/FontFamily';
import { moderateScale } from 'react-native-size-matters';
import CustomButton from '@components/CustomButton';
import createBasicStyles from 'styles';
import CustomImageComponent from '@components/CustomImageComponent';
import RBSheet from 'react-native-raw-bottom-sheet';
import IMAGES from '@assets/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiRequest, openImage_Picker } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { showSuccessToast } from '@utils/CustomToast';
import CustomLucideIcon from '@components/CustomLucideIcon';
import { useFocusEffect } from '@react-navigation/native';
import CustomHeader from '@components/CustomHeader';
import CustomDropdown from '@components/CustomDropdown';
import CustomImageAvatarPopUp from '@components/CustomImageAvatarPopUp';
import { useSelector } from 'react-redux';

const EditNewProfileScreen = (props: any) => {
  const { navigation } = props;
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { prevData } = props.route?.params;
  const [Loader, setLoader] = useState(false);
  const [avatarsData, setAvatarsData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [FailedModalState, setFailedModalState] = useState(false);
  const [errorMessage, seterrorMessage] = useState('');
  const [playlistOptions, setPlaylistOptions] = useState<any[]>([]);

  let reduxResponse = useSelector((state: any) => state?.data);
  let { settingsData, childrenList = [] } = reduxResponse;

  console.log('Settings Data from Redux:', settingsData);

  // Prepare language dropdown data
  const languageDropdownData = [
    {
      label: settingsData?.DARA_DEFAULT_LANGUAGE?.name,
      value: settingsData?.DARA_DEFAULT_LANGUAGE?.code,
    },
    ...(settingsData?.DARA_SUPPORTED_LANGUAGES?.map((item: any) => ({
      label: item.name,
      value: item.code,
    })) ?? []),
  ];

  // Find the complete child data from Redux store using the ID
  const findChildFromStore = (childId: string) => {
    return childrenList.find((child: any) => child._id === childId);
  };

  // Get complete child data either from passed data or Redux store
  const completeChildData = findChildFromStore(prevData?._id) || prevData;

  const refRBSheet = useRef<{ open: () => void; close: () => void } | null>(
    null,
  );
  let manageByRef = React.createRef<any>();
  const openRBSheet = useCallback(() => {
    refRBSheet.current?.open();
  }, []);

  const [visible, setVisible] = useState(false);

  const openPopup = () => setVisible(true);
  const closePopup = () => setVisible(false);

  const handleConfirm = async (option: 'avatar' | 'gallery') => {
    console.log('CONFIRM OPTION 👉', option);

    const selectedOption = option?.toLowerCase();

    if (selectedOption === 'avatar') {
      openRBSheet(); // ❌ avatar untouched
    }

    if (selectedOption === 'gallery') {
      try {
        const image = await openImage_Picker();
        if (image?.path) {
          handleOnchange(image.path, 'userImage');
        }
      } catch (e) {
        console.log('Gallery cancelled');
      }
    }
  };

  const [inputs, setInputs] = useState({
    userImage: '',
    userName: '',
    age: '',
    gender: '',
    language: '',
    playlistContent: [],
  });

  const [errors, setErrors] = useState({
    userNameError: '',
    ageError: '',
    genderError: '',
    languageError: '',
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchAvatars();
    }, []),
  );

  useFocusEffect(
    React.useCallback(() => {
      setAgeData(settingsData?.DARA_AGE_RANGES);

      if (completeChildData) {
        setInputs({
          userImage:
            completeChildData.avatar ||
            completeChildData.profilePictureUrl ||
            '',
          userName: completeChildData.username || '',
          age: completeChildData.ageRange || '',
          gender: completeChildData.gender || '',
          language: completeChildData.languagePreference || 'en',
          playlistContent: completeChildData.assignContentCategories || [], // ✅ PREFILL
        });

        // ✅ fetch playlist options
        if (completeChildData.ageRange) {
          fetchPlaylistByAge(completeChildData.ageRange);
        }
      }
    }, [settingsData, completeChildData]),
  );

  const handleOnchange = (text: any, input: any) => {
    setInputs(prevState => ({ ...prevState, [input]: text }));
  };

  const handleError = (error: any, input: any) => {
    setErrors(prevState => ({ ...prevState, [input]: error }));
  };

  async function fetchPlaylistByAge(ageRange: any) {
    try {
      setLoading(true);

      const query = encodeURIComponent(
        JSON.stringify({ ageRanges: [ageRange] }),
      );

      const res = await apiRequest(
        `${ApiURL.fetchAge}?query=${query}`,
        'GET',
        null,
        true,
      );

      setLoading(false);

      if (!res?.error) {
        const options = res?.data?.list?.map((item: any) => ({
          label: item.title,
          value: item._id,
        }));

        setPlaylistOptions(options || []);
      }
    } catch (e) {
      setLoading(false);
      console.log('Playlist fetch error', e);
    }
  }

  async function fetchAvatars() {
    setLoading(true);

    try {
      const res = await apiRequest(
        ApiURL.fetchAvatarsProfiles,
        'GET',
        null,
        true,
      );

      setLoading(false);

      if (!res?.error) {
        setAvatarsData(res?.data?.list);
      } else {
        const errorMsg =
          res?.message || 'Registration failed. Please try again.';
        seterrorMessage(errorMsg);
        // setFailedModalState(true);
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoading(false);
      seterrorMessage(error.message || 'Unexpected error occurred');
      // setFailedModalState(true);
    }
  }

  const handleValidate = () => {
    Keyboard.dismiss();
    let isValid = true;

    // Reset errors
    setErrors({
      userNameError: '',
      ageError: '',
      genderError: '',
      languageError: '',
    });

    // Username validation (even if read-only, should have value)
    if (!inputs.userName || !inputs.userName.trim()) {
      handleError('Username is required', 'userNameError');
      isValid = false;
    }

    if (!inputs.age || !inputs.age.trim()) {
      handleError('Please select age range', 'ageError');
      isValid = false;
    }

    if (!inputs.gender || !inputs.gender.trim()) {
      handleError('Please select gender', 'genderError');
      isValid = false;
    }

    if (!inputs.language || !inputs.language.trim()) {
      handleError('Please select language', 'languageError');
      isValid = false;
    }
    if (!inputs.playlistContent || inputs.playlistContent.length === 0) {
      Alert.alert('Validation Error', 'Please select playlist content');
      isValid = false;
    }

    if (isValid) {
      handleUpdateChild();
    }
  };

  async function handleUpdateChild() {
    setLoader(true);

    // Try sending the payload WITHOUT username to avoid the API error
    const payload: any = {
      _id: completeChildData._id,
      // Try including username only if it's different from original
      // If API rejects it, remove this line completely
      // username: inputs.userName,
      avatar: inputs?.userImage || '',
      languagePreference:
        inputs.language || settingsData?.DARA_DEFAULT_LANGUAGE?.code || 'en',
      ageRange: inputs?.age,
      gender: inputs.gender,
      bleDeviceId: '6902080605cf3bc9adaf02be',
      // assignContentCategories: ['69084126893980040125369b'],
      assignContentCategories: inputs.playlistContent,
    };

    console.log('Update payload:', payload);

    try {
      const res = await apiRequest(
        ApiURL.updateNewChild,
        'POST',
        payload,
        true,
      );

      console.log('✅ API Response FROM EDIT PROFILE:', res);
      setLoader(false);

      if (!res?.error) {
        showSuccessToast(res?.message || 'Profile updated successfully!');

        // Navigate back with a small delay for better UX
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        const errorMsg = res?.message || 'Request failed. Please try again.';

        // Check if it's a username validation error
        if (errorMsg.includes('username')) {
          // If username causes error, try again without it
          console.log(
            'Username update not allowed, trying without username...',
          );
          delete payload.username;
          handleUpdateChildWithoutUsername(payload);
        } else {
          Alert.alert('Error', errorMsg);
        }

        seterrorMessage(errorMsg);
        // setFailedModalState(true);
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoader(false);
      Alert.alert('Error', error.message || 'Network error occurred');
      seterrorMessage(error.message || 'Unexpected error occurred');
      // setFailedModalState(true);
    }
  }

  // Fallback function if username update fails
  async function handleUpdateChildWithoutUsername(payload: any) {
    setLoader(true);

    try {
      const res = await apiRequest(
        ApiURL.updateNewChild,
        'POST',
        payload,
        true,
      );

      console.log('✅ API Response (without username):', res);
      setLoader(false);

      if (!res?.error) {
        showSuccessToast('Profile updated (username cannot be changed)');

        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        Alert.alert('Error', res?.message || 'Request failed');
      }
    } catch (error: any) {
      console.log('🔥 API Exception:', error);
      setLoader(false);
      Alert.alert('Error', error.message || 'Network error occurred');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        backgroundColor={theme.transparent}
        barStyle={'light-content'}
      />
      <CustomHeader showBackButton={true} showNotifications={false} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <Text style={styles.title}>Edit Details</Text>

            <View style={styles.profileCard}>
              <View style={[styles.profileIcon]}>
                <CustomImageComponent
                  source={inputs?.userImage ? inputs?.userImage : IMAGES.user4}
                  height={moderateScale(100)}
                  width={moderateScale(100)}
                  style={{ borderRadius: moderateScale(52) }}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => openPopup()}
                  style={{
                    backgroundColor: theme.white,
                    padding: moderateScale(5),
                    position: 'absolute',
                    bottom: moderateScale(-10),
                    right: moderateScale(0),
                    elevation: 5,
                    borderRadius: moderateScale(25),
                  }}
                >
                  <CustomLucideIcon
                    name="PlusIcon"
                    color={theme.iconColor}
                    size={moderateScale(25)}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputSpacing}>
              <Text style={styles.inputLabel}>User Name</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{inputs.userName}</Text>
                <Text style={styles.noteText}>Username cannot be changed</Text>
              </View>
            </View>

            <CustomDropdown
              title="Age"
              titleStyle={{
                fontSize: moderateScale(14),
                color: theme.black,
                fontFamily: FontFamily.KhulaSemiBold,
              }}
              data={ageData || []}
              placeholder="Select Age Range"
              value={inputs.age}
              // onChange={(item: any) => {
              //   handleOnchange(item, 'age');
              // }}
              onChange={(item: any) => {
                handleOnchange(item, 'age');
                fetchPlaylistByAge(item);
                handleOnchange([], 'playlistContent'); // reset old selection
              }}
              customDropdownContainerStyle={styles.inputSpacing}
              errorMessage={errors?.ageError}
              customDropdownStyle={{
                borderWidth: 1,
                borderColor: errors?.ageError ? theme.themeRed : '#D2D2D26E',
                paddingHorizontal: moderateScale(12),
              }}
              onFocus={() => handleError('', 'ageError')}
              ref={manageByRef}
            />

            <CustomDropdown
              title="Gender"
              titleStyle={{
                fontSize: moderateScale(14),
                color: theme.black,
                fontFamily: FontFamily.KhulaSemiBold,
              }}
              data={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' },
              ]}
              placeholder="Select Gender"
              value={inputs.gender}
              onChange={(item: any) => {
                handleOnchange(item, 'gender');
              }}
              customDropdownContainerStyle={styles.inputSpacing}
              errorMessage={errors?.genderError}
              customDropdownStyle={{
                borderWidth: 1,
                borderColor: errors?.genderError ? theme.themeRed : '#D2D2D26E',
                paddingHorizontal: moderateScale(12),
              }}
              onFocus={() => handleError('', 'genderError')}
              ref={manageByRef}
            />

            <CustomDropdown
              title="Select Playlist Content"
              multiSelect={true}
              titleStyle={{
                fontSize: moderateScale(14),
                color: theme.black,
                fontFamily: FontFamily.KhulaSemiBold,
              }}
              data={playlistOptions}
              placeholder="Select Playlist Content"
              value={inputs.playlistContent}
              onChange={(item: any) => {
                handleOnchange(item, 'playlistContent');
              }}
              customDropdownContainerStyle={styles.inputSpacing}
              errorMessage={errors?.playlistError}
              customDropdownStyle={{
                borderWidth: 1,
                borderColor: errors?.playlistError
                  ? theme.themeRed
                  : '#D2D2D26E',
                paddingHorizontal: moderateScale(12),
              }}
            />

            {/* <CustomDropdown
              title="Language"
              titleStyle={{
                fontSize: moderateScale(14),
                color: theme.black,
                fontFamily: FontFamily.KhulaSemiBold,
              }}
              data={languageDropdownData}
              placeholder="Select Language"
              value={inputs.language}
              onChange={(item: any) => {
                handleOnchange(item.value, 'language');
              }}
              customDropdownContainerStyle={styles.inputSpacing}
              errorMessage={errors?.languageError}
              customDropdownStyle={{
                borderWidth: 1,
                borderColor: errors?.languageError
                  ? theme.themeRed
                  : '#D2D2D26E',
                paddingHorizontal: moderateScale(12),
              }}
              onFocus={() => handleError('', 'languageError')}
              ref={manageByRef}
            /> */}

            <CustomDropdown
              title="Language"
              titleStyle={{
                fontSize: moderateScale(14),
                color: theme.black,
                fontFamily: FontFamily.KhulaSemiBold,
              }}
              data={languageDropdownData}
              placeholder="Select Language"
              value={inputs.language}
              onChange={(item: any) => {
                // Handle both cases: if item is the value or an object with value property
                const selectedValue =
                  typeof item === 'object' ? item.value : item;
                console.log('Selected value to save:', selectedValue);

                handleOnchange(selectedValue, 'language');
              }}
              customDropdownContainerStyle={styles.inputSpacing}
              errorMessage={errors?.languageError}
              customDropdownStyle={{
                borderWidth: 1,
                borderColor: errors?.languageError
                  ? theme.themeRed
                  : '#D2D2D26E',
                paddingHorizontal: moderateScale(12),
              }}
              onFocus={() => handleError('', 'languageError')}
              ref={manageByRef}
            />

            <CustomButton
              text={Loader ? 'Updating...' : 'Save'}
              backgroundColor={theme.themeColor}
              onPress={() => {
                handleValidate();
              }}
              height={moderateScale(55)}
              style={{
                alignSelf: 'center',
                borderRadius: moderateScale(12),
                marginTop: moderateScale(50),
                marginBottom: moderateScale(30),
              }}
              disabled={Loader}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomImageAvatarPopUp
        visible={visible}
        onDismiss={closePopup}
        onConfirm={handleConfirm}
      />

      <RBSheet
        ref={refRBSheet}
        height={500}
        openDuration={250}
        draggable={true}
        dragOnContent={true}
        closeOnPressMask={true}
        customStyles={{
          container: styles.rbSheetContainer,
        }}
      >
        <View style={styles.rbSheetContent}>
          <View style={styles.rbSheetHeader}>
            <Text style={styles.rbSheetTitle}>Choose Icon</Text>
          </View>

          <FlatList
            data={avatarsData}
            numColumns={4}
            keyExtractor={(item, index) => `thumbnail-${item.id || index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  margin: moderateScale(5),
                  marginTop: moderateScale(15),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  handleOnchange(item?.url, 'userImage');
                  refRBSheet?.current?.close();
                }}
                activeOpacity={0.7}
              >
                <CustomImageComponent
                  source={item?.url}
                  height={moderateScale(70)}
                  width={moderateScale(70)}
                  style={{
                    borderRadius: moderateScale(52),
                    elevation: 3,
                    overflow: 'hidden',
                  }}
                />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: moderateScale(20) }}
          />
        </View>
      </RBSheet>

      <CustomLoader visible={Loader || loading} />
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.mainBackground,
      marginHorizontal: moderateScale(20),
      marginTop: moderateScale(20),
      borderRadius: 10,
      paddingBottom: moderateScale(20),
    },
    title: {
      fontSize: moderateScale(22),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      marginVertical: moderateScale(10),
    },

    subtitle: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      textAlign: 'center',
      marginVertical: moderateScale(10),
    },
    description: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.text,
      textAlign: 'center',
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
      alignItems: 'center',
      marginVertical: moderateScale(10),
    },
    profileIcon: {
      width: moderateScale(100),
      height: moderateScale(100),
      borderRadius: moderateScale(50),
      backgroundColor: theme.themeColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: moderateScale(5),
    },
    kidsProfile: {
      backgroundColor: theme.background,
    },
    newProfile: {
      backgroundColor: theme.background,
    },
    profileName: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaBold,
      color: theme.text,
      textAlign: 'center',
      marginTop: moderateScale(10),
    },
    inputSpacing: {
      marginTop: moderateScale(20),
    },
    inputLabel: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
      marginBottom: moderateScale(8),
    },
    readOnlyField: {
      borderWidth: 1,
      borderColor: '#D2D2D26E',
      borderRadius: moderateScale(8),
      padding: moderateScale(12),
      backgroundColor: theme.lightGray || '#F5F5F5',
    },
    readOnlyText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.black,
    },
    noteText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.gray,
      marginTop: moderateScale(4),
      fontStyle: 'italic',
    },

    thumbnailsContainer: {
      marginTop: moderateScale(10),
    },
    rbSheetContainer: {
      backgroundColor: theme.mainBackground,
      borderTopLeftRadius: moderateScale(10),
      borderTopRightRadius: moderateScale(10),
    },
    rbSheetContent: {
      marginHorizontal: moderateScale(15),
    },
    rbSheetHeader: {
      marginVertical: moderateScale(20),
      borderBottomWidth: moderateScale(1),
      borderColor: theme.gray,
      paddingBottom: moderateScale(10),
    },
    rbSheetTitle: {
      fontSize: moderateScale(20),
      color: theme.text,
      fontFamily: FontFamily.KhulaBold,
      textAlign: 'center',
    },
  });

export default EditNewProfileScreen;
