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
    height: height,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal:30,
  },
  heroTitle: {
    fontSize: 50,
    fontFamily: "Futura-Medium",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Futura-Medium",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default HeroImage;
