import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from "react-native";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const NotificationsScreen = ({ navigation }) => {
  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted") {
      console.log("Notification permissions granted!");
    } else {
      console.log("Notification permissions denied!");
    }
    navigation.replace("MainScreen");
  };

  const handleNotNow = () => {
    navigation.replace("MainScreen");
  };

  return (
    <ImageBackground
      source={require("../assets/SplashScreen.png")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Overlay */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          {/* Title Section */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Stay in the Know</Text>
          </View>

          {/* Information Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Ionicons
                name="bag-outline"
                size={40}
                color="#fff"
                style={styles.icon}
              />
              <View style={styles.textContainer}>
                <Text style={styles.infoTitle}>Order Status</Text>
                <Text style={styles.infoDescription}>
                  Track your order updates in real time
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Ionicons
                name="shirt-outline"
                size={40}
                color="#fff"
                style={styles.icon}
              />
              <View style={styles.textContainer}>
                <Text style={styles.infoTitle}>Back in Stock</Text>
                <Text style={styles.infoDescription}>
                  Be the first to know when it's back in stock
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Button Section */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestNotificationPermission}
          >
            <Text style={styles.primaryButtonText}>Turn on Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleNotNow}
          >
            <Text style={styles.secondaryButtonText}>Not Now &gt;</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#D9D9D9",
    opacity: 0.41,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingVertical: height * 0.07,
    justifyContent: "space-between",
    paddingLeft: "8%",
    paddingRight: "8%",
  },
  titleContainer: {
    marginTop: height * 0.06,
    width: "100%",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 30,
    fontFamily: "Futura-Bold",
    color: "#fff",
    textAlign: "center",
  },
  infoSection: {
    marginVertical: height * 0.04,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 50,
  },
  icon: {
    fontSize: 40,
    color: "#fff",
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 20,
    fontFamily: "Futura-Bold",
    color: "#fff",
  },
  infoDescription: {
    fontSize: 16,
    fontFamily: "Futura-Medium",
    color: "#fff",
  },
  buttonsContainer: {
    alignItems: "center",
    width: "100%",
  },
  primaryButton: {
    width: "100%",
    height: height * 0.05,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 15,
  },
  primaryButtonText: {
    fontSize: 20,
    fontFamily: "Futura-Medium",
    color: "#fff",
  },
  secondaryButton: {
    marginTop: 5,
  },
  secondaryButtonText: {
    fontSize: 20,
    fontFamily: "Futura-Medium",
    color: "#fff",
    textAlign: "center",
  },
  innerContainer: {
    width: "100%",
  },
});

export default NotificationsScreen;
