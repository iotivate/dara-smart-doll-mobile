import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import createBasicStyles from 'styles';
import { useTheme } from '@theme/themeContext';
import FastImage from '@d11/react-native-fast-image';
import IMAGES from '@assets/images';

const ListEmptyComponent = (props: any) => {
    const { navigation } = props;
    const { theme, isDark } = useTheme();
    const basicStyles = createBasicStyles(theme);

    return (
        <View style={{ alignItems: 'center', marginVertical: moderateScale(10) }}>
            <FastImage source={IMAGES.datanotfound} style={{ width: moderateScale(200), height: moderateScale(200) }} resizeMode='contain' />
        </View>
    );
};

export default ListEmptyComponent;
