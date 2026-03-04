import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from "react-native";
import { fetchBlogArticles } from "../../api/shopifyApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import GlassHeader from "../../components/GlassHeader";
import { getScreenContentPadding } from "../../constants/layout";

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

const SweepstakesItem = ({ item }) => {
  const [showAfter, setShowAfter] = useState(false);
  const currentImage = showAfter ? item.image2 : item.image1;

  return (
    <View style={styles.card}>
      <Text allowFontScaling={false} style={styles.articleTitle}>{item.title}</Text>

      {item.description1 && (
        <Text allowFontScaling={false} style={styles.articleText}>{item.description1}</Text>
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
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
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
      <View style={styles.root}>
        <GlassHeader scrollY={scrollY} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#333" />
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.root}>
      <GlassHeader scrollY={scrollY} />
  
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={{
          ...getScreenContentPadding(insets),
          paddingBottom: 40,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {currentArticles.length > 0 && (
          <>
            <Text allowFontScaling={false} style={styles.outlineTitle}>
              CURRENT GIVEAWAYS
            </Text>
            {currentArticles.map((item) => (
              <SweepstakesItem key={item.id} item={item} />
            ))}
          </>
        )}
  
        {previousArticles.length > 0 && (
          <>
            <Text allowFontScaling={false} style={styles.outlineTitle}>
              PREVIOUS GIVEAWAYS
            </Text>
            {previousArticles.map((item) => (
              <SweepstakesItem key={item.id} item={item} />
            ))}
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  outlineTitle: {
    fontSize: 24,
    color: "#000",
    fontWeight: "900",
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
