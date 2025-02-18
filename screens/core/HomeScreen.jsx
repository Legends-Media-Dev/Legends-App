import React, { useState, useEffect, Component } from "react";
import { Animated, StatusBar, StyleSheet, View, FlatList, Dimensions, Image, Text, TouchableOpacity } from "react-native";
import { TabView, SceneMap } from 'react-native-tab-view';
import ProductCard from "../../components/ProductCard";
import { useCart } from "../../context/CartContext";
import { fetchAllProductsCollection, fetchCollections } from "../../api/shopifyApi";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

const ForYou = () => (
  <ScrollView style={[styles.container]} >
      <Text>
        Hello
      </Text>
  </ScrollView>
);

const News = () => (
  <ScrollView style={[styles.container]} >
  </ScrollView>
)

class HomeScreen extends Component {
  // const navigation = useNavigation();
  // const [collections, setCollections] = useState([]);
  // const [products, setProducts] = useState([]);
  // const [loadingCollections, setLoadingCollections] = useState(true);
  // const [loadingProducts, setLoadingProducts] = useState(true);

  //const { addItemToCart } = useCart();

  constructor(props) {
    super(props);

    this.state = {
      index: 0,
      routes: [
        { key: "forYou", title: "FOR YOU" },
        { key: "news", title: "NEWS" }
      ],
    };
  }

  _handleIndexChange = (index) => {
    this.setState({ index });
  };

  _renderTabBar = (props) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);

    return (
      <View style={styles.tabBar}>
        {props.navigationState.routes.map((route, i) => {
          const opacity = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map((inputIndex) =>
              inputIndex === i ? 1 : 0.5
            ),
          });

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={() => this.setState({ index: i })}
            >
              <Animated.Text style={[styles.tabText, { opacity }]}>
                {route.title}
              </Animated.Text>

              {/* Red Line for Active Tab */}
              {this.state.index === i && <View style={styles.activeTabLine} />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  _renderScene = SceneMap({
    forYou: ForYou,
    news: News,
  });

  render() {
    return (
      <TabView
        navigationState={this.state}
        renderScene={this._renderScene}
        renderTabBar={this._renderTabBar}
        onIndexChange={this._handleIndexChange}
      />
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingTop: StatusBar.currentHeight,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    padding: 16,
  },
  tabText: {
    fontSize: 15,
    fontFamily: "Futura-Medium",
  },
  activeTabLine: {
    position: "absolute",
    bottom: 0,
    right: "10%",
    left: "10%",
    width: "100%",
    height: 2, 
    backgroundColor: "red",
    //borderRadius: 2,
  },
});

export default HomeScreen;




  // Fetch collections for the carousel
  // useEffect(() => {
  //   const getCollections = async () => {
  //     try {
  //       const data = await fetchCollections();
  //       console.log("Fetched collections:", data);
  //       setCollections(data || []); // Ensure valid data
  //     } catch (error) {
  //       console.error("Error fetching collections:", error);
  //     } finally {
  //       setLoadingCollections(false);
  //     }
  //   };

  //   getCollections();
  // }, []);

  // Fetch all products for the grid
  // useEffect(() => {
  //   const getProducts = async () => {
  //     try {
  //       const data = await fetchAllProductsCollection(
  //         "gid://shopify/Collection/268601557146"
  //       );
  //       setProducts(data.products.edges.map((edge) => edge.node) || []);
  //     } catch (error) {
  //       console.error("Error fetching products:", error);
  //     } finally {
  //       setLoadingProducts(false);
  //     }
  //   };

  //   getProducts();
  // }, []);

  // const renderProductItem = ({ item }) => (
  //   <TouchableOpacity
  //     style={{ width: "50%" }}
  //     onPress={() => navigation.navigate("Product", { product: item })}
  //   >
  //     <ProductCard
  //       image={
  //         item.images.edges[0]?.node.src || "https://via.placeholder.com/100"
  //       }
  //       name={item.title || "No Name"}
  //       price={item.variants.edges[0].node.price.amount || "N/A"}
  //     />
  //   </TouchableOpacity>
  // );

  // if (loadingCollections || loadingProducts) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <Text>Loading...</Text>
  //     </View>
  //   );
  // }

  // return (
  //   <View style={styles.container}>
  //     <Text>
  //       Hello
  //     </Text>
  //   </View>
  // );