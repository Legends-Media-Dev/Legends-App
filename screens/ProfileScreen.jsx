import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      // Clear the stored token
      await AsyncStorage.removeItem("shopifyAccessToken");
      await AsyncStorage.removeItem("accessTokenExpiry");
      console.log("User logged out");

      // Navigate to LoginScreen
      navigation.replace("LoginScreen");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#C8102F",
    padding: 15,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
