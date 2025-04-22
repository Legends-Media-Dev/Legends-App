import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../context/CartContext";

const CartIconWithBadge = () => {
  const navigation = useNavigation();
  const { cartItemCount, cart } = useCart();

  return (
    <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
      <View style={styles.container}>
        <Ionicons name="bag-outline" size={24} color="#000" />
        {cartItemCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartItemCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 25,
    padding: 4,
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -4,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default CartIconWithBadge;
