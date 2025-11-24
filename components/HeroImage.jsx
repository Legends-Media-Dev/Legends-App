import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchAllProductsCollection } from "../api/shopifyApi";
import { Image, ImageBackground } from "expo-image";

const { width, height } = Dimensions.get("window");
const HeroImage = ({
  title,
  subtitle,
  collectionHandle,
  image,
  onImageLoadEnd,
}) => {
  const navigation = useNavigation();

  const handlePress = async () => {
    const data = await fetchAllProductsCollection(collectionHandle);
    navigation.navigate("Collection", {
      handle: collectionHandle,
      title,
      products: data.products,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.99}>
      {image && (
        <ImageBackground
          source={{ uri: image }}
          style={styles.heroContainer}
          imageStyle={{ contentFit: "cover" }}
          transition={300}
        >
          <View style={styles.overlay}>
            <Text allowFontScaling={false} style={styles.heroTitle}>{title}</Text>
            {subtitle && <Text allowFontScaling={false} style={styles.heroSubtitle}>{subtitle}</Text>}
          </View>
        </ImageBackground>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    width: "100%",
    height: 680,
    justifyContent: "flex-end",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // This now covers the whole image
    justifyContent: "flex-end",
    paddingBottom: 40,
    paddingLeft: 20,
    paddingRight: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: "Futura-Bold",
    color: "#fff",
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Futura-Medium",
  },
});

export default HeroImage;
