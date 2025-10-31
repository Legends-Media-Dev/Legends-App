import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Linking
} from "react-native";
import { Image, ImageBackground } from "expo-image";

const { width } = Dimensions.get("window");

const perks = [
  "Access to VIP Facebook Community",
  "Access to VIP only merchandise products",
  "Exclusive sponsorship discounts",
  "Exclusive VIP only giveaways",
  "Monthly merch drop early access",
  "Exclusive VIP portal",
  "Free shipping on orders over $100",
  "25 bonus entries for car giveaways",
  "5x entries for car giveaways",
  "Monthly VIP T-shirt",
];

function JoinVIPScreen() {
  const [loading, setLoading] = React.useState(true);

  const handlePress = () => {
    Linking.openURL('https://legends.media/pages/vip-page');
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="small" color="#333" />
      </View>
    );
  }

  return (
    <ImageBackground
      transition={300}
      source={require("../../assets/vip-dark-background.png")}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.tierLabel}>GOLD</Text>
          <Text style={styles.priceText}>
            $25<Text style={styles.moText}>/mo</Text>
          </Text>

          <View style={styles.perkSection}>
            {perks.map((perk, index) => (
              <View key={index} style={styles.perkRow}>
                <Text style={styles.dot}>●</Text>
                <Text style={styles.perkText}>{perk}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.joinButton} activeOpacity={1} onPress={handlePress}>
            <Text style={styles.joinButtonText}>JOIN ONLINE TODAY</Text>
          </TouchableOpacity>
        </View>
        <Image
          transition={300}
          source={require("../../assets/How_VIP_Works.png")} 
          style={styles.productImage}
        />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: width - 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  tierLabel: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
    color: "#C8A101",
    textAlign: "center",
    marginBottom: 8,
  },
  priceText: {
    fontSize: 32,
    fontFamily: "Futura-Bold",
    textAlign: "center",
  },
  moText: {
    fontSize: 18,
    fontFamily: "Futura-Medium",
  },
  perkSection: {
    marginTop: 20,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  dot: {
    color: "#000",
    fontSize: 12,
    marginRight: 6,
    marginTop: 3,
  },
  perkText: {
    fontSize: 14,
    fontFamily: "Futura-Medium",
    color: "#333",
    flex: 1,
  },
  joinButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 30,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Futura-Bold",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF", // or match your splash bg
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: width,
    height: (width - 10) * 1.25,
    borderRadius: 12,
    marginTop: 15,
    contentFit: "cover",
  },
});

export default JoinVIPScreen;
