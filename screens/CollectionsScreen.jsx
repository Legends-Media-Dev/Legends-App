import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { fetchCollections } from "../api/shopifyApi";

// Removed the Collection and Navigation prop type definitions

const CollectionsScreen = ({ navigation }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCollections = async () => {
      try {
        const data = await fetchCollections();
        setCollections(data);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };

    getCollections();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading collections...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.collectionContainer}
            onPress={() =>
              navigation.navigate("Products", {
                collectionId: item.id,
                title: item.title,
              })
            }
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>
              {item.description || "No description available."}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No collections found.</Text>
          </View>
        }
      />
      <View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={styles.cartText}>Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Futura-Medium",
    fontSize: 16,
    color: "#000",
  },
  collectionContainer: {
    margin: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontFamily: "Futura-Medium",
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  description: {
    fontFamily: "Futura-Medium",
    fontSize: 14,
    color: "#555",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontFamily: "Futura-Medium",
    fontSize: 16,
    color: "#888",
  },
  container: {
    // flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
  },
  cartButton: {
    padding: 10,
    backgroundColor: "#FF5A5F",
    borderRadius: 5,
    alignItems: "center",
  },
  cartText: {
    fontFamily: "Futura-Medium",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CollectionsScreen;
