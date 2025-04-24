import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

const VIPPortalScreen = () => {
  const navigation = useNavigation();

  const handleRaceGamePress = () => {
    navigation.navigate("VIPRaceScreen"); // You'll create this screen/component next
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>WELCOME TO THE VIP PORTAL</Text>
      <Text style={styles.subtext}>
        Thanks for being a Legends VIP! Unlock special perks, discounts, and
        experiences.
      </Text>

      <View style={styles.box}>
        <Text style={styles.boxTitle}>🏁 RACE DUSTIN & WIN</Text>
        <Text style={styles.boxText}>
          Play a quick game and win a one-time discount code if you beat Dustin!
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleRaceGamePress}>
          <Text style={styles.buttonText}>Start Race</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 20,
    justifyContent: "flex-start",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Futura-Bold",
    color: "#000",
    marginBottom: 10,
  },
  subtext: {
    fontSize: 15,
    color: "#444",
    fontFamily: "Futura-Medium",
    marginBottom: 20,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  boxTitle: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
    marginBottom: 10,
    color: "#C8102F",
  },
  boxText: {
    fontSize: 14,
    fontFamily: "Futura-Medium",
    color: "#333",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Futura-Bold",
  },
});

export default VIPPortalScreen;
