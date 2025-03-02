// components/HeroImage.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const HeroImage = ({ title, subtitle, backgroundColor = "#000000" }) => {
  return (
    <View style={[styles.heroContainer, { backgroundColor }]}>
      <View style={styles.overlay}>
        <Text style={styles.heroTitle}>{title}</Text>
        {subtitle && <Text style={styles.heroSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    width: "100%",
    height: "680",
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#fff",
  },
});

export default HeroImage;
