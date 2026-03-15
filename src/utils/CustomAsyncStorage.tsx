import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ✅ Store data in AsyncStorage
 * @param {string} key
 * @param {any} value
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    console.log(`✅ Data stored for key: ${key}`);
  } catch (e) {
    console.log(`❌ Error storing data for key: ${key}`, e);
  }
};

/**
 * ✅ Get data from AsyncStorage
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export const getData = async key => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.log(`❌ Error getting data for key: ${key}`, e);
    return null;
  }
};

/**
 * ✅ Remove specific data from AsyncStorage
 * @param {string} key
 */
export const removeData = async key => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`🗑️ Removed data for key: ${key}`);
  } catch (e) {
    console.log(`❌ Error removing data for key: ${key}`, e);
  }
};

/**
 * ✅ Clear all AsyncStorage data
 */
export const clearData = async () => {
  try {
    await AsyncStorage.clear();
    console.log('🧹 All AsyncStorage data cleared');
  } catch (e) {
    console.log('❌ Error clearing AsyncStorage', e);
  }
};
