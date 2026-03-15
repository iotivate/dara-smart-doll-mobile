import { StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import FontFamily from '@assets/fonts/FontFamily';

const createBasicStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: moderateScale(0),
      backgroundColor: theme.white,
    },
    textStyleExtraLarge: {
      fontSize: moderateScale(20),
      color: theme?.text || '#000',
      fontFamily: FontFamily.KhulaSemiBold,
    },
    textStyleExtraLargeBold: {
      fontSize: moderateScale(20),
      color: theme?.text || '#000',
      fontFamily: FontFamily.KhulaSemiBold,
    },
    textStyleLarge: {
      fontSize: moderateScale(16),
      color: theme?.text || '#000',
      fontFamily: FontFamily.KhulaSemiBold,
    },
    textStyleLargeBold: {
      fontSize: moderateScale(16),
      color: theme?.grayLight || '#000',
      fontFamily: FontFamily.KhulaSemiBold,
    },
    textStyleMedium: {
      fontSize: moderateScale(13),
      color: theme?.text || '#000',
      fontFamily: FontFamily.KhulaSemiBold,
    },
    textStyleRegular: {
      fontSize: moderateScale(13),
      color: theme?.text || '#000',
      fontFamily: FontFamily.KhulaRegular,
    },
    textStyleMediumBold: {
      fontSize: moderateScale(13),
      color: theme?.text || '#000',
      fontFamily: FontFamily.KhulaSemiBold,
    },
    textStyleSmall: {
      fontSize: moderateScale(12),
      color: theme?.text || '#000',
      fontFamily: FontFamily.KhulaSemiBold,
    },
    textStyleSmallBold: {
      fontSize: moderateScale(12),
      color: theme?.text || '#000',
      fontFamily: FontFamily.KhulaSemiBold,
    },
    textStyleExtraSmall: {
      fontSize: moderateScale(10),
      color: theme?.text || '#000',
      fontFamily: FontFamily.KhulaSemiBold,
    },
    textStyleExtraSmallBold: {
      fontSize: moderateScale(10),
      color: theme?.text || '#000',
      fontFamily: FontFamily.KhulaSemiBold,
    },
    flexDirectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

export default createBasicStyles;
