import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React, { useState, useEffect, useRef, useCallback } from "react";
import GlassHeader from "../../components/GlassHeader";
import AppRefreshControl from "../../components/AppRefreshControl";
import { useCart } from "../../context/CartContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import {
  fetchCollections,
  fetchAllProductsCollection,
  fetchAppCollectionsInfo,
} from "../../api/shopifyApi";
import { FlatList } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const SHOP_COLLECTION_DEFAULT_ORDER = [
  "ALL PRODUCT",
  "EASY ENTRIES",
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

const ShopScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { getCartDetails } = useCart();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCollections = useCallback(async () => {
    try {
      const [configList, shopifyCollections] = await Promise.all([
        fetchAppCollectionsInfo(),
        fetchCollections(),
      ]);

      const orderList =
        configList && configList.length > 0
          ? configList
          : SHOP_COLLECTION_DEFAULT_ORDER.map((label) => ({ label }));

      const mapped = [];
      for (const item of orderList) {
        const label = item.label ?? item;
        const handle = item.handle;
        const displayName = item.displayName ?? label;
        const match = shopifyCollections.find(
          (c) =>
            (handle && c.handle?.toLowerCase() === handle.toLowerCase()) ||
            (c.title?.trim().toUpperCase() === label.trim().toUpperCase())
        );
        if (match) {
          mapped.push({ ...match, title: displayName });
        }
      }

      setCollections(mapped);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadCollections(), getCartDetails?.()]);
    } catch (e) {
      console.error("Shop refresh:", e);
    } finally {
      setRefreshing(false);
    }
  }, [loadCollections, getCartDetails]);

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
          {item.title || "No Title"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <GlassHeader variant="dark" showSearchOnLeft scrollY={scrollY} />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" />
        </View>
      )}
      <View style={styles.container}>
        <AnimatedFlatList
          data={collections}
          keyExtractor={(item) => item.id}
          renderItem={renderCollectionItem}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <AppRefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              progressViewOffset={insets.top + 40}
            />
          }
          contentContainerStyle={[
            styles.flatListContent,
            { paddingTop: insets.top + 50 }
          ]}
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
