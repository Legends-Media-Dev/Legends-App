import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { getDefaultStoreUrl } from "../utils/versionCheck";

export default function UpdateRequiredModal({ visible, storeUrl, onDismiss }) {
  const url = storeUrl || getDefaultStoreUrl();

  const handleUpdate = () => {
    Linking.openURL(url).catch((err) =>
      console.warn("Could not open store:", err)
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Image
            source={require("../assets/Legends.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text allowFontScaling={false} style={styles.title}>
            Update Required
          </Text>
          <Text allowFontScaling={false} style={styles.message}>
            You're running an older version of the app. Please update to the
            latest version to continue.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text allowFontScaling={false} style={styles.buttonText}>
              Update
            </Text>
          </TouchableOpacity>
          {onDismiss && (
            <TouchableOpacity
              style={styles.laterButton}
              onPress={onDismiss}
            >
              <Text allowFontScaling={false} style={styles.laterButtonText}>
                Later
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 28,
    marginBottom: 20,
  },
  title: {
    fontFamily: "Futura-Bold",
    fontSize: 20,
    color: "#000",
    marginBottom: 10,
  },
  message: {
    fontFamily: "Futura-Medium",
    fontSize: 15,
    color: "#333",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#C8102F",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Futura-Bold",
    fontSize: 16,
    color: "#fff",
  },
  laterButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  laterButtonText: {
    fontFamily: "Futura-Medium",
    fontSize: 14,
    color: "#666",
  },
});
