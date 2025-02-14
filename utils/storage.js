import AsyncStorage from "@react-native-async-storage/async-storage";

export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
  }
};

export const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return null;
  }
};

export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
  }
};

export const isTokenValid = async () => {
  try {
    const expiry = await AsyncStorage.getItem("accessTokenExpiry");

    if (!expiry) {
      console.log("No token expiry found.");
      return false; // No expiry means token is invalid
    }

    const isValid = new Date(expiry) > new Date(); // Check if token is still valid
    console.log("Token is still valid:", isValid);

    return isValid;
  } catch (error) {
    console.error("Error checking token validity:", error);
    return false; // Default to invalid if there's an error
  }
};

// Save product to Recently Viewed list
export const addRecentlyViewedProduct = async (productId) => {
  try {
    const existingData = await AsyncStorage.getItem("recentlyViewedProducts");
    let recentlyViewed = existingData ? JSON.parse(existingData) : [];

    // Prevent duplicates
    recentlyViewed = recentlyViewed.filter((id) => id !== productId);

    // Add new product at the beginning
    recentlyViewed.unshift(productId);

    // Limit to 10 recently viewed products
    recentlyViewed = recentlyViewed.slice(0, 10);

    await AsyncStorage.setItem(
      "recentlyViewedProducts",
      JSON.stringify(recentlyViewed)
    );
  } catch (error) {
    console.error("Error storing recently viewed product:", error);
  }
};

// Retrieve stored product IDs
export const getRecentlyViewedProducts = async () => {
  try {
    const value = await AsyncStorage.getItem("recentlyViewedProducts");
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error("Error retrieving recently viewed products:", error);
    return [];
  }
};
