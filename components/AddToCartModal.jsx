import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../context/CartContext";
import LegendsLogo from "../assets/Legends.png";
import { TouchableWithoutFeedback, Keyboard } from "react-native";
import { Image, ImageBackground } from "expo-image";

export default function AddToCartModal({ visible, onClose, onGoToCart }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>

            <Image
              source={LegendsLogo}
              style={styles.logo}
              contentFit="contain"
            />

            <View style={{ marginTop: "-13" }}>
              <Text allowFontScaling={false} style={styles.title}>Cart locked and loaded</Text>
              <Text allowFontScaling={false} style={styles.message}>
                Finish checking out to make them yours.
              </Text>
            </View>

            {/* CTA Button */}
            <View style={ styles.lowerButtons}>
              <TouchableOpacity onPress={onGoToCart} style={styles.buttonPrimary}>
                <ImageBackground
                  source={require("../assets/vip-dark-background.png")}
                  style={styles.buttonImageBackground}
                  imageStyle={{ borderRadius: 8 }}
                  contentFit="cover"
                  >
                  <Text allowFontScaling={false} style={styles.buttonText}>GO TO CART</Text>
                </ImageBackground>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.buttonPrimary}>
                <View style={styles.buttonSecondary}>
                  <Text allowFontScaling={false} style={styles.buttonText}>CONTINUE SHOPPING</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonImageBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "75%",
    backgroundColor: "#F2F2F2",
    padding: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    minHeight: 300,
  },
  logo: {
    width: 140,
    height: 60,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginTop: 4,
  },
  productImage: {
    width: 60,
    height: 60,
    marginHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  extraText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
    textAlign: "center",
  },
  buttonPrimary: {
    height: 50,
    width: "90%",
    borderRadius: 8,
    overflow: "hidden",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Futura-Bold",
    fontSize: 16,
    textAlign: "center",
  },
  lowerButtons: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    gap: 5,
  },
  buttonSecondary: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#C8102F",
  },
});
