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
import ProductCard from "../../components/ProductCard";
import { fetchAllProductsCollectionAdmin } from "../../api/shopifyApi";

const { width, height } = Dimensions.get("window");

const CollectionScreen = ({ route, navigation }) => {
  const { handle, title } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchAllProductsCollectionAdmin(handle);
        console.log("Fetched Admin products data:", data);
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [handle]);

  const renderProductItem = ({ item }) => {
    console.log(item.variants.edges);
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
          price={item.variants.edges[0]?.node.price || "N/A"}
        />
      </TouchableOpacity>
    );
  };

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
    backgroundColor: "#FFFFFF",
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
    height: height / 2.5,
    padding: 8,
  },
});

export default CollectionScreen;
