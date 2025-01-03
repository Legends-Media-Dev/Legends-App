import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CollectionsScreen from "./screens/CollectionsScreen";
import ProductsScreen from "./screens/ProductsScreen";
import WebViewScreen from "./screens/WebViewScreen";
import MainScreen from "./screens/MainScreen";
import ProductScreen from "./screens/ProductScreen";
import CartScreen from "./screens/CartScreen";
import { CartProvider } from "./context/CartContext";
import * as Font from "expo-font";
// import AppLoading from "expo-app-loading";
import AppLoading from "expo-app-loading";
import NotificationsScreen from "./screens/NotificatiosScreen";
import { usePushNotifications } from "./usePushNotifications";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Removed the RootStackParamList type definition
const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  // const { expoPushToken, notification } = usePushNotifications();

  // const data = JSON.stringify(notification, undefined, 2);

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
        <Stack.Navigator initialRouteName="Collections">
          {/* Set Collections as the initial route */}
          <Stack.Screen name="Collections" component={CollectionsScreen} />
          <Stack.Screen name="Products" component={ProductsScreen} />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{
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
              // headerRight: () => (
              //   <Ionicons
              //     name="bag-outline"
              //     size={24}
              //     color="#000"
              //     style={{ marginRight: 30 }}
              //   />
              // ),
            }}
          />
          <Stack.Screen
            name="MainScreen"
            component={MainScreen}
            options={{
              headerStyle: {
                backgroundColor: "#fff",
              },
              headerTintColor: "#000",
              headerTitle: () => null,
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
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ headerShown: false }}
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
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
    // <View
    //   style={{
    //     flex: 1, // Makes the View fill the entire screen
    //     display: "flex",
    //     justifyContent: "center", // Centers vertically
    //     alignItems: "center", // Centers horizontally
    //   }}
    // >
    //   <Text>Hello</Text>
    //   {/* <Text>Token: {expoPushToken?.data ?? ""}</Text> */}
    //   {/* <Text>{data}</Text> */}
    // </View>
  );
}
