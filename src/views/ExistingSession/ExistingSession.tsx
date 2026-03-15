import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomHeader from '@components/CustomHeader';
import CustomButton from '@components/CustomButton';
import CustomVectorIcons from '@components/CustomVectorIcons';
import DeleteModal from '@components/DeleteModal';
import { ApiURL } from '@services/ApiConstants';
import { apiRequest } from '@services/ApiServices';
import { useSelector } from 'react-redux';

const ExistingSession = ({ navigation }: any) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loader, setLoader] = useState(false);
  const [sessionData, setSessionData] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [selectedScheduleContentId, setSelectedScheduleContentId] =
    useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Format time from timestamp to readable format
  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'Time not set';

    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')} ${ampm}`;
  };

  // Format repeat type
  const formatRepeatType = (repeat: any) => {
    if (!repeat || !repeat.type) return 'Once';

    const type = repeat.type.toLowerCase();
    if (type === 'daily') return 'Daily';
    if (type === 'weekly') {
      if (repeat.daysOfWeek && repeat.daysOfWeek.length > 0) {
        const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = repeat.daysOfWeek.map(
          (day: number) => daysMap[day] || day,
        );
        return `Weekly (${days.join(', ')})`;
      }
      return languageData?.repeat_weekly || 'Weekly';
    }
    return languageData?.repeat_once || 'Once';
  };

  // Fetch existing sessions
  const fetchExistingSession = async () => {
    setLoader(true);
    try {
      // This endpoint might need to be different for scheduled sessions
      // Based on your API response, it seems like this should be the schedule sessions endpoint
      const url = ApiURL.schduleSession; // This should be the correct endpoint for scheduled sessions

      console.log('Fetching scheduled sessions from:', url);

      const res = await apiRequest(url, 'GET', null, true);

      setLoader(false);
      console.log('Session data response:', res);

      if (!res?.error && res.data) {
        // Handle both array and object responses
        const sessions = Array.isArray(res.data)
          ? res.data
          : res.data.list || [];
        setSessionData(sessions);
        console.log('Loaded sessions:', sessions.length);
      } else {
        console.log('API Error:', res?.message);
        Alert.alert('Error', res?.message || 'Failed to load sessions');
      }
    } catch (error: any) {
      setLoader(false);
      console.log('🔥 API Exception:', error);
      Alert.alert('Error', error.message || 'Network error occurred');
    }
  };

  /**
   * Handle session deletion - API Integration
   */
  const handleDeleteSession = async () => {
    if (!selectedSessionId || !selectedChildId || !selectedScheduleContentId) {
      Alert.alert(
        languageData?.error_title || 'Error',
        languageData?.missing_delete_data ||
          'Missing required data for deletion',
      );

      return;
    }

    setIsDeleting(true);
    try {
      // Prepare the payload according to API requirements
      const payload = {
        childId: selectedChildId,
        scheduleContentId: selectedScheduleContentId,
      };

      console.log('Delete payload:', payload);

      // Make DELETE request to the schedule deletion endpoint
      const url = ApiURL.deleteSession;

      // If the endpoint expects POST method with payload
      const res = await apiRequest(url, 'DELETE', payload, true);

      if (!res?.error) {
        Alert.alert(
          languageData?.success_title || 'Success',
          languageData?.delete_success || 'Session deleted successfully',
        );

        // Remove the deleted session from local state
        setSessionData(prev =>
          prev.filter(session => session._id !== selectedSessionId),
        );

        // Show success feedback
        console.log('Session deleted successfully:', res);
      } else {
        Alert.alert(
          languageData?.error_title || 'Error',
          res?.message ||
            languageData?.delete_failed ||
            'Failed to delete session',
        );

        console.log('Delete API Error:', res?.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Network error occurred');
      console.log('🔥 Delete Exception:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSelectedSessionId(null);
      setSelectedChildId(null);
      setSelectedScheduleContentId(null);
    }
  };

  /**
   * Prepare for session deletion
   * This function extracts required data before showing delete confirmation
   */
  const prepareDeleteSession = (session: any) => {
    // Extract required data from the session object
    const sessionId = session._id;
    const childId = session.childId?._id || session.childId;
    const scheduleContentId = session?._id;

    if (!sessionId || !childId || !scheduleContentId) {
      Alert.alert('Error', 'Cannot delete: Missing required session data');
      return;
    }

    // Set the data for deletion
    setSelectedSessionId(sessionId);
    setSelectedChildId(childId);
    setSelectedScheduleContentId(scheduleContentId);

    // Navigate to VerifyPin screen first
    navigation.navigate('VerifyPin', {
      mode: 'CONFIRM_PIN',
      nextScreen: 'ExistingSession',
      onSuccess: () => {
        setShowDeleteModal(true);
      },
    });
  };

  /**
   * Handle edit session with PIN verification
   */
  const handleEditSession = (session: any) => {
    navigation.navigate('VerifyPin', {
      sessionId: session._id,
      sessionData: session,
      editMode: true,
      mode: 'CONFIRM_PIN',
      nextScreen: 'SetSchedule',
    });
  };

  /**
   * Handle the actual delete after PIN verification
   * This is called from the DeleteModal after user confirms deletion
   */
  const confirmDeleteAfterPinVerification = () => {
    // Call the actual delete function
    handleDeleteSession();
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExistingSession();
    setRefreshing(false);
  };

  // Initial data fetch
  useEffect(() => {
    fetchExistingSession();
  }, []);

  // Render loading state
  if (loader && sessionData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor={theme.transparent}
          barStyle="light-content"
        />
        <CustomHeader showBackButton={true} showNotifications={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.themeColor} />
          <Text style={styles.loadingText}>
            {languageData?.loading_sessions || 'Loading sessions...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.transparent} barStyle="light-content" />

      <CustomHeader showBackButton={true} showNotifications={false} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: moderateScale(60) }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.themeColor]}
            tintColor={theme.themeColor}
          />
        }
      >
        <Text style={styles.title}>
          {languageData?.existing_session_title || 'Existing Session'}
        </Text>

        {sessionData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CustomVectorIcons
              name="calendar"
              iconSet="Feather"
              size={moderateScale(60)}
              color={theme.gray}
            />
            <Text style={styles.emptyText}>
              {languageData?.no_sessions_title || 'No scheduled sessions found'}
            </Text>

            <Text style={styles.emptySubtext}>
              {languageData?.no_sessions_subtitle ||
                'Create your first schedule to get started'}
            </Text>
          </View>
        ) : (
          sessionData.map((session: any, index: number) => (
            <View key={session._id || index} style={styles.card}>
              {/* LEFT: Child Info */}
              <View style={styles.leftColumn}>
                {/* Avatar placeholder - you can use actual child avatar if available */}
                <View style={styles.avatarPlaceholder}>
                  <CustomVectorIcons
                    name="user"
                    iconSet="Feather"
                    size={moderateScale(25)}
                    color={theme.white}
                  />
                </View>
                <Text numberOfLines={1} style={styles.userName}>
                  {session.childId?.username ||
                    languageData?.child_default_name ||
                    'Child'}
                </Text>
                <Text style={styles.ageText}>
                  {session.childId?.ageRange || ''}{' '}
                  {languageData?.age_suffix || 'Age'}
                </Text>
              </View>

              {/* RIGHT SIDE: Session Details */}
              <View style={styles.rightColumn}>
                {/* Session Title + Edit */}
                <View style={styles.rowBetween}>
                  <Text style={styles.sessionTitle}>
                    {session.contentId?.title ||
                      session.categoryId?.title ||
                      languageData?.session_default_title ||
                      'Session'}
                  </Text>
                  <TouchableOpacity onPress={() => handleEditSession(session)}>
                    <CustomVectorIcons
                      name="edit"
                      iconSet="Feather"
                      size={moderateScale(18)}
                      color={theme.themeColor}
                      style={{ marginTop: moderateScale(5) }}
                    />
                  </TouchableOpacity>
                </View>

                {/* Category */}
                <View style={styles.infoRow}>
                  <CustomVectorIcons
                    name="folder"
                    iconSet="Feather"
                    size={moderateScale(14)}
                    color={theme.themeColor}
                    style={{ marginBottom: moderateScale(2) }}
                  />
                  <Text style={styles.smallText}>
                    {languageData?.category_default || 'Category'}
                  </Text>
                </View>

                {/* Time and Repeat */}
                <View style={styles.infoRow}>
                  <CustomVectorIcons
                    name="clock"
                    iconSet="Feather"
                    size={moderateScale(14)}
                    color={theme.black}
                    style={{ marginBottom: moderateScale(5) }}
                  />
                  <Text style={styles.smallText}>
                    Time: {formatTime(session.time)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <CustomVectorIcons
                    name="repeat"
                    iconSet="Feather"
                    size={moderateScale(14)}
                    color={theme.black}
                    style={{ marginBottom: moderateScale(5) }}
                  />
                  <Text
                    style={{
                      fontSize: moderateScale(12),
                      fontFamily: FontFamily.KhulaRegular,
                      color: theme.black,
                      marginLeft: moderateScale(4),
                      maxWidth: '50%',
                    }}
                  >
                    {languageData?.repeat_label || 'Repeat'}:{' '}
                    {formatRepeatType(session.repeat)}
                  </Text>
                </View>

                {/* Notifications + Delete */}
                <View style={styles.rowBetween}>
                  <View style={styles.infoRow}>
                    <CustomVectorIcons
                      name={session.enableNotifications ? 'bell' : 'bell-off'}
                      iconSet="Feather"
                      size={moderateScale(14)}
                      color={
                        session.enableNotifications
                          ? theme.themeColor
                          : theme.gray
                      }
                      style={{ marginBottom: moderateScale(5) }}
                    />
                    <Text
                      style={[
                        styles.smallText,
                        {
                          color: session.enableNotifications
                            ? theme.themeColor
                            : theme.gray,
                        },
                      ]}
                    >
                      {session.enableNotifications
                        ? languageData?.notifications_on || 'Notifications ON'
                        : languageData?.notifications_off ||
                          'Notifications OFF'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => prepareDeleteSession(session)}
                  >
                    <CustomVectorIcons
                      name="delete"
                      type="MaterialIcons"
                      size={moderateScale(18)}
                      color={theme.themeRed}
                      style={{ marginBottom: moderateScale(5) }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <CustomButton
          text={languageData?.add_schedule_button || 'Add Schedule'}
          backgroundColor={theme.themeColor}
          height={moderateScale(52)}
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('VerifyPin', {
              mode: 'CONFIRM_PIN',
              nextScreen: 'EditExistingScreen',
            })
          }
        />

        {/* Delete Modal - This will only show after PIN verification */}
        <DeleteModal
          visible={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedSessionId(null);
            setSelectedChildId(null);
            setSelectedScheduleContentId(null);
          }}
          onDelete={confirmDeleteAfterPinVerification}
          title={languageData?.delete_session_title || 'Delete Session?'}
          subtitle={
            languageData?.delete_session_subtitle ||
            'Are you sure you want to delete this session? This action cannot be undone.'
          }
          deleteButtonText={
            isDeleting
              ? languageData?.deleting_session || 'Deleting...'
              : languageData?.delete_session_button || 'Delete Session'
          }
          loading={isDeleting}
          showCancelButton={true}
        />
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
      marginTop: moderateScale(20),
    },
    title: {
      fontSize: moderateScale(18),
      color: theme.black,
      fontFamily: FontFamily.KhulaBold,
      textAlign: 'center',
      marginTop: moderateScale(10),
      marginBottom: moderateScale(10),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.black,
      marginTop: moderateScale(20),
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: moderateScale(60),
    },
    emptyText: {
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
      marginTop: moderateScale(20),
    },
    emptySubtext: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.gray,
      marginTop: moderateScale(10),
      textAlign: 'center',
    },
    card: {
      width: '92%',
      alignSelf: 'center',
      backgroundColor: theme.white,
      borderRadius: moderateScale(12),
      padding: moderateScale(12),
      marginTop: moderateScale(18),
      borderColor: '#E5E7EB',
      borderWidth: 1,
      shadowColor: theme.black,
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: moderateScale(3),
      elevation: 3,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: moderateScale(10),
    },
    leftColumn: {
      width: '22%',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    avatarPlaceholder: {
      width: moderateScale(50),
      height: moderateScale(50),
      borderRadius: moderateScale(25),
      backgroundColor: theme.themeColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    userName: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
      marginTop: moderateScale(6),
      textAlign: 'center',
    },
    ageText: {
      fontSize: moderateScale(10),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.gray,
      marginTop: moderateScale(2),
      textAlign: 'center',
    },
    rightColumn: {
      width: '78%',
      justifyContent: 'center',
      paddingLeft: moderateScale(8),
    },
    sessionTitle: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      color: theme.black,
      marginTop: moderateScale(4),
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: moderateScale(6),
      marginTop: moderateScale(4),
    },
    smallText: {
      fontSize: moderateScale(12),
      fontFamily: FontFamily.KhulaRegular,
      color: theme.black,
      marginLeft: moderateScale(4),
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: moderateScale(2),
    },
    addButton: {
      width: '90%',
      alignSelf: 'center',
      marginTop: moderateScale(30),
      marginBottom: moderateScale(20),
      borderRadius: moderateScale(10),
    },
  });

export default ExistingSession;
