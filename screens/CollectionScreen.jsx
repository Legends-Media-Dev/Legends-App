// Collection Screen
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import ProductCard from "../components/ProductCard";
import { fetchAllProductsCollection } from "../api/shopifyApi";

const { width, height } = Dimensions.get("window");

const CollectionScreen = ({ route, navigation }) => {
  const { collectionId, title } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchAllProductsCollection(collectionId);
        setProducts(data.products.edges.map((edge) => edge.node) || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [collectionId]);

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={{ width: "50%" }}
      onPress={() => navigation.navigate("Product", { product: item })}
    >
      <ProductCard
        image={
          item.images.edges[0]?.node.src || "https://via.placeholder.com/100"
        }
        name={item.title || "No Name"}
        price={item.variants.edges[0].node.price.amount || "N/A"}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        numColumns={2}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
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
    paddingTop: 0, // Prevent any unintended padding
  },
});

export default CollectionScreen;
