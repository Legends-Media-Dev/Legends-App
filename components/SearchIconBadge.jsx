import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../context/CartContext";
import * as Haptics from "expo-haptics";

const SearchIconBadge = ({ backStatus }) => {
  const navigation = useNavigation();
  const { cartItemCount } = useCart();

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Search");
  };

  const handlePressChevron = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  };

  return backStatus == "Search" ? (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <View style={styles.container}>
        <Ionicons name="search-outline" size={24} color="#000" />
      </View>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity onPress={handlePressChevron} activeOpacity={1}>
      <View style={styles.chevronContainer}>
        <Ionicons name="chevron-back-outline" size={28} color="#000" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 25,
    padding: 4,
  },
  chevronContainer: {
    marginLeft: 10,
    padding: 4,
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -4,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default SearchIconBadge;
