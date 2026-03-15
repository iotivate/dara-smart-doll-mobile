import React from 'react';
import FastImage from '@d11/react-native-fast-image';
import { moderateScale } from 'react-native-size-matters';

const CustomImageComponent = ({
  source,
  height = moderateScale(15),
  width = moderateScale(15),
  resizeMode = FastImage.resizeMode.cover,
  priority = FastImage.priority.normal,
  style = {},
}) => {
  let imageSource;

  // Handle different source types
  if (source && typeof source === 'object') {
    // Case 1: Object with uri property { uri: 'https://...' }
    if (source.uri) {
      imageSource = { uri: source.uri, priority };
    }
    // Case 2: React Native Image asset object
    else if (source.default) {
      imageSource = source.default;
    }
    // Case 3: Local asset object
    else if (source.uri && source.uri.startsWith('file://')) {
      imageSource = source;
    }
  }
  // Case 4: String URL
  else if (typeof source === 'string') {
    if (source.startsWith('http://') || source.startsWith('https://')) {
      imageSource = { uri: source, priority };
    } else {
      imageSource = { uri: source };
    }
  }
  // Case 5: Number (local require)
  else if (typeof source === 'number') {
    imageSource = source;
  } else {
    console.warn('AppImage: Invalid image source provided:', source);
    return null;
  }

  return (
    <FastImage
      style={[
        {
          height: moderateScale(height),
          width: moderateScale(width),
        },
        style,
      ]}
      source={imageSource}
      resizeMode={resizeMode}
    />
  );
};

export default CustomImageComponent;
