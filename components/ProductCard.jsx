import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

const ProductCard = ({ image, name, price }) => {
  return (
    <View style={styles.card}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
      </View>

      {/* Product Name */}
      <Text style={styles.productName}>{name}</Text>

      {/* Product Price */}
      <Text style={styles.productPrice}>${parseFloat(price).toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    // width: "45%",
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    margin: 10,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 160,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  productName: {
    textAlign: "left",
    fontSize: 11,
    fontFamily: "Futura-Bold",
    padding: 10,
  },
  productPrice: {
    textAlign: "left",
    fontSize: 10,
    fontFamily: "Futura-Medium",
    color: "#A09E9E",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
});

export default ProductCard;
