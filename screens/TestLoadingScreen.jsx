import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const LoadingAnimation = () => {
  console.log(require("../assets/loading_animation.json"));

  return (
    <View style={styles.container}>
      <LottieView
        style={{ width: 400, height: 400 }}
        source={require("../assets/data.json")}
        autoPlay
        loop
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingAnimation;
