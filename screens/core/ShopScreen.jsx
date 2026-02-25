import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React, { useState, useEffect } from "react";
import GlassHeader from "../../components/GlassHeader";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  fetchCollections,
  fetchAllProductsCollection,
} from "../../api/shopifyApi";
import { FlatList } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

const ShopScreen = () => {
  const navigation = useNavigation();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const collectionLabelMap = {
    "all-product": "SHOP ALL",
    "mystery-deals": "MYSTERY DEALS",
    "new-release": "NEW RELEASE",
    tshirts: "TSHIRTS",
    hoodies: "HOODIES",
    accessories: "ACCESSORIES",
    stickers: "STICKERS",
    "digital-downloads": "DOWNLOADS",
    "last-chance-offers": "LAST CHANCE OFFERS",
    "learn-more-vip": "JOIN VIP",
  };

  useEffect(() => {
    const desiredOrder = [
      "ALL PRODUCT",
      "MYSTERY DEALS",
      "NEW RELEASE",
      "TSHIRTS",
      "HOODIES",
      "ACCESSORIES",
      "STICKERS",
      "DIGITAL DOWNLOADS",
      "LAST CHANCE OFFERS",
      "LEARN MORE - VIP",
    ];

    const getCollections = async () => {
      try {
        const data = await fetchCollections();
        const mapped = [];

        // Match Shopify collection titles to their desired position
        for (let title of desiredOrder) {
          const match = data.find(
            (c) => c.title.trim().toUpperCase() === title.trim().toUpperCase()
          );
          if (match) mapped.push(match);
        }

        setCollections(mapped);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };

    getCollections();
  }, []);

  const handleCollectionPress = async (handle, title) => {
    try {
      const data = await fetchAllProductsCollection(handle); // Uses Admin API
      navigation.navigate("Collection", {
        handle,
        title,
        products: data.products,
      });
    } catch (error) {
      console.error("Error fetching collection products:", error);
    }
  };

  const renderCollectionItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.collectionItem}
        activeOpacity={1}
        onPress={async () => {
          if (item.handle && item.title) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Trigger haptic
            handleCollectionPress(item.handle, item.title);
          } else {
            console.warn("Missing handle or title:", item);
          }
        }}
      >
        <Text allowFontScaling={false} style={styles.collectionText}>
          {collectionLabelMap[item.handle] || item.title || "No Title"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <GlassHeader />
  
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" />
        </View>
      )}
  
      <View style={styles.container}>
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          renderItem={renderCollectionItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      </View>
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
  flatListContent: {
    paddingTop: 120,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  collectionItem: {
    backgroundColor: "#F8F8F8",
    borderRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 8, // was 8
    marginHorizontal: 4, // NEW
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15, // increased a bit
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  collectionText: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
    color: "#000",
  },
  searchButton: {
    backgroundColor: "#C8102F",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Futura-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: "#FFFFFF", // Match background
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ShopScreen;
