import React, { useState, useEffect } from "react";
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
import { ScrollView } from "react-native-gesture-handler";
import LottieView from "lottie-react-native";

import { useCart } from "../context/CartContext"; // Import CartContext

const { width } = Dimensions.get("window");

const ProductScreen = ({ route }) => {
  const { product } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Extract photos from product.images.edges
  const extractPhotos = (imagesEdges) => {
    return imagesEdges.map((edge, index) => ({
      id: index.toString(), // Unique id for each photo
      uri: edge.node.src, // Image URL
    }));
  };

  const photos = extractPhotos(product.images.edges);

  // useEffect(() => {
  //   // Simulate loading images (this could be replaced with actual image loading logic)
  //   const imagePromises = photos.map((photo) => {
  //     return new Promise((resolve) => {
  //       Image.prefetch(photo.uri).then(resolve).catch(resolve);
  //     });
  //   });

  //   Promise.all(imagePromises).then(() => setIsLoading(false)); // Set loading to false after all images are loaded
  // }, [photos]);

  useEffect(() => {
    // Minimum loading time (e.g., 3 seconds)
    const minLoadingTime = 3000; // 3 seconds

    // Start the timer
    const timer = setTimeout(() => {
      setIsLoading(false); // Set loading to false after 3 seconds
    }, minLoadingTime);

    // Load images
    const imagePromises = photos.map((photo) => {
      return new Promise((resolve) => {
        Image.prefetch(photo.uri).then(resolve).catch(resolve);
      });
    });

    Promise.all(imagePromises).then(() => {
      // Ensure the loading animation lasts for the minimum time
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    });

    // Cleanup the timer
    return () => clearTimeout(timer);
  }, [photos]);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  // const photos = extractPhotos(product.images.edges);

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

  // Use the CartContext
  const { addItemToCart } = useCart();

  const handleAddToCart = async () => {
    console.log("testing add");
    console.log(product?.variants?.edges?.[0]?.node?.id);
    if (product?.variants?.edges?.[0]?.node?.id) {
      const variantId = product.variants.edges[0].node.id;
      try {
        console.log("Adding item to cart with variant ID:", variantId);
        await addItemToCart(variantId, quantity);
        alert("Added to cart!");
      } catch (error) {
        console.error("Error handling add to cart:", error);
      } finally {
        // closeModal();
        console.log("finsihed add");
      }
    } else {
      console.error("No variant ID available for the selected product.");
    }
  };

  // Extract sizes from product.variants.edges
  const extractSizes = (variantsEdges) => {
    return variantsEdges.map((edge, index) => {
      const sizeOption = edge.node.selectedOptions.find(
        (option) => option.name === "Size" || option.name === "Title"
      ); // Check for "Size" or fallback to "Title"

      console.log(edge.node);

      return {
        id: index.toString(), // Unique id for each size/variant
        label: getProductSize(sizeOption?.value) || "Default", // Use the value or fallback to "Default"
        available: edge.node.availableForSale, // Check if the variant is available for sale
      };
    });
  };

  // Use the function to extract sizes
  const sizes = extractSizes(product.variants.edges);

  // Automatically set the selected size to the first available one
  const [selectedSize, setSelectedSize] = useState(() => {
    const firstAvailable = sizes.find((size) => size.available);
    return firstAvailable ? firstAvailable.label : null;
  });

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

  // Render loading animation
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          style={{ width: 400, height: 400 }}
          source={require("../assets/data.json")}
          autoPlay
          loop
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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
        <View style={{ padding: 20, paddingBottom: 5 }}>
          {!product.variants.edges[0].node.availableForSale ? (
            <Text style={styles.productSoldOutTitle}>SOLD OUT</Text>
          ) : null}
          <Text style={styles.productTitle}>{product.title}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              $
              {parseFloat(product.variants.edges[0].node.price.amount).toFixed(
                2
              )}
            </Text>
            {product.variants.edges[0].node.compareAtPrice ? (
              <Text style={styles.originalPrice}>
                $
                {parseFloat(
                  product.variants.edges[0].node.compareAtPrice.amount
                ).toFixed(2)}
              </Text>
            ) : null}
          </View>
        </View>
        <View
          style={{
            height: "1",
            backgroundColor: "#D9D9D9",
            marginLeft: 20,
            marginRight: 20,
            marginBottom: 20,
          }}
        />
        <View style={{ paddingLeft: 20, paddingRight: 20, marginBottom: 40 }}>
          <Text style={styles.productDescription}>{product.description}</Text>
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
                  size={20}
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

        <View style={styles.quantityContainer}>
          <Text style={styles.sizeTitle}>Quantity:</Text>
          <View style={styles.selectorContainer}>
            {/* Minus Button */}
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleDecrement}
              disabled={quantity === 1}
            >
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>

            {/* Quantity Value */}
            <Text style={styles.quantity}>{quantity}</Text>

            {/* Plus Button */}
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncrement}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Buttons */}
        <View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.addToBagButton,
                {
                  backgroundColor: !product.variants.edges[0].node
                    .availableForSale
                    ? "grey"
                    : "black",
                },
              ]}
              disabled={!product.variants.edges[0].node.availableForSale} // Disable button if sold out
              onPress={handleAddToCart}
            >
              <Text style={styles.addToBagText}>Add to cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View>
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 30,
          }}
        >
          <Text style={styles.lowerCTAButton}>YOU MAY ALSO LIKE</Text>
        </View>
        {/* Call in code in kaylas section for showcasing products in a specific collection */}
      </View>
    </ScrollView>
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
    color: "#000",
    marginBottom: 10,
    fontFamily: "Futura-Bold",
  },
  lowerCTAButton: {
    fontSize: 30,
    fontFamily: "Futura-Bold",

    color: "#000",
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 15,
    color: "#A09E9E",
    fontFamily: "Futura-Medium",
  },
  productSoldOutTitle: {
    fontSize: 20,
    color: "C8102F",
    marginBottom: 10,
    fontFamily: "Futura-Bold",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 9,
  },
  currentPrice: {
    fontSize: 18,
    fontFamily: "Futura-Bold",

    color: "#C8102F",
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
    color: "#A09E9E",
    textDecorationLine: "line-through",
  },
  sizeContainer: {
    marginBottom: 20,
    gap: 13,
  },
  sizeTitle: {
    fontSize: 16,
    fontFamily: "Futura-Bold",
  },
  sizeIndicator: {
    fontSize: 16,
    fontFamily: "Futura-Medium",
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
    fontFamily: "Futura-Bold",
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
    borderRadius: 100,
  },
  addToBagText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Futura-Bold",
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

  quantityContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 10,
  },
  selectorContainer: {
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 1000,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    width: "35%",
    marginTop: 10,
  },
  quantityButton: {
    padding: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#000",
  },
  quantity: {
    fontSize: 14,
    fontWeight: 500,
    marginHorizontal: 15,
    fontFamily: "Futura-Medium",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#fff", // Ensure no content shows behind the loading animation
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});

export default ProductScreen;
