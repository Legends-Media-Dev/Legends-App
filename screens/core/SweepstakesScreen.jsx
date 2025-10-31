import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { fetchBlogArticles } from "../../api/shopifyApi";
import { Image } from "expo-image";

const extractSweepstakesData = (article) => {
  console.log(article);
  const html = article.contentHtml || "";

  const rawParagraphs = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/g)].map(
    (match) => match[1]
  );

  const cleanParagraphs = rawParagraphs.map((p) =>
    p.replace(/<[^>]+>/g, "").trim()
  );

  const imgMatches = [...html.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)].map(
    (match) => match[1]
  );

  return {
    id: article.id,
    title: article.title,
    description1: cleanParagraphs[0] || "",
    description2: cleanParagraphs[1] || "",
    image1: imgMatches[0] || null,
    image2: imgMatches[1] || null,
  };
};

const decodeHtmlEntities = (str) => {
  return str
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
};

const parseDetails = (description) => {
  const details = {};
  const sweepstakesPeriodMatch = description.match(
    /SWEEPSTAKES PERIOD: ([^,]+)/i
  );
  const arvMatch = description.match(/ARV:\s*\$?([^,]+,[^,]+)/i);
  const winnerMatch = description.match(/WINNER: ([^,]+)/i);
  const locationMatch = description.match(/LOCATION: (.+?)(?=\s+[A-Z\s]+?:)/i);
  const itemsBoughtMatch = description.match(
    /ITEMS?\s+BOUGHT:\s*(.+?)(?:\s+[A-Z][A-Z\s]+?:|$)/i
  );

  if (sweepstakesPeriodMatch) details.period = sweepstakesPeriodMatch[1].trim();
  if (arvMatch) details.arv = arvMatch[1].trim();
  if (winnerMatch) details.winner = winnerMatch[1].trim();
  if (locationMatch)
    details.location = locationMatch[1].replace(/,$/, "").trim();
  if (itemsBoughtMatch) {
    details.itemsBought = decodeHtmlEntities(itemsBoughtMatch[1].trim());
  }

  return details;
};

const SweepstakesItem = ({ item }) => {
  const [showAfter, setShowAfter] = useState(false);
  const details = parseDetails(item.description2);
  const currentImage = showAfter ? item.image2 : item.image1;

  return (
    <View style={styles.card}>
      <Text style={styles.articleTitle}>{item.title}</Text>

      {item.description1 && (
        <Text style={styles.articleText}>{item.description1}</Text>
      )}
      {details.arv && (
        <Text style={styles.articleText}>ARV: {details.arv}</Text>
      )}
      {details.winner && (
        <Text style={styles.articleText}>WINNER: {details.winner}</Text>
      )}
      {details.location && (
        <Text style={styles.articleText}>LOCATION: {details.location}</Text>
      )}
      {details.itemsBought && (
        <Text style={styles.articleText}>
          ITEMS BOUGHT: {details.itemsBought}
        </Text>
      )}

      {currentImage && (
        <View style={styles.imageContainer}>
          <Image
            transition={300}
            source={{ uri: currentImage }}
            style={styles.mainImage}
          />

          <View style={styles.overlayButtons}>
            <TouchableOpacity
              onPress={() => setShowAfter(false)}
              style={[styles.overlayBtn, !showAfter && styles.overlayBtnActive]}
            >
              <Text
                style={[
                  styles.overlayBtnText,
                  !showAfter && styles.overlayBtnTextActive,
                ]}
              >
                Before
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowAfter(true)}
              style={[styles.overlayBtn, showAfter && styles.overlayBtnActive]}
            >
              <Text
                style={[
                  styles.overlayBtnText,
                  showAfter && styles.overlayBtnTextActive,
                ]}
              >
                After
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const SweepstakesScreen = () => {
  const [currentArticles, setCurrentArticles] = useState([]);
  const [previousArticles, setPreviousArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const blog = await fetchBlogArticles("sweepstakes");
        const allArticles = blog.articles?.edges || [];

        const current = [];
        const previous = [];

        allArticles.forEach((edge) => {
          const article = edge.node;
          const tags = article.tags || [];
          const cleaned = extractSweepstakesData(article);

          if (tags.includes("current")) {
            console.log(cleaned)
            current.push(cleaned);
          } else if (tags.includes("previous")) {
            previous.push(cleaned);
          }
        });

        setCurrentArticles(current);
        setPreviousArticles(previous);
      } catch (error) {
        console.error("Error loading sweepstakes articles:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#333" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {currentArticles.length > 0 && (
        <>
          <Text style={styles.outlineTitle}>CURRENT SWEEPSTAKES</Text>
          {currentArticles.map((item) => (
            <SweepstakesItem key={item.id} item={item} />
          ))}
        </>
      )}

      {previousArticles.length > 0 && (
        <>
          <Text style={styles.outlineTitle}>PREVIOUS SWEEPSTAKES</Text>
          {previousArticles.map((item) => (
            <SweepstakesItem key={item.id} item={item} />
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  outlineTitle: {
    fontSize: 24,
    color: "#000",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "Futura-Bold",
    marginBottom: 10,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  articleTitle: {
    fontSize: 16,
    fontFamily: "Futura-Bold",
    color: "#000",
    marginBottom: 6,
  },
  articleText: {
    fontSize: 14,
    fontFamily: "Futura-Regular",
    color: "#000",
    marginBottom: 4,
  },
  imageContainer: {
    position: "relative",
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: 200,
    contentFit: "cover",
  },
  overlayButtons: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    overflow: "hidden",
  },
  overlayBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    backgroundColor: "transparent",
  },
  overlayBtnActive: {
    backgroundColor: "#000",
  },
  overlayBtnText: {
    fontSize: 12,
    color: "#000",
    fontFamily: "Futura-Bold",
  },
  overlayBtnTextActive: {
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SweepstakesScreen;
