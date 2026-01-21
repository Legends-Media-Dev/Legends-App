import React from "react";
import { View, StyleSheet } from "react-native";
import NewsScreen from "../homeTabViews/NewsScreen";
import GlassHeader from "../../components/GlassHeader";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <GlassHeader />
      <NewsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
