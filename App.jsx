import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CollectionScreen from "./screens/CollectionScreen";
import ProductsScreen from "./screens/ProductsScreen";
import CartScreen from "./screens/CartScreenTest";
import MainScreen from "./screens/MainScreen";
import ProductScreen from "./screens/ProductScreen";
import NotificationsScreen from "./screens/NotificatiosScreen";
import { CartProvider } from "./context/CartContext";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
import { Animated, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Stack = createStackNavigator();

function AnimatedHeader({ isCollection, collectionName }) {
  const logoPosition = useRef(new Animated.Value(0)).current; // Logo position
  const logoOpacity = useRef(new Animated.Value(1)).current; // Logo opacity
  const [showCollectionName, setShowCollectionName] = useState(false); // Track if the name should show

  useEffect(() => {
    if (isCollection) {
      // Animate logo sliding out and reducing opacity
      Animated.parallel([
        Animated.timing(logoPosition, {
          toValue: -200, // Move far enough to exit the screen
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0.1, // Reduce opacity to 75%
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Show collection name after logo exits
        setShowCollectionName(true);
      });
    } else {
      // Reset position and opacity when returning to MainScreen
      setShowCollectionName(false);
      Animated.parallel([
        Animated.timing(logoPosition, {
          toValue: 0, // Reset to center
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1, // Reset opacity to 100%
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isCollection]);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
      }}
    >
      {/* Logo */}
      {!showCollectionName && (
        <Animated.Image
          source={require("./assets/legends.webp")}
          style={{
            width: 100,
            resizeMode: "contain",
            transform: [{ translateX: logoPosition }],
            opacity: logoOpacity, // Apply animated opacity
          }}
        />
      )}

      {/* Collection Name */}
      {showCollectionName && (
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#000",
          }}
        >
          {collectionName || ""}
        </Text>
      )}
    </View>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      "Futura-Bold": require("./assets/fonts/FuturaBold.ttf"),
      "Futura-Medium": require("./assets/fonts/FuturaMedium.ttf"),
    });
  };

  useEffect(() => {
    loadFonts().then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MainScreen"
          screenOptions={{
            headerStyle: { backgroundColor: "#fff" },
            headerTintColor: "#000",
            headerTitleStyle: { fontWeight: "bold" },
            headerBackTitleVisible: false,
            headerBackTitle: "",
          }}
        >
          {/* Main Screen */}
          <Stack.Screen
            name="MainScreen"
            component={MainScreen}
            options={{
              headerTitle: () => <AnimatedHeader isCollection={false} />,
              headerLeft: null,
              headerRight: () => (
                <Ionicons
                  name="bag-outline"
                  size={24}
                  color="#000"
                  style={{ marginRight: 30 }}
                />
              ),
            }}
          />

          {/* Collection Screen */}
          <Stack.Screen
            name="Collection"
            component={CollectionScreen}
            options={({ route }) => ({
              headerTitle: () => (
                <AnimatedHeader
                  isCollection={true}
                  collectionName={route.params?.title}
                />
              ),
              headerRight: () => (
                <Ionicons
                  name="bag-outline"
                  size={24}
                  color="#000"
                  style={{ marginRight: 30 }}
                />
              ),
            })}
          />

          {/* Products Screen */}
          <Stack.Screen
            name="Products"
            component={ProductsScreen}
            options={({ route }) => ({
              title: route.params?.title || "Products",
              headerRight: () => (
                <Ionicons
                  name="bag-outline"
                  size={24}
                  color="#000"
                  style={{ marginRight: 30 }}
                />
              ),
            })}
          />

          {/* Product Details Screen */}
          <Stack.Screen
            name="Product"
            component={ProductScreen}
            options={{
              title: "Product Details",
              headerBackImage: () => (
                <Ionicons
                  name="chevron-back-outline"
                  size={25}
                  color="#000"
                  style={{ marginLeft: 15 }}
                />
              ),
              headerRight: () => (
                <Ionicons
                  name="bag-outline"
                  size={24}
                  color="#000"
                  style={{ marginRight: 30 }}
                />
              ),
            }}
          />

          {/* Cart Screen */}
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{
              title: "Your Cart",
              headerRight: () => (
                <Ionicons
                  name="bag-outline"
                  size={24}
                  color="#000"
                  style={{ marginRight: 30 }}
                />
              ),
            }}
          />

          {/* Notifications Screen */}
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
