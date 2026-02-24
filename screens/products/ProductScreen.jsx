import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import ProductCard from "../../components/ProductCard";
import * as Haptics from "expo-haptics";

import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import { useCart } from "../../context/CartContext"; // Import CartContext
const { width } = Dimensions.get("window");
import AddToCartModal from "../../components/AddToCartModal";

import { getRecentlyViewedProducts, getCustomerInfo } from "../../utils/storage";
import {
  fetchProductById,
  fetchAllProductsCollection,
} from "../../api/shopifyApi";
import { addRecentlyViewedProduct } from "../../utils/storage";
import { Image } from "expo-image";
import { useGiveaway } from "../../context/GiveawayContext";

const TICKET_ICON_URI =
  "https://cdn.shopify.com/s/files/1/0003/8977/5417/files/admit_one_ticket.png?v=1683922022";

function getVipMultiplier(tags) {
  if (!Array.isArray(tags)) return 1;
  if (tags.includes("VIP Platinum")) return 10;
  if (tags.includes("VIP Gold")) return 5;
  if (tags.includes("VIP Silver")) return 2;
  if (tags.includes("Inactive Subscriber")) return 1;
  return 1;
}

const ProductScreen = ({ route, navigation }) => {
  const { addItemToCart } = useCart();
  const { multiplier: giveawayMultiplier } = useGiveaway();
  const { product } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const suggestedCacheRef = useRef([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const currentPrice = parseFloat(
    product.variants.edges[0]?.node.price?.amount || 0
  );
  const [showReminder, setShowReminder] = useState(false);
  const [customerTags, setCustomerTags] = useState(null);

  const compareAt = parseFloat(
    product.variants.edges[0]?.node.compareAtPrice?.amount || 0
  );

  const showGiveaway =
    giveawayMultiplier > 0 &&
    !Number.isNaN(currentPrice) &&
    currentPrice >= 0;
  const giveawayEntries = showGiveaway
    ? Math.floor(
      currentPrice *
      giveawayMultiplier *
      getVipMultiplier(customerTags ?? []) *
      quantity
    )
    : 0;

  const extractPhotos = (imagesEdges) => {
    return imagesEdges
      .map((edge, index) => {
        const uri = edge?.node?.url || edge?.node?.src;
        return uri ? { id: index.toString(), uri } : null;
      })
      .filter(Boolean); // Remove any null entries
  };

  const photos = extractPhotos(product.images.edges);

  useEffect(() => {
    const minLoadingTime = 500;
    const startTime = Date.now();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minLoadingTime);

    const imagePromises = photos.map((photo) => {
      return new Promise((resolve) => {
        Image.prefetch(photo.uri).then(resolve).catch(resolve);
      });
    });

    Promise.all(imagePromises).then(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    });

    if (product?.id) {
      addRecentlyViewedProduct(product.id);
    }

    getCustomerInfo().then((info) => {
      if (info?.tags) setCustomerTags(info.tags);
    });

    const fetchRecentProducts = async () => {
      const ids = await getRecentlyViewedProducts();
      const filteredIds = ids.filter((id) => id !== product.id); // exclude current

      const hasChanged =
        filteredIds.length !== suggestedCacheRef.current.length ||
        filteredIds.some((id, i) => id !== suggestedCacheRef.current[i]);

      if (!hasChanged) return;

      suggestedCacheRef.current = filteredIds;

      const products = await Promise.all(
        filteredIds.map(async (id) => {
          try {
            return await fetchProductById(id);
          } catch (err) {
            console.error(`Failed to fetch product ${id}`, err);
            return null;
          }
        })
      );

      setRecentProducts(products.filter(Boolean));
    };

    const fetchSuggestedProducts = async () => {
      try {
        const data = await fetchAllProductsCollection("new-release");
        const products = data?.products?.edges?.map((edge) => edge.node) || [];
        setSuggestedProducts(products);
      } catch (error) {
        console.error("Failed to fetch suggested products:", error);
      }
    };

    fetchSuggestedProducts();
    fetchRecentProducts();

    return () => clearTimeout(timer);
  }, [photos, product]);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const getProductSize = (size) => {
    if (!size) return null;

    if (size.toLowerCase().includes("small")) return "Small";
    if (size.toLowerCase().includes("medium")) return "Medium";
    if (
      size.toLowerCase().includes("large") &&
      !size.toLowerCase().includes("x")
    )
      return "Large";
    if (
      size.toLowerCase().includes("xlarge") &&
      !size.toLowerCase().includes("2x") &&
      !size.toLowerCase().includes("3x")
    )
      return "XLarge";
    if (size.toLowerCase().includes("2xlarge")) return "2XLarge";
    if (size.toLowerCase().includes("3xlarge")) return "3XLarge";

    return size;
  };

  const getShopifyVariantSize = (size) => {
    switch (size) {
      case "Small":
        return "Adult Small";
      case "Medium":
        return "Adult Medium";
      case "Large":
        return "Adult Large";
      case "XLarge":
        return "Adult XLarge";
      case "2XLarge":
        return "Adult 2XLarge";
      case "3XLarge":
        return "Adult 3XLarge";
      default:
        return size;
    }
  };

  const handleAddToCart = async () => {
    const mappedSize = getShopifyVariantSize(selectedSize);
    const matchingVariant = product.variants.edges.find((edge) => {
      const option = edge.node.selectedOptions.find(
        (opt) => opt.name === "Size" || opt.name === "Title"
      );
      return option?.value === mappedSize;
    });

    if (!matchingVariant) {
      console.error("❌ No matching variant found for selected size.");
      return;
    }

    const variantId = matchingVariant.node.id;

    try {
      setIsAddingToCart(true); // start loading
      await addItemToCart(variantId, quantity);
      setShowReminder(true);
      // alert("Added to cart!");
    } catch (error) {
      console.error("Error handling add to cart:", error);
      alert("Something went wrong while adding to cart.");
    } finally {
      setIsAddingToCart(false); // end loading
    }
  };

  const extractSizes = (variantsEdges) => {
    return variantsEdges.map((edge, index) => {
      const sizeOption = edge.node.selectedOptions.find(
        (option) => option.name === "Size" || option.name === "Title"
      );

      return {
        id: index.toString(),
        label: getProductSize(sizeOption?.value) || "Default",
        available: edge.node.availableForSale,
      };
    });
  };

  const sizes = extractSizes(product.variants.edges);
  const [selectedSize, setSelectedSize] = useState(() => {
    const firstAvailable = sizes.find((size) => size.available);
    return firstAvailable ? firstAvailable.label : null;
  });

  const getSizeIndicator = (size) => {
    switch (size) {
      case "Small":
        return "S";
      case "Medium":
        return "M";
      case "Large":
        return "L";
      case "XLarge":
        return "XL";
      case "2XLarge":
        return "XXL";
      case "3XLarge":
        return "XXXL"; // ✅ Add this
      default:
        return ""; // fallback
    }
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => (
    <View style={styles.imageWrapper}>
      <Image
        transition={300}
        source={{ uri: item.uri }}
        style={styles.productImage}
      />
    </View>
  );

  return (
    <>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" />
        </View>
      )}
      <AddToCartModal
        visible={showReminder}
        onClose={() => setShowReminder(false)}
        onGoToCart={() => {
          setShowReminder(false);
          navigation.navigate("Cart");
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.imageContainer}>
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
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
            {!product.variants.edges.some((v) => v.node.availableForSale) ? (
              <Text allowFontScaling={false} style={styles.productSoldOutTitle}>SOLD OUT</Text>
            ) : null}

            <Text allowFontScaling={false} style={styles.productTitle}>{product.title}</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceBlock}>
                <Text allowFontScaling={false} style={styles.currentPrice}>
                  ${currentPrice.toFixed(2)}
                </Text>
                {compareAt > currentPrice && (
                  <Text allowFontScaling={false} style={styles.originalPrice}>
                    ${compareAt.toFixed(2)}
                  </Text>
                )}
              </View>
              {showGiveaway && giveawayEntries > 0 && (
                <View style={styles.entriesBadge}>
                  <Image
                    source={{ uri: TICKET_ICON_URI }}
                    style={styles.entriesTicketIcon}
                  />
                  <Text allowFontScaling={false} style={styles.entriesText}>
                    {giveawayEntries} ENTRIES
                  </Text>
                </View>
              )}
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
            <Text allowFontScaling={false} style={styles.productDescription}>{product.description}</Text>
          </View>

          {/* Size Selector */}
          {sizes[0].label == "Default Title" ? null : (
            <View style={styles.sizeContainer}>
              <View style={styles.topContainer}>
                <Text allowFontScaling={false} style={styles.sizeTitle}>
                  Size:{" "}
                  <Text allowFontScaling={false} style={styles.sizeIndicator}>
                    {getSizeIndicator(selectedSize)}
                  </Text>
                </Text>
                {/* <TouchableOpacity style={styles.sizeGuideContainer}>
                  <Text allowFontScaling={false} style={styles.sizeGuide}>Size Guide </Text>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={20}
                    color="#000"
                  />
                </TouchableOpacity> */}
              </View>
              <View style={{ paddingLeft: 10 }}>
                <View style={styles.gridContainer}>
                  {sizes.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.sizeOption,
                        selectedSize === item.label && styles.selectedSize,
                        !item.available && styles.unavailableSize,
                      ]}
                      onPress={async () => {
                        if (item.available) {
                          await Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light
                          );
                          setSelectedSize(item.label);
                          console.log(selectedSize);
                        }
                      }}
                      disabled={!item.available}
                    >
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.sizeText,
                          selectedSize === item.label &&
                          styles.selectedSizeText,
                          !item.available && styles.unavailableSizeText,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          <View style={styles.quantityContainer}>
            <Text allowFontScaling={false} style={styles.sizeTitle}>Quantity:</Text>
            <View style={styles.selectorContainer}>
              {/* Minus Button */}
              <TouchableOpacity
                style={styles.quantityButton}
                activeOpacity={1}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleDecrement();
                }}
                disabled={quantity === 1}
              >
                <Text allowFontScaling={false} style={styles.buttonText}>-</Text>
              </TouchableOpacity>

              {/* Quantity Value */}
              <Text allowFontScaling={false} style={styles.quantity}>{quantity}</Text>

              {/* Plus Button */}
              <TouchableOpacity
                style={styles.quantityButton}
                activeOpacity={1}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleIncrement();
                }}
              >
                <Text allowFontScaling={false} style={styles.buttonText}>+</Text>
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
                    backgroundColor: product.variants.edges.some(
                      (v) => v.node.availableForSale
                    )
                      ? "black"
                      : "grey",
                  },
                ]}
                disabled={
                  !product.variants.edges.some(
                    (v) => v.node.availableForSale
                  ) || isAddingToCart // disable during loading
                }
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  await handleAddToCart();
                }}
              >
                {isAddingToCart ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text allowFontScaling={false} style={styles.addToBagText}>Add to cart</Text>
                )}
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
            <Text allowFontScaling={false} style={styles.lowerCTAButton}>YOU MAY ALSO LIKE</Text>
          </View>
          {suggestedProducts.length > 0 && (
            <FlatList
              data={suggestedProducts}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20, paddingBottom: 20 }}
              renderItem={({ item }) => {
                const variant = item.variants.edges[0]?.node;
                const price = parseFloat(variant?.price?.amount || "0").toFixed(
                  2
                );
                const compareAt = variant?.compareAtPrice?.amount
                  ? parseFloat(variant.compareAtPrice.amount).toFixed(2)
                  : null;

                return (
                  <TouchableOpacity
                    style={{ width: 180, marginRight: 12 }}
                    onPress={() =>
                      navigation.push("Product", { product: item })
                    }
                  >
                    <ProductCard
                      image={
                        item.images.edges[0]?.node.src || "..assets/Legends.png"
                      }
                      name={item.title || "No Name"}
                      price={
                        item.variants.edges[0]?.node.price?.amount
                          ? parseFloat(
                            item.variants.edges[0].node.price.amount
                          ).toFixed(2)
                          : "N/A"
                      }
                      compareAtPrice={
                        item.variants.edges[0]?.node.compareAtPrice?.amount
                          ? parseFloat(
                            item.variants.edges[0].node.compareAtPrice.amount
                          ).toFixed(2)
                          : null
                      }
                      availableForSale={
                        !item.variants.edges.every(
                          (variantEdge) => !variantEdge.node.availableForSale
                        )
                      }
                    />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </ScrollView>
    </>
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
    contentFit: "cover",
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
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  priceBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  currentPrice: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
    color: "#C8102F",
    marginRight: 0,
  },
  originalPrice: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
    color: "#A09E9E",
    textDecorationLine: "line-through",
  },
  entriesBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  entriesTicketIcon: {
    width: 24,
    height: 24,
  },
  entriesText: {
    fontFamily: "Futura-Bold",
    fontSize: 14,
    color: "#000",
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
    textDecorationLine: "line-through",
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  sizeOption: {
    alignSelf: "flex-start", // allow it to wrap naturally
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20, // gives it that pill shape and space around text
    backgroundColor: "#E0E0E0",
    margin: 5,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "start",
    paddingHorizontal: 10,
  },
});

export default ProductScreen;
