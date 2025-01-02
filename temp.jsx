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

const CartScreen = ({ navigation }) => {
  const { cart, getCartDetails, updateCartDetails } = useCart(); // Ensure updateCartDetails is implemented
  const [quantities, setQuantities] = useState({}); // State to track quantities by item ID
  const [totalPrice, setTotalPrice] = useState(0); // State to track total price
  const isInitialized = useRef(false); // To track initialization

  useEffect(() => {
    // Fetch cart details only once
    if (!isInitialized.current) {
      getCartDetails();
      isInitialized.current = true;
    }

    // Initialize quantities and calculate total price
    if (cart?.lines?.edges && Object.keys(quantities).length === 0) {
      const initialQuantities = cart.lines.edges.reduce((acc, item) => {
        acc[item.node.id] = item.node.quantity;
        return acc;
      }, {});
      setQuantities(initialQuantities);
      calculateTotalPrice(initialQuantities); // Initialize total price
    }
  }, [cart, quantities, getCartDetails]);

  const calculateTotalPrice = (updatedQuantities) => {
    const newTotalPrice = cart?.lines?.edges?.reduce((total, item) => {
      const itemId = item.node.id;
      const quantity = updatedQuantities[itemId] || item.node.quantity;
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
      const updatedCart = await updateCartDetails(updatedLines);

      // Re-fetch cart details after syncing to ensure UI reflects updates
      await getCartDetails();
    } catch (error) {
      console.error("Failed to update cart on the server:", error);
    }
  };

  const handleIncrement = (itemId) => {
    setQuantities((prevQuantities) => {
      const updatedQuantities = {
        ...prevQuantities,
        [itemId]: prevQuantities[itemId] + 1,
      };
      calculateTotalPrice(updatedQuantities); // Recalculate total price
      return updatedQuantities;
    });
  };

  const handleDecrement = (itemId) => {
    setQuantities((prevQuantities) => {
      const updatedQuantities = {
        ...prevQuantities,
        [itemId]: prevQuantities[itemId] > 1 ? prevQuantities[itemId] - 1 : 1,
      };
      calculateTotalPrice(updatedQuantities); // Recalculate total price
      return updatedQuantities;
    });
  };

  const handleNavigateToCheckout = async () => {
    await syncCartWithServer(); // Sync cart before navigating
    navigation.navigate("Checkout");
  };

  // Update cart when navigating back
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", async () => {
      try {
        await syncCartWithServer();
      } catch (error) {
        console.error("Error syncing cart before navigating back:", error);
      }
    });

    return unsubscribe;
  }, [navigation, quantities, syncCartWithServer]);

  // Helper function to calculate total number of items
  const getTotalItems = () => {
    return Object.values(quantities).reduce((total, qty) => total + qty, 0);
  };

  const handleRemoveItem = async (itemId) => {
    try {
      // Set the quantity of the item to 0
      const updatedQuantities = { ...quantities, [itemId]: 0 };

      // Update quantities state
      setQuantities(updatedQuantities);

      // Sync updated cart with the server
      const updatedLines = Object.entries(updatedQuantities).map(
        ([lineId, quantity]) => ({
          id: lineId,
          quantity,
        })
      );

      await updateCartDetails(updatedLines); // Update cart details on the server

      // Refresh cart details to reflect changes
      await getCartDetails();
      calculateTotalPrice(updatedQuantities);
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  // Render each cart item
  const renderItem = ({ item }) => {
    const product = item?.node?.merchandise;
    const price = product?.price?.amount || "0.00";
    const compareAtPrice = product?.compareAtPrice?.amount || null;
    const itemId = item.node.id;
    const quantity = quantities[itemId] || item.node.quantity; // Use state or fallback to initial quantity

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
                ${parseFloat(price).toFixed(2)}
              </Text>
              {compareAtPrice && (
                <Text style={styles.compareAtPrice}>
                  ${parseFloat(compareAtPrice).toFixed(2)}
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
              style={styles.removeButton} // Add a style for the remove button
              onPress={() => handleRemoveItem(itemId)} // Call the remove handler
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
        <Text style={styles.cartIndicator}>
          My Bag ({getTotalItems()}) {/* Call the helper function here */}
        </Text>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cart?.lines?.edges || []} // Ensure cart lines exist
        keyExtractor={(item) => item?.node?.id}
        renderItem={renderItem}
      />

      {/* Total Section */}
      <Text style={styles.total}>
        Total: ${totalPrice.toFixed(2)}{" "}
        {cart?.estimatedCost?.totalAmount?.currencyCode || ""}
      </Text>

      {/* Checkout Button */}
      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={handleNavigateToCheckout}
      >
        <Text style={styles.checkoutText}>Proceed to Checkout</Text>
      </TouchableOpacity>
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
    color: "#FF0000",
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
  checkoutButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
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
});

export default CartScreen;