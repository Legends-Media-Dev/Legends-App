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
import { Ionicons } from "@expo/vector-icons";

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
        source={require("./assets/legends.webp")}
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
        name="Collection"
        component={CollectionScreen}
        options={({ route, navigation }) => ({
          headerBackTitle: "",
          headerBackTitleVisible: false,
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
          headerBackTitleVisible: false,
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

// Account Stack Navigator
function AccountStack() {
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
    </Stack.Navigator>
  );
}

// App Component with Bottom Tabs
export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      "Futura-Bold": require("./assets/fonts/FuturaBold.ttf"),
      "Futura-Medium": require("./assets/fonts/FuturaMedium.ttf"),
      "Futura-Regular": require("./assets/fonts/FuturaRegular.ttf"),
    });
  };

  useEffect(() => {
    loadFonts().then(() => setFontsLoaded(true));
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
