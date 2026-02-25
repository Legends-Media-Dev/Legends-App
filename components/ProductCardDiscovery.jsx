import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";

const ProductCardDiscovery = ({ product, onPress }) => {
  const image = product?.images?.edges?.[0]?.node?.src;
  const variant = product?.variants?.edges?.[0]?.node;

  const price = parseFloat(variant?.price?.amount || 0);
  const compare = parseFloat(variant?.compareAtPrice?.amount || 0);
  const hasDiscount = compare > price;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          contentFit="cover"
        />
      </View>

      <Text numberOfLines={2} style={styles.name}>
        {product.title}
      </Text>

      <View style={styles.priceRow}>
        <Text style={[styles.price, hasDiscount && styles.discounted]}>
          ${price.toFixed(2)}
        </Text>

        {hasDiscount && (
          <Text style={styles.compare}>
            ${compare.toFixed(2)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 170,
    marginRight: 18,
  },

  imageWrapper: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  name: {
    fontSize: 14,
    fontFamily: "Futura-Medium",
    marginTop: 10,
    color: "#222",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },

  price: {
    fontSize: 14,
    fontFamily: "Futura-Bold",
    color: "#000",
  },

  discounted: {
    color: "#C8102F",
  },

  compare: {
    fontSize: 13,
    color: "#999",
    textDecorationLine: "line-through",
  },
});

export default ProductCardDiscovery;