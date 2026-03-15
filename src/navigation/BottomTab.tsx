import CustomVectorIcons from '@components/CustomVectorIcons';
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

import Dashboard from '@views/Dashboard';
import PlaylistScreen from '@views/PlaylistScreen';
import AboutDaraScreen from '@views/AboutDaraScreen';
// import ProfileScreen from '@views/ProfileScreen';
import { useTheme } from '@theme/themeContext';
import CustomLucideIcon from '@components/CustomLucideIcon';
import { moderateScale } from 'react-native-size-matters';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomFabBar } from 'rn-wave-bottom-bar';
import ProfileSettings from '@views/ProfileScreen/ProfileSetting';

const Tab = createBottomTabNavigator();

const BottomTab = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  // const tabBarIcon =
  //   (name: string) =>
  //   ({
  //     focused,
  //     color,
  //     size,
  //   }: {
  //     focused: boolean;
  //     color: string; // Defines fab icon color
  //     size: number;
  //   }) => {
  //     console.log(name, focused, color, size);

  //     return (
  //       <CustomVectorIcons
  //         name={name}
  //         size={28}
  //         color={'red'}
  //         // color={focused ? 'white' : 'white'}
  //       />
  //     );
  //   };

  const TabBarIcon = ({
    focused,
    label,
    iconName,
    iconSet,
    type,
  }: {
    focused: boolean;
    label: string;
    iconName: string;
    iconSet: string;
    type: any;
  }) => {
    const { theme, isDark } = useTheme();
    const styles = getStyles(theme);

    console.log(focused, label, iconName, iconSet, type);

    return (
      <View
      // style={
      //   focused ? styles.activeTabBackground : styles.inactiveTabBackground
      // }
      >
        {/* <CustomVectorIcons name={iconName} size={moderateScale(22)} color={focused ? theme.themeColor : '#444444'} iconSet={iconSet} /> */}
        <CustomLucideIcon
          name={iconName}
          size={moderateScale(22)}
          color={theme.white}
        />
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5F0B65',
        tabBarInactiveTintColor: 'white',
        tabBarActiveBackgroundColor: '#5F0B65',
        tabBarInactiveBackgroundColor: 'red',
        tabBarLabelStyle: {
          color: 'purple',
        },
      }}
      tabBar={props => (
        <BottomFabBar
          mode={'default'}
          isRtl={false}
          // Add Shadow for active tab bar button
          focusedButtonStyle={{
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -1,
            },
            shadowOpacity: 0.61,
            shadowRadius: 8,
            elevation: 14,
          }}
          bottomBarContainerStyle={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'transparent',
            borderRadius: 50,
          }}
          springConfig={{
            stiffness: 1500,
            damping: 85,
            mass: 4,
          }}
          {...props}
        />
      )}
    >
      <Tab.Screen
        options={{
          // tabBarLabel: 'Profile',
          // tabBarIcon:TabBarIcon('home'),

          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              label="Dashboard"
              iconName="House"
              iconSet="Entypo"
            />
          ),
        }}
        name="Dashboard"
        component={Dashboard}
      />
      <Tab.Screen
        name="AboutDara"
        options={{
          // tabBarIcon: TabBarIcon('info')

          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              label="Home"
              iconName="Info"
              iconSet="Entypo"
            />
          ),
        }}
        component={AboutDaraScreen}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              label="Microphone"
              iconName="Mic"
              iconSet="Entypo"
            />
          ),
        }}
        name="Microphone"
        component={PlaylistScreen}
      />
      <Tab.Screen
        options={{
          // tabBarIcon: TabBarIcon('list')

          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              label="Playlist"
              iconName="List"
              iconSet="Entypo"
            />
          ),
        }}
        name="Playlist"
        component={PlaylistScreen}
      />
      <Tab.Screen
        options={{
          // tabBarIcon: TabBarIcon('men')

          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              label="Profile"
              iconName="User"
              iconSet="Entypo"
            />
          ),
        }}
        name="ProfileSettings"
        component={ProfileSettings}
      />
    </Tab.Navigator>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    bottomBar: {
      // backgroundColor: theme.themeColor,
    },
    tabContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabItem: {
      alignItems: 'center',
      marginTop: moderateScale(10),
    },
    tabLabel: {
      fontSize: 12,
      marginTop: 4,
      color: theme.text,
    },
    activeTabBackground: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 80,
    },

    inactiveTabBackground: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 80,
    },
  });

export default BottomTab;
