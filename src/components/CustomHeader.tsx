/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
} from 'react-native';
import CustomVectorIcons from './CustomVectorIcons';
import { useNavigation } from '@react-navigation/native';
import FontFamily from '@assets/fonts/FontFamily';
import { useTheme } from '@theme/themeContext';
import { moderateScale } from 'react-native-size-matters';
import IMAGES from '@assets/images';
import CustomImageComponent from './CustomImageComponent';
import CustomLucideIcon from './CustomLucideIcon';
import { useSelector } from 'react-redux';

type HeaderType =
  | 'default'
  | 'dashboard'
  | 'search'
  | 'backWithAction'
  | 'profileSearch';

type CustomHeaderProps = {
  // Layout & Type
  type?: HeaderType;
  style?: any;

  // Title & Text
  title?: string;
  userName?: string;
  greetingText?: string;

  // Navigation
  showBackButton?: boolean;
  backButtonText?: string;
  onBackPress?: () => void;
  onSearchPress?: () => void;

  // Actions
  showProfile?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  notificationBadgeCount?: number;
  showSettings?: boolean;
  showDownload?: boolean;
  showActionButton?: boolean;
  actionButtonText?: string;
  onActionPress?: () => void;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
  onDownloadPress?: () => void;
  onSearchChange?: (text: string) => void;

  // Dropdown
  showDropdown?: boolean;
  dropdownItems?: Array<{ name: string; image?: any }>;
  onDropdownSelect?: (item: { name: string; image?: any }) => void;
  selectedDropdownItem?: string;
  dropdownImage?: any;

  // Custom Content
  customLeftContent?: React.ReactNode;
  customCenterContent?: React.ReactNode;
  customRightContent?: React.ReactNode;

  // Images
  profileImage?: any;
  backgroundImage?: any;

  // Styles
  backgroundColor?: string;
  transparentBackground?: boolean;
  showIconCircles?: boolean;
  iconCircleSize?: number;
  iconSize?: number;
};

