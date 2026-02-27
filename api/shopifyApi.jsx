import axios from "axios";

// Replace this URL with the trigger URL of your deployed function
const CLOUD_FUNCTION_URL_FC =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchCollectionsHandler";

const CLOUD_FUNCTION_URL_FCBH =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchCollectionByHandleHandler";

const CLOUD_FUNCTION_URL_SP =
  "https://us-central1-premier-ikon.cloudfunctions.net/searchProductsHandler";

const CLOUD_FUNCTION_URL_SP_SF =
  "https://us-central1-premier-ikon.cloudfunctions.net/searchProductsHandlerSF";

const CLOUD_FUNCTION_URL_FAPC =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchAllProductsCollectionHandler";

const CLOUD_FUNCTION_URL_FAPCA =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchAllProductsCollectionHandlerAdmin";

const CLOUD_FUNCTION_URL_CC =
  "https://us-central1-premier-ikon.cloudfunctions.net/createCartHandler";

const CLOUD_FUNCTION_URL_ATC =
  "https://us-central1-premier-ikon.cloudfunctions.net/addToCartHandler";

const CLOUD_FUNCTION_URL_FCC =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchCartHandler";

const CLOUD_FUNCTION_URL_CCH =
  "https://us-central1-premier-ikon.cloudfunctions.net/createCheckoutHandler";

const CLOUD_FUNCTION_URL_CCHU =
  "https://us-central1-premier-ikon.cloudfunctions.net/createCheckoutUpdatedHandler";

const CLOUD_FUNCTION_URL_UUC =
  "https://us-central1-premier-ikon.cloudfunctions.net/updateCartHandler";

const CLOUD_FUNCTION_URL_DIFC =
  "https://us-central1-premier-ikon.cloudfunctions.net/deleteItemHandler";

const CLOUD_FUNCTION_URL_CAL =
  "https://us-central1-premier-ikon.cloudfunctions.net/customerLoginHandler";

const CLOUD_FUNCTION_URL_CAC =
  "https://us-central1-premier-ikon.cloudfunctions.net/createCustomerHandler";

const CLOUD_FUNCTION_URL_FCD =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchCustomerDetailsHandler";

const CLOUD_FUNCTION_URL_UFP =
  "https://us-central1-premier-ikon.cloudfunctions.net/customerRecoverHandler";

const CLOUD_FUNCTION_URL_FPBI =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchProductByIdHandler";

const CLOUD_FUNCTION_URL_FPBIA =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchProductByIdHandlerAdmin";

const CLOUD_FUNCTION_URL_FACO =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchAllCustomerOrdersHandler";

const CLOUD_FUNCTION_URL_YOUTUBE_DB =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchYoutubeDataFromDBHandler";

const CLOUD_FUNCTION_URL_FBBH =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchBlogByHandle";

const CLOUD_FUNCTION_URL_SAVE_USER_NOTI =
  "https://us-central1-premier-ikon.cloudfunctions.net/saveUserNotiHandler";


const CLOUD_FUNCTION_URL_FETCH_GIVEAWAY_ENTRIES =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchGiveawayInfoHandler";

const CLOUD_FUNCTION_URL_APP_VERSION =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchAppInfoHandler";

/**
 * Fetch app version config from Firebase (fetchAppInfoHandler).
 * Expects: { appInfo: [{ minVersion, iosStoreUrl?, androidStoreUrl? }], total }
 * Uses the first appInfo entry. When you release a new build, set minVersion in Firebase.
 */
