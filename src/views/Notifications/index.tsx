/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';
import CustomHeader from '@components/CustomHeader';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';
import CustomLoader from '@utils/CustomLoader';
import { showErrorToast } from '@utils/CustomToast';
import CustomVectorIcons from '@components/CustomVectorIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const NotificationScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const languageData = useSelector(
    (state: any) => state?.language?.languageData,
  );

  const [notificationList, setNotificationList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For image preview modal
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // Calculate unread count
  const unreadCount = notificationList.filter(n => n.isRead === false).length;

  // ================= API =================
  const fetchNotifications = async (showLoader = true) => {
    if (showLoader) setLoader(true);

    try {
      const res = await apiRequest(
        `${ApiURL.getNotificationsList}?page=1&size=50`,
        'GET',
        null,
        true,
      );

      if (!res?.error && Array.isArray(res?.data?.list)) {
        setNotificationList(res.data.list);
      } else {
        setNotificationList([]);
        showErrorToast(
          languageData?.failed_load_notifications ||
            'Failed to load notifications',
        );
      }
    } catch (e) {
      showErrorToast(languageData?.network_error || 'Network error');

      setNotificationList([]);
    } finally {
      setLoader(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(false);
  };

  // ================= DATE FORMAT =================
  const formatDate = timestamp => {
    if (!timestamp) return '';

    const date = new Date(Number(timestamp));
    const now = new Date();

    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    if (diffDay === 1) return 'Yesterday';

    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  // ================= ICON =================
  const getIcon = () => ({
    name: 'bell',
    color: theme.themeColor,
  });

  const markAsRead = async (id: any) => {
    try {
      await apiRequest(ApiURL.markNotificationRead, 'POST', { _id: id }, true);

      // Optimistic UI update
      setNotificationList(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (e) {
      showErrorToast(
        languageData?.failed_mark_all_read || 'Failed to mark all as read',
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest(ApiURL.markAllNotificationsRead, 'POST', null, true);

      // Update UI locally
      setNotificationList(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      showErrorToast(
        languageData?.failed_mark_read || 'Failed to mark as read',
      );
    }
  };

  const onPressNotification = item => {
    if (item.isRead) return;
    markAsRead(item._id);
  };

  // ================= IMAGE PREVIEW FUNCTIONS =================
  const openImagePreview = imageUri => {
    setSelectedImage(imageUri);
    setImageModalVisible(true);
  };

  const closeImagePreview = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  // ================= RENDER ITEM =================
  const renderItem = ({ item }) => {
    const icon = getIcon();
    const isUnread = item?.isRead === false;
    const hasImage = item?.media && item?.mediaType === 'image';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPressNotification(item)}
        style={[styles.card, !isUnread && styles.readCard]}
      >
        <View style={[styles.iconBox, { backgroundColor: icon.color + '20' }]}>
          <CustomVectorIcons
            name={icon.name}
            iconSet="Feather"
            size={moderateScale(20)}
            color={icon.color}
          />
        </View>

        <View style={styles.textWrap}>
          {/* TITLE + DOT */}
          <View style={styles.row}>
            <Text style={styles.title} numberOfLines={2}>
              {item?.title}
            </Text>
            {isUnread && <View style={styles.dot} />}
          </View>

          {/* DESCRIPTION */}
          <Text style={styles.desc} numberOfLines={3}>
            {item?.description}
          </Text>

          {/* IMAGE THUMBNAIL */}
          {hasImage && (
            <TouchableOpacity
              onPress={() => openImagePreview(item.media)}
              activeOpacity={0.8}
              style={styles.imageContainer}
            >
              <Image
                source={{ uri: item.media }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <CustomVectorIcons
                  name="zoom-in"
                  iconSet="Feather"
                  size={moderateScale(24)}
                  color="white"
                />
              </View>
            </TouchableOpacity>
          )}

          {/* TIME + MARK AS READ */}
          <View style={styles.footerRow}>
            <Text style={styles.time}>{formatDate(item?.createdAt)}</Text>

            {isUnread && (
              <TouchableOpacity
                onPress={() => markAsRead(item._id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.markReadText}>Mark as read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ================= EMPTY COMPONENT =================
  const Empty = () => (
    <View style={styles.empty}>
      <CustomVectorIcons
        name="bell-off"
        iconSet="Feather"
        size={moderateScale(56)}
        color={theme.gray}
      />
      <Text style={styles.emptyTitle}>
        {languageData?.no_notifications || 'No Notifications'}
      </Text>

      <TouchableOpacity onPress={fetchNotifications} style={styles.retry}>
        <Text style={styles.retryText}>
          {languageData?.refresh || 'Refresh'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ================= IMAGE PREVIEW MODAL =================
  const ImagePreviewModal = () => (
    <Modal
      visible={imageModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeImagePreview}
    >
      <TouchableWithoutFeedback onPress={closeImagePreview}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeImagePreview}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <CustomVectorIcons
                name="x"
                iconSet="Feather"
                size={moderateScale(24)}
                color="white"
              />
            </TouchableOpacity>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <CustomHeader
        showBackButton
        backButtonText={languageData?.notifications || 'Notifications'}
        showNotifications={false}
      />

      {/* 🔹 MARK ALL AS READ ROW WITH UNREAD COUNT */}
      {unreadCount > 0 && (
        <View style={styles.actionRow}>
          <View style={styles.actionRowContent}>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCountText}>
                {unreadCount} {languageData?.unread || 'unread'}
              </Text>
            </View>
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markReadText}>
                {languageData?.mark_as_read || 'Mark as read'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={notificationList}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.themeColor}
          />
        }
        ListEmptyComponent={!loader && <Empty />}
      />

      <CustomLoader visible={loader} />
      <ImagePreviewModal />
    </SafeAreaView>
  );
};

export default NotificationScreen;

const getStyles = theme =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },

    list: {
      padding: moderateScale(16),
      paddingBottom: moderateScale(30),
    },

    card: {
      flexDirection: 'row',
      padding: moderateScale(14),
      backgroundColor: theme.white,
      borderRadius: moderateScale(12),
      marginBottom: moderateScale(12),
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },

    iconBox: {
      width: moderateScale(38),
      height: moderateScale(38),
      borderRadius: moderateScale(19),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: moderateScale(12),
    },

    textWrap: { flex: 1 },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    title: {
      flex: 1,
      fontFamily: FontFamily.KhulaBold,
      fontSize: moderateScale(14),
      color: theme.text,
    },

    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.themeColor,
      marginLeft: 8,
    },

    desc: {
      fontFamily: FontFamily.KhulaRegular,
      fontSize: moderateScale(13),
      color: theme.gray,
      marginTop: 4,
    },

    // Image thumbnail styles
    imageContainer: {
      marginTop: moderateScale(8),
      borderRadius: moderateScale(8),
      overflow: 'hidden',
      position: 'relative',
    },

    thumbnailImage: {
      width: '100%',
      height: moderateScale(160),
      borderRadius: moderateScale(8),
    },

    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    time: {
      fontSize: moderateScale(11),
      color: '#9CA3AF',
    },

    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
    },

    emptyTitle: {
      marginTop: 10,
      fontSize: 16,
      color: theme.gray,
    },

    retry: {
      marginTop: 12,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.themeColor,
    },

    retryText: {
      color: theme.white,
      fontFamily: FontFamily.KhulaSemiBold,
    },

    readCard: {
      opacity: 0.6,
    },

    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 6,
    },

    markReadText: {
      fontSize: moderateScale(12),
      color: theme.themeColor,
      fontFamily: FontFamily.KhulaSemiBold,
    },

    actionRow: {
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(10),
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },

    actionRowContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    markAllText: {
      fontSize: moderateScale(13),
      color: theme.themeColor,
      fontFamily: FontFamily.KhulaSemiBold,
    },

    unreadBadge: {
      backgroundColor: theme.themeColor + '20', // 20% opacity
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(4),
      borderRadius: moderateScale(12),
    },

    unreadCountText: {
      fontSize: moderateScale(12),
      color: theme.themeColor,
      fontFamily: FontFamily.KhulaSemiBold,
    },

    // Image Preview Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    modalContent: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      justifyContent: 'center',
      alignItems: 'center',
    },

    closeButton: {
      position: 'absolute',
      top: moderateScale(50),
      right: moderateScale(20),
      zIndex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: moderateScale(20),
      padding: moderateScale(8),
    },

    fullImage: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height * 0.8,
    },
  });
