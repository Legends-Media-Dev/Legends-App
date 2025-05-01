import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ProductCard from "../../components/ProductCard";
import { getRecentlyViewedProducts } from "../../utils/storage";
import { fetchProductById, fetchProductByIdAdmin } from "../../api/shopifyApi";
import { clearRecentlyViewedProducts } from "../../utils/storage";

const ForYouScreen = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastViewedIdsRef = useRef([]);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const fetchRecentlyViewed = async () => {
        setLoading(true);

        const productIds = await getRecentlyViewedProducts();

        const hasChanged =
          productIds.length !== lastViewedIdsRef.current.length ||
          productIds.some((id, i) => id !== lastViewedIdsRef.current[i]);

        if (!hasChanged) {
          setLoading(false);
          return;
        }

        lastViewedIdsRef.current = productIds;

        try {
          if (productIds && productIds.length > 0) {
            const products = await Promise.all(
              productIds.map(async (id) => {
                try {
                  return await fetchProductById(id);
                } catch (err) {
                  console.error(`Failed to fetch product ${id}:`, err);
                  return null;
                }
              })
            );

            setRecentlyViewed(products.filter(Boolean));
          } else {
            setRecentlyViewed([]);
          }
        } catch (error) {
          console.error("Error fetching recently viewed products:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchRecentlyViewed();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <View style={{ paddingLeft: 20 }}>
        <Text style={styles.subheading}>Recently Viewed</Text>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : recentlyViewed.length === 0 ? (
        <Text style={styles.noProductsText}>
          No recently viewed products yet.
        </Text>
      ) : (
        <FlatList
          data={recentlyViewed}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
          renderItem={({ item }) => {
            const variant = item.variants.edges[0]?.node;
            const price = parseFloat(variant?.price?.amount || "0").toFixed(2);
            const compareAt = variant?.compareAtPrice?.amount
              ? parseFloat(variant.compareAtPrice.amount).toFixed(2)
              : null;

            return (
              <TouchableOpacity
                style={{ width: 160, marginRight: 12 }}
                onPress={() =>
                  navigation.navigate("Product", { product: item })
                }
              >
                <ProductCard
                  image={
                    item.images.edges[0]?.node.src ||
                    "https://via.placeholder.com/100"
                  }
                  name={item.title || "No Name"}
                  price={price}
                  compareAtPrice={compareAt}
                />
              </TouchableOpacity>
            );
          }}
        />
      )}
      <TouchableOpacity
        style={{
          backgroundColor: "#C8102F",
          padding: 10,
          marginVertical: 10,
          borderRadius: 5,
          marginLeft: 20,
          marginRight: 20,
        }}
        onPress={async () => {
          await clearRecentlyViewedProducts();
          setRecentlyViewed([]);
        }}
      >
        <Text
          style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
        >
          Clear Recently Viewed
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Futura-Bold",
    marginTop: 20,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 18,
    fontFamily: "Futura-Medium",
    marginTop: 10,
  },
  loadingText: {
    fontSize: 14,
    color: "#888",
  },
  noProductsText: {
    fontSize: 14,
    color: "#888",
    marginTop: 10,
  },
  productList: {
    paddingBottom: 20,
    paddingLeft: 16,
  },
});

export default ForYouScreen;
