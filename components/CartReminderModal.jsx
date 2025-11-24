import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Image, ImageBackground } from "expo-image";

import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../context/CartContext";
import LegendsLogo from "../assets/Legends.png";

export default function CartReminderModal({ visible, onClose, onGoToCart }) {
  const { cart } = useCart();
  const items = cart?.lines?.edges || [];
  const maxImages = 4;
  const imagesToShow = items.slice(0, maxImages);
  const remainingCount = items.length - maxImages;

  return (
    <Modal visible={visible} transparent animationType="fade">
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
            transition={300}
          />

          <Text allowFontScaling={false} style={styles.title}>Pick up right where you left off!</Text>
          <Text allowFontScaling={false} style={styles.message}>Complete your order now.</Text>

          {/* Product Images */}
          <FlatList
            horizontal
            data={imagesToShow}
            keyExtractor={(item) => item.node.id}
            renderItem={({ item }) => {
              const imageUrl =
                item?.node?.merchandise?.product?.images?.edges?.[0]?.node?.src;

              if (!imageUrl) return null;

              return (
                <Image
                  transition={300}
                  source={{ uri: imageUrl }}
                  style={styles.productImage}
                />
              );
            }}
            contentContainerStyle={{
              marginTop: 16,
              marginBottom: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
            showsHorizontalScrollIndicator={false}
          />

          {remainingCount > 0 && (
            <Text allowFontScaling={false} style={styles.extraText}>
              +{remainingCount} other product{remainingCount > 1 ? "s" : ""}
            </Text>
          )}

          {/* CTA Button */}
          <TouchableOpacity onPress={onGoToCart} style={styles.buttonPrimary}>
            <ImageBackground
              source={require("../assets/vip-dark-background.png")}
              style={styles.buttonImageBackground}
              imageStyle={{ borderRadius: 8 }}
              contentFit="cover"
              transition={300}
            >
              <Text allowFontScaling={false} style={styles.buttonText}>FINISH CHECKOUT</Text>
            </ImageBackground>
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
    position: "relative",
    minHeight: 380,
  },
  logo: {
    width: 140,
    height: 60,
    marginBottom: 5,
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
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Futura-Bold",
    fontSize: 16,
    textAlign: "center",
  },
});
