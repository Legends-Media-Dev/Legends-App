import React from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  Image,
} from "react-native";
import RoundedBox from "../components/RoundedBox";
import ProductCard from "../components/ProductCard";
import { ScrollView } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

const data = [
  { id: "1", text: "Shop All" },
  { id: "2", text: "T-Shirts" },
  { id: "3", text: "Hoodies" },
  { id: "4", text: "Accessories" },
  { id: "5", text: "Sale" },
];

const MainScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Banner Image */}
      <Image
        source={require("../assets/MainScreenBanner.jpeg")}
        style={styles.banner}
      />

      {/* Carousel Section */}
      <View style={styles.carouselContainer}>
        <FlatList
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.carouselItem}>
              <RoundedBox
                width={width * 0.4}
                height={height * 0.05}
                isFilled={false}
                borderColor="#000"
                borderWidth={2}
                borderRadius={5}
                text={item.text}
                textColor="#000"
                textSize={16}
                onClick={() => console.log(`${item.text} clicked`)}
              />
            </View>
          )}
        />
      </View>

      {/* Product Card Section */}
      <View style={styles.productSection}>
        <ProductCard
            image="https://via.placeholder.com/200"
            name="Tshirt - Black Banana Evo"
            onLikePress={() => console.log("Liked Product 1")}
          />
          <ProductCard
            image="https://via.placeholder.com/200"
            name="Tshirt - Classic White"
            onLikePress={() => console.log("Liked Product 2")}
          />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  banner: {
    width:"100%",
    height: 180,
    resizeMode: "cover",
  },
  carouselContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.02, 
  },
  carouselItem: {
    marginHorizontal: 10, 
  },
  productSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: height * 0.02,
    paddingHorizontal: 10,
  },  
});

export default MainScreen;
