import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";

const ProductCardMini = ({ image, name, price, compareAtPrice }) => {
  const priceAmount = parseFloat(price?.amount || 0);
  const compareAmount = parseFloat(compareAtPrice?.amount || 0);
  const hasDiscount = compareAmount > priceAmount;

  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} transition={300} style={styles.image} />

      <View style={styles.textContainer}>
        <Text allowFontScaling={false} numberOfLines={2} style={styles.productName}>
          {name}
        </Text>

        <View style={styles.priceRow}>
          <Text
            allowFontScaling={false}
            style={[styles.productPrice, hasDiscount && styles.discountedPrice]}
          >
            ${priceAmount.toFixed(2)}
          </Text>

          {hasDiscount && (
            <Text allowFontScaling={false} style={styles.compareAtPrice}>
              ${compareAmount.toFixed(2)}
            </Text>
          )}
        </View>
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
    contentFit: "contain",
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
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  productPrice: {
    fontSize: 13,
    fontFamily: "Futura-Medium",
    color: "#000",
  },
  discountedPrice: {
    color: "#C8102F",
    fontSize: 12,
    fontFamily: "Futura-Bold",
  },
  compareAtPrice: {
    fontSize: 13,
    fontFamily: "Futura-Medium",
    color: "#A09E9E",
    textDecorationLine: "line-through",
  },
});

export default ProductCardMini;
