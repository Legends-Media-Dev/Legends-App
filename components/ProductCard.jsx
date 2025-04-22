import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

const ProductCard = ({ image, name, price }) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
      </View>

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
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 12,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "conver",
    borderRadius: 12,
  },
  textContainer: {
    width: "90%",
  },
  productName: {
    textAlign: "left",
    fontSize: 12,
    fontFamily: "Futura-Bold",
    paddingHorizontal: 8,
    color: "#000000",
    textTransform: "uppercase",
    lineHeight: 16,
  },
  productPrice: {
    marginTop: 5,
    textAlign: "left",
    fontSize: 12,
    fontFamily: "Futura-Regular",
    paddingHorizontal: 8,
    color: "#000000",
  },
});

export default ProductCard;
