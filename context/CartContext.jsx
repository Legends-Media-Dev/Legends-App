// import React, { createContext, useContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { createCart, addToCart, fetchCart } from "../api/shopifyApi";

// // Removed the CartContextType interface

// // Create the context with a default value of `null`
// const CartContext = createContext(null);

// // CartProvider Component
// export const CartProvider = ({ children }) => {
//   const [cartId, setCartId] = useState(null);
//   const [cart, setCart] = useState(null); // Replace `any` with the specific type if known

//   // Initialize the cart when the provider mounts
//   useEffect(() => {
//     const initializeCart = async () => {
//       try {
//         const existingCartId = await AsyncStorage.getItem("shopifyCartId");

//         if (!existingCartId) {
//           const cart = await createCart();
//           if (!cart) {
//             console.error("Cart creation failed");
//             return;
//           }
//           const newCartId = cart.id;
//           console.log("New Cart ID:", newCartId);
//           await AsyncStorage.setItem("shopifyCartId", newCartId);
//           setCartId(newCartId);
//         } else {
//           console.log("Existing Cart ID:", existingCartId);
//           setCartId(existingCartId);
//         }
//       } catch (error) {
//         console.error("Error initializing cart:", error);
//       }
//     };

//     initializeCart();
//   }, []);

//   // Function to add items to the cart
//   const addItemToCart = async (variantId, quantity) => {
//     if (!cartId) {
//       console.error("Cart ID is not initialized. Cannot add item to cart.");
//       return;
//     }

//     try {
//       const updatedCart = await addToCart(cartId, variantId, quantity);

//       if (!updatedCart) {
//         console.error("Failed to update cart. API returned null.");
//         return;
//       }

//       console.log("Updated cart:", updatedCart);
//       setCart(updatedCart);
//     } catch (error) {
//       console.error("Error adding item to cart:", error);
//     }
//   };

//   // Function to fetch cart details
//   const getCartDetails = async () => {
//     if (!cartId) {
//       console.error("Cart ID is not initialized");
//       return;
//     }

//     try {
//       const cartDetails = await fetchCart(cartId);
//       setCart(cartDetails);
//     } catch (error) {
//       console.error("Error fetching cart details:", error);
//     }
//   };

//   return (
//     <CartContext.Provider value={{ cart, addItemToCart, getCartDetails }}>
//       {children}
//     </CartContext.Provider>
//   );
// };

// // Custom hook to use the Cart Context
// export const useCart = () => {
//   const context = useContext(CartContext);

//   if (!context) {
//     throw new Error("useCart must be used within a CartProvider");
//   }

//   return context;
// };

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

  // Initialize the cart when the provider mounts
  useEffect(() => {
    const initializeCart = async () => {
      try {
        const existingCartId = await AsyncStorage.getItem("shopifyCartId");

        if (!existingCartId) {
          const cart = await createCart();
          if (!cart) {
            console.error("Cart creation failed");
            return;
          }
          const newCartId = cart.id;
          console.log("New Cart ID:", newCartId);
          await AsyncStorage.setItem("shopifyCartId", newCartId);
          setCartId(newCartId);
        } else {
          console.log("Existing Cart ID:", existingCartId);
          setCartId(existingCartId);
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
      const updatedCart = await addToCart(cartId, variantId, quantity);

      if (!updatedCart) {
        console.error("Failed to update cart. API returned null.");
        return;
      }

      console.log("Updated cart:", updatedCart);
      setCart(updatedCart);
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

  return (
    <CartContext.Provider
      value={{
        cart,
        addItemToCart,
        getCartDetails,
        updateCartDetails,
        deleteItemFromCart,
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
