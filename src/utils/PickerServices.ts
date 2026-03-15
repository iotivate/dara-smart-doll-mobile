import { convertSizeToMB, formatDuration } from '@services/ApiServices';
import moment from 'moment';
import ImagePicker from 'react-native-image-crop-picker';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';

export const openVideo_Picker = async () => {
  try {
    // Open Image Picker
    const image = await ImagePicker.openPicker({
      // Enables cropping
      width: 500,
      height: 500,
      mediaType: 'video',
    });
    const videoDuration = formatDuration(image?.duration);
    // console.log('Image picking error:', videoDuration);

    let alldata = {
      ...image,
      video_duration: formatDuration(image?.duration),
      video_size: convertSizeToMB(image?.size),
    };

    return alldata; // Return the image for further use
  } catch (error) {}
};
export const openImage_Picker = async () => {
  try {
    // Open Image Picker
    const image = await ImagePicker.openPicker({
      cropping: true, // Enables cropping
      width: widthPercentageToDP('100%'),
      height: heightPercentageToDP('40%'),
      mediaType: 'photo',
    });

    // console.log('Selected & Cropped Image:', image);
    return image; // Return the image for further use
  } catch (error) {
    // console.log('Image picking error:', error);
  }
};
export const open_video_Picker = async () => {
  try {
    // Open Image Picker
    const image = await ImagePicker.openPicker({
      cropping: true, // Enables cropping
      width: 500,
      height: 500,
      mediaType: 'video',
    });

    // console.log('Selected & Cropped Image:', image);
    return image; // Return the image for further use
  } catch (error) {
    console.log('Image picking error:', error);
  }
};

export const openCamera = async () => {
  try {
    const media = await ImagePicker.openCamera({
      mediaType: 'video', // 'photo' or 'video'
    });

    let alldata = {
      ...media,
      video_duration: formatDuration(media?.duration),
      video_size: convertSizeToMB(media?.size),
    };

    return alldata; // Return captured media
  } catch (error) {}
};

export const time_fun = (updatedAt: any) => {
  const duration = moment.duration(moment().diff(moment(updatedAt)));
  const hours = duration.hours();
  const minutes = duration.minutes();
  return `${hours > 0 ? `${hours}h ` : ''}${
    minutes > 0 ? `${minutes}m` : '2h 24m'
  }`;
};
