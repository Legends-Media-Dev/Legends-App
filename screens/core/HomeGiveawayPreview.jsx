import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { fetchGiveawayCompInfo } from "../../api/shopifyApi";

export default function HomeGiveawayPreview() {
  const navigation = useNavigation();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGiveaway = async () => {
      try {
        const data = await fetchGiveawayCompInfo();
        const items = data?.items ?? [];
        if (items.length > 0) {
          const first = items[0];
          setItem({
            id: first.id,
            badgeLabel: first.badgeLabel ?? "CHECK OUT PAST GIVEAWAYS",
            title: first.title ?? "",
            header: first.header ?? "",
            buttonText: first.buttonText ?? "View Past Winners",
            imageLink: first.imageLink ?? null,
          });
        }
      } catch (error) {
        console.error("Failed to load home giveaway:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGiveaway();
  }, []);

  if (loading || !item) return null;

  const isPast = (item.badgeLabel || "").toUpperCase().includes("PAST");
  const ctaText = (item.buttonText ?? "").trim();
  const ctaWithArrow = ctaText.endsWith("→") ? ctaText : `${ctaText} →`;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate("Sweepstakes")}
      style={styles.wrapper}
    >
      <View style={styles.card}>
        {item.imageLink && (
          <Image
            source={{ uri: item.imageLink }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        )}

        <View style={styles.overlay} />

        {item.badgeLabel ? (
          <View
            style={[
              styles.badge,
              isPast && styles.badgePast,
            ]}
          >
            <Text style={styles.badgeText}>{item.badgeLabel}</Text>
          </View>
        ) : null}

        <View style={styles.content}>
          <Text style={styles.kicker}>{item.title}</Text>
          <Text style={styles.title}>{item.header}</Text>
          <Text style={styles.cta}>{ctaWithArrow}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 30,
  },

  card: {
    borderRadius: 26,
    overflow: "hidden",
    position: "relative",
  },

  image: {
    width: "100%",
    height: 220,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  content: {
    position: "absolute",
    bottom: 22,
    left: 22,
    right: 22,
  },

  kicker: {
    color: "#fff",
    fontSize: 12,
    letterSpacing: 1.4,
    fontFamily: "Futura-Medium",
  },

  title: {
    marginTop: 6,
    fontSize: 22,
    color: "#fff",
    fontFamily: "Futura-Bold",
  },

  cta: {
    marginTop: 12,
    fontSize: 14,
    color: "#fff",
    fontFamily: "Futura-Bold",
  },

  badge: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "#C8102F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    zIndex: 3,

    shadowColor: "#C8102F",
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },

  badgePast: {
    backgroundColor: "#111",
    shadowColor: "#000",
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Futura-Bold",
    letterSpacing: 1,
  },
});