import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";

const { width, height } = Dimensions.get("window");

const MainScreen = ({ navigation }) => {
  const handleNavigateToCheckout = () => {
    navigation.navigate("Product");
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Screen</Text>
      {/* Checkout Button */}
      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={handleNavigateToCheckout}
      >
        <Text style={styles.checkoutText}>Proceed to Product Screen</Text>
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
  title: {
    fontSize: 25,
    fontFamily: "Futura-Medium",
    color: "#000",
    textAlign: "center",
  },
});

export default MainScreen;
