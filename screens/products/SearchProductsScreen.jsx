import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Keyboard,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ProductCardMini from "../../components/ProductCardMini";

import {
  fetchAllProductsCollectionAdmin,
  searchProducts,
} from "../../api/shopifyApi";

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (query.trim().length === 0) {
          const data = await fetchAllProductsCollectionAdmin("new-release");
          setProducts(data.products || []);
        } else {
          const results = await searchProducts(query.trim());
          setProducts(results || []);
        }
      } catch (err) {
        console.error("Error loading products:", err);
      }
    };

    const debounce = setTimeout(loadProducts, 300); // wait for typing to stop
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = () => {
    if (query.trim()) {
      Keyboard.dismiss();
      navigation.navigate("SearchResults", { query });
    }
  };

  const renderProductItem = ({ item }) => {
    console.log(item.variants.edges);
    return (
      <TouchableOpacity
        style={styles.productWrapper}
        onPress={() => navigation.navigate("Product", { product: item })}
      >
        <ProductCardMini
          image={
            item.images.edges[0]?.node.src || "https://via.placeholder.com/100"
          }
          name={item.title || "No Name"}
          price={item.variants.edges[0]?.node.price || "N/A"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#000" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Search Products"
            placeholderTextColor={"#000"}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Suggested Section */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <Text style={styles.suggestedHeader}>Products</Text>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
  },
  searchBarContainer: {
    marginBottom: 12,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: "#ffffff",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Futura-Medium",
  },
  suggestedHeader: {
    fontSize: 16,
    fontFamily: "Futura-Bold",
    marginTop: 5,
    marginBottom: 5,
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  productImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginRight: 12,
  },
  productText: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
});

export default SearchScreen;
