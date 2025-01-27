// Import React and all dependencies
import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CollectionScreen from "./screens/CollectionScreen";
import MainScreen from "./screens/MainScreen";
import ProductScreen from "./screens/ProductScreen";
import ShopScreen from "./screens/ShopScreen";
import SweepstakesScreen from "./screens/SweepstakesScreen";
import AccountScreen from "./screens/AccountScreen";
import CartScreen from "./screens/CartScreen";
import { CartProvider } from "./context/CartContext";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
import { Animated, View, TouchableOpacity } from "react-native";
import NotificationsScreen from "./screens/NotificatiosScreen";
import WebViewScreen from "./screens/WebViewScreen";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SignUpScreen from "./screens/SignUpScreen";
import TestLoadingScreen from "./screens/TestLoadingScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import { usePushNotifications } from "./usePushNotifications";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isTokenValid } from "./utils/storage";

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Reusable Header Component
function AnimatedHeader() {
  const logoPosition = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
      }}
    >
      <Animated.Image
        source={require("./assets/Legends.png")}
        style={{
          width: 100,
          resizeMode: "contain",
          transform: [{ translateX: logoPosition }],
          opacity: logoOpacity,
        }}
      />
    </View>
  );
}

// Main Stack Navigator
function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="MainScreen"
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#000",
        headerTitleStyle: { fontWeight: "bold" },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="MainScreen"
        component={MainScreen}
        options={({ navigation }) => ({
          headerTitle: () => <AnimatedHeader />,
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
      <Stack.Screen
        name="WebViewScreen"
        component={WebViewScreen}
        options={{
          headerBackTitle: false,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={{
          headerBackTitle: "",
          headerBackTitleVisible: false,
          headerTitle: () => <AnimatedHeader />,
        }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          headerTitle: "Your Cart",
          headerBackTitle: false,
        }}
      />
    </Stack.Navigator>
  );
}

// Shop Stack Navigator
function ShopStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#000",
        headerTitleStyle: { fontWeight: "bold" },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Shop"
        component={ShopScreen}
        options={({ navigation }) => ({
          headerTitle: () => <AnimatedHeader />,
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
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          headerBackTitle: false,
          headerTitle: "Your Cart",
        }}
      />
      <Stack.Screen
        name="WebViewScreen"
        component={WebViewScreen}
        options={{
          headerBackTitle: false,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="Collection"
        component={CollectionScreen}
        options={({ navigation }) => ({
          headerBackTitle: "",
          headerTitle: () => <AnimatedHeader />,
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
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={{
          headerBackTitle: "",
          headerBackTitleVisible: false,
          headerTitle: () => <AnimatedHeader />,
        }}
      />
    </Stack.Navigator>
  );
}

// Sweepstakes Stack Navigator
function SweepstakesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#000",
        headerTitleStyle: { fontWeight: "bold" },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Sweepstakes"
        component={SweepstakesScreen}
        options={({ navigation }) => ({
          headerTitle: () => <AnimatedHeader />,
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
      <Stack.Screen
        name="WebViewScreen"
        component={WebViewScreen}
        options={{
          headerBackTitle: false,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          headerBackTitle: false,
          headerTitle: "Your Cart",
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

// Account Stack Navigator with Conditional Navigation
function AccountStack() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await AsyncStorage.getItem("shopifyAccessToken");
        if (!token) {
          setIsAuthenticated(false);
          return;
        }
        const isValid = await isTokenValid(token);
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return null; // Optional: Replace with a loading spinner if desired
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#000",
        headerTitleStyle: { fontWeight: "bold" },
        headerBackTitleVisible: false,
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen
          name="Account"
          component={AccountScreen}
          options={({ navigation }) => ({
            headerTitle: () => <AnimatedHeader />,
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
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerTitle: "Login",
            headerShown: false,
          }}
        />
      )}
      <Stack.Screen
        name="SignUpScreen"
        component={SignUpScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
        options={() => ({
          headerShown: false,
        })}
      />
    </Stack.Navigator>
  );
}

// App Component with Bottom Tabs
export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const loadFonts = async () => {
    await Font.loadAsync({
      "Futura-Bold": require("./assets/fonts/FuturaBold.ttf"),
      "Futura-Medium": require("./assets/fonts/FuturaMedium.ttf"),
      "Futura-Regular": require("./assets/fonts/FuturaRegular.ttf"),
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === "HOME") {
                  iconName = focused ? "home" : "home-outline";
                } else if (route.name === "SHOP") {
                  iconName = focused ? "bag" : "bag-outline";
                } else if (route.name === "SWEEPSTAKES") {
                  iconName = focused ? "pricetag" : "pricetag-outline";
                } else if (route.name === "ACCOUNT") {
                  iconName = focused ? "person" : "person-outline";
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: "#000",
              tabBarInactiveTintColor: "gray",
              headerShown: false,
            })}
          >
            <Tab.Screen name="HOME" component={MainStack} />
            <Tab.Screen name="SHOP" component={ShopStack} />
            <Tab.Screen name="SWEEPSTAKES" component={SweepstakesStack} />
            <Tab.Screen name="ACCOUNT" component={AccountStack} />
          </Tab.Navigator>
        </NavigationContainer>
      </CartProvider>
    </GestureHandlerRootView>
  );
}
