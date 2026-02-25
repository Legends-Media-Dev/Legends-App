import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { fetchBlogArticles } from "../../api/shopifyApi";

export default function HomeGiveawayPreview() {
  const navigation = useNavigation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Badge Logic
  const getBadgeLabel = (publishedAt) => {
    if (!publishedAt) return "CHECK OUT PAST GIVEAWAYS";

    const now = new Date();
    const start = new Date(publishedAt);

    const GIVEAWAY_DURATION_DAYS = 14; // adjust if needed
    const end = new Date(start);
    end.setDate(end.getDate() + GIVEAWAY_DURATION_DAYS);

    const diffInMs = end - now;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays <= 0) return "CHECK OUT PAST GIVEAWAYS";
    if (diffInDays <= 3) return "ENDS SOON";

    return "LIVE";
  };

  useEffect(() => {
    const loadGiveaway = async () => {
      try {
        const blog = await fetchBlogArticles("sweepstakes");
        const edges = blog?.articles?.edges || [];

        if (!edges.length) {
          setLoading(false);
          return;
        }

        // Find current giveaway first
        const current = edges.find((edge) =>
          edge.node.tags?.includes("current")
        );

        const target = current || edges[0]; // fallback to most recent

        const html = target.node.contentHtml || "";
        const imgMatch = html.match(/<img[^>]*src="([^"]+)"/);

        setArticle({
          id: target.node.id,
          title: target.node.title,
          image: imgMatch ? imgMatch[1] : null,
          publishedAt: target.node.publishedAt,
        });
      } catch (error) {
        console.error("Failed to load home giveaway:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGiveaway();
  }, []);

  if (loading || !article) return null;

  const badgeLabel = getBadgeLabel(article.publishedAt);
  const isPast = badgeLabel === "CHECK OUT PAST GIVEAWAYS";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate("Sweepstakes")}
      style={styles.wrapper}
    >
      <View style={styles.card}>
        {article.image && (
          <Image
            source={{ uri: article.image }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        )}

        <View style={styles.overlay} />

        {/* 🔴 Dynamic Badge */}
        {badgeLabel && (
          <View
            style={[
              styles.badge,
              isPast && styles.badgePast,
            ]}
          >
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.kicker}>
            {isPast ? "PAST GIVEAWAYS" : "CURRENT GIVEAWAY"}
          </Text>

          <Text style={styles.title}>{article.title}</Text>

          <Text style={styles.cta}>
            {isPast ? "View Past Winners →" : "Enter Now →"}
          </Text>
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