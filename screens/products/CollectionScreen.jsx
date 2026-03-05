// Collection Screen
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassHeader from "../../components/GlassHeader";
import { getScreenContentPadding } from "../../constants/layout";

/** Tighter side padding on collection so grid has more room and clearer gap between columns */
const COLLECTION_PADDING_HORIZONTAL = 12;
import ProductCard from "../../components/ProductCard";
import { fetchAllProductsCollection } from "../../api/shopifyApi";
import * as Haptics from "expo-haptics";
import ProductCardDiscovery from "../../components/ProductCardDiscovery";

const { width, height } = Dimensions.get("window");

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const CollectionScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { handle, title } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchAllProductsCollection(handle);
        const edges = data.products?.edges || [];
        const productNodes = edges.map((edge) => edge.node); // extract actual products
        setProducts(productNodes);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [handle]);

  // console.log(products[1].variants.edges[0].node.availableForSale);
  const renderProductItem = ({ item }) => {
    const allVariants = item.variants.edges.map((edge) => edge.node);
    const isSoldOut = allVariants.every(
      (variant) => !variant.availableForSale
    );

    return (
      <View style={styles.productWrapper}>
        <ProductCardDiscovery
          product={item}
          onPress={async () => {
            await Haptics.impactAsync(
              Haptics.ImpactFeedbackStyle.Medium
            );
            navigation.navigate("Product", { product: item });
          }}
        />
      </View>
    );
  };

  return (
    <>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" />
        </View>
      )}
      <View style={styles.container}>
        <GlassHeader variant="dark" scrollY={scrollY} />
        <AnimatedFlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={<View style={styles.listTopSpacer} />}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.flatListContent,
            getScreenContentPadding(insets),
            { paddingHorizontal: COLLECTION_PADDING_HORIZONTAL },
            products.length === 1 && { alignItems: "flex-start" },
            { paddingBottom: (insets?.bottom ?? 0) + 90 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  flatListContent: {
    paddingTop: 0,
    alignItems: "center",
  },
  columnWrapper: {
    flexDirection: "row",
    width: width - 2 * COLLECTION_PADDING_HORIZONTAL,
    justifyContent: "flex-start",
  },
  listTopSpacer: {
    height: 12,
  },
  productWrapper: {
    width: (width - 2 * COLLECTION_PADDING_HORIZONTAL) / 2,
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: "#F2F2F2", // match your background
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CollectionScreen;
