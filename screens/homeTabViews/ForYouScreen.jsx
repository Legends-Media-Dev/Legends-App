import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductCard from "../../components/ProductCard";
import { getRecentlyViewedProducts, clearRecentlyViewedProducts } from "../../utils/storage";
import { fetchProductById, fetchCustomerDetails } from "../../api/shopifyApi";

const ForYouScreen = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const getCustomerData = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("shopifyAccessToken");
        if (!accessToken) return;

        const customerDetails = await fetchCustomerDetails(accessToken);
        setCustomerData(customerDetails);
      } catch (error) {
        console.error("Error fetching customer details:", error);
      }
    };

    getCustomerData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchRecentlyViewed = async () => {
        try {
          setLoading(true);
          const productIds = await getRecentlyViewedProducts();
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
      <View style={{ paddingLeft: 20, paddingTop: 20 }}>
        {customerData && customerData.firstName ? (
          <Text style={styles.title}>Hi, {customerData.firstName}</Text>
        ) : (
          <Text style={styles.title}>Welcome Back!</Text>
        )}
      </View>

      <View style={{ paddingLeft: 20 }}>
        <Text style={styles.subheading}>Recently Viewed</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" />
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
        style={styles.clearButton}
        onPress={async () => {
          await clearRecentlyViewedProducts();
          setRecentlyViewed([]);
        }}
      >
        <Text style={styles.clearText}>Clear Recently Viewed</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 18,
    fontFamily: "Futura-Medium",
    marginTop: 10,
  },
  noProductsText: {
    fontSize: 14,
    color: "#888",
    marginTop: 20,
    textAlign: "center",
  },
  productList: {
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  clearButton: {
    backgroundColor: "#C8102F",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    marginLeft: 20,
    marginRight: 20,
  },
  clearText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default ForYouScreen;
