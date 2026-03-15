import { navigate } from '@navigation/NavigationService';
import { clearData, getData } from '@utils/CustomAsyncStorage';
import { showErrorToast } from '@utils/CustomToast';
import axios from 'axios';
import moment from 'moment';

export const apiRequest = async (
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data: any = null,
  isToken: boolean = false,
  isMultipart: boolean = false,
  tempToken: any = null,
) => {
  //  console.log('apiRequest CALLED WITH----------------------------------------:', url);

  console.log({
    url,
    method,
    data,
    isToken,
    isMultipart,
    tempToken,
  });
  try {
    let finalHeaders: any = {
      Accept: 'application/json',
      'Content-Type': isMultipart ? 'multipart/form-data' : 'application/json',
    };

    // Add token if isToken is true
    if (isToken) {
      const token = await getData('token');
      console.log('token', token);

      if (tempToken) {
        finalHeaders.Authorization = `Bearer ${tempToken}`;
      } else if (token) {
        finalHeaders.Authorization = `Bearer ${token}`;
      }
    }
    // console.log('� API Params', data);

    // If method is GET, prevent sending a request body
    const config: any = {
      method,
      url,
      headers: finalHeaders,
    };

    console.log('🔁 API Config', config);

    if (method !== 'GET') {
      config.data = isMultipart ? createFormData(data) : data;
    }

    const response: any = await axios(config);

    // Handle unauthorized token errors
    if (
      response.data?.message === 'Send valid token' ||
      response.data?.code === 'TOKEN_EXPIRED'
    ) {
      await clearData();
      navigate('Login');
      showErrorToast(response?.data?.message);
    }

    // console.log('✅ API Response', response.data);

    return response.data;
  } catch (error: any) {
    console.log('🚫 API Request Failed', error);
    console.log('❌ API Error', error?.response?.data);

    if (
      error?.response.data?.message === 'Send valid token' ||
      error?.response.data?.code === 'TOKEN_EXPIRED'
    ) {
      await clearData();
      navigate('Login');
      showErrorToast(error?.response?.data?.message);
    }

    return error?.response?.data;
  }
};

// Helper function to create FormData for file uploads
const createFormData = (fileData: any) => {
  let formData = new FormData();
  if (fileData) {
    formData.append('module', fileData.module);
    formData.append('file', {
      uri: fileData.path,
      type: fileData.mime,
      name: fileData.path.split('/').pop(),
    });
  }

  // console.log('formDataformDataformDataformDataformDataformData', formData);
  return formData;
};

export const convertSizeToMB = (sizeInBytes: number): string => {
  const sizeInMB = sizeInBytes / (1024 * 1024); // Convert to MB
  return `${sizeInMB.toFixed(2)} MB`; // Format to 2 decimal places
};
export const formatDuration = (milliseconds: any): string => {
  const totalSeconds = Math.floor(milliseconds / 1000); // Convert to seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours > 0 ? String(hours).padStart(2, '0') : null, // Add hours only if > 0
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ]
    .filter(Boolean) // Remove null values
    .join(':');
};

export const time_fun = (updatedAt: any) => {
  const duration = moment.duration(moment().diff(moment(updatedAt)));
  const hours = duration.hours();
  const minutes = duration.minutes();
  return `${hours > 0 ? `${hours}h ` : ''}${
    minutes > 0 ? `${minutes}m` : '2h 24m'
  }`;
};
