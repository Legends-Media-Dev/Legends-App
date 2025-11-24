import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useCart } from "../../context/CartContext";
import { createCheckout, createCheckoutUpdated } from "../../api/shopifyApi";
import { Image } from "expo-image";

const CartScreen = ({ navigation }) => {
  const { cart, getCartDetails, updateCartDetails, deleteItemFromCart } =
    useCart(); // Ensure updateCartDetails is implemented
  const [quantities, setQuantities] = useState({}); // State to track quantities by item ID
  const [totalPrice, setTotalPrice] = useState(0); // State to track total price
  const isInitialized = useRef(false); // To track initialization
  const [removingItemId, setRemovingItemId] = useState(null);

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

  const syncCartWithServer = async (customQuantities = null) => {
    try {
      const quantitiesToUse = customQuantities || quantities;

      const updatedLines = Object.entries(quantitiesToUse).map(
        ([lineId, quantity]) => ({
          id: lineId.split("?")[0], // clean up the ID
          quantity,
        })
      );

      if (!cart?.id || updatedLines.length === 0) {
        throw new Error("Missing cartId or updatedLines");
      }

      await updateCartDetails(updatedLines);
      await getCartDetails();
    } catch (error) {
      // console.error("Failed to update cart on the server:", error);
      throw error; // ✅ THIS LINE IS ESSENTIAL
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
      Alert.alert("Out of Stock", "There is no more stock for this item.");
      setQuantities((prevQuantities) => {
        const updatedQuantities = {
          ...prevQuantities,
          [itemId]: prevQuantities[itemId] - 1,
        };

        calculateTotalPrice(updatedQuantities); // Recalculate total price
        syncCartWithServer(updatedQuantities); // Sync with server
        return updatedQuantities;
      });

      // Directly update the cart with the new quantity
      await updateCartDetails([
        { id: itemId, quantity: quantities[itemId] - 1 },
      ]);
      await getCartDetails();
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
      // console.error("Failed to decrement item quantity:", error);
    }
  };

  const handleNavigateToCheckoutUpdated = async () => {
    console.log("Cart Object Before Checkout:", JSON.stringify(cart, null, 2));
    console.log(cart.checkoutUrl);
    if (!cart || !cart.id) {
      alert("Your cart is empty!");
      return;
    }

    try {
      console.log("Fetching Checkout URL...");
      await getCartDetails(); // Ensure cart details are updated before checkout

      if (!cart.checkoutUrl) {
        console.error("Checkout URL is missing from the cart response.");
        alert("Failed to retrieve the checkout URL. Please try again.");
        return;
      }

      console.log("Navigating to WebViewScreen with URL:", cart.checkoutUrl);
      navigation.navigate("WebViewScreen", { checkoutUrl: cart.checkoutUrl });
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const getDisplaySizeFromShopifyVariant = (shopifySize) => {
    switch (shopifySize) {
      case "Default Title":
        return null;
      case "Adult Small":
        return "Small";
      case "Adult Medium":
        return "Medium";
      case "Adult Large":
        return "Large";
      case "Adult XLarge":
        return "XLarge";
      case "Adult 2XLarge":
        return "2XLarge";
      case "Adult 3XLarge":
        return "3XLarge";
      default:
        return shopifySize;
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
      setRemovingItemId(itemId); // show loader

      await deleteItemFromCart(itemId);

      const updatedQuantities = { ...quantities };
      delete updatedQuantities[itemId];
      setQuantities(updatedQuantities);

      await getCartDetails();
      calculateTotalPrice(updatedQuantities);
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    } finally {
      setRemovingItemId(null); // hide loader
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
      product?.product?.images?.edges?.[0]?.node?.src || "..assets/Legends.png";

    return (
      <View style={styles.cartItemContainer}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            transition={300}
            source={{
              uri: productImage,
            }}
            style={styles.productImage}
          />
        </View>

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <View style={{ gap: 7 }}>
            <Text allowFontScaling={false} style={styles.productTitle}>{product?.product?.title}</Text>

            {/* Price Section */}
            <View style={styles.priceContainer}>
              <Text allowFontScaling={false} style={styles.currentPrice}>
                ${totalItemPrice.toFixed(2)}
              </Text>

              {Number(compareAtPrice) > Number(price) && (
                <Text allowFontScaling={false} style={styles.compareAtPrice}>
                  ${totalComparePrice.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
          {/* <Text style={styles.productSize}>
            {product?.title || "Unknown Size"}
          </Text> */}
          <Text
            allowFontScaling={false}
            style={[
              styles.productSize,
              product?.title == "Default Title" && {
                fontSize: 0,
              },
            ]}
          >
            {getDisplaySizeFromShopifyVariant(product?.title)}
          </Text>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <View style={styles.selectorContainer}>
              {/* Minus Button */}
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleDecrement(itemId)}
                disabled={quantity === 1}
              >
                <Text allowFontScaling={false} style={styles.buttonText}>-</Text>
              </TouchableOpacity>

              {/* Quantity Value */}
              <Text allowFontScaling={false} style={styles.quantity}>{quantity}</Text>

              {/* Plus Button */}
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleIncrement(itemId)}
              >
                <Text allowFontScaling={false} style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveItem(itemId)}
              disabled={removingItemId === itemId}
            >
              {removingItemId === itemId ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text allowFontScaling={false} style={styles.removeButton}>Remove</Text>
              )}
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
        <Text allowFontScaling={false} style={styles.cartIndicator}>My Bag ({getTotalItems()})</Text>
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
          <Text allowFontScaling={false} style={styles.emptyCartText}>Your cart is empty.</Text>
        </View>
      )}

      <View style={styles.lowerCheckoutContainer}>
        {/* Total Section */}
        <View style={styles.costContainer}>
          <Text allowFontScaling={false} style={styles.total}>Estimated Total:</Text>
          <Text allowFontScaling={false} style={styles.cartTotal}>
            ${cart?.lines?.edges?.length > 0 ? totalPrice.toFixed(2) : "0.00"}
          </Text>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            { opacity: cart?.lines?.edges?.length > 0 ? 1 : 0.5 },
          ]}
          onPress={handleNavigateToCheckoutUpdated}
          disabled={cart?.lines?.edges?.length === 0} // Disable button when cart is empty
        >
          <Text allowFontScaling={false} style={styles.checkoutText}>Checkout</Text>
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
    contentFit: "contain",
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
