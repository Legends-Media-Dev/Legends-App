// components/ContentBox.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ContentBox = ({ topTitle, bottomTitle, topColor = "#4CAF50", bottomColor = "#FF5722" }) => {
  return (
    <View style={styles.container}>
      {/* Top Box */}
      <View style={[styles.box, {backgroundColor: topColor }]}>
          <Text style={styles.title}>{topTitle}</Text>
      </View>

      {/* Bottom Box */}
      <View style={[styles.box, { backgroundColor: bottomColor }]}>
        <Text style={styles.title}>{bottomTitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: "100%",
    height: 160,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    padding: 16,
    marginVertical: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default ContentBox;
