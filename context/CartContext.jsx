import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createCart,
  addToCart,
  fetchCart,
  updateCart,
  deleteItem,
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

        if (!existingCartId) {
          console.log("No existing cart ID found. Creating a new cart...");
          await resetCart(); // Create a new cart if no existing cart ID
        } else {
          console.log("Existing Cart ID:", existingCartId);
          setCartId(existingCartId);

          // Fetch cart details to verify the cart is valid
          const fetchedCart = await fetchCart(existingCartId);
          if (fetchedCart) {
            setCart(fetchedCart); // Update cart state with fetched details
          } else {
            console.log("Invalid or expired cart. Creating a new one...");
            await resetCart(); // Reset the cart if the existing one is invalid
          }
        }
      } catch (error) {
        console.error("Error initializing cart:", error);
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
      console.error("Cart ID is not initialized");
      return;
    }

    try {
      const payload = {
        cartId, // Ensure cartId is a string
        lines: updatedLines, // Pass updatedLines directly as "lines"
      };

      console.log("Payload being sent:", payload);

      const updatedCart = await updateCart(cartId, updatedLines); // UpdateCart API call
      if (!updatedCart) {
        console.error("Failed to update cart. API returned null.");
        return;
      }

      console.log("Updated cart after syncing:", updatedCart);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error updating cart details:", error);
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
