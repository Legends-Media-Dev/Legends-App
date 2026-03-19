import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ImageBackground } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

export default function CartConfirmationModal({
  visible,
  title = "Don't forget your free item",
  primaryLabel = "Get Item",
  secondaryLabel = "No Thanks",
  onPrimaryPress,
  onSecondaryPress,
  onRequestClose,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose || onSecondaryPress}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onRequestClose || onSecondaryPress}
          >
            <Ionicons name="close" size={22} color="#000" />
          </TouchableOpacity>

          <Text allowFontScaling={false} style={styles.title}>
            {title}
          </Text>

          <TouchableOpacity style={styles.buttonPrimary} onPress={onPrimaryPress}>
            <ImageBackground
              source={require("../assets/vip-dark-background.png")}
              style={styles.buttonImageBackground}
              imageStyle={{ borderRadius: 8 }}
              contentFit="cover"
              transition={300}
            >
              <Text allowFontScaling={false} style={styles.buttonText}>
                {primaryLabel}
              </Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterButton} onPress={onSecondaryPress}>
            <Text allowFontScaling={false} style={styles.laterButtonText}>
              {secondaryLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "75%",
    backgroundColor: "#F2F2F2",
    padding: 24,
    borderRadius: 10,
    alignItems: "center",
    position: "relative",
  },
  title: {
    fontFamily: "Futura-Bold",
    fontSize: 22,
    color: "#000",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 18,
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
  },
  buttonImageBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPrimary: {
    height: 50,
    width: "90%",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 4,
  },
  buttonText: {
    fontFamily: "Futura-Bold",
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
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
