import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const ProductCardMini = ({ image, name, price }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />

      <View style={styles.textContainer}>
        <Text numberOfLines={2} style={styles.productName}>
          {name}
        </Text>
        <Text style={styles.productPrice}>${parseFloat(price).toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    width: "100%",
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    borderRadius: 6,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 13,
    fontFamily: "Futura-Bold",
    color: "#444",
    textTransform: "uppercase",
  },
  productPrice: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: "Futura-Regular",
    color: "#000",
  },
});

export default ProductCardMini;
