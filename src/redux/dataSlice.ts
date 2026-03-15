// import { createSlice } from '@reduxjs/toolkit';
// import { RootState } from './store';
// import {
//   getbanner,
//   getChildrenProfiles,
//   getLanguageSetting,
//   getProfile,
// } from '../utils/Redux_api_fun';
// import { getSettingsdata } from '../utils/Redux_api_fun';
// import { handleAsyncThunk } from './reduxHelper';

// // Define the state interface
// interface DataState {
//   loading: boolean;
//   error: string | null;
//   getprofiledata: any | null;
//   settingsData: any[];
//   getbannerData: any[];
//   childrenList: any[];
//   contentModalVisible: boolean;
//   socketContentId: string | null;
//   showSocketModal: boolean;
//   languageData: Record<string, string>;
// }

// // Initial state
// const initialState: DataState = {
//   loading: false,
//   error: null,
//   getprofiledata: null,
//   settingsData: [],
//   getbannerData: [],
//   childrenList: [],
//   contentModalVisible: false,
//   socketContentId: null,
//   showSocketModal: false,
//   languageData: {},
// };

// // Slice definition
// const dataSlice = createSlice({
//   name: 'data',
//   initialState,
//   reducers: {
//     resetState: () => initialState,
//     setChildrenList: (state, action) => {
//       state.childrenList = action.payload;
//     },

//     // 🔔 MODAL CONTROL
//     showSocketContent: (state, action) => {
//       state.showSocketModal = true;
//       state.socketContentId = action.payload;
//     },
//     hideSocketContent: state => {
//       state.showSocketModal = false;
//       state.socketContentId = null;
//     },
//   },

//   extraReducers: builder => {
//     // Async thunks using helper
//     handleAsyncThunk(builder, getProfile, 'getprofiledata');
//     handleAsyncThunk(builder, getChildrenProfiles, 'childrenList'); // Add this line
//     handleAsyncThunk(builder, getSettingsdata, 'settingsData');
//     handleAsyncThunk(builder, getbanner, 'getbannerData');
//     handleAsyncThunk(builder, getLanguageSetting, 'languageData');
//   },
// });

// // Export actions
// export const {
//   resetState,
//   setChildrenList,
//   showSocketContent,
//   hideSocketContent,
// } = dataSlice.actions;

// // Selectors
// export const selectData = (state: RootState) => state.data;
// export const selectLoading = (state: RootState) => state.data.loading;
// export const selectChildrenList = (state: RootState) => state.data.childrenList;
// export const selectLanguageData = (state: RootState) => state.data.languageData;

// // Reducer
// export default dataSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';
import {
  getbanner,
  getChildrenProfiles,
  getLanguageSetting,
  getProfile,
  getSettingsdata,
} from '../utils/Redux_api_fun';
import { handleAsyncThunk } from './reduxHelper';

// Define the state interface - FIXED
interface DataState {
  loading: boolean;
  error: string | null;
  getprofiledata: any | null;
  settingsData: any | null;
  getbannerData: any[];
  childrenList: any[];
  contentModalVisible: boolean;
  socketContentId: string | null;
  showSocketModal: boolean;
  languageData: Record<string, string>;
}

// Initial state - FIXED
const initialState: DataState = {
  loading: false,
  error: null,
  getprofiledata: null,
  settingsData: null,
  getbannerData: [],
  childrenList: [],
  contentModalVisible: false,
  socketContentId: null,
  showSocketModal: false,
  languageData: {},
};

// Slice definition
const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    resetState: () => initialState,
    setChildrenList: (state, action) => {
      state.childrenList = action.payload;
    },

    // 🔔 MODAL CONTROL
    showSocketContent: (state, action) => {
      state.showSocketModal = true;
      state.socketContentId = action.payload;
    },
    hideSocketContent: state => {
      state.showSocketModal = false;
      state.socketContentId = null;
    },

    setSettingsDataDirectly: (state, action) => {
      state.settingsData = action.payload;
    },
  },

  extraReducers: builder => {
    // ✅ getSettingsdata
    builder.addCase(getSettingsdata.pending, state => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(getSettingsdata.fulfilled, (state, action) => {
      state.loading = false;
      // ✅ Action payload
      state.settingsData = action.payload || {};
      console.log('🔄 settingsData stored in Redux:', action.payload);
    });

    builder.addCase(getSettingsdata.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch settings';
      state.settingsData = {};
    });

    handleAsyncThunk(builder, getProfile, 'getprofiledata');
    handleAsyncThunk(builder, getChildrenProfiles, 'childrenList');
    handleAsyncThunk(builder, getbanner, 'getbannerData');
    handleAsyncThunk(builder, getLanguageSetting, 'languageData');
  },
});

// Export actions
export const {
  resetState,
  setChildrenList,
  showSocketContent,
  hideSocketContent,
  setSettingsDataDirectly,
} = dataSlice.actions;

// Selectors
export const selectData = (state: RootState) => state.data;
export const selectLoading = (state: RootState) => state.data.loading;
export const selectChildrenList = (state: RootState) => state.data.childrenList;
export const selectLanguageData = (state: RootState) => state.data.languageData;
export const selectSettingsData = (state: RootState) => state.data.settingsData;

// Reducer
export default dataSlice.reducer;
