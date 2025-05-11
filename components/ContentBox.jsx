import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchAllProductsCollection } from "../api/shopifyApi";

const ContentBox = ({
  topTitle,
  topColor = "#4CAF50",
  screenName,
  handle = null,
  image = null,
  onPress = null, // Add optional custom handler
}) => {
  const navigation = useNavigation();

  const handlePress = async () => {
    if (onPress) {
      onPress(); // Call the custom handler
      return;
    }

    try {
      if (handle) {
        const data = await fetchAllProductsCollection(handle);
        navigation.navigate("Collection", {
          handle,
          title: topTitle,
          products: data.products,
        });
      } else if (screenName) {
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
      {image ? (
        <ImageBackground
          source={typeof image === "string" ? { uri: image } : image}
          style={styles.imageBox}
          imageStyle={styles.imageStyle}
        >
          <View style={styles.overlay}>
            <View style={styles.overlayContent}>
              <Text style={styles.title}>{topTitle}</Text>
            </View>
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.imageBox, { backgroundColor: topColor }]}>
          <Text style={styles.title}>{topTitle}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  imageBox: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  imageStyle: {
    resizeMode: "cover",
    borderRadius: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Full coverage
    justifyContent: "flex-end",
  },
  overlayContent: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: "Futura-Bold",
    color: "#fff",
    textTransform: "uppercase",
  },
});

export default ContentBox;
