import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useCart } from "../context/CartContext";
import { createCheckout } from "../api/shopifyApi";

const CheckoutScreen = ({ navigation }) => {
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!cart || !cart.lines?.edges.length) {
      alert("Your cart is empty!");
      return;
    }

    setLoading(true);

    try {
      // Map cart lines to lineItems expected by createCheckout
      const lineItems = cart.lines.edges.map((line) => ({
        variantId: line.node.merchandise.id,
        quantity: line.node.quantity,
      }));

      const checkout = await createCheckout(lineItems);
      const { webUrl } = checkout;

      // Navigate to the Shopify-hosted checkout page
      navigation.navigate("WebViewScreen", { checkoutUrl: webUrl });
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Checkout</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  checkoutButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CheckoutScreen;
