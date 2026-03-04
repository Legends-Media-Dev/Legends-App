import React, { useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import NewsScreen from "../homeTabViews/NewsScreen";
import GlassHeader from "../../components/GlassHeader";

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  return (
    <View style={styles.container}>
      <GlassHeader variant="light" showSearchOnLeft scrollY={scrollY} />
      <NewsScreen scrollY={scrollY} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
