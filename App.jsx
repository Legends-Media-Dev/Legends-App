// Import React and all dependencies
import { Text, TextInput, Animated, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

if (!Text.defaultProps) Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;

if (!TextInput.defaultProps) TextInput.defaultProps = {};
TextInput.defaultProps.allowFontScaling = false;

if (!Animated.Text.defaultProps) Animated.Text.defaultProps = {};
Animated.Text.defaultProps.allowFontScaling = false;


import React, { useEffect, useState, useRef } from "react";
import {
  NavigationContainer,
  Modal,
  useNavigationContainerRef,
} from "@react-navigation/native";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { saveUserNotificationToken } from "./api/shopifyApi";
import { registerForPushNotificationsAsync } from "./utils/notifications";

const PROJECT_ID = "53372938-06cb-43b4-8f47-24a1359a4711";

import { HeaderStyleInterpolators } from "@react-navigation/stack";
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
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isTokenValid } from "./utils/storage";

// Imports for cart pop up
import { AppState } from "react-native";
import { useCart } from "./context/CartContext";
import CartReminderModal from "./components/CartReminderModal";
import SearchIconBadge from "./components/SearchIconBadge";

import { getCustomerInfo } from "./utils/storage"; // use your existing helper
import VipPortalScreen from "./screens/vip/VIPPortalScreen";

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainScreen" component={MainScreen} />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
      <Stack.Screen name="Collection" component={CollectionScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="JoinVIPScreen" component={JoinVIPScreen} />
      <Stack.Screen name="VIPPortalScreen" component={VIPPortalScreen} />
      <Stack.Screen name="Sweepstakes" component={SweepstakesScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
    </Stack.Navigator>
  );
}

// Shop Stack Navigator
function ShopStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
      <Stack.Screen name="Collection" component={CollectionScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
    </Stack.Navigator>
  );
}

function VipStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="VipPortalScreen" component={VIPPortalScreen} />
      <Stack.Screen name="JoinVIPScreen" component={JoinVIPScreen} />
      <Stack.Screen name="Collection" component={CollectionScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
    </Stack.Navigator>
  );
}

// Sweepstakes Stack Navigator
function SweepstakesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Sweepstakes" component={SweepstakesScreen} />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
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
        headerShown: false,
        headerBackTitleVisible: false,
        headerStyleInterpolator: HeaderStyleInterpolators.forNoAnimation,
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen
          name="Account"
          component={AccountScreen}
          options={{
            unmountOnBlur: true,
            title: "",
          }}
        />
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            unmountOnBlur: true,
            headerTitle: "Login",
            headerShown: false,
          }}
        />
      )}
      <Stack.Screen
        name="SignUpScreen"
        component={SignUpScreen}
        options={() => ({ unmountOnBlur: true, headerShown: false })}
      />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
        options={() => ({ unmountOnBlur: true, headerShown: false })}
      />
      <Stack.Screen
        name="JoinVIPScreen"
        component={JoinVIPScreen}
        options={() => ({
          unmountOnBlur: true,
          headerBackTitle: "",
        })}
      />
      <Stack.Screen
        name="VIPPortalScreen"
        component={VIPPortalScreen}
        options={({ navigation }) => ({
          unmountOnBlur: true,
          headerBackTitle: "",
        })}
      />
      <Stack.Screen
        name="Collection"
        component={CollectionScreen}
        options={({ navigation }) => ({
          unmountOnBlur: true,
          headerBackTitle: "",
        })}
      />
      <Stack.Screen
        name="WebViewScreen"
        component={WebViewScreen}
        options={{
          unmountOnBlur: true,
          headerBackTitle: false,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          unmountOnBlur: true,
          headerBackTitle: false,
        }}
      />
      <Stack.Screen
        name="SweepstakesScreen"
        component={SweepstakesScreen}
        options={({ navigation }) => ({
          unmountOnBlur: true,
        })}
      />
      <Stack.Screen
        name="OrdersScreen"
        component={OrdersScreen}
        options={({ navigation }) => ({
          unmountOnBlur: true,
          headerBackTitle: "",
        })}
      />
      <Stack.Screen
        name="PrivacyPolicyScreen"
        component={PrivacyPolicyScreen}
        options={() => ({
          unmountOnBlur: true,
          headerShown: true,
          headerBackTitleVisible: true,
        })}
      />
      <Stack.Screen
        name="OrderConfirmationScreen"
        component={OrderConfirmationScreen}
        options={{
          unmountOnBlur: true,
          headerTitle: "",
          headerBackTitle: "",
        }}
      />
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={({ navigation }) => ({
          unmountOnBlur: true,
          headerBackTitle: "",
        })}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={({ navigation }) => ({
          unmountOnBlur: true,
          headerBackTitle: "",
        })}
      />
      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={({ navigation }) => ({
          unmountOnBlur: true,
          headerBackTitle: "",
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
    // await AsyncStorage.clear();
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadFonts();
      setFontsLoaded(true);
      await checkAuthentication();

      // ✅ Register push notifications on every app launch
      // Force update to ensure token is always saved to Firestore, even if:
      // - User denied permissions previously
      // - Token was deleted from Firebase
      // - App was updated
      // This ensures all users (new and existing) are always registered
      try {
        await registerForPushNotificationsAsync(true); // true = always save to ensure it's in Firebase
      } catch (error) {
        console.warn("⚠️ Could not register push notifications:", error);
      }
    };

    init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <AppWithCartReminder />
      </CartProvider>
    </GestureHandlerRootView>
  );
}

function GlassTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBarPill}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            navigation.navigate(route.name);
          };

          let iconName;
          if (route.name === "HOME") iconName = "home";
          if (route.name === "SHOP") iconName = "bag";
          if (route.name === "VIP") iconName = "people";
          if (route.name === "ACCOUNT") iconName = "person";

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isFocused ? iconName : `${iconName}-outline`}
                size={19}
                color={isFocused ? "#111" : "#9A9A9A"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelActive,
                ]}
              >
                {options.title || route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
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
        tabBar={(props) => <GlassTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="HOME" component={MainStack} options={{ title: "Home" }} />
        <Tab.Screen name="SHOP" component={ShopStack} options={{ title: "Shop" }} />
        <Tab.Screen name="VIP" component={VipStack} options={{ title: "Members" }} />
        <Tab.Screen
          name="ACCOUNT"
          component={AccountStack}
          options={{ title: "Account" }}
        />
      </Tab.Navigator>

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

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  tabBarPill: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderColor: "#E6E6E6",
    paddingHorizontal: 40,
    paddingVertical: 6,
    borderRadius: 22,
    borderWidth: 1,
  },

  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 13,
    gap: 4,
  },

  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
    color: "#8A8A8A",
    fontFamily: "Futura-Medium",
  },

  tabLabelActive: {
    color: "#111",
  },
});
