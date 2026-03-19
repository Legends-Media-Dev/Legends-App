import React, { useEffect, useState, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Fuse from "fuse.js";
import { fetchAllProductsCollection } from "../../api/shopifyApi";
import GlassHeader from "../../components/GlassHeader";
import { getScreenContentPadding } from "../../constants/layout";
import * as Haptics from "expo-haptics";
import ProductCardDiscovery from "../../components/ProductCardDiscovery";

const { width, height } = Dimensions.get("window");
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const COLLECTION_PADDING_HORIZONTAL = 12;

const SearchResultsScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { query } = route.params;
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // 🧠 Load all products for fuzzy search
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const data = await fetchAllProductsCollection("all-product");
        const all = data?.products?.edges?.map((edge) => edge.node) || [];
        setAllProducts(all);
      } catch (err) {
        console.error("Error loading all products:", err);
      } finally {
        setIsReady(true); // 🆕 mark data as ready for searching
      }
    };
    loadAllProducts();
  }, []);

  const normalizeQuery = (input) => {
    let q = input.toLowerCase();
    q = q.replace(/hzts|h4ts|ha5s|ha+s/gi, "hats");
    q = q.replace(/shrits|shirs|shrit|shrt/gi, "shirts");
    q = q.replace(/hoddie|hodie|hoody/gi, "hoodie");
    return q.trim();
  };

  // 🧠 Run fuzzy search after data loads
  useEffect(() => {
    if (!isReady) return; // 🆕 wait until products are loaded

    const runSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const normalized = normalizeQuery(query);

      const fuse = new Fuse(allProducts, {
        keys: ["title", "description"],
        threshold: 0.4,
      });

      const fuzzyResults = fuse.search(normalized);
      const matched = fuzzyResults.map((r) => r.item);

      setResults(matched);
      setLoading(false);
    };

    const debounce = setTimeout(runSearch, 250);
    return () => clearTimeout(debounce);
  }, [query, allProducts, isReady]);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.productWrapper}>
        <ProductCardDiscovery
          product={item}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate("Product", { product: item });
          }}
        />
      </View>
    );
  };

  if (!isReady || loading) {
    return (
      <View style={styles.container}>
        <GlassHeader variant="dark" scrollY={scrollY} />
        <View style={[styles.loadingOverlay, getScreenContentPadding(insets)]}>
          <ActivityIndicator size="small" />
        </View>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={styles.container}>
        <GlassHeader variant="dark" scrollY={scrollY} />
        <View style={[styles.emptyContainer, getScreenContentPadding(insets)]}>
          <Text allowFontScaling={false} style={styles.noResultsText}>No products found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GlassHeader variant="dark" scrollY={scrollY} />
      <AnimatedFlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
          results.length === 1 && { alignItems: "flex-start" },
          { paddingBottom: (insets?.bottom ?? 0) + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAFAFA",
    flex: 1,
  },
  productWrapper: {
    width: (width - 2 * COLLECTION_PADDING_HORIZONTAL) / 2,
    paddingHorizontal: 18,
    marginBottom: 24,
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
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsText: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
    fontFamily: "Futura-Medium",
  },
});

export default SearchResultsScreen;
