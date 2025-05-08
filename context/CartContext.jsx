import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createCart,
  addToCart,
  fetchCart,
  updateCart,
  deleteItem,
  resetCart,
} from "../api/shopifyApi";

// Create the context with a default value of `null`
const CartContext = createContext(null);

// CartProvider Component
export const CartProvider = ({ children }) => {
  const [cartId, setCartId] = useState(null);
  const [cart, setCart] = useState(null);

  // Function to reset and create a new cart
  const resetCart = async () => {
    try {
      console.log("Resetting cart...");
      await AsyncStorage.removeItem("shopifyCartId"); // Clear stored cart ID
      const newCart = await createCart(); // Create a new cart via API
      if (newCart) {
        const newCartId = newCart.id;
        console.log("New Cart ID created:", newCartId);
        await AsyncStorage.setItem("shopifyCartId", newCartId); // Save new cart ID
        setCartId(newCartId);
        setCart(newCart); // Update cart state with the new cart
      } else {
        console.error("Failed to create a new cart");
      }
    } catch (error) {
      console.error("Error resetting cart:", error);
    }
  };

  // Initialize cart logic
  useEffect(() => {
    const initializeCart = async () => {
      try {
        const existingCartId = await AsyncStorage.getItem("shopifyCartId");

        const isInvalidId =
          !existingCartId ||
          existingCartId.includes("shopify://") || // bad format
          existingCartId.length < 20;

        if (isInvalidId) {
          console.log("Bad cart ID. Resetting cart...");
          await resetCart();
          return;
        }

        console.log("Existing Cart ID:", existingCartId);
        setCartId(existingCartId);

        const fetchedCart = await fetchCart(existingCartId);

        const isValidCart =
          fetchedCart &&
          fetchedCart.id &&
          Array.isArray(fetchedCart?.lines?.edges);

        if (isValidCart) {
          setCart(fetchedCart);
        } else {
          console.warn("Fetched cart is invalid or empty. Resetting...");
          await resetCart();
        }
      } catch (error) {
        console.error("Error initializing cart:", error);
        await resetCart(); // Ensure fallback on any error
      }
    };

    initializeCart();
  }, []);

  // Function to add items to the cart
  const addItemToCart = async (variantId, quantity) => {
    if (!cartId) {
      console.error("Cart ID is not initialized. Cannot add item to cart.");
      return;
    }

    try {
      await addToCart(cartId, variantId, quantity);
      const updatedCart = await fetchCart(cartId); // <-- force refresh from Shopify
      if (!updatedCart) {
        console.error("Failed to fetch updated cart.");
        return;
      }

      setCart(updatedCart); // <-- update context
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  // Function to fetch cart details
  const getCartDetails = async () => {
    if (!cartId) {
      console.error("Cart ID is not initialized");
      return;
    }

    try {
      const cartDetails = await fetchCart(cartId);
      setCart(cartDetails);
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };

  // Function to update cart details (e.g., quantities)
  // Function to update cart details (e.g., quantities)
  const updateCartDetails = async (updatedLines) => {
    if (!cartId) {
      throw new Error("Cart ID is not initialized");
    }

    try {
      const updatedCart = await updateCart(cartId, updatedLines); // this calls your cloud function

      if (!updatedCart) {
        throw new Error("No cart returned from server");
      }

      setCart(updatedCart); // ✅ store it
    } catch (error) {
      // ✅ IMPORTANT: properly rethrow Shopify userError
      const rawError = error?.response?.data?.error || error?.message;
      throw new Error(rawError);
    }
  };

  const deleteItemFromCart = async (lineId) => {
    if (!cartId) {
      console.error("Cart ID is not initialized");
      return;
    }

    try {
      await deleteItem(cartId, lineId); // Call your delete API function
      const updatedCart = await getCartDetails(); // Fetch the updated cart after deletion
      setCart(updatedCart);
    } catch (error) {
      console.error("Error deleting item from cart:", error);
    }
  };

  // Calculate cart item count (sum of all item quantities)
  const cartItemCount = Array.isArray(cart?.lines?.edges)
    ? cart.lines.edges.reduce((total, edge) => total + edge.node.quantity, 0)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        addItemToCart,
        getCartDetails,
        updateCartDetails,
        deleteItemFromCart,
        cartItemCount,
        resetCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the Cart Context
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};
