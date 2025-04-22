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
import { searchProducts, searchProductsSF } from "../../api/shopifyApi";
import ProductCard from "../../components/ProductCard";

const { width, height } = Dimensions.get("window");

const SearchResultsScreen = ({ route, navigation }) => {
  const { query } = route.params;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getResults = async () => {
      try {
        if (!query.trim()) {
          setResults([]); // optionally clear results
          setLoading(false);
          return;
        }

        setLoading(true);
        const products = await searchProductsSF(query.trim());
        setResults(products || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(getResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const renderItem = ({ item }) => {
    const variant = item.variants.edges[0]?.node;
    const rawAmount = variant?.price?.amount;
    const compareAt = variant?.compareAtPrice?.amount
      ? parseFloat(variant.compareAtPrice.amount).toFixed(2)
      : null;

    const price =
      rawAmount && !isNaN(Number(rawAmount)) ? Number(rawAmount) : null; // pass `null` if price is invalid

    return (
      <TouchableOpacity
        style={styles.productWrapper}
        onPress={() => navigation.navigate("Product", { product: item })}
      >
        <ProductCard
          image={
            item.images.edges[0]?.node.url || "https://via.placeholder.com/100"
          }
          name={item.title}
          price={price}
          compareAtPrice={compareAt}
        />
      </TouchableOpacity>
    );
  };

  return (
    <>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F2F2F2",
    width: "100%",
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
});

export default SearchResultsScreen;
