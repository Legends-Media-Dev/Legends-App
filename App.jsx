import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import CollectionScreen from "./screens/CollectionScreen";
import MainScreen from "./screens/MainScreen";
import ProductScreen from "./screens/ProductScreen";
import { CartProvider } from "./context/CartContext";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
import { Animated, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ShopScreen from "./screens/ShopScreen";
import SweepstakesScreen from "./screens/SweepstakesScreen";
import AccountScreen from "./screens/AccountScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AnimatedHeader({ isCollection, collectionName }) {
  const logoPosition = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const [showCollectionName, setShowCollectionName] = useState(false);

  useEffect(() => {
    if (isCollection) {
      Animated.parallel([
        Animated.timing(logoPosition, {
          toValue: -200,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0.1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowCollectionName(true);
      });
    } else {
      setShowCollectionName(false);
      Animated.parallel([
        Animated.timing(logoPosition, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
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
      {!showCollectionName && (
        <Animated.Image
          source={require("./assets/legends.webp")}
          style={{
            width: 100,
            resizeMode: "contain",
            transform: [{ translateX: logoPosition }],
            opacity: logoOpacity,
          }}
        />
      )}
      {showCollectionName && (
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000" }}>
          {collectionName || ""}
        </Text>
      )}
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
      <Stack.Screen
        name="Collection"
        component={CollectionScreen}
        options={({ route }) => ({
          headerBackTitle: "",
          headerBackTitleVisible: false,
          headerTitle: () => (
            <AnimatedHeader
              isCollection={true}
              collectionName={route.params?.title}
            />
          ),
        })}
      />
      <Stack.Screen 
        name="Product" 
        component={ProductScreen}
        options={{
          headerBackTitle: "",
          headerBackTitleVisible: false,
          title: "",
        }}
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
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Home") {
                iconName = focused ? "home" : "home-outline";
              } else if (route.name === "Shop") {
                iconName = focused ? "bag" : "bag-outline";
              } else if (route.name === "Sweepstakes") {
                iconName = focused ? "cart" : "cart-outline";
              } else if (route.name === "Account") {
                iconName = focused ? "person" : "person-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "#000",
            tabBarInactiveTintColor: "gray",
            headerShown: false,
          })}
        >
          <Tab.Screen name="Home" component={MainStack} />
          <Tab.Screen name="Shop" component={ShopScreen} />
          <Tab.Screen name="Sweepstakes" component={SweepstakesScreen} />
          <Tab.Screen name="Account" component={AccountScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
