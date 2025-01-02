import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useCart } from "../context/CartContext";
import { createCheckout } from "../api/shopifyApi";

const CartScreen = ({ navigation }) => {
  const { cart, getCartDetails, updateCartDetails, deleteItemFromCart } =
    useCart(); // Ensure updateCartDetails is implemented
  const [quantities, setQuantities] = useState({}); // State to track quantities by item ID
  const [totalPrice, setTotalPrice] = useState(0); // State to track total price
  const isInitialized = useRef(false); // To track initialization

  useEffect(() => {
    // Fetch cart details only once
    if (!isInitialized.current) {
      getCartDetails();
      isInitialized.current = true;
    }

    // Initialize quantities and calculate total price only if cart has items
    if (
      cart?.lines?.edges?.length > 0 &&
      Object.keys(quantities).length === 0
    ) {
      const initialQuantities = cart.lines.edges.reduce((acc, item) => {
        acc[item.node.id] = item.node.quantity;
        return acc;
      }, {});
      setQuantities(initialQuantities);
      calculateTotalPrice(initialQuantities);
    }
  }, [cart, getCartDetails]);

  const calculateTotalPrice = (updatedQuantities) => {
    if (!cart?.lines?.edges || cart.lines.edges.length === 0) {
      setTotalPrice(0); // Set total price to 0 when cart is empty
      return;
    }

    const newTotalPrice = cart.lines.edges.reduce((total, item) => {
      const itemId = item.node.id;
      const quantity = updatedQuantities[itemId] || 0; // Set to 0 if removed
      const price = parseFloat(item.node.merchandise.price.amount) || 0;
      return total + price * quantity;
    }, 0);

    setTotalPrice(newTotalPrice);
  };

  const syncCartWithServer = async () => {
    try {
      // Include items with quantity 0 to inform the server to remove them
      const updatedLines = Object.entries(quantities).map(
        ([lineId, quantity]) => ({
          id: lineId,
          quantity,
        })
      );

      if (!cart?.id || updatedLines.length === 0) {
        throw new Error("Missing cartId or updatedLines");
      }

      // Sync with the server
      await updateCartDetails(updatedLines);

      // Re-fetch cart details after syncing to ensure UI reflects updates
      await getCartDetails();
    } catch (error) {
      console.error("Failed to update cart on the server:", error);
    }
  };

  const handleIncrement = async (itemId) => {
    try {
      setQuantities((prevQuantities) => {
        const updatedQuantities = {
          ...prevQuantities,
          [itemId]: prevQuantities[itemId] + 1,
        };

        calculateTotalPrice(updatedQuantities); // Recalculate total price
        syncCartWithServer(updatedQuantities); // Sync with server
        return updatedQuantities;
      });

      // Directly update the cart with the new quantity
      await updateCartDetails([
        { id: itemId, quantity: quantities[itemId] + 1 },
      ]);
      await getCartDetails(); // Refresh cart details
    } catch (error) {
      console.error("Failed to increment item quantity:", error);
    }
  };

  const handleDecrement = async (itemId) => {
    try {
      setQuantities((prevQuantities) => {
        const updatedQuantities = {
          ...prevQuantities,
          [itemId]: prevQuantities[itemId] > 1 ? prevQuantities[itemId] - 1 : 1,
        };

        calculateTotalPrice(updatedQuantities); // Recalculate total price
        syncCartWithServer(updatedQuantities); // Sync with server
        return updatedQuantities;
      });

      // Directly update the cart with the new quantity
      await updateCartDetails([
        {
          id: itemId,
          quantity: quantities[itemId] - 1 > 0 ? quantities[itemId] - 1 : 1,
        },
      ]);
      await getCartDetails(); // Refresh cart details
    } catch (error) {
      console.error("Failed to decrement item quantity:", error);
    }
  };

  const handleNavigateToCheckout = async () => {
    try {
      if (!cart || !cart.lines?.edges.length) {
        alert("Your cart is empty!");
        return;
      }

      // Map cart lines to lineItems expected by createCheckout
      const lineItems = cart.lines.edges.map((line) => ({
        variantId: line.node.merchandise.id,
        quantity: line.node.quantity,
      }));

      console.log("Creating Shopify checkout...");
      const checkout = await createCheckout(lineItems);
      const { webUrl } = checkout;

      console.log("Navigating to WebViewScreen...");
      navigation.navigate("WebViewScreen", { checkoutUrl: webUrl });
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", async () => {
      try {
        const hasUpdates = Object.entries(quantities).some(([lineId, qty]) => {
          const cartLine = cart?.lines?.edges.find(
            (line) => line.node.id === lineId
          );
          return cartLine && cartLine.node.quantity !== qty;
        });

        if (hasUpdates) {
          console.log("Syncing cart on navigation back...");
          await syncCartWithServer();
        } else {
          console.log("No changes detected. Skipping sync.");
        }
      } catch (error) {
        console.error("Error syncing cart before navigating back:", error);
      }
    });

    return unsubscribe;
  }, [navigation, quantities, cart]);

  // Helper function to calculate total number of items
  const getTotalItems = () => {
    return Object.values(quantities).reduce((total, qty) => total + qty, 0);
  };

  const handleRemoveItem = async (itemId) => {
    try {
      // Call the deleteItemFromCart function to remove the item from the cart
      await deleteItemFromCart(itemId);

      // Update quantities state by removing the deleted item
      const updatedQuantities = { ...quantities };
      delete updatedQuantities[itemId];
      setQuantities(updatedQuantities);

      // Refresh cart details
      await getCartDetails();

      // Recalculate total price
      calculateTotalPrice(updatedQuantities);
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  const calculateItemPrice = (price, quantity) => {
    const parsedPrice = parseFloat(price) || 0; // Safely parse price
    return parsedPrice * quantity; // Calculate total price for the item
  };

  // Render each cart item
  const renderItem = ({ item }) => {
    const product = item?.node?.merchandise;
    const price = product?.price?.amount || "0.00";
    const compareAtPrice = product?.compareAtPrice?.amount || null;
    const itemId = item.node.id;
    const quantity = quantities[itemId] || item.node.quantity; // Use state or fallback to initial quantity

    const totalItemPrice = calculateItemPrice(price, quantity); // Calculate total price for this item
    const totalComparePrice = calculateItemPrice(compareAtPrice, quantity); // Calculate total price for this item

    // Fetch product image safely
    const productImage =
      product?.product?.images?.edges?.[0]?.node?.src ||
      "https://via.placeholder.com/100";

    return (
      <View style={styles.cartItemContainer}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: productImage,
            }}
            style={styles.productImage}
          />
        </View>

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <View style={{ gap: 7 }}>
            <Text style={styles.productTitle}>{product?.product?.title}</Text>

            {/* Price Section */}
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>
                ${totalItemPrice.toFixed(2)} {/* Show total item price */}
              </Text>
              {compareAtPrice && (
                <Text style={styles.compareAtPrice}>
                  ${totalComparePrice.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
          <Text style={styles.productSize}>Large</Text>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <View style={styles.selectorContainer}>
              {/* Minus Button */}
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleDecrement(itemId)}
                disabled={quantity === 1}
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>

              {/* Quantity Value */}
              <Text style={styles.quantity}>{quantity}</Text>

              {/* Plus Button */}
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleIncrement(itemId)}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveItem(itemId)}
            >
              <Text style={styles.removeButton}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Cart Indicator */}
      <View style={styles.topContainer}>
        <Text style={styles.cartIndicator}>My Bag ({getTotalItems()})</Text>
      </View>

      {/* Cart Items */}
      {cart?.lines?.edges?.length > 0 ? (
        <FlatList
          data={cart.lines.edges}
          keyExtractor={(item) => item.node.id}
          renderItem={renderItem}
        />
      ) : (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>Your cart is empty.</Text>
        </View>
      )}

      <View style={styles.lowerCheckoutContainer}>
        {/* Total Section */}
        <View style={styles.costContainer}>
          <Text style={styles.total}>Estimated Total:</Text>
          <Text style={styles.cartTotal}>
            ${cart?.lines?.edges?.length > 0 ? totalPrice.toFixed(2) : "0.00"}
          </Text>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            { opacity: cart?.lines?.edges?.length > 0 ? 1 : 0.5 },
          ]}
          onPress={handleNavigateToCheckout}
          disabled={cart?.lines?.edges?.length === 0} // Disable button when cart is empty
        >
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  topContainer: {
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomColor: "grey",
    borderBottomWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cartIndicator: {
    fontFamily: "Futura-Medium",
    fontSize: 15,
  },
  cartItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  detailsContainer: {
    flex: 1,
  },
  productTitle: {
    fontFamily: "Futura-Bold",
    fontSize: 16,
    color: "#000",
  },
  productSize: {
    fontFamily: "Futura-Medium",
    fontSize: 14,
    color: "#A09E9E",
    marginTop: 5,
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentPrice: {
    fontFamily: "Futura-Bold",
    fontSize: 16,
    color: "#C8102F",
    marginRight: 10,
  },
  compareAtPrice: {
    fontFamily: "Futura-Medium",
    fontSize: 16,
    color: "#A09E9E",
    textDecorationLine: "line-through",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginLeft: 20,
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: "medium",
    marginTop: 20,
    marginLeft: 20,
  },
  checkoutButton: {
    backgroundColor: "#C8102F",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: 15,
  },
  selectorContainer: {
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 1000,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    width: "35%",
    marginTop: 10,
  },
  quantityButton: {
    padding: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  quantity: {
    fontSize: 14,
    fontWeight: 500,
    marginHorizontal: 15,
    fontFamily: "Futura-Medium",
  },
  removeButton: {
    marginTop: 4,
    textDecorationLine: "underline",
    fontFamily: "Futura-Regular",
    fontSize: 13,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartText: {
    fontSize: 16,
    color: "gray",
    fontFamily: "Futura-Regular",
  },
  lowerCheckoutContainer: {
    borderTopColor: "black",
    borderTopWidth: "0.5",
    marginBottom: "10%",
  },
  costContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 20,
  },
});

export default CartScreen;
