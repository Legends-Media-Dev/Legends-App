// // components/HeroImage.jsx
// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { fetchAllProductsCollectionAdmin } from "../api/shopifyApi";

// const { width, height } = Dimensions.get("window");

// const HeroImage = ({
//   title,
//   subtitle,
//   backgroundColor = "#000000",
//   collectionHandle = "new-release",
// }) => {
//   const navigation = useNavigation();

//   const handlePress = async () => {
//     try {
//       const data = await fetchAllProductsCollectionAdmin(collectionHandle);
//       navigation.navigate("Collection", {
//         handle: collectionHandle,
//         title: title,
//         products: data.products,
//       });
//     } catch (error) {
//       console.error("Error fetching new-release collection:", error);
//     }
//   };

//   return (
//     <TouchableOpacity
//       onPress={handlePress}
//       activeOpacity={1} // Set to 1 for no visual change on press, or 0.9 for subtle effect
//       style={[styles.heroContainer, { backgroundColor }]}
//     >
//       <View style={styles.overlay}>
//         <Text style={styles.heroTitle}>{title}</Text>
//         {subtitle && <Text style={styles.heroSubtitle}>{subtitle}</Text>}
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   heroContainer: {
//     width: "100%",
//     height: 680,
//     justifyContent: "flex-end",
//   },
//   overlay: {
//     padding: 20,
//   },
//   heroTitle: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   heroSubtitle: {
//     fontSize: 16,
//     color: "#fff",
//   },
// });

// export default HeroImage;
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchAllProductsCollection } from "../api/shopifyApi";

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
          imageStyle={{ resizeMode: "cover" }}
        >
          <View style={styles.overlay}>
            <Text style={styles.heroTitle}>{title}</Text>
            {subtitle && <Text style={styles.heroSubtitle}>{subtitle}</Text>}
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
