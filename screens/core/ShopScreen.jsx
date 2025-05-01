import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const getCollections = async () => {
      try {
        const data = await fetchCollections();
        setCollections(data || []);
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
        onPress={() => {
          if (item.handle && item.title) {
            handleCollectionPress(item.handle, item.title);
          } else {
            console.warn("Missing handle or title:", item);
          }
        }}
      >
        <Text style={styles.collectionText}>{item.title || "No Title"}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate("Search")}
        >
          <Text style={styles.searchButtonText}>Search Products</Text>
        </TouchableOpacity>

        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          renderItem={renderCollectionItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flatListContent: {
    paddingBottom: 16,
  },
  collectionItem: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3, // Shadow on android
    shadowColor: "#000", // Shadow on IOS
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  collectionText: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
    color: "#000",
  },
  searchButton: {
    backgroundColor: "#C8102F",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Futura-Bold",
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
