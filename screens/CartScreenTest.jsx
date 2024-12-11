import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Cart</Text>
      <FlatList
        data={cart?.lines?.edges || []} // Ensure cart lines exist
        keyExtractor={(item) => item?.node?.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Text>{item?.node?.merchandise?.title || "Unknown Item"}</Text>
            <Text>
              Quantity: {item?.node?.quantity || 0} | Price: $
              {item?.node?.merchandise?.price?.amount || "N/A"}
            </Text>
          </View>
        )}
      />
      <Text style={styles.total}>
        Total: ${totalAmount} {currencyCode}
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
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cartItem: {
    marginBottom: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  checkoutButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CartScreen;
