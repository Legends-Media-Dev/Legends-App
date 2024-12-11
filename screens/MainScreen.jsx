import React from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const MainScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Screen</Text>
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
