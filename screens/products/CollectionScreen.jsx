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
import * as Haptics from "expo-haptics";
import ProductCardDiscovery from "../../components/ProductCardDiscovery";

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
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          numColumns={2}
          contentContainerStyle={[
            styles.flatListContent,
            products.length === 1 && { alignItems: "flex-start" },
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
    paddingBottom: 16,
    paddingTop: 0,
  },
  productWrapper: {
    width: width / 2,
    paddingHorizontal: 15,
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
