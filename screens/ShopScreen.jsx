import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { fetchCollections } from "../api/shopifyApi";
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
            console.log("Fetched collections: ", data);
            setCollections(data || []);
        } catch (error) {
            console.error("Error fetching collections:", error);
        } finally {
            setLoading(false);
        }
    };
    getCollections();
  }, []);

  const renderCollectionItem = ({ item }) => (
    <TouchableOpacity
        style ={styles.collectionItem}
        onPress={() =>
            navigation.navigate("Collection", {
                collectionId: item.id,
                title: item.title,
            })
        }
    >
        <Text style={styles.collectionText}>{item.title || "No Title"}</Text>
    </TouchableOpacity>
  )

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
        <FlatList
            data={collections}
            keyExtractor={(item) => item.id}
            renderItem={renderCollectionItem}
            contentContainerStyle={styles.flatListContent}
        />
    </View>
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
  });

export default ShopScreen;
