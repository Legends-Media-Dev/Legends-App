// Import React and all dependencies
import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer, Modal, Text, useNavigationContainerRef } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CartIconWithBadge from "./components/CartIconBadge";

import MainScreen from "./screens/core/HomeScreen";
import ShopScreen from "./screens/core/ShopScreen";
import SweepstakesScreen from "./screens/core/SweepstakesScreen";
import AccountScreen from "./screens/core/AccountScreen";

import CollectionScreen from "./screens/products/CollectionScreen";
import ProductScreen from "./screens/products/ProductScreen";
import SearchScreen from "./screens/products/SearchProductsScreen";
import SearchResultsScreen from "./screens/products/SearchResultsScreen";

import CartScreen from "./screens/shopflow/CartScreen";
import WebViewScreen from "./screens/shopflow/WebViewScreen";

import LoginScreen from "./screens/authentication/LoginScreen";
import SignUpScreen from "./screens/authentication/SignUpScreen";
import ForgotPasswordScreen from "./screens/authentication/ForgotPasswordScreen";

import VIPPortalScreen from "./screens/vip/VIPPortalScreen";
import JoinVIPScreen from "./screens/vip/JoinVIPScreen";

import PrivacyPolicyScreen from "./screens/account/PrivacyPolicyScreen";
import OrdersScreen from "./screens/account/OrdersScreen";
import OrderConfirmationScreen from "./screens/shopflow/OrderConfirmationScreen";

import { CartProvider } from "./context/CartContext";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
import { Animated, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isTokenValid } from "./utils/storage";

// Imports for cart pop up
import { AppState } from "react-native";
import { useCart } from "./context/CartContext";
import CartReminderModal from "./components/CartReminderModal";

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
          height: undefined, // Let height scale based on width & aspect ratio
          aspectRatio: 2, // Set this to your logo's actual width/height ratio (see below)
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
        headerStyle: {
          backgroundColor: "#fff",
          elevation: 0,
          shadowColor: "transparent",
        },
        headerTintColor: "#000",
        headerTitleStyle: { fontWeight: "bold" },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="MainScreen"
        component={MainScreen}
        options={({ navigation }) => ({
          title: "",
          headerTitle: () => <AnimatedHeader />,
          headerRight: () => <CartIconWithBadge />,
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
        name="Collection"
        component={CollectionScreen}
        options={({ navigation }) => ({
          headerBackTitle: "",
          headerTitle: () => <AnimatedHeader />,
          headerRight: () => <CartIconWithBadge />,
        })}
      />
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={({ navigation }) => ({
          headerBackTitle: "",
          headerTitle: () => <AnimatedHeader />,
          headerRight: () => <CartIconWithBadge />,
        })}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          headerTitle: () => <AnimatedHeader />,
          headerBackTitle: false,
        }}
      />
      <Stack.Screen
        name="JoinVIPScreen"
        component={JoinVIPScreen}
        options={() => ({
          headerBackTitle: "",
          headerTitle: () => <AnimatedHeader />,
          headerRight: () => <CartIconWithBadge />,
        })}
      />
      <Stack.Screen
        name="VIPPortalScreen"
        component={VIPPortalScreen}
        options={() => ({
          headerShown: true,
          headerBackTitleVisible: true,
        })}
      />
      <Stack.Screen
        name="Sweepstakes"
        component={SweepstakesScreen}
        options={({ navigation }) => ({
          headerTitle: () => <AnimatedHeader />,
          headerRight: () => <CartIconWithBadge />,
        })}
      />
    </Stack.Navigator>
  );
}

// Shop Stack Navigator
function ShopStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff",
          elevation: 0,
          shadowColor: "transparent",
        },
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
          headerRight: () => <CartIconWithBadge />,
        })}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          headerBackTitle: false,
          headerTitle: () => <AnimatedHeader />,
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
          headerRight: () => <CartIconWithBadge />,
        })}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={({ navigation }) => ({
          headerBackTitle: "",
          headerTitle: () => <AnimatedHeader />,
          headerRight: () => <CartIconWithBadge />,
        })}
      />
      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={({ navigation }) => ({
          headerBackTitle: "",
          headerTitle: () => <AnimatedHeader />,
          headerRight: () => <CartIconWithBadge />,
        })}
      />
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={({ navigation }) => ({
          headerBackTitle: "",
          headerTitle: () => <AnimatedHeader />,
          headerRight: () => <CartIconWithBadge />,
        })}
      />
    </Stack.Navigator>
  );
}

