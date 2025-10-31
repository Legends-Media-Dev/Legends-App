import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Fuse from "fuse.js"; // 🆕 add this import
import ProductCardMini from "../../components/ProductCardMini";

import {
  fetchAllProductsCollection,
  searchProductsSF,
} from "../../api/shopifyApi";

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // 🆕 store all products for fuzzy search
  const navigation = useNavigation();

  // 🆕 Load all products once for local fuzzy searching
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const data = await fetchAllProductsCollection("all-product");
        const all = data?.products?.edges?.map((edge) => edge.node) || [];
        setAllProducts(all);
        setProducts(all); // show everything initially
      } catch (err) {
        console.error("Error loading all products:", err);
      }
    };
    loadAllProducts();
  }, []);

  // 🧠 helper for common typo normalization (optional but useful)
  const normalizeQuery = (input) => {
    let q = input.toLowerCase();
    q = q.replace(/hzts|h4ts|ha5s|ha+s/gi, "hats");
    q = q.replace(/shrits|shirs|shrit|shrt/gi, "shirts");
    q = q.replace(/hoddie|hodie|hoody/gi, "hoodie");
    return q.trim();
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (query.trim().length === 0) {
          setProducts(allProducts);
          return;
        }

        // 🆕 Use Fuse.js for fuzzy search
        const normalizedQuery = normalizeQuery(query);
        const fuse = new Fuse(allProducts, {
          keys: ["title", "description"],
          threshold: 0.4, // 0 = exact, 1 = very loose
        });

        const fuzzyResults = fuse.search(normalizedQuery);
        const matchedProducts = fuzzyResults.map((r) => r.item);

        // 🆕 If no fuzzy matches, fallback to Shopify search (for remote matches)
        if (matchedProducts.length === 0) {
          const results = await searchProductsSF(normalizedQuery);
          if (results && results.length > 0) {
            setProducts(results);
          } else {
            // Optional fallback to accessories if both fuzzy + search fail
            const fallback = await fetchAllProductsCollection("accessories");
            const fallbackProducts =
              fallback?.products?.edges?.map((edge) => edge.node) || [];
            setProducts(fallbackProducts);
          }
        } else {
          setProducts(matchedProducts);
        }
      } catch (err) {
        console.error("Error loading products:", err);
      }
    };

    const debounce = setTimeout(loadProducts, 300);
    return () => clearTimeout(debounce);
  }, [query, allProducts]);

  const handleSearch = () => {
    if (query.trim()) {
      Keyboard.dismiss();
      navigation.navigate("SearchResults", { query });
    }
  };

  const renderProductItem = ({ item }) => {
    const variant = item.variants.edges[0]?.node;
    const imageNode = item.images?.edges?.[0]?.node;
    const imageUrl = imageNode?.url || imageNode?.src || "..assets/Legends.png";

    return (
      <TouchableOpacity
        style={styles.productWrapper}
        activeOpacity={1}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate("Product", { product: item });
        }}
      >
        <ProductCardMini
          image={imageUrl}
          name={item.title || "No Name"}
          price={variant?.price}
          compareAtPrice={variant?.compareAtPrice}
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
    contentFit: "contain",
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
