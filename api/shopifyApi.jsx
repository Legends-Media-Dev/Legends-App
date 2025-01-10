import axios from "axios";

// Replace this URL with the trigger URL of your deployed function
const CLOUD_FUNCTION_URL_FC =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchCollectionsHandler";

const CLOUD_FUNCTION_URL_FAPC =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchAllProductsCollectionHandler";

const CLOUD_FUNCTION_URL_CC =
  "https://us-central1-premier-ikon.cloudfunctions.net/createCartHandler";

const CLOUD_FUNCTION_URL_ATC =
  "https://us-central1-premier-ikon.cloudfunctions.net/addToCartHandler";

const CLOUD_FUNCTION_URL_FCC =
  "https://us-central1-premier-ikon.cloudfunctions.net/fetchCartHandler";

const CLOUD_FUNCTION_URL_CCH =
  "https://us-central1-premier-ikon.cloudfunctions.net/createCheckoutHandler";

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

/**
 * Fetch Products in a Collection
 */
export const fetchAllProductsCollection = async (
  collectionId,
  cursor = null
) => {
  try {
    // Send a GET request to the Cloud Function
    const response = await axios.get(CLOUD_FUNCTION_URL_FAPC, {
      params: {
        collectionId,
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
export const addToCart = async (cartId, variantId, quantity = 1) => {
  try {
    // Call the Cloud Function
    const response = await axios.post(CLOUD_FUNCTION_URL_ATC, {
      cartId,
      variantId,
      quantity,
    });

    console.log("addToCart response:", response.data);

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

// Create Checkout
export const createCheckout = async (lineItems) => {
  try {
    // Send a POST request to the Cloud Function with lineItems in the body
    const response = await axios.post(CLOUD_FUNCTION_URL_CCH, { lineItems });

    console.log("createCheckout response:", response.data);

    // Return the checkout object from the Cloud Function response
    return response.data;
  } catch (error) {
    console.error(
      "Error creating checkout via Cloud Function:",
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
    console.log("Updating cart with payload:", { cartId, lines });

    // Make the API request
    const response = await axios.post(CLOUD_FUNCTION_URL_UUC, {
      cartId,
      lines, // Lines include quantity: 0 to inform server to remove these items
    });

    // Log and validate the response
    console.log("updateCart response:", response.data);

    if (!response.data || !response.data.lines) {
      throw new Error("Invalid response: Missing lines in cart data");
    }

    // Return the updated cart data
    return response.data;
  } catch (error) {
    // Log the error for debugging
    console.error(
      "Error updating cart via Cloud Function:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteItem = async (cartId, lineId) => {
  try {
    const response = await axios.post(CLOUD_FUNCTION_URL_DIFC, {
      cartId,
      lineId,
    });
    console.log("Item deleted successfully:", response.data);
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

    console.log("customerSignIn response:", response.data);

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

    console.log("customerSignUp response:", response.data);

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
