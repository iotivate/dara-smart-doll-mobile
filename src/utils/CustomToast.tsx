import Toast from 'react-native-toast-message';

export const showSuccessToast = (message: string) => {
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: message,
    position: 'bottom',
    visibilityTime: 3000,
    autoHide: true,
  });
};

export const showErrorToast = (message: string) => {
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
    position: 'bottom',
    visibilityTime: 3000,
    autoHide: true,
  });
};
