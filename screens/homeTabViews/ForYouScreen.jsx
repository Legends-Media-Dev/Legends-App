import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductCard from "../../components/ProductCard";
import { getRecentlyViewedProducts } from "../../utils/storage";
import { fetchProductById, fetchCustomerDetails, fetchAllProductsCollection } from "../../api/shopifyApi";
import vipBackground from "../../assets/vip-dark-background.png";

const ForYouScreen = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);
  const navigation = useNavigation();
  const [tshirtData, setTshirtData] = useState([]);
  const [vipProducts, setVipProducts] = useState([]);
  const [loadingVIPProducts, setLoadingVIPProducts] = useState([]);

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

    const fetchHeroTs = async () => {
      try {
        const collection = await fetchAllProductsCollection("tshirts");
        setTshirtData(collection.products.edges.map((edge) => edge.node));
      } catch (err) {
        console.error("Failed to load hero image:", err);
      } finally {
        setHeroImageLoadingTs(false);
      }
    };

    const fetchVIPProducts = async () => {
      try {
        const collection = await fetchAllProductsCollection("free-vip-digital-downloads");
        const products = collection?.products?.edges.map((edge) => edge.node) || [];
        if (products.length > 0) {
          setVipProducts(products);
        }
      } catch (err) {
        console.error("Error fetching VIP product:", err);
      } finally {
        setLoadingVIPProducts(false);
      }
    };
    
    fetchVIPProducts();
    fetchHeroTs();
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

      {customerData?.tags?.includes("VIP Gold") ||
      customerData?.tags?.includes("Active Subscriber") ? (
        loadingVIPProducts ? (
          <ActivityIndicator style={{ marginTop: 20 }} size="large" />
        ) : vipProducts ? (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Collection", {
                handle: "free-vip-digital-downloads",
                title: "VIP Exclusive Downloads",
              })
            }
            activeOpacity={0.9}
          >
            <ImageBackground
              source={vipBackground}
              style={styles.vipCard}
              imageStyle={styles.vipCardImage}
            >
              <View style={styles.vipCardContent}>
                <Text style={styles.vipExclusiveButtonText}>VIP Exclusive Product</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ) : null
      ) : (
        <TouchableOpacity
          onPress={() => navigation.navigate("JoinVIPScreen")}
          activeOpacity={0.9}
        >
          <ImageBackground
            source={vipBackground}
            style={styles.vipCard}
            imageStyle={styles.vipCardImage}
          >
            <View style={styles.vipCardContent}>
              <Text style={styles.vipTitle}>JOIN VIP</Text>
              <Text style={styles.vipText}>
                Get early access to drops, giveaways, and limited releases.
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      )}

      <View style={styles.sectionHeader}>
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

      <View style={styles.sectionHeader}>
        <Text style={styles.subheading}>TSHIRTS</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" />
      ) : tshirtData.length === 0 ? (
        <Text style={styles.noProductsText}>
          Error fetching Tshirts
        </Text>
      ) : (
        <FlatList
          data={tshirtData}
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
    fontSize: 15,
    fontFamily: "Futura-Bold",
    marginTop: 10,
  },
  noProductsText: {
    fontSize: 14,
    color: "#888",
    marginTop: 20,
    textAlign: "center",
  },
  productList: {
    paddingHorizontal: 20,
  },
  vipCard: {
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  vipCardImage: {
    resizeMode: "cover",
    borderRadius: 12,
  },
  vipCardContent: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  vipTitle: {
    fontSize: 40,
    fontFamily: "Futura-Bold",
    marginBottom: 6,
    color: "#FFFFFF",
  },
  vipText: {
    fontSize: 10,
    fontFamily: "Futura-Medium",
    color: "#FAF3E0",
    marginBottom: 12,
  },
  vipButton: {
    backgroundColor: "#C8102F",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: "center",
  },
  vipButtonText: {
    color: "#fff",
    fontFamily: "Futura-Medium",
    fontSize: 14,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  vipBannerWrapper: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  
  vipExclusiveButton: {
    backgroundColor: "#C8102F",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  
  vipExclusiveButtonText: {
    color: "#fff",
    fontFamily: "Futura-Bold",
    fontSize: 16,
  },  
});

export default ForYouScreen;
