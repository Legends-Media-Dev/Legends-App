import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchAllProductsCollectionAdmin } from "../api/shopifyApi"; // only needed if you're navigating to a Collection screen

const ContentBox = ({
  topTitle,
  topColor = "#4CAF50",
  screenName,
  handle = null,
}) => {
  const navigation = useNavigation();

  const handlePress = async () => {
    try {
      if (handle) {
        // Navigate to a collection screen and pass the products
        const data = await fetchAllProductsCollectionAdmin(handle);
        navigation.navigate("Collection", {
          handle,
          title: topTitle,
          products: data.products,
        });
      } else {
        // Navigate normally if no handle
        navigation.navigate(screenName);
      }
    } catch (error) {
      console.error("Navigation error in ContentBox:", error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.99}
    >
      <View style={[styles.box, { backgroundColor: topColor }]}>
        <Text style={styles.title}>{topTitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: "100%",
    height: 160,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    padding: 16,
    marginTop: 2,
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: "Futura-Bold",
    color: "#fff",
  },
});

export default ContentBox;
