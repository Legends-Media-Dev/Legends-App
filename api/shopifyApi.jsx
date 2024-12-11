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

    console.log("fetchCart response:", response.data);

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
