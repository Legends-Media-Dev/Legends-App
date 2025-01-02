import React, { useEffect, useState } from "react";
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
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Stack = createStackNavigator();

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
            headerTintColor: "#000", // Color for back arrow and header text/icons
            headerTitleStyle: { fontWeight: "bold" },
            headerBackTitleVisible: false, // Hides the back button label
            headerBackTitle: "",
          }}
        >
          {/* Main Screen (No Back Arrow) */}
          <Stack.Screen
            name="MainScreen"
            component={MainScreen}
            options={{
              headerTitle: () => (
                <Image
                  source={require("./assets/legends.webp")}
                  style={{
                    width: 100,
                    resizeMode: "contain",
                  }}
                />
              ),
              headerLeft: null, // Remove the left header element
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
            options={{
              headerTitle: () => (
                <Image
                  source={require("./assets/legends.webp")}
                  style={{
                    width: 100,
                    resizeMode: "contain",
                  }}
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


          {/* Products Screen */}
          <Stack.Screen
            name="Products"
            component={ProductsScreen}
            options={({ route }) => ({
              title: route.params?.title || "Products", // Use the title from route params
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
              headerShown: false, // Hides the header for this screen
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
