import React from "react";
import { View, Text, StyleSheet } from "react-native";

const SweepstakesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Shop Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Optional: Set background color to white
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000", // Optional: Set text color to black
  },
});

export default SweepstakesScreen;
