import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CollectionScreen from "./screens/CollectionScreen";
import CollectionsScreen from "./screens/CollectionsScreen";
import ProductsScreen from "./screens/ProductsScreen";
import CartScreen from "./screens/CartScreen";
import MainScreen from "./screens/MainScreen";
import ProductScreen from "./screens/ProductScreen";
import NotificationsScreen from "./screens/NotificatiosScreen";
import WebViewScreen from "./screens/WebViewScreen";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SignUpScreen from "./screens/SignUpScreen";
import TestLoadingScreen from "./screens/TestLoadingScreen";
import { CartProvider } from "./context/CartContext";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
import { Animated, View, Text, TouchableOpacity, Image } from "react-native";
import { usePushNotifications } from "./usePushNotifications";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isTokenValid } from "./utils/storage";

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
          source={require("./assets/legends_logo.png")}
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
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const loadFonts = async () => {
    await Font.loadAsync({
      "Futura-Bold": require("./assets/fonts/FuturaBold.ttf"),
      "Futura-Medium": require("./assets/fonts/FuturaMedium.ttf"),
    });
  };

  const checkAuthentication = async () => {
    try {
      console.log("Checking for token...");
      const token = await AsyncStorage.getItem("shopifyAccessToken");
      if (!token) {
        console.log("No token found.");
        setIsAuthenticated(false);
        return;
      }

      const isValid = await isTokenValid();
      console.log("Token is valid:", isValid);
      setIsAuthenticated(isValid);
    } catch (error) {
      console.error("Error during authentication check:", error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    loadFonts().then(() => setFontsLoaded(true));
    checkAuthentication();
  }, []);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
          // initialRouteName={isAuthenticated ? "MainScreen" : "LoginScreen"}
          initialRouteName={"MainScreen"}
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
            options={({ navigation }) => ({
              headerTitle: () => <AnimatedHeader isCollection={false} />,
              headerLeft: null,
              headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
                  <Ionicons
                    name="bag-outline"
                    size={24}
                    color="#000"
                    style={{ marginRight: 30 }}
                  />
                </TouchableOpacity>
              ),
            })}
          />

          {/* Collection Screen */}
          <Stack.Screen
            name="Collection"
            component={CollectionScreen}
            options={({ navigation, route }) => ({
              headerTitle: () => (
                <AnimatedHeader
                  isCollection={true}
                  collectionName={route.params?.title}
                />
              ),
              headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
                  <Ionicons
                    name="bag-outline"
                    size={24}
                    color="#000"
                    style={{ marginRight: 30 }}
                  />
                </TouchableOpacity>
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
                <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
                  <Ionicons
                    name="bag-outline"
                    size={24}
                    color="#000"
                    style={{ marginRight: 30 }}
                  />
                </TouchableOpacity>
              ),
            })}
          />

          {/* Set Collections as the initial route */}
          <Stack.Screen name="Collections" component={CollectionsScreen} />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{
              title: "Your Cart",
              headerStyle: {
                backgroundColor: "#fff",
              },
              headerTintColor: "#000",
              headerTitle: () => null,
              headerBackTitle: null,
              headerBackImage: () => (
                <Ionicons
                  name="chevron-back-outline" // Back arrow icon
                  size={25} // Adjust the size here
                  color="#000"
                  style={{ marginLeft: 15 }} // Add margin if needed
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
          <Stack.Screen
            name="Product"
            component={ProductScreen}
            options={({ navigation }) => ({
              headerStyle: {
                backgroundColor: "#fff",
              },
              headerTintColor: "#000",
              headerTitle: () => null,
              headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
                  <Ionicons
                    name="bag-outline"
                    size={24}
                    color="#000"
                    style={{ marginRight: 30 }}
                  />
                </TouchableOpacity>
              ),
              headerBackTitle: null,
              headerBackImage: () => (
                <Ionicons
                  name="chevron-back-outline" // Back arrow icon
                  size={25} // Adjust the size here
                  color="#000"
                  style={{ marginLeft: 15 }} // Add margin if needed
                />
              ),
            })}
          />
          <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={() => ({
              headerShown: false,
            })}
          />
          <Stack.Screen
            name="SignUpScreen"
            component={SignUpScreen}
            options={() => ({
              headerShown: false,
            })}
          />
          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{
              title: "Profile",
              headerStyle: { backgroundColor: "#fff" },
              headerTintColor: "#000",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
          <Stack.Screen
            name="TestLoadingScreen"
            component={TestLoadingScreen}
            options={{
              title: "Test",
              headerStyle: { backgroundColor: "#fff" },
              headerTintColor: "#000",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
