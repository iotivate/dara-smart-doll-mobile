/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@theme/themeContext';
import FontFamily from '@assets/fonts/FontFamily';
import CustomImageComponent from './CustomImageComponent';
import CustomLucideIcon from './CustomLucideIcon';
import CustomVectorIcons from './CustomVectorIcons';
import IMAGES from '@assets/images';
import { useSelector } from 'react-redux';

type Props = {
  onBack?: () => void;
  username?: string;
  avatar?: any;
  onNameSelect?: (name: string) => void;
  showSearch?: boolean;
  title?: string;
  dropdownItems?: any[];
  onSearchPress?: () => void;
};

const CustomHomeHeader: React.FC<Props> = ({
  onBack,
  username = 'Carlos',
  avatar,
  onNameSelect,
  showSearch = true,
  title = 'Back',
  dropdownItems = [],
  onSearchPress,
}) => {
  const { theme } = useTheme();
  const languageData = useSelector((state: any) => state?.data?.languageData);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.themeColor }]}>
      {/* TOP ROW */}
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onBack}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <CustomVectorIcons
            name="chevron-back"
            iconSet="Ionicons"
            size={moderateScale(24)}
            color={theme.white}
          />
          <Text style={styles.backText}>{languageData?.[title] || title}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rightProfile}
          onPress={() => setDropdownOpen(!dropdownOpen)}
        >
          <CustomImageComponent
            source={avatar}
            height={moderateScale(36)}
            width={moderateScale(36)}
            style={{ borderRadius: moderateScale(18), marginRight: 6 }}
          />

          <Text style={styles.username}>{username}</Text>

          <CustomLucideIcon
            name="ChevronDown"
            color={'white'}
            size={moderateScale(18)}
          />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR - Conditionally render */}
      {showSearch && (
        <TouchableOpacity
          style={styles.searchWrapper}
          activeOpacity={0.7}
          onPress={onSearchPress}
        >
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
            pointerEvents="none" // IMPORTANT — taaki touch parent handle kare
            editable={false} // optional (UI look same rahe)
          />
        </TouchableOpacity>
      )}

      {dropdownOpen && (
        <View
          style={[
            styles.dropdownBox,
            {
              top: showSearch
                ? Platform.OS === 'ios'
                  ? moderateScale(115)
                  : moderateScale(95)
                : Platform.OS === 'ios'
                ? moderateScale(80)
                : moderateScale(60),
            },
          ]}
        >
          {dropdownItems?.map(item => (
            <TouchableOpacity
              key={item._id}
              style={styles.itemRow}
              onPress={() => {
                setDropdownOpen(false);
                onNameSelect && onNameSelect(item);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CustomImageComponent
                  source={item.profilePictureUrl || item.avatar || IMAGES.user5}
                  height={moderateScale(28)}
                  width={moderateScale(28)}
                  style={{ borderRadius: 14, marginRight: 8 }}
                />
                <Text style={styles.dropdownText}>{item.username}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingBottom: moderateScale(20),
    paddingTop: Platform.OS === 'ios' ? moderateScale(55) : moderateScale(25),
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    alignItems: 'center',
    marginTop: moderateScale(20),
  },

  backText: {
    color: 'white',
    fontSize: moderateScale(18),
    fontFamily: FontFamily.KhulaSemiBold,
    marginLeft: moderateScale(5),
  },

  rightProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  username: {
    color: 'white',
    fontSize: moderateScale(16),
    marginRight: moderateScale(6),
    fontFamily: FontFamily.KhulaSemiBold,
  },

  searchWrapper: {
    flexDirection: 'row',
    backgroundColor: 'white',
    width: '90%',
    height: 45,
    alignSelf: 'center',
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(15),
    alignItems: 'center',
    marginTop: moderateScale(30),
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
    width: moderateScale(300),
    backgroundColor: 'white',
    borderRadius: moderateScale(10),
    position: 'absolute',
    right: moderateScale(20),
    paddingVertical: moderateScale(5),
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 9999, // Add this line
    shadowRadius: moderateScale(2),
    marginTop: 50,
  },

  itemRow: {
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(10),
  },

  dropdownText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.KhulaRegular,
    color: '#444',
  },
});

export default CustomHomeHeader;
