import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../context/CartContext";
import * as Haptics from "expo-haptics";

export const HEADER_HEIGHT = 60;

/** Scroll distance (px) after which the center logo is fully hidden. */
export const LOGO_FADE_SCROLL_DISTANCE = 80;

const LIGHT_LOGO = require("../assets/LegendsLight.png");
const DARK_LOGO = require("../assets/Legends.png");

/**
 * @param {Object} props
 * @param {"light" | "dark"} [props.variant] - "light" uses splash-icon, "dark" uses Legends.png. Ignored if logoSource is set.
 * @param {import("react-native").ImageSourcePropType} [props.logoSource] - Custom logo image. Overrides variant when provided.
 * @param {boolean} [props.showSearchOnLeft] - If true, always show search icon on the left (for main tab screens). If false, show back arrow when possible.
 * @param {import("react-native").Animated.Value} [props.scrollY] - Optional. When provided, the center logo fades out as the user scrolls down and reappears when scrolled back to top.
 * @param {boolean} [props.showLogoutOnRight] - If true, right button shows logout icon and calls onLogoutPress instead of cart.
 * @param {() => void} [props.onLogoutPress] - Called when logout button is pressed (use with showLogoutOnRight).
 */
export default function GlassHeader({ variant = "light", logoSource, showSearchOnLeft = false, scrollY, showLogoutOnRight = false, onLogoutPress }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { cartItemCount } = useCart();

  const canGoBack = !showSearchOnLeft && navigation.canGoBack();

  const source = logoSource ?? (variant === "dark" ? DARK_LOGO : LIGHT_LOGO);

  const logoOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, LOGO_FADE_SCROLL_DISTANCE],
        outputRange: [1, 0],
        extrapolate: "clamp",
      })
    : 1;

  const LogoComponent = scrollY ? Animated.Image : Image;

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

        {/* Logo - fades out when scrollY is passed and user scrolls down */}
        <View style={styles.logoWrapper}>
          <LogoComponent
            source={source}
            style={[styles.logo, scrollY ? { opacity: logoOpacity } : {}]}
          />
        </View>

        {/* Right: Logout (Account) or Cart with count badge */}
        <TouchableOpacity
          style={styles.circleButton}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (showLogoutOnRight && onLogoutPress) {
              onLogoutPress();
            } else {
              navigation.navigate("Cart");
            }
          }}
        >
          {showLogoutOnRight ? (
            <Ionicons name="log-out-outline" size={18} color="#000" />
          ) : (
            <>
              <Ionicons name="bag-outline" size={18} color="#000" />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text allowFontScaling={false} style={styles.cartBadgeText}>
                    {cartItemCount}
                  </Text>
                </View>
              )}
            </>
          )}
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
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    right: -4,
    top: -4,
    backgroundColor: "#C8102E",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
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
