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

const ProductScreen = ({ route }) => {
  const { product } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Extract photos from product.images.edges
  const extractPhotos = (imagesEdges) => {
    return imagesEdges.map((edge, index) => ({
      id: index.toString(), // Unique id for each photo
      uri: edge.node.src, // Image URL
    }));
  };

  console.log(product.variants.edges[0].node.availableForSale);

  const photos = extractPhotos(product.images.edges);

  const getProductSize = (size) => {
    if (size === "S") {
      return "Small";
    } else if (size === "M") {
      return "Medium";
    } else if (size === "L") {
      return "Large";
    } else if (size === "XL") {
      return "XLarge";
    } else if (size === "2XL") {
      return "2XLarge";
    }
  };

  // Extract sizes from product.variants.edges
  const extractSizes = (variantsEdges) => {
    return variantsEdges.map((edge, index) => {
      const sizeOption = edge.node.selectedOptions.find(
        (option) => option.name === "Size" || option.name === "Title"
      ); // Check for "Size" or fallback to "Title"

      return {
        id: index.toString(), // Unique id for each size/variant
        label: getProductSize(sizeOption?.value) || "Default", // Use the value or fallback to "Default"
        available: edge.node.availableForSale, // Check if the variant is available for sale
      };
    });
  };

  // Use the function to extract sizes
  const sizes = extractSizes(product.variants.edges);

  const [selectedSize, setSelectedSize] = useState(
    sizes[0].label == "Default" ? null : "Medium"
  );

  const getSizeIndicator = (size) => {
    if (size === "Small") {
      return "S";
    } else if (size === "Medium") {
      return "M";
    } else if (size === "Large") {
      return "L";
    } else if (size === "XLarge") {
      return "XL";
    } else if (size === "2XLarge") {
      return "XXL";
    }
  };

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
        !item.available && styles.unavailableSize, // Apply unavailable style if not available
      ]}
      onPress={() => item.available && setSelectedSize(item.label)} // Prevent selection if not available
      disabled={!item.available} // Disable button if not available
    >
      <Text
        style={[
          styles.sizeText,
          selectedSize === item.label && styles.selectedSizeText,
          !item.available && styles.unavailableSizeText, // Apply unavailable text style
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

        {/* Pagination on Image */}
        {photos.length > 1 ? (
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
        ) : null}
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <View style={{ padding: 20 }}>
          {!product.variants.edges[0].node.availableForSale ? (
            <Text style={styles.productSoldOutTitle}>SOLD OUT</Text>
          ) : null}
          <Text style={styles.productTitle}>{product.title}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              ${product.variants.edges[0].node.price.amount}
            </Text>
            {product.variants.edges[0].node.compareAtPrice ? (
              <Text style={styles.originalPrice}>
                ${product.variants.edges[0].node.compareAtPrice.amount}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Size Selector */}
        {sizes[0].label == "Default" ? null : (
          <View style={styles.sizeContainer}>
            <View style={styles.topContainer}>
              <Text style={styles.sizeTitle}>
                Size{" "}
                <Text style={styles.sizeIndicator}>
                  {getSizeIndicator(selectedSize)}
                </Text>
              </Text>
              <TouchableOpacity style={styles.sizeGuideContainer}>
                <Text style={styles.sizeGuide}>Size Guide </Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={18}
                  color="#000"
                />
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
        )}

        {/* Buttons */}
        <View style={{ paddingTop: sizes[0].label == "Default" ? "0" : "20" }}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.applePayButton}>
              <Text style={styles.applePayText}> Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addToBagButton,
                {
                  backgroundColor: !product.variants.edges[0].node
                    .availableForSale
                    ? "grey"
                    : "#FF0000",
                },
              ]}
              disabled={!product.variants.edges[0].node.availableForSale} // Disable button if sold out
              onPress={() => {
                if (product.variants.edges[0].node.availableForSale) {
                  // Your Add to Bag logic here
                  console.log("Added to Bag");
                }
              }}
            >
              <Text style={styles.addToBagText}>Add to Bag</Text>
            </TouchableOpacity>
          </View>
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  productSoldOutTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "red",
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF0000",
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 18,
    color: "#A9A9A9",
    fontWeight: "bold",

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
  sizeIndicator: {
    fontSize: 16,
    fontWeight: "500",
    color: "#A09E9E",
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
  unavailableSize: {
    backgroundColor: "#E0E0E0",
    position: "relative",
  },
  unavailableSizeText: {
    color: "#A9A9A9",
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
    paddingLeft: 20,
    paddingRight: 20,
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
    // backgroundColor: "#FF0000",
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