const CustomHeader: React.FC<CustomHeaderProps> = ({
  type = 'default',
  title = 'Back',
  userName: initialUserName = 'Zery',
  greetingText = 'Hi',
  onSearchPress,

  // Navigation
  showBackButton = false,
  backButtonText = 'Back',
  onBackPress,

  // Actions
  showProfile = false,
  showSearch = false,
  showNotifications = true,
  notificationBadgeCount = 0,
  showSettings = false,
  showDownload = false,
  showActionButton = false,
  actionButtonText = 'Done',
  onActionPress,
  onProfilePress,
  onNotificationPress,
  onSettingsPress,
  onDownloadPress,
  onSearchChange,

  // Dropdown
  showDropdown = false,
  dropdownItems = [
    { name: 'Carlos', image: IMAGES.user5 },
    { name: 'Jonathan', image: IMAGES.user4 },
  ],
  onDropdownSelect,
  selectedDropdownItem: initialSelectedItem = 'select child',
  dropdownImage,

  // Custom Content
  customLeftContent,
  customCenterContent,
  customRightContent,

  // Images
  profileImage = IMAGES.user4,
  backgroundImage,

  // Styles
  backgroundColor,
  transparentBackground = false,
  showIconCircles = true,
  iconCircleSize = moderateScale(40),
  iconSize = moderateScale(20),
}) => {
  const { theme, currentTheme } = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation<any>();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedUserName, setSelectedUserName] = useState(initialUserName);
  const [selectedProfileImage, setSelectedProfileImage] =
    useState(profileImage);
  const [selectedDropdownItem, setSelectedDropdownItem] =
    useState(initialSelectedItem);

  const languageData = useSelector((state: any) => state?.data?.languageData);

  // Update when props change
  useEffect(() => {
    setSelectedUserName(initialUserName);
  }, [initialUserName]);

  useEffect(() => {
    setSelectedProfileImage(profileImage);
  }, [profileImage]);

  useEffect(() => {
    setSelectedDropdownItem(initialSelectedItem);
  }, [initialSelectedItem]);

  // Handle back press
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const isProfileSearch = type === 'profileSearch';

  // Handle search change
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    onSearchChange?.(text);
  };

  // Handle dropdown item selection
  // const handleDropdownSelect = (item: { name: string; image?: any }) => {
  //   // setSelectedUserName(item.name);
  //   // if (item.image) {
  //   //   setSelectedProfileImage(item.image);
  //   // }
  //   setSelectedDropdownItem(item.name);
  //   setDropdownOpen(false);
  //   onDropdownSelect?.(item);
  // };

  // const handleDropdownSelect = (item: { name: string; image?: any }) => {
  //   console.log('Selected dropdown item:', item);
  //   setSelectedDropdownItem(item.name);

  //   if (item.image) {
  //     setSelectedChildImage(item.image);
  //   } else {
  //     setSelectedChildImage(null);
  //   }

  //   setDropdownOpen(false);
  //   onDropdownSelect?.(item);
  // };

  const handleDropdownSelect = (item: { name: string; image?: any }) => {
    console.log('Selected dropdown item:', item);
    setSelectedDropdownItem(item?.name);
    // Remove setting selectedChildImage here
    setDropdownOpen(false);
    onDropdownSelect?.(item);
  };

  // Determine header height based on type
  const getHeaderHeight = () => {
    switch (type) {
      case 'dashboard':
        return moderateScale(200);
      case 'search':
        return moderateScale(160);
      case 'profileSearch':
        return moderateScale(180);
      default:
        return moderateScale(120);
    }
  };

  // Render background
  const renderBackground = () => {
    if (transparentBackground) return null;

    const height = getHeaderHeight();

    if (currentTheme === 'dark' || backgroundColor) {
      return (
        <View
          style={{
            marginTop: moderateScale(-30),
            borderRadius: moderateScale(20),
            width: '100%',
            height,
            backgroundColor: backgroundColor || theme.themeColor,
          }}
        />
      );
    }

    return (
      <CustomImageComponent
        source={
          backgroundImage ||
          (currentTheme === 'custom'
            ? IMAGES.bg_card_secondary
            : IMAGES.bg_card_primary)
        }
        width={'100%'}
        height={height}
        resizeMode="stretch"
        style={{
          marginTop: moderateScale(-35),
          borderRadius: moderateScale(20),
        }}
      />
    );
  };

  // Render icon with optional circular background
  const renderIcon = (
    name: string,
    iconSet: string,
    onPress?: () => void,
    badgeCount?: number,
  ) => {
    const iconContent = (
      <View style={{ position: 'relative' }}>
        <CustomVectorIcons
          name={name}
          iconSet={iconSet}
          size={iconSize}
          color={showIconCircles ? theme?.themeColor : theme.white}
        />
        {badgeCount !== undefined && badgeCount > 0 && (
          <View
            style={[
              styles.badge,
              showIconCircles
                ? styles.badgeInsideCircle
                : styles.badgeWithoutCircle,
            ]}
          >
            <Text style={styles.badgeText}>
              {badgeCount > 9 ? '9+' : badgeCount}
            </Text>
          </View>
        )}
      </View>
    );

    if (showIconCircles) {
      return (
        <TouchableOpacity
          onPress={onPress}
          style={{
            width: iconCircleSize,
            height: iconCircleSize,
            borderRadius: iconCircleSize / 2,
            backgroundColor: theme.white,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: moderateScale(10),
          }}
        >
          {iconContent}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        style={{ marginLeft: moderateScale(10) }}
      >
        {iconContent}
      </TouchableOpacity>
    );
  };

  const renderLeftContent = () => {
    if (customLeftContent) return customLeftContent;

    // 🔹 Profile + name for profileSearch
    if (isProfileSearch) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <CustomImageComponent
            source={selectedProfileImage}
            height={moderateScale(40)}
            width={moderateScale(40)}
            style={{ borderRadius: moderateScale(20) }}
          />
          <Text
            style={{
              marginLeft: moderateScale(10),
              fontFamily: FontFamily.KhulaSemiBold,
              fontSize: moderateScale(16),
              color: theme.white,
            }}
          >
            {selectedUserName}
          </Text>
        </View>
      );
    }

    // existing back button logic
    if (showBackButton) {
      return (
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <CustomVectorIcons
            name="chevron-back"
            iconSet="Ionicons"
            size={moderateScale(24)}
            color={theme.white}
          />
          <Text style={[styles.backText]}>
            {languageData?.[backButtonText] ||
              languageData?.[title] ||
              backButtonText ||
              title}
          </Text>
        </TouchableOpacity>
      );
    }

    // ✅ Always show parent profile in dashboard header
    if (showProfile && type === 'dashboard') {
      return (
        <TouchableOpacity
          onPress={onProfilePress}
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
        >
          {/* ✅ Always show parent image here */}
          <CustomImageComponent
            source={selectedProfileImage}
            height={moderateScale(50)}
            width={moderateScale(50)}
            style={{ borderRadius: moderateScale(25) }}
          />
          <View style={{ marginLeft: moderateScale(10) }}>
            <Text style={styles.greetingText}>
              {languageData?.[greetingText] || greetingText}{' '}
              <Text style={styles.userName}>{selectedUserName}!</Text>
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (title && !showBackButton) {
      return <Text style={[styles.backText, { flex: 1 }]}>{title}</Text>;
    }

    return null;
  };

  const renderRightContent = () => {
    if (customRightContent) return customRightContent;

    // ✅ Allow notifications even in profileSearch
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {showNotifications &&
          renderIcon(
            'notifications',
            'Ionicons',
            onNotificationPress
              ? onNotificationPress
              : () => navigation.navigate('Notification'),
            notificationBadgeCount,
          )}

        {showSettings &&
          renderIcon(
            'settings',
            'Ionicons',
            onSettingsPress
              ? onSettingsPress
              : () => navigation.navigate('NotificationSettings'),
          )}

        {showDownload && renderIcon('download', 'Ionicons', onDownloadPress)}

        {showActionButton && (
          <TouchableOpacity onPress={onActionPress}>
            <Text style={styles.actionText}>
              {languageData?.[actionButtonText] || actionButtonText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderCenterContent = () => {
    if (customCenterContent) return customCenterContent;

    // 🔹 PROFILE SEARCH → TAP TO NAVIGATE
    if (isProfileSearch) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSearchPress}
          style={styles.searchWrapper}
        >
          <CustomVectorIcons
            name="search"
            iconSet="Ionicons"
            size={moderateScale(18)}
            color={theme.themeColorMid}
            style={styles.searchIcon}
          />

          <Text
            style={{
              fontSize: moderateScale(14),
              color: theme.textSub,
              fontFamily: FontFamily.KhulaRegular,
            }}
          >
            {languageData?.search || 'Search'}
          </Text>
        </TouchableOpacity>
      );
    }

    // 🔹 NORMAL SEARCH (editable)
    if (showSearch) {
      return (
        <View style={styles.searchWrapper}>
          <CustomVectorIcons
            name="search"
            iconSet="Ionicons"
            size={moderateScale(18)}
            color={theme.themeColorMid}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={languageData?.search || 'Search'}
            placeholderTextColor={theme.textSub}
            value={searchText}
            onChangeText={handleSearchChange}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <View
      style={{
        borderBottomLeftRadius: moderateScale(30),
        borderBottomRightRadius: moderateScale(30),
        backgroundColor: transparentBackground
          ? 'transparent'
          : theme.transparent,
      }}
    >
      {!transparentBackground && renderBackground()}

      {/* Main Header Content */}
      <View style={styles.headCont}>
        <View style={styles.mainRow}>
          {renderLeftContent()}
          {renderRightContent()}
        </View>

        {renderCenterContent()}
      </View>

      {/* Dropdown Section */}
      {showDropdown && (
        <TouchableOpacity
          onPress={() => setDropdownOpen(!dropdownOpen)}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            position: 'absolute',
            bottom: moderateScale(25),
            backgroundColor: theme.white,
            width: '90%',
            alignSelf: 'center',
            paddingVertical: moderateScale(8),
            paddingHorizontal: moderateScale(15),
            borderRadius: moderateScale(25),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          {/* ✅ Use dropdownImage prop if provided, otherwise use selectedProfileImage */}
          <CustomImageComponent
            source={dropdownImage || selectedProfileImage}
            height={moderateScale(30)}
            width={moderateScale(30)}
            style={{
              borderRadius: moderateScale(15),
              marginRight: moderateScale(6),
            }}
          />
          <Text style={[styles.nameText]}>{selectedDropdownItem}</Text>
          <View style={{ marginLeft: 'auto' }}>
            <CustomLucideIcon
              name="ChevronDown"
              color={theme.gray}
              size={moderateScale(20)}
            />
          </View>
        </TouchableOpacity>
      )}

      {/* Dropdown Menu */}
      {dropdownOpen && showDropdown && (
        <View style={styles.dropdownBox}>
          {dropdownItems.map(item => (
            <TouchableOpacity
              key={item.name}
              onPress={() => handleDropdownSelect(item)}
              style={[
                styles.itemRow,
                selectedDropdownItem === item.name && styles.selectedItemRow,
              ]}
            >
              <CustomImageComponent
                source={item.image || IMAGES.user4}
                height={moderateScale(25)}
                width={moderateScale(25)}
                style={{
                  borderRadius: moderateScale(12.5),
                  marginRight: moderateScale(8),
                }}
              />
              <Text
                style={[
                  styles.dropdownText,
                  selectedDropdownItem === item.name &&
                    styles.selectedDropdownText,
                ]}
              >
                {item.name}
              </Text>
              {selectedDropdownItem === item.name && (
                <CustomVectorIcons
                  name="checkmark"
                  iconSet="Ionicons"
                  size={moderateScale(16)}
                  color={theme.themeColor}
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    headCont: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? moderateScale(40) : moderateScale(27),
      left: moderateScale(20),
      width: '90%',
    },
    mainRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backText: {
      color: theme.white,
      fontSize: moderateScale(18),
      fontFamily: FontFamily.KhulaSemiBold,
      marginLeft: moderateScale(5),
      marginTop: 3,
    },
    greetingText: {
      color: theme.white,
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaSemiBold,
    },
    userName: {
      color: theme.white,
      fontSize: moderateScale(16),
      fontFamily: FontFamily.KhulaExtraBold,
    },
    nameText: {
      color: theme.gray,
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaSemiBold,
      marginLeft: moderateScale(5),
      flex: 1,
    },
    actionText: {
      fontFamily: FontFamily.KhulaSemiBold,
      marginTop: 3,
    },
    badge: {
      position: 'absolute',
      top: -5,
      right: -5,
      borderRadius: moderateScale(8),
      minWidth: moderateScale(16),
      height: moderateScale(16),
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: moderateScale(3),
    },
    badgeInsideCircle: {
      backgroundColor: theme.danger,
    },
    badgeWithoutCircle: {
      backgroundColor: theme.danger,
      top: -2,
      right: -2,
    },
    badgeText: {
      color: theme.black,
      fontSize: moderateScale(9),
      fontFamily: FontFamily.KhulaBold,
      includeFontPadding: false,
    },
    searchWrapper: {
      flexDirection: 'row',
      backgroundColor: 'white',
      width: '100%',
      height: moderateScale(45),
      borderRadius: moderateScale(25),
      paddingHorizontal: moderateScale(15),
      alignItems: 'center',
      marginTop: moderateScale(20),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    searchIcon: {
      fontSize: moderateScale(16),
      marginRight: moderateScale(10),
    },
    searchInput: {
      flex: 1,
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: '#444',
      paddingVertical: 0,
    },
    dropdownBox: {
      width: moderateScale(310),
      backgroundColor: 'white',
      borderRadius: moderateScale(12),
      position: 'absolute',
      right: moderateScale(20),
      top: Platform.OS === 'ios' ? moderateScale(100) : moderateScale(150),
      paddingVertical: moderateScale(8),
      elevation: 5,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      zIndex: 1000,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: moderateScale(10),
      paddingHorizontal: moderateScale(15),
    },
    selectedItemRow: {
      backgroundColor: theme.lightThemeColor,
    },
    dropdownText: {
      fontSize: moderateScale(14),
      fontFamily: FontFamily.KhulaRegular,
      color: '#444',
      flex: 1,
    },
    selectedDropdownText: {
      color: theme.themeColor,
      fontFamily: FontFamily.KhulaSemiBold,
    },
  });

export default CustomHeader;
