import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const ProductScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("Medium");

  const photos = [
    {
      id: "1",
      uri: "https://legends.media/cdn/shop/files/1_8ed0d422-dbb6-4f0a-89a8-7c1df8dc1895.png?v=1733935782",
    },
    {
      id: "2",
      uri: "https://legends.media/cdn/shop/files/1_8ed0d422-dbb6-4f0a-89a8-7c1df8dc1895.png?v=1733935782",
    },
    {
      id: "3",
      uri: "https://legends.media/cdn/shop/files/1_8ed0d422-dbb6-4f0a-89a8-7c1df8dc1895.png?v=1733935782",
    },
  ];

  const sizes = [
    { id: "1", label: "Small" },
    { id: "2", label: "Medium" },
    { id: "3", label: "Large" },
    { id: "4", label: "XL" },
    { id: "5", label: "XXL" },
  ];

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => (
    <View style={styles.imageWrapper}>
      <Image source={{ uri: item.uri }} style={styles.productImage} />
    </View>
  );

  const renderSizeItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.sizeOption,
        selectedSize === item.label && styles.selectedSize,
      ]}
      onPress={() => setSelectedSize(item.label)}
    >
      <Text
        style={[
          styles.sizeText,
          selectedSize === item.label && styles.selectedSizeText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Product Image Carousel */}
      <View style={styles.imageContainer}>
        <FlatList
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false} // Disable the horizontal scroll bar
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onScroll={handleScroll}
          style={styles.carousel}
        />

        {/* Pagination Indicator */}
        <View style={styles.paginationContainer}>
          {photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.activeDot,
                {
                  width: `${100 / photos.length}%`, // Dynamic width
                },
              ]}
            />
          ))}
        </View>
      </View>
      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <View style={{ padding: 20 }}>
          <Text style={styles.productTitle}>Tshirt - Black Banana Evo</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>$30.00</Text>
            <Text style={styles.originalPrice}>$35.00</Text>
          </View>
        </View>
        {/* Size Selector */}
        <View style={styles.sizeContainer}>
          <View style={styles.topContainer}>
            <Text style={styles.sizeTitle}>Size</Text>
            <TouchableOpacity style={styles.sizeGuideContainer}>
              <Text style={styles.sizeGuide}>Size Guide </Text>
              <Ionicons name="chevron-forward-outline" size={18} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={{ paddingLeft: 10 }}>
            <FlatList
              data={sizes}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderSizeItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.sizeOptions}
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.applePayButton}>
            <Text style={styles.applePayText}> Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addToBagButton}>
            <Text style={styles.addToBagText}>Add to Bag</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    display: "flex",
  },
  imageWrapper: {
    width: width,
    height: width,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  carousel: {
    flexGrow: 0,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    width: "100%",
    bottom: 0,
    backgroundColor: "red",
  },
  paginationDot: {
    height: 5,
    backgroundColor: "#ccc",
  },
  activeDot: {
    backgroundColor: "#000",
  },
  favoriteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 15,
    padding: 5,
  },
  favoriteText: {
    fontSize: 16,
    color: "#000",
  },
  detailsContainer: {
    flex: 1,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF0000",
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 14,
    color: "#A9A9A9",
    textDecorationLine: "line-through",
  },
  sizeContainer: {
    marginBottom: 20,
    gap: 18,
  },
  sizeTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sizeOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  sizeOption: {
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 25,
    marginRight: 30,
    backgroundColor: "#E0E0E0",
  },
  selectedSize: {
    backgroundColor: "#000",
  },
  sizeText: {
    color: "#000",
    fontWeight: "600",
  },
  selectedSizeText: {
    color: "#fff",
  },
  sizeGuide: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  applePayButton: {
    backgroundColor: "#000",
    flex: 1,
    alignItems: "center",
    padding: 15,
    marginRight: 10,
    borderRadius: 5,
  },
  applePayText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  addToBagButton: {
    backgroundColor: "#FF0000",
    flex: 1,
    alignItems: "center",
    padding: 15,
    borderRadius: 5,
  },
  addToBagText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  topContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 20,
    paddingRight: 20,
  },
  sizeGuideContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default ProductScreen;
