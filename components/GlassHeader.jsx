import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const HEADER_HEIGHT = 60; 

export default function GlassHeader() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
  
    const canGoBack = navigation.canGoBack();
  
    return (
      <View style={[styles.wrapper, { top: insets.top + 8 }]}>
        <View style={styles.container}>
          
          {/* Left Button */}
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => {
              if (canGoBack) {
                navigation.goBack();
              } else {
                navigation.navigate("Search");
              }
            }}
          >
            <Ionicons
              name={canGoBack ? "arrow-back" : "search-outline"}
              size={18}
              color="#000"
            />
          </TouchableOpacity>
  
          {/* Logo */}
          <View style={styles.logoWrapper}>
            <Image
              source={require("../assets/splash-icon.png")}
              style={styles.logo}
            />
          </View>
  
          {/* Cart */}
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.navigate("Cart")}
          >
            <Ionicons name="bag-outline" size={18} color="#000" />
          </TouchableOpacity>
  
        </View>
      </View>
    );
  }

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: "center",
  },

  container: {
    width: "92%",
    height: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.12)",
  },

  logoWrapper: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -50 }],
    alignItems: "center",
    justifyContent: "center",
  },  

  logo: {
    width: 110,
    height: 110,
    resizeMode: "contain",
  },
});
