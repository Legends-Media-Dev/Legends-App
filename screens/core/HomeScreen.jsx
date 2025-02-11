import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
} from "react-native";
import ProductCard from "../../components/ProductCard";
import { useCart } from "../../context/CartContext";
import {
  fetchAllProductsCollection,
  fetchCollections,
} from "../../api/shopifyApi";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const { addItemToCart } = useCart();

  // Fetch collections for the carousel
  useEffect(() => {
    const getCollections = async () => {
      try {
        const data = await fetchCollections();
        console.log("Fetched collections:", data);
        setCollections(data || []); // Ensure valid data
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoadingCollections(false);
      }
    };

    getCollections();
  }, []);

  // Fetch all products for the grid
  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchAllProductsCollection(
          "gid://shopify/Collection/268601557146"
        );
        setProducts(data.products.edges.map((edge) => edge.node) || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    getProducts();
  }, []);

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

  if (loadingCollections || loadingProducts) {
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
        ListHeaderComponent={
          <>
            {/* Banner Image */}
            <Image
              source={require("../../assets/MainScreenBanner.jpeg")}
              style={styles.banner}
            />
          </>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  banner: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  noDataText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
  },
});

export default HomeScreen;