export const fetchAppInfo = async () => {
  try {
    const response = await axios.get(CLOUD_FUNCTION_URL_APP_VERSION, {
      timeout: 8000,
    });
    const data = response.data;
    const first = data?.appInfo?.[0];
    if (!first) return null;

    const minVersion = first.minVersion ?? first.min_version ?? null;
    const iosStoreUrl = (first.iosStoreUrl ?? first.ios_store_url ?? "").trim().replace(/"$/, "");
    const androidStoreUrl = (first.androidStoreUrl ?? first.android_store_url ?? "").trim().replace(/"$/, "") || null;

    return {
      minVersion: minVersion || null,
      iosStoreUrl: iosStoreUrl || null,
      androidStoreUrl: androidStoreUrl || null,
    };
  } catch (error) {
    console.warn(
      "App info (version) fetch failed:",
      error.response?.data || error.message
    );
    return null;
  }
};

/**
 * Fetch giveaway info (multiplier, start date, end date) from the backend
 */
export const fetchGiveawayInfo = async () => {
  try {
    const response = await axios.get(CLOUD_FUNCTION_URL_FETCH_GIVEAWAY_ENTRIES);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching giveaway info via Cloud Function:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Fetch Collections
 */
export const fetchCollections = async () => {
  try {
    // Call the Cloud Function
    const response = await axios.get(CLOUD_FUNCTION_URL_FC);

    // Return the collections data
    return response.data;
  } catch (error) {
    console.error("Error fetching collections from Cloud Function:", error);
    throw error;
  }
};

export const fetchCollectionByHandle = async (handle) => {
  try {
    const response = await axios.get(CLOUD_FUNCTION_URL_FCBH, {
      params: { handle },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching collection by handle:", error);
    throw error;
  }
};

/**
 * Fetch the current YouTube video from Firebase (fetchYoutubeDataFromDBHandler).
 * Backend returns the single "current" doc: { id, videoId, title, thumbnail, publishedAt, date, updatedAt }.
 * Returns that shape for NewsScreen / YoutubeContentBox. Returns null on 404 or empty data.
 */
export const fetchLatestYouTubeVideo = async () => {
  try {
    const response = await axios.get(CLOUD_FUNCTION_URL_YOUTUBE_DB, {
      timeout: 10000,
    });
    const data = response.data;
    if (!data || !data.videoId) return null;
    return {
      id: data.id ?? null,
      videoId: data.videoId,
      title: data.title ?? "",
      thumbnail: data.thumbnail ?? null,
      publishedAt: data.publishedAt ?? null,
      date: data.date ?? null,
      updatedAt: data.updatedAt ?? null,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error("Error fetching YouTube data from DB:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetch Products in a Collection
 */
export const fetchAllProductsCollection = async (
  collectionHandle,
  cursor = null
) => {
  try {
    // Send a GET request to the Cloud Function
    const response = await axios.get(CLOUD_FUNCTION_URL_FAPC, {
      params: {
        collectionHandle, // 👈 changed from collectionId
        cursor,
      },
    });

    // Return the products collection data
    return response.data;
  } catch (error) {
    console.error("Error fetching products collection:", error);
    throw error;
  }
};

/**
 * Fetch Products in a Collection (Admin API version)
 */
// export const fetchAllProductsCollectionAdmin = async (
//   handle,
//   cursor = null
// ) => {
//   try {
//     const response = await axios.get(CLOUD_FUNCTION_URL_FAPCA, {
//       params: {
//         handle,
//         cursor,
//       },
//     });

//     return response.data;
//   } catch (error) {
//     // Enhanced error logging
//     if (error.response) {
//       console.error("❌ Backend responded with error:", error.response.status);
//       console.error("🛑 Error details:", error.response.data);
//     } else {
//       console.error("❌ Network or unknown error:", error.message);
//     }
//     throw error;
//   }
// };

/**
 * Create a New Cart
 */
export const createCart = async () => {
  try {
    // Call the Cloud Function
    const response = await axios.get(CLOUD_FUNCTION_URL_CC);

    // Return the collections data
    return response.data;
  } catch (error) {
    console.error("Error fetching collections from Cloud Function:", error);
    throw error;
  }
};

/**
 * Add to Cart
 */
export const addToCart = async (cartId, variantId, quantity) => {
  try {
    // Call the Cloud Function
    const response = await axios.post(CLOUD_FUNCTION_URL_ATC, {
      cartId,
      variantId,
      quantity,
    });

    // console.log("addToCart response:", response.data);

    // Return the updated cart
    return response.data;
  } catch (error) {
    console.error(
      "Error adding item to cart via Cloud Function:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Fetch Cart Details
 */
export const fetchCart = async (cartId) => {
  try {
    // Make a GET request to the Cloud Function with the cartId as a query parameter
    const response = await axios.get(CLOUD_FUNCTION_URL_FCC, {
      params: { cartId },
    });

    // Return the cart data
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching cart via Cloud Function:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// // Create Checkout DEPRECATED
// export const createCheckout = async (lineItems) => {
//   try {
//     // Send a POST request to the Cloud Function with lineItems in the body
//     const response = await axios.post(CLOUD_FUNCTION_URL_CCH, { lineItems });

//     console.log("createCheckout response:", response.data);

//     // Return the checkout object from the Cloud Function response
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error creating checkout via Cloud Function:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };

// Create Checkout Updated
export const createCheckoutUpdated = async (lineItems) => {
  try {
    // Send a POST request to the updated Cloud Function with lineItems in the body
    const response = await axios.post(CLOUD_FUNCTION_URL_CCHU, { lineItems });

    // console.log("createCheckoutUpdated response:", response.data);

    // Return the cart object (including checkoutUrl) from the Cloud Function response
    return response.data;
  } catch (error) {
    console.error(
      "Error creating checkout via updated Cloud Function:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateCart = async (cartId, lines) => {
  try {
    if (!cartId || !Array.isArray(lines)) {
      throw new Error("Invalid cartId or lines provided");
    }

    // Log the payload being sent to the server
    // console.log("Updating cart with payload:", { cartId, lines });

    // Make the API request
    const response = await axios.post(CLOUD_FUNCTION_URL_UUC, {
      cartId,
      lines, // Lines include quantity: 0 to inform server to remove these items
    });

    // Log and validate the response
    // console.log("updateCart response:", response.data);

    if (!response.data || !response.data.lines) {
      throw new Error("Invalid response: Missing lines in cart data");
    }

    // Return the updated cart data
    return response.data;
  } catch (error) {
    // Log the error for debugging
    // console.error(
    //   "Error updating cart via Cloud Function:",
    //   error.response?.data || error.message
    // );
    throw error;
  }
};

export const deleteItem = async (cartId, lineId) => {
  try {
    const response = await axios.post(CLOUD_FUNCTION_URL_DIFC, {
      cartId,
      lineId,
    });
    // console.log("Item deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting item from cart:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Sign in Customer
 */
export const customerSignIn = async (email, password) => {
  try {
    // Call the Cloud Function
    const response = await axios.post(CLOUD_FUNCTION_URL_CAL, {
      email,
      password,
    });

    // console.log("customerSignIn response:", response.data);

    // Return the customer access token
    return response.data;
  } catch (error) {
    console.error(
      "Error signing in customer via Cloud Function:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Sign up Customer
 */
export const customerSignUp = async (firstName, lastName, email, password) => {
  try {
    // Call the Cloud Function
    const response = await axios.post(CLOUD_FUNCTION_URL_CAC, {
      firstName,
      lastName,
      email,
      password,
    });

    // console.log("customerSignUp response:", response.data);

    // Return the created customer details
    return response.data;
  } catch (error) {
    console.error(
      "Error signing up customer via Cloud Function:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Fetch Customer Details
 */
export const fetchCustomerDetails = async (accessToken) => {
  try {
    // Call the Cloud Function
    const response = await axios.post(CLOUD_FUNCTION_URL_FCD, {
      accessToken,
    });

    console.log("fetchCustomerDetails response:", response.data);

    // Return the customer details
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching customer details via Cloud Function:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Forgot Password
 * Sends a password recovery email to the provided email address.
 */
export const forgotPassword = async (email) => {
  try {
    // Call the Cloud Function for customer recovery
    const response = await axios.post(CLOUD_FUNCTION_URL_UFP, {
      email,
    });

    // console.log("forgotPassword response:", response.data);

    if (
      response.data.customerUserErrors &&
      response.data.customerUserErrors.length > 0
    ) {
      throw new Error(response.data.customerUserErrors[0].message);
    }

    return { success: true, message: "Recovery email sent successfully." };
  } catch (error) {
    console.error(
      "Error sending password recovery email:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to send recovery email."
    );
  }
};

/**
 * Fetch Product by ID
 */
export const fetchProductById = async (productId) => {
  try {
    if (!productId) throw new Error("Missing productId parameter");

    // Call the Cloud Function with productId as a query parameter
    const response = await axios.get(CLOUD_FUNCTION_URL_FPBI, {
      params: { productId },
    });

    // console.log("fetchProductById response:", response.data);

    // Return the product details
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching product by ID via Cloud Function:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Fetch Product by ID using Admin API Cloud Function
 */
// export const fetchProductByIdAdmin = async (productId) => {
//   try {
//     if (!productId) throw new Error("Missing productId parameter");

//     const response = await axios.get(CLOUD_FUNCTION_URL_FPBIA, {
//       params: { productId },
//     });

//     if (!response.data || !response.data.id) {
//       console.warn("Product not found or malformed response:", response.data);
//       return null;
//     }

//     // console.log("fetchProductById response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error fetching product by ID via Admin API Cloud Function:",
//       error.response?.data || error.message
//     );
//     return null;
//   }
// };

/**
 * Fetch All Orders for a Specific Customer
 */
export const fetchAllCustomerOrders = async (accessToken) => {
  try {
    if (!accessToken) throw new Error("Missing accessToken parameter");

    // console.log("Access token being sent to Cloud Function:", accessToken);

    // Call the Cloud Function with accessToken in the request body (POST)
    const response = await axios.post(CLOUD_FUNCTION_URL_FACO, {
      accessToken, // Send in body, not as query params
    });

    // console.log("fetchAllCustomerOrders response:", response.data);

    // Return the customer orders
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all customer orders via Cloud Function:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Search Products by Keyword
 */
// export const searchProducts = async (searchTerm) => {
//   try {
//     if (!searchTerm) throw new Error("Missing searchTerm parameter");

//     const response = await axios.post(CLOUD_FUNCTION_URL_SP, {
//       searchTerm: searchTerm,
//     });

//     // console.log("searchProducts response:", response.data);

//     return response.data.products || [];
//   } catch (error) {
//     console.error(
//       "Error searching products via Cloud Function:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };

export const searchProductsSF = async (searchTerm) => {
  try {
    if (!searchTerm) throw new Error("Missing searchTerm parameter");

    const response = await axios.post(CLOUD_FUNCTION_URL_SP_SF, {
      searchTerm: searchTerm,
    });

    // console.log("searchProducts response:", response.data);

    return response.data.products || [];
  } catch (error) {
    console.error(
      "Error searching products via Cloud Function:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const fetchBlogArticles = async (blogHandle) => {
  try {
    const response = await axios.get(CLOUD_FUNCTION_URL_FBBH, {
      params: { blogHandle }, // Pass handle as query param
    });

    return response.data; // This is the blog object
  } catch (error) {
    console.error("Error fetching blog articles:", error);
    throw error;
  }
};

/**
 * Save Expo Push Token to Firestore via Cloud Function
 */
export const saveUserNotificationToken = async (token, deviceInfo = {}) => {
  try {
    if (!token) throw new Error("Missing Expo push token");

    // 🧩 Try to pull user info if available
    let userId = null;
    let email = null;
    try {
      const userInfoRaw = await AsyncStorage.getItem("customerInfo");
      if (userInfoRaw) {
        const userInfo = JSON.parse(userInfoRaw);
        userId = userInfo?.id || null;
        email = userInfo?.email || null;
      }
    } catch (err) {
      console.warn(
        "⚠️ Could not load customer info for notification token:",
        err
      );
    }

    // 🧠 Debug log — shows what we’re about to send to Firestore
    // console.log("📤 Preparing to save push token to Firestore:", {
    //   token,
    //   userId,
    //   email,
    //   deviceInfo,
    // });

    // 🚀 Send token + user info + device info to Cloud Function
    const response = await axios.post(CLOUD_FUNCTION_URL_SAVE_USER_NOTI, {
      token,
      userId,
      email,
      deviceInfo,
    });

    // console.log("✅ Firestore response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error saving notification token:",
      error.response?.data || error.message
    );
    throw error;
  }
};
