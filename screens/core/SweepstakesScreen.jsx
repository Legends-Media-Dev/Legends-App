import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { fetchBlogArticles } from "../../api/shopifyApi";
import SwiperContentBox from "../../components/SwiperContentBox";
import OutlineText from "../../components/SvgOutlineText";

const extractSweepstakesData = (article) => {
  const html = article.contentHtml || "";

  // Match <p> tag content
  const rawParagraphs = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/g)].map(
    (match) => match[1]
  );

  // Remove any HTML tags from each paragraph
  const cleanParagraphs = rawParagraphs.map((p) =>
    p.replace(/<[^>]+>/g, "").trim()
  );

  // Match <img> tag src attributes
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

const parseDetails = (description) => {
  const details = {};
  
  const sweepstakesPeriodMatch = description.match(/SWEEPSTAKES PERIOD: ([^,]+)/i);
  const arvMatch = description.match(/ARV: ([^,]+)/i);
  const winnerMatch = description.match(/WINNER: ([^,]+)/i);
  const locationMatch = description.match(/LOCATION: ([^,]+)/i);
  const itemsBoughtMatch = description.match(/ITEMS BOUGHT: (.+)/i);
  
  if (sweepstakesPeriodMatch) details.period = sweepstakesPeriodMatch[1].trim();
  if (arvMatch) details.arv = arvMatch[1].trim();
  if (winnerMatch) details.winner = winnerMatch[1].trim();
  if (locationMatch) details.location = locationMatch[1].trim();
  if (itemsBoughtMatch) details.itemsBought = itemsBoughtMatch[1].trim();
  
  return details;
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

  const renderItem = ({ item }) => {
    const details = parseDetails(item.description2);
  
    return (
      <View>
        <Text style={styles.articleTitle}>{item.title}</Text>
        {item.description1 ? (
          <Text style={styles.articleText}>
            {item.description1}
          </Text>
        ) : null}
  
        {/* Structured second description */}
        {details.arv && (
          <Text style={styles.articleText}>
            ARV: {details.arv}
          </Text>
        )}
        {details.winner && (
          <Text style={styles.articleText}>
            WINNER: {details.winner}
          </Text>
        )}
        {details.location && (
          <Text style={styles.articleText}>
            LOCATION: {details.location}
          </Text>
        )}
        {details.itemsBought && (
          <Text style={styles.articleText}>
            ITEMS BOUGHT: {details.itemsBought}
          </Text>
        )}

        <SwiperContentBox
          image1={item.image1}
          image2={item.image2}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <>
          {currentArticles.length > 0 && (
            <>
              <Text style={styles.outlineTitle}>
                CURRENT SWEEPSTAKES
              </Text>
              {currentArticles.map((item) => (
                <View key={item.id}>{renderItem({ item })}</View>
              ))}
            </>  
          )}
  
          {previousArticles.length > 0 && (
            <>
              <Text style={styles.outlineTitle}>
                PREVIOUS SWEEPSTAKES
              </Text>

              {previousArticles.map((item) => (
                <View key={item.id}>{renderItem({ item })}</View>
              ))}
            </>
          )}
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
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
    borderRadius: 10,
    marginTop: 10,
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
});

export default SweepstakesScreen;