// Sweepstakes Stack Navigator
function SweepstakesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff",
          elevation: 0,
          shadowColor: "transparent",
        },
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
          headerRight: () => <CartIconWithBadge />,
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
          headerTitle: () => <AnimatedHeader />,
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
          options={{
            title: "",
            headerTitle: () => <AnimatedHeader />,
            headerRight: () => <CartIconWithBadge />,
          }}
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
      <Stack.Screen
        name="JoinVIPScreen"
        component={JoinVIPScreen}
        options={() => ({
          headerBackTitle: "",
          headerTitle: () => <AnimatedHeader />,
          headerRight: () => <CartIconWithBadge />,
        })}
      />
      <Stack.Screen
        name="VIPPortalScreen"
        component={VIPPortalScreen}
        options={({ navigation }) => ({
          headerBackTitle: "",
          headerTitle: () => <AnimatedHeader />,
          headerRight: () => <CartIconWithBadge />,
        })}
      />
      <Stack.Screen
        name="Collection"
        component={CollectionScreen}
        options={({ navigation }) => ({
          headerBackTitle: "",
          headerTitle: () => <AnimatedHeader />,
          headerRight: () => <CartIconWithBadge />,
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
          headerTitle: () => <AnimatedHeader />,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="SweepstakesScreen"
        component={SweepstakesScreen}
        options={({ navigation }) => ({
          headerTitle: () => <AnimatedHeader />,
          headerRight: () => <CartIconWithBadge />,
        })}
      />
      <Stack.Screen
        name="OrdersScreen"
        component={OrdersScreen}
        options={({ navigation }) => ({
          headerBackTitle: "",
          headerTitle: () => <AnimatedHeader />,
        })}
      />
      <Stack.Screen
        name="PrivacyPolicyScreen"
        component={PrivacyPolicyScreen}
        options={() => ({
          headerShown: true,
          headerBackTitleVisible: true,
        })}
      />
      <Stack.Screen
        name="OrderConfirmationScreen"
        component={OrderConfirmationScreen}
        options={{
          headerTitle: "",
          headerBackTitle: "",
        }}
      />
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={({ navigation }) => ({
          headerBackTitle: "",
          headerTitle: () => <AnimatedHeader />,
          headerRight: () => <CartIconWithBadge />,
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
      const token = await AsyncStorage.getItem("shopifyAccessToken");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      const isValid = await isTokenValid();
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
        <AppWithCartReminder />
      </CartProvider>
    </GestureHandlerRootView>
  );
}

function AppWithCartReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const appState = useRef(AppState.currentState);
  const hasShownReminder = useRef(false);
  const navRef = useNavigationContainerRef();
  const coldStart = useRef(true);
  const { cart, hasHydrated } = useCart();

  // ✅ Cold start cart check
  useEffect(() => {
    if (
      coldStart.current &&
      hasHydrated &&
      !hasShownReminder.current &&
      cart &&
      Array.isArray(cart.lines?.edges) &&
      cart.lines.edges.length > 0
    ) {
      setShowReminder(true);
      hasShownReminder.current = true;
    }
  
    if (hasHydrated) {
      coldStart.current = false;
    }
  }, [hasHydrated, cart]);   

  return (
    <NavigationContainer ref={navRef}>
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

      {/* 🧠 Modal */}
      <CartReminderModal
        visible={showReminder}
        onClose={() => setShowReminder(false)}
        onGoToCart={() => {
          setShowReminder(false);
          navRef?.navigate("SHOP");
          setTimeout(() => navRef?.navigate("Cart"), 200);
        }}
      />
    </NavigationContainer>
  );
}
