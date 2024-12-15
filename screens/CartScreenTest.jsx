import React, { useEffect } from "react";
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
  const { cart, getCartDetails } = useCart();

  useEffect(() => {
    getCartDetails();
  }, []);

  if (!cart) {
    return (
      <View style={styles.container}>
        <Text>Your cart is empty.</Text>
      </View>
    );
  }

  // Safely access properties using optional chaining
  const totalAmount = cart?.estimatedCost?.totalAmount?.amount || "N/A";
  const currencyCode = cart?.estimatedCost?.totalAmount?.currencyCode || "N/A";

  const handleNavigateToCheckout = () => {
    navigation.navigate("Checkout");
  };

  // Render each cart item
  const renderItem = ({ item }) => {
    const product = item?.node?.merchandise;
    const price = product?.price?.amount || "0.00";
    const compareAtPrice = product?.compareAtPrice?.amount || null;
    const quantity = item?.node?.quantity || 1;

    // Fetch product image safely
    const productImage =
      product?.product?.images?.edges?.[0]?.node?.src ||
      "https://via.placeholder.com/100";

    console.log(productImage);

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
          <Text style={styles.productTitle}>{product?.product?.title}</Text>
          <Text style={styles.productSize}>Large</Text>

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
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Cart Indicator */}
      <View style={styles.topContainer}>
        <Text style={styles.cartIndicator}>
          My Bag ({cart?.lines?.edges?.length || 0})
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
        Total: ${parseFloat(totalAmount).toFixed(2)} {currencyCode}
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
    fontSize: 18,
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
});

export default CartScreen;
