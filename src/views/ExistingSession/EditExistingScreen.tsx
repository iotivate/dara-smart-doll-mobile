/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomHeader from '@components/CustomHeader';
import CustomButton from '@components/CustomButton';
import CustomDropdown from '@components/CustomDropdown';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import { Check, Play, Pause } from 'lucide-react-native';
import CustomVectorIcons from '@components/CustomVectorIcons';
import { useSelector } from 'react-redux';

const EditExistingScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  // STATES
  const [category, setCategory] = useState('');
  const [contentState, setcontentState] = useState('');
  const repeatOptions = [
    languageData?.repeat_once || 'Once',
    languageData?.repeat_daily || 'Daily',
    languageData?.repeat_weekly || 'Weekly',
  ];

  const [repeat, setRepeat] = useState('Once');
  const [notification, setNotification] = useState(true);
  const [Loader, setLoader] = useState(false);
  const [activeChild, setActiveChild] = useState('');
  const [activeChildData, setActiveChilData] = useState([]);
  const [categorydata, setcategorydata] = useState([]);

  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const isChildSelected = !!activeChild;

  // DAYS OF WEEK FOR WEEKLY REPEAT
  const daysOfWeek = [
    { id: 0, label: 'Sunday', short: 'Sun' },
    { id: 1, label: 'Monday', short: 'Mon' },
    { id: 2, label: 'Tuesday', short: 'Tue' },
    { id: 3, label: 'Wednesday', short: 'Wed' },
    { id: 4, label: 'Thursday', short: 'Thu' },
    { id: 5, label: 'Friday', short: 'Fri' },
    { id: 6, label: 'Saturday', short: 'Sat' },
  ];
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  // MODAL STATES
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [audioList, setAudioList] = useState([]);
  const [selectedAudios, setSelectedAudios] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState('');

  // Hour and minute dropdown options
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    label: i.toString().padStart(2, '0'),
    value: i,
  }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, '0'),
    value: i,
  }));

  // Convert selected hour/minute to timestamp for API
  useEffect(() => {
    if (selectedHour === null || selectedMinute === null) return;

    const now = new Date();

    const selectedTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      selectedHour,
      selectedMinute,
      0,
      0,
    );

    const timestamp = selectedTime.getTime();
    console.log('Final Time Timestamp:', timestamp);
  }, [selectedHour, selectedMinute]);

  // Initial API call to fetch active children
  useEffect(() => {
    SelectChild_APICALL();
  }, []);

  // Function to get timestamp from selected hour and minute
  const getTimestampFromSelectedTime = () => {
    // Use selectedHour and selectedMinute for timestamp
    if (
      selectedHour === null ||
      selectedHour === undefined ||
      selectedMinute === null ||
      selectedMinute === undefined
    ) {
      Alert.alert('Error', 'Please select a valid time');
      return null;
    }

    const now = new Date();

    // Create a date for today with the selected time
    const selectedDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      selectedHour,
      selectedMinute,
      0, // seconds
      0, // milliseconds
    );

    // Get Unix timestamp in milliseconds
    const timestamp = selectedDate.getTime();
    console.log(
      'Schedule Timestamp:',
      timestamp,
      'for time:',
      `${selectedHour}:${selectedMinute}`,
    );

    return timestamp;
  };

  // Handle day selection for weekly repeat
  const handleDaySelect = (dayId: number) => {
    setSelectedDays(prev => {
      if (prev.includes(dayId)) {
        // Remove if already selected
        return prev.filter(id => id !== dayId);
      } else {
        // Add to selection
        return [...prev, dayId];
      }
    });
  };

  // NEW FUNCTIONS

  // API call to fetch active children profiles
  const SelectChild_APICALL = () => {
    setLoader(true);

    apiRequest(ApiURL.fetchActiveProfiles, 'GET', null, true)
      .then((res: any) => {
        setLoader(false);
        if (!res.error && res.data?.list) {
          let dropdowndata = res.data.list;
          let converteddata = dropdowndata.map((item: any) => ({
            label: item.username,
            value: item._id, // Store child ID as value
            ageRange: item.ageRange, // Store age range separately
            originalData: item, // Store original data
          }));
          console.log('Active children data:', converteddata);
          setActiveChilData(converteddata);
        } else {
          Alert.alert('Error', 'Failed to fetch children data');
        }
      })
      .catch((error: any) => {
        setLoader(false);
        console.log('errorerrorerrorerrorerror', error);
        Alert.alert('Error', 'Network error occurred');
      });
  };

  // API call to fetch categories based on selected child age range
  const SelectCategories_APICALL = (ageRange: any) => {
    if (!ageRange) {
      Alert.alert('Error', 'No age range provided');
      return;
    }

    setLoader(true);

    const query = {
      ageRanges: [ageRange], // ageRange = "1-2"
    };

    const url = `https://api.darabuddy.com/api/v1/categories/users/all-documents?query=${encodeURIComponent(
      JSON.stringify(query),
    )}`;

    console.log('Fetching categories for age range:', ageRange);
    console.log('URL:', url);

    apiRequest(url, 'GET', null, true)
      .then((res: any) => {
        setLoader(false);
        console.log('Categories API response:', res);

        if (!res.error && res.data?.list) {
          let dropdowndata = res.data.list;

          const comvert_data = dropdowndata.map((ele: any) => ({
            label: ele.title,
            value: ele._id, // This is the category ID
            ageRange: ele.ageRange,
          }));

          console.log('Converted category data:', comvert_data);
          setcategorydata(comvert_data);

          if (comvert_data.length === 0) {
            Alert.alert('Info', 'No categories found for this age range');
          }
        } else {
          const errorMsg = res?.message || 'Failed to fetch categories';
          console.log('Categories API error:', errorMsg);
          Alert.alert('Error', errorMsg);
        }
      })
      .catch((error: any) => {
        setLoader(false);
        console.log('Error fetching categories:', error);
        Alert.alert('Error', 'Network error occurred');
      });
  };

  // Handle selection of active child
  const handel_Active_Child = (ele: any) => {
    console.log('Selected child element:', ele);

    if (!ele) {
      Alert.alert('Error', 'No child selected');
      return;
    }

    let selectedChildId;
    let selectedAgeRange;

    if (ele && typeof ele === 'object') {
      selectedChildId = ele.value;
      selectedAgeRange = ele.ageRange;
    } else if (typeof ele === 'string') {
      const childObj = activeChildData.find(child => child.value === ele);
      if (childObj) {
        selectedChildId = childObj.value;
        selectedAgeRange = childObj.ageRange;
      }
    }

    if (!selectedChildId || !selectedAgeRange) {
      Alert.alert('Error', 'Invalid child selection');
      return;
    }

    setActiveChild(selectedChildId);

    // Clear previous selections
    setCategory('');
    setAudioList([]);
    setSelectedAudios([]);
    setcontentState('');

    // Fetch categories for this age range
    SelectCategories_APICALL(selectedAgeRange);
  };

  // Handle selection of category
  const handle_PlayList_Content = (item: any) => {
    console.log('Category selected:', item);
    setCategory(item);
    setSelectedCategoryForModal(item); // Store for modal
    setAudioList([]); // Clear previous audio list
    setSelectedAudios([]); // Clear previous selections
    setcontentState(''); // Clear previous content state
  };

  // Fetch audio content list based on selected category
  const fetchAudioContent = async (categoryId: any) => {
    console.log('Fetching content for category ID:', categoryId);
    setLoader(true);

    try {
      const apicall_content = await apiRequest(
        `${ApiURL.ExistingSession}?keyWord=&categoryId=${categoryId}&page=1&size=10`,
        'GET',
        null,
        true,
      );

      setLoader(false);
      console.log('Content API response:', apicall_content);

      if (!apicall_content.error && apicall_content.data?.list) {
        // Transform API response to match expected audio list format
        const audioData = apicall_content.data.list.map((item: any) => ({
          id: item._id,
          title: item.title || 'Untitled Audio',
          description: item.description || '',
          duration: '0:00',
          audioUrl: item.audioUrl || '',
          thumbnailUrl: item.thumbnailUrls?.[0] || '',
          language: item.language || 'en',
          categoryId: item.categoryId?._id || categoryId,
          isFavorite: item.isFavorite || false,
        }));

        console.log('Audio data transformed:', audioData);
        setAudioList(audioData);

        // Clear previous selections when fetching new audio list
        setSelectedAudios([]);

        return audioData;
      } else {
        console.log('No content found for this category');
        Alert.alert('Info', 'No audio content available for this category');
        setAudioList([]);
        return [];
      }
    } catch (error) {
      setLoader(false);
      console.log('Error fetching content:', error);
      Alert.alert('Error', 'Failed to fetch audio content');
      setAudioList([]);
      return [];
    }
  };

  // Handle opening the audio selection modal
  const handleOpenAudioModal = async () => {
    if (!category) {
      Alert.alert('Info', 'Please select a category first');
      return;
    }

    setModalVisible(true);

    // If audio list is empty, fetch it
    if (audioList.length === 0) {
      await fetchAudioContent(category);
    }
  };

  // Handle audio selection (checkbox toggle)
  const handleAudioSelect = (audioId: string) => {
    // For single selection
    setSelectedAudios([audioId]);
    setcontentState(audioId);

    const selectedAudio = audioList.find(audio => audio.id === audioId);
    if (selectedAudio) {
      console.log('Selected audio:', selectedAudio.title);
    }
  };

  // Handle audio play/pause
  const handlePlayAudio = (audioId: string, audioUrl: string) => {
    if (currentlyPlaying === audioId) {
      // Pause if already playing
      setCurrentlyPlaying(null);
      console.log('Pause audio:', audioId);
    } else {
      // Play new audio
      setCurrentlyPlaying(audioId);
      console.log('Play audio:', audioId, 'URL:', audioUrl);
    }
  };

  // Handle modal close and save selections
  const handleModalClose = () => {
    setModalVisible(false);
  };

  // Filter audio list based on search query
  const filteredAudioList = audioList.filter(
    audio =>
      audio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audio.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Render individual audio item
  const renderAudioItem = ({ item }) => (
    <View style={styles.audioItem}>
      {/* Checkbox for selection */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          selectedAudios.includes(item.id) && styles.checkboxSelected,
        ]}
        onPress={() => handleAudioSelect(item.id)}
      >
        {selectedAudios.includes(item.id) && (
          <Check size={16} color={theme.white} />
        )}
      </TouchableOpacity>

      {/* Audio Thumbnail (if available) */}
      {item.thumbnailUrl ? (
        <View style={styles.thumbnailContainer}>
          <View style={styles.thumbnailPlaceholder}>
            <CustomVectorIcons
              name="musical-notes"
              iconSet="Ionicons"
              size={moderateScale(25)}
              color={theme.gray}
            />
          </View>
        </View>
      ) : null}

      {/* Audio Info */}
      <View style={styles.audioInfo}>
        <Text style={styles.audioTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={styles.audioDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <Text style={styles.audioDuration}>
          {item.duration} • {item.language}
        </Text>
      </View>

      {/* Play/Pause Button */}
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => handlePlayAudio(item.id, item.audioUrl)}
      >
        {currentlyPlaying === item.id ? (
          <Pause size={20} color={theme.themeColor} />
        ) : (
          <Play size={20} color={theme.themeColor} />
        )}
      </TouchableOpacity>
    </View>
  );

  // ScheduleClass function - FIXED
  const ScheduleClass = async () => {
    // Validation checks
    if (!activeChild) {
      Alert.alert(
        languageData?.error_title || 'Error',
        languageData?.no_child_selected_error || 'Please select a child',
      );

      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (selectedAudios.length === 0) {
      Alert.alert('Error', 'Please select at least one audio');
      return;
    }

    if (
      selectedHour === null ||
      selectedHour === undefined ||
      selectedMinute === null ||
      selectedMinute === undefined
    ) {
      Alert.alert('Error', 'Please select a valid time');
      return;
    }

    // Additional validation for weekly repeats
    if (repeat === 'Weekly' && selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day for weekly repeat');
      return;
    }

    // Get timestamp for selected time
    const timestamp = getTimestampFromSelectedTime();
    if (timestamp === null) {
      Alert.alert('Error', 'Invalid time selected');
      return;
    }

    setLoader(true);

    // Function to map repeat type to API format
    const getRepeatType = () => {
      switch (repeat.toLowerCase()) {
        case 'once':
          return 'once';
        case 'daily':
          return 'daily';
        case 'weekly':
          return 'weekly';
        default:
          return 'once';
      }
    };

    // Prepare payload according to API requirements
    const payload: any = {
      childId: activeChild, // Child ID
      categoryId: category,
      contentId: contentState, // Selected audio ID
      time: timestamp,
      enableNotifications: notification,
      repeat: {
        type: getRepeatType(),
      },
    };

    // Add daysOfWeek for weekly repeats
    if (repeat === 'Weekly' && selectedDays.length > 0) {
      payload.repeat.daysOfWeek = selectedDays;
    }

    console.log('Schedule API Payload:', payload);

    try {
      const res = await apiRequest(ApiURL.AddSession, 'POST', payload, true);
      setLoader(false);

      if (!res?.error) {
        console.log('Schedule created successfully:', res);
        // Alert.alert('Success', 'Schedule created successfully!');
        Alert.alert('Success', 'Schedule created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('ExistingSession');
            },
          },
        ]);

        // Reset form after success
        setCategory('');
        setcontentState('');
        setSelectedHour(null);
        setSelectedMinute(null);
        setRepeat('Once');
        setSelectedDays([]);
        setNotification(true);
        setAudioList([]);
        setSelectedAudios([]);
        setActiveChild('');
      } else {
        const errorMsg =
          res?.message || 'Failed to schedule class. Please try again.';
        Alert.alert('Error', errorMsg);
      }
    } catch (error: any) {
      setLoader(false);
      console.log('Schedule API Error:', error);
      Alert.alert('Error', error.message || 'Network error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader showBackButton={true} showNotifications={false} />

      <ScrollView contentContainerStyle={{ paddingBottom: moderateScale(80) }}>
        <Text style={styles.mainTitle}>
          {languageData?.set_schedule_title || 'Set Schedule'}
        </Text>

        {/* Active Child Dropdown */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>
            {languageData?.select_child_label || 'Select Child'}
          </Text>

          <CustomDropdown
            data={activeChildData}
            placeholder={
              languageData?.select_active_child_placeholder ||
              'Select Active Child'
            }
            value={activeChild}
            onChange={(ele: any) => handel_Active_Child(ele)}
            customDropdownStyle={styles.dropdownStyle}
          />
        </View>

        {/* Time Selection */}
        <View style={styles.timeSection}>
          <Text style={styles.label}>
            {languageData?.start_time_label || 'Start Time'}
          </Text>

          <View style={styles.timeRow}>
            {/* Hour Dropdown */}
            <View style={styles.timeDropdownWrapper}>
              <CustomDropdown
                data={hourOptions}
                placeholder={languageData?.hour_placeholder || 'HH'}
                value={selectedHour}
                onChange={(ele: any) => {
                  console.log('Selected hour element:', ele);
                  if (ele && typeof ele === 'object') {
                    setSelectedHour(ele.value !== undefined ? ele.value : null);
                  } else if (ele !== undefined) {
                    setSelectedHour(ele);
                  } else {
                    setSelectedHour(null);
                  }
                }}
                customDropdownStyle={styles.timeDropdownStyle}
                dropdownTextStyle={styles.timeDropdownText}
              />
            </View>

            <Text style={styles.colon}>:</Text>

            {/* Minute Dropdown */}
            <View style={styles.timeDropdownWrapper}>
              <CustomDropdown
                data={minuteOptions}
                placeholder={languageData?.minute_placeholder || 'MM'}
                value={selectedMinute}
                onChange={(ele: any) => {
                  console.log('Selected minute element:', ele);
                  if (ele && typeof ele === 'object') {
                    setSelectedMinute(
                      ele.value !== undefined ? ele.value : null,
                    );
                  } else if (ele !== undefined) {
                    setSelectedMinute(ele);
                  } else {
                    setSelectedMinute(null);
                  }
                }}
                customDropdownStyle={styles.timeDropdownStyle}
                dropdownTextStyle={styles.timeDropdownText}
              />
            </View>
          </View>

          {/* Display selected time */}
          {selectedHour !== null &&
            selectedHour !== undefined &&
            selectedMinute !== null &&
            selectedMinute !== undefined && (
              <Text style={styles.selectedTimeText}>
                {languageData?.selected_time_label || 'Selected time'}:
                {selectedHour?.toString()?.padStart(2, '0')}:
                {selectedMinute?.toString()?.padStart(2, '0')}
              </Text>
            )}
        </View>

        {/* REPEAT OPTIONS */}
        <View style={styles.sectionContainer}>
          <Text style={styles.label}>
            {languageData?.repeat_session_label || 'Repeat Session'}
          </Text>

          <View style={styles.repeatContainer}>
            {repeatOptions.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.repeatOption,
                  repeat === opt && styles.repeatOptionActive,
                ]}
                onPress={() => {
                  setRepeat(opt);
                  // Clear selected days when changing repeat type
                  if (opt !== 'Weekly') {
                    setSelectedDays([]);
                  }
                }}
              >
                <Text
                  style={[
                    styles.repeatText,
                    repeat === opt && styles.repeatTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Days of Week Selection for Weekly Repeat */}
          {repeat === 'Weekly' && (
            <View style={styles.daysContainer}>
              <Text style={styles.daysLabel}>
                {languageData?.select_days_label || 'Select Days:'}
              </Text>

              <View style={styles.daysGrid}>
                {daysOfWeek.map(day => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(day.id) && styles.dayButtonSelected,
                    ]}
                    onPress={() => handleDaySelect(day.id)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        selectedDays.includes(day.id) &&
                          styles.dayButtonTextSelected,
                      ]}
                    >
                      {day.short}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedDays.length > 0 && (
                <Text style={styles.selectedDaysText}>
                  {languageData?.selected_days_label || 'Selected'}:
                  {selectedDays
                    .map(id => daysOfWeek.find(d => d.id === id)?.short)
                    .join(', ')}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Categories Dropdown */}
        {/* <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Select Categories</Text>
          <CustomDropdown
            data={categorydata}
            placeholder="Select Categories"
            value={category}
            onChange={(item: any) => {
              handle_PlayList_Content(item);
            }}
            customDropdownStyle={styles.dropdownStyle}
          />
        </View> */}

        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>
            {languageData?.select_categories_label || 'Select Categories'}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (!isChildSelected) {
                Alert.alert(
                  languageData?.select_child_first_title ||
                    'Select Child First',
                  languageData?.select_child_first_message ||
                    'Please select a child to load categories',
                );
              }
            }}
          >
            <View pointerEvents={isChildSelected ? 'auto' : 'none'}>
              <CustomDropdown
                data={categorydata}
                placeholder={
                  isChildSelected
                    ? languageData?.select_categories_placeholder ||
                      'Select Categories'
                    : languageData?.select_child_to_enable_categories ||
                      'Select child first'
                }
                value={category}
                disabled={!isChildSelected}
                onChange={(item: any) => {
                  handle_PlayList_Content(item);
                }}
                customDropdownStyle={[
                  styles.dropdownStyle,
                  !isChildSelected && styles.disabledDropdown,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Playlist Content Selection - Now opens modal */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>
            {languageData?.select_playlist_label || 'Select Playlist Content'}
          </Text>

          <TouchableOpacity
            style={[
              styles.modalTrigger,
              !category && styles.modalTriggerDisabled,
            ]}
            onPress={handleOpenAudioModal}
            disabled={!category}
          >
            <Text
              style={[
                styles.modalTriggerText,
                !selectedAudios.length && styles.modalTriggerPlaceholder,
              ]}
            >
              {selectedAudios.length > 0
                ? `Selected ${selectedAudios.length} audio(s)`
                : !category
                ? languageData?.select_category_first ||
                  'Select a category first'
                : languageData?.select_playlist_placeholder ||
                  'Select Playlist Content'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* NOTIFICATION */}
        <View style={styles.notificationRow}>
          <Text style={styles.label}>
            {languageData?.notification_label || 'Notification'}
          </Text>

          <Switch
            value={notification}
            onValueChange={setNotification}
            thumbColor={notification ? theme.themeColor : '#ccc'}
            trackColor={{ true: theme.themeColor + '80', false: '#D1D1D1' }}
          />
        </View>

        {/* SAVE BUTTON */}
        <CustomButton
          text={languageData?.save_schedule_button || 'Save Schedule'}
          backgroundColor={theme.themeColor}
          height={moderateScale(45)}
          style={styles.saveBtn}
          onPress={ScheduleClass}
          loading={Loader}
        />
      </ScrollView>

      {/* Audio Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {languageData?.audio_modal_title || 'Select Audio Content'}
              </Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <CustomVectorIcons
                  name="close"
                  iconSet="Ionicons"
                  size={moderateScale(36)}
                  color={theme.gray}
                />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={
                  languageData?.audio_search_placeholder ||
                  'Search audio by title or description...'
                }
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
            </View>

            {/* Selected Count and Info */}
            <View style={styles.modalInfoContainer}>
              {selectedAudios.length > 0 && (
                <Text style={styles.selectedCountText}>
                  {selectedAudios.length} audio(s) selected
                </Text>
              )}
              {audioList.length === 0 && (
                <Text style={styles.noContentText}>
                  {languageData?.no_audio_for_category ||
                    'No audio content available for this category'}
                </Text>
              )}
            </View>

            {/* Audio List */}
            <FlatList
              data={filteredAudioList}
              renderItem={renderAudioItem}
              keyExtractor={item => item.id}
              style={styles.audioList}
              contentContainerStyle={styles.audioListContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {audioList.length === 0
                      ? languageData?.no_audio_for_category ||
                        'No audio content available for this category'
                      : languageData?.no_matching_audio ||
                        'No matching audio found'}
                  </Text>
                </View>
              }
            />

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text>{languageData?.modal_cancel || 'Cancel'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.doneButton,
                  selectedAudios.length === 0 && styles.doneButtonDisabled,
                ]}
                onPress={handleModalClose}
                disabled={selectedAudios.length === 0}
              >
                <Text>
                  {selectedAudios.length > 0
                    ? languageData?.modal_select_with_count?.replace(
                        '{{count}}',
                        selectedAudios.length,
                      ) || `Select (${selectedAudios.length})`
                    : languageData?.modal_select || 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
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
    mainTitle: {
      fontSize: moderateScale(20),
      textAlign: 'center',
      fontFamily: FontFamily.KhulaBold,
      color: theme.black,
      marginTop: moderateScale(12),
      marginBottom: moderateScale(10),
    },
    label: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
      marginBottom: moderateScale(8),
    },
    dropdownContainer: {
      width: '100%',
      paddingHorizontal: moderateScale(20),
      marginBottom: moderateScale(20),
    },
    dropdownStyle: {
      borderWidth: 1,
      borderColor: '#E6E6E6',
      borderRadius: moderateScale(10),
      backgroundColor: theme.white,
      paddingHorizontal: moderateScale(15),
      width: '100%',
      marginLeft: 0,
      marginRight: 0,
      color: theme.text,
    },
    timeSection: {
      width: '100%',
      paddingHorizontal: moderateScale(20),
      marginBottom: moderateScale(20),
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(12),
    },
    timeDropdownWrapper: {
      flex: 1,
    },
    timeDropdownStyle: {
      borderWidth: 1,
      borderColor: '#DCDCDC',
      borderRadius: moderateScale(8),
      backgroundColor: theme.white,
      paddingHorizontal: moderateScale(12),
      height: moderateScale(50),
      justifyContent: 'center',
    },
    timeDropdownText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
      textAlign: 'center',
    },
    colon: {
      fontSize: moderateScale(18),
      fontWeight: 'bold',
      color: theme.black,
    },
    selectedTimeText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.themeColor,
      marginTop: moderateScale(8),
      textAlign: 'center',
    },
    sectionContainer: {
      width: '100%',
      paddingHorizontal: moderateScale(20),
      marginBottom: moderateScale(20),
    },
    repeatContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: moderateScale(10),
    },
    repeatOption: {
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(10),
      borderRadius: moderateScale(20),
      backgroundColor: '#F8F8F8',
      borderWidth: 1,
      borderColor: '#E6E6E6',
    },
    repeatOptionActive: {
      backgroundColor: theme.themeColor + '20',
      borderColor: theme.themeColor,
    },
    repeatText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.black,
    },
    repeatTextActive: {
      color: theme.themeColor,
      fontFamily: FontFamily.KhulaSemiBold,
    },
    // Days of Week Styles
    daysContainer: {
      marginTop: moderateScale(15),
    },
    daysLabel: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
      marginBottom: moderateScale(10),
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: moderateScale(8),
      marginBottom: moderateScale(10),
    },
    dayButton: {
      width: moderateScale(45),
      height: moderateScale(45),
      borderRadius: moderateScale(8),
      backgroundColor: '#F8F8F8',
      borderWidth: 1,
      borderColor: '#E6E6E6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dayButtonSelected: {
      backgroundColor: theme.themeColor + '20',
      borderColor: theme.themeColor,
    },
    dayButtonText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.black,
    },
    dayButtonTextSelected: {
      color: theme.themeColor,
      fontFamily: FontFamily.KhulaSemiBold,
    },
    selectedDaysText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.themeColor,
      fontStyle: 'italic',
    },
    notificationRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: moderateScale(20),
      marginTop: moderateScale(10),
      marginBottom: moderateScale(30),
    },
    saveBtn: {
      width: '90%',
      alignSelf: 'center',
      borderRadius: moderateScale(10),
      // marginTop: moderateScale(5),
    },

    // Modal Trigger Button (replaces dropdown)
    modalTrigger: {
      borderWidth: 1,
      borderColor: '#E6E6E6',
      borderRadius: moderateScale(10),
      backgroundColor: theme.white,
      paddingHorizontal: moderateScale(15),
      height: moderateScale(50),
      justifyContent: 'center',
      width: '100%',
    },
    modalTriggerDisabled: {
      backgroundColor: '#F5F5F5',
      borderColor: '#E0E0E0',
    },
    modalTriggerText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
    },
    modalTriggerPlaceholder: {
      color: '#999',
    },

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.white,
      borderTopLeftRadius: moderateScale(20),
      borderTopRightRadius: moderateScale(20),
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: moderateScale(20),
      borderBottomWidth: 1,
      borderBottomColor: '#E6E6E6',
    },
    modalTitle: {
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaBold,
      color: theme.black,
    },
    closeButton: {
      padding: moderateScale(5),
    },
    searchContainer: {
      padding: moderateScale(20),
      paddingTop: 0,
      marginTop: moderateScale(10),
    },
    searchInput: {
      borderWidth: 1,
      borderColor: '#E6E6E6',
      borderRadius: moderateScale(10),
      padding: moderateScale(12),
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.black,
      backgroundColor: '#F8F8F8',
    },
    modalInfoContainer: {
      paddingHorizontal: moderateScale(20),
      paddingBottom: moderateScale(10),
    },
    selectedCountText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.themeColor,
      marginBottom: moderateScale(5),
    },
    noContentText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: '#999',
      fontStyle: 'italic',
    },
    audioList: {
      maxHeight: moderateScale(300),
    },
    audioListContent: {
      paddingHorizontal: moderateScale(20),
    },
    audioItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: moderateScale(12),
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    checkbox: {
      width: moderateScale(24),
      height: moderateScale(24),
      borderRadius: moderateScale(4),
      borderWidth: 2,
      borderColor: '#E6E6E6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: moderateScale(12),
    },
    checkboxSelected: {
      backgroundColor: theme.themeColor,
      borderColor: theme.themeColor,
    },
    thumbnailContainer: {
      marginRight: moderateScale(12),
    },
    thumbnailPlaceholder: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(8),
      backgroundColor: theme.themeColor + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    audioInfo: {
      flex: 1,
    },
    audioTitle: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
      marginBottom: moderateScale(2),
    },
    audioDescription: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: '#666',
      marginBottom: moderateScale(2),
    },
    audioDuration: {
      fontSize: moderateScale(11),
      fontFamily: FontFamily.KhulaRegular,
      color: '#888',
    },
    playButton: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      backgroundColor: theme.themeColor + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: moderateScale(10),
    },
    emptyContainer: {
      paddingVertical: moderateScale(40),
      alignItems: 'center',
    },
    emptyText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: '#999',
      textAlign: 'center',
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: moderateScale(20),
      borderTopWidth: 1,
      borderTopColor: '#E6E6E6',
    },
    cancelButton: {
      flex: 1,
      padding: moderateScale(12),
      borderRadius: moderateScale(10),
      borderWidth: 1,
      borderColor: '#E6E6E6',
      marginRight: moderateScale(10),
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
    },
    doneButton: {
      flex: 1,
      padding: moderateScale(12),
      borderRadius: moderateScale(10),
      backgroundColor: theme.themeColor,
      marginLeft: moderateScale(10),
      alignItems: 'center',
    },
    doneButtonDisabled: {
      backgroundColor: '#E6E6E6',
    },
    doneButtonText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.white,
    },
    disabledDropdown: {
      backgroundColor: '#F2F2F2',
      opacity: 0.6,
    },
  });

export default EditExistingScreen;
