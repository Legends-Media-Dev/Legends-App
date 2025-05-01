// Collection Screen
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import ProductCard from "../../components/ProductCard";
import { fetchAllProductsCollection } from "../../api/shopifyApi";

const { width, height } = Dimensions.get("window");

const CollectionScreen = ({ route, navigation }) => {
  const { handle, title } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const renderProductItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.productWrapper}
        onPress={() => navigation.navigate("Product", { product: item })}
      >
        <ProductCard
          image={
            item.images.edges[0]?.node.src || "https://via.placeholder.com/100"
          }
          name={item.title || "No Name"}
          price={
            item.variants.edges[0]?.node.price?.amount
              ? parseFloat(item.variants.edges[0].node.price.amount).toFixed(2)
              : "N/A"
          }
          compareAtPrice={
            item.variants.edges[0]?.node.compareAtPrice?.amount
              ? parseFloat(
                  item.variants.edges[0].node.compareAtPrice.amount
                ).toFixed(2)
              : null
          }
        />
      </TouchableOpacity>
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
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
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
    paddingBottom: 16,
    paddingTop: 0,
  },
  productWrapper: {
    width: width / 2,
    height: height / 3.3,
    padding: 8,
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
