import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Fuse from "fuse.js";
import { fetchAllProductsCollection } from "../../api/shopifyApi";
import ProductCard from "../../components/ProductCard";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

const SearchResultsScreen = ({ route, navigation }) => {
  const { query } = route.params;
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false); // 🆕 ensures products loaded before showing anything

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
    const variant = item?.variants?.edges?.[0]?.node;

    // 🖼️ Image fallback
    const imageNode = item?.images?.edges?.[0]?.node;
    const imageUrl =
      imageNode?.url ||
      imageNode?.src ||
      item?.featuredImage?.url ||
      "../assets/Legends.png";

    const compareAt = variant?.compareAtPrice?.amount
      ? parseFloat(variant.compareAtPrice.amount).toFixed(2)
      : null;

    return (
      <TouchableOpacity
        style={styles.productWrapper}
        activeOpacity={1}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate("Product", { product: item });
        }}
      >
        <ProductCard
          image={imageUrl}
          name={item.title || "No Name"}
          price={
            variant?.price?.amount
              ? parseFloat(variant.price.amount).toFixed(2)
              : "N/A"
          }
          compareAtPrice={compareAt}
          availableForSale={variant?.availableForSale}
        />
      </TouchableOpacity>
    );
  };

  // 🧩 unified render logic (no flicker)
  if (!isReady || loading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noResultsText}>No products found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F2F2F2",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productWrapper: {
    width: width / 2,
    height: height / 3.3,
    padding: 8,
  },
  flatListContent: {
    paddingBottom: 16,
    paddingTop: 0,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  noResultsText: {
    textAlign: "center",
    color: "gray",
    fontSize: 16,
    fontFamily: "Futura-Medium",
  },
});

export default SearchResultsScreen;
