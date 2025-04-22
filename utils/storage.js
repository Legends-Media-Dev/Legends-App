import AsyncStorage from "@react-native-async-storage/async-storage";

// Generic SET with automatic JSON.stringify for objects
export const setItem = async (key, value) => {
  try {
    const stringifiedValue =
      typeof value === "string" ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, stringifiedValue);
  } catch (error) {
    console.error(`Error storing key "${key}":`, error);
  }
};

// Generic GET with optional parsing
export const getItem = async (key, parse = false) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return parse && value ? JSON.parse(value) : value;
  } catch (error) {
    console.error(`Error retrieving key "${key}":`, error);
    return null;
  }
};

export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing key "${key}":`, error);
  }
};

// Validate token expiry
export const isTokenValid = async () => {
  try {
    const expiry = await AsyncStorage.getItem("accessTokenExpiry");
    if (!expiry) return false;

    const isValid = new Date(expiry) > new Date();
    console.log("Token is still valid:", isValid);
    return isValid;
  } catch (error) {
    console.error("Error checking token validity:", error);
    return false;
  }
};

// Add a product ID to Recently Viewed list
export const addRecentlyViewedProduct = async (productId) => {
  try {
    const existingData = await AsyncStorage.getItem("recentlyViewedProducts");
    let recentlyViewed = existingData ? JSON.parse(existingData) : [];

    if (!productId) return;

    // Remove if already exists
    recentlyViewed = recentlyViewed.filter((id) => id !== productId);

    // Add to front
    recentlyViewed.unshift(productId);

    // Keep only 10 items
    recentlyViewed = recentlyViewed.slice(0, 10);

    await AsyncStorage.setItem(
      "recentlyViewedProducts",
      JSON.stringify(recentlyViewed)
    );

    // console.log("Recently viewed updated:", recentlyViewed);
  } catch (error) {
    console.error("Error storing recently viewed product:", error);
  }
};

// Get Recently Viewed product IDs
export const getRecentlyViewedProducts = async () => {
  try {
    const value = await AsyncStorage.getItem("recentlyViewedProducts");
    const result = value ? JSON.parse(value) : [];
    console.log("Fetched recently viewed:", result);
    return result;
  } catch (error) {
    console.error("Error retrieving recently viewed products:", error);
    return [];
  }
};

export const clearRecentlyViewedProducts = async () => {
  try {
    await AsyncStorage.removeItem("recentlyViewedProducts");
    console.log("Recently viewed products cleared.");
  } catch (error) {
    console.error("Error clearing recently viewed products:", error);
  }
};

// Optional: Clear everything (for dev testing)
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log("AsyncStorage cleared.");
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
};
