import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@services/ApiServices';
import { ApiURL } from '@services/ApiConstants';

const handleApiError = (error: any) => {
  console.log('API Error:', error);
  return Promise.reject(
    error?.response?.data || error.message || 'Something went wrong',
  );
};

export const initializeAppData = createAsyncThunk(
  'data/initializeAppData',
  async (navigation: any, { dispatch }) => {
    try {
      await Promise.all([
        dispatch(getProfile(navigation)),
        dispatch(getSettingsdata(navigation)),
      ]);
    } catch (error) {
      console.log('App initialization error:', error);
    }
  },
);

export const getProfile = createAsyncThunk(
  'data/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const apidata = await apiRequest(ApiURL.getProfile, 'GET', null, true);
      // console.log('apidataapidataapidataapidata', apidata?.data);
      return apidata?.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  },
);

export const getbanner = createAsyncThunk(
  'data/getbanner',
  async (navigation, { rejectWithValue }) => {
    try {
      const apidata = await apiRequest(ApiURL.getbanner, 'GET', null, true);
      const dic = apidata?.data;
      return dic;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  },
);

export const getSettingsdata = createAsyncThunk(
  'data/getSettingsdata',
  async (navigation, { rejectWithValue }) => {
    try {
      const apidata = await apiRequest(
        ApiURL.getSettingsdata,
        'GET',
        null,
        true,
      );
      const dic = apidata?.data;
      return dic;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  },
);

export const getChildrenProfiles = createAsyncThunk(
  'data/getChildrenProfiles',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiRequest(
        `${ApiURL.fetchChildrenlist}?keyWord&page=1&size=100`,
        'GET',
        null,
        true,
      );

      return res?.data?.list || [];
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  },
);

export const getLanguageSetting = createAsyncThunk(
  'data/getLanguageSetting',
  async (lang: string, { rejectWithValue }) => {
    try {
      const res = await apiRequest(
        `${ApiURL.getLanguageSetting}`,
        'GET',
        null,
        true,
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  },
);
