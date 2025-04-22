import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

const ProductCard = ({ image, name, price, compareAtPrice }) => {
  const hasDiscount =
    compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price);

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
      </View>

      <View style={styles.textContainer}>
        <Text numberOfLines={2} style={styles.productName}>
          {name}
        </Text>

        <View style={styles.priceContainer}>
          <Text
            style={[styles.productPrice, hasDiscount && styles.discountedPrice]}
          >
            ${parseFloat(price).toFixed(2)}
          </Text>

          {hasDiscount && (
            <Text style={styles.compareAtPrice}>
              ${parseFloat(compareAtPrice).toFixed(2)}
            </Text>
          )}
        </View>
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
    resizeMode: "cover",
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
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    marginTop: 5,
    gap: 8,
  },
  productPrice: {
    fontSize: 12,
    fontFamily: "Futura-Medium",
    color: "#000000",
  },
  discountedPrice: {
    color: "#C8102F",
    fontSize: 12,
    fontFamily: "Futura-Bold",
  },
  compareAtPrice: {
    fontSize: 12,
    fontFamily: "Futura-Medium",
    color: "#A09E9E",
    textDecorationLine: "line-through",
  },
});

export default ProductCard;
