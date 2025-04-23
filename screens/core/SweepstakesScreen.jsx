import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { fetchBlogArticles } from "../../api/shopifyApi";

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

  const renderItem = ({ item }) => (
    <View style={styles.articleContainer}>
      <Text style={styles.articleTitle}>{item.title}</Text>
      {item.description1 ? (
        <Text style={styles.articleText}>{item.description1}</Text>
      ) : null}
      {item.description2 ? (
        <Text style={styles.articleText}>{item.description2}</Text>
      ) : null}
      {item.image1 && (
        <Image source={{ uri: item.image1 }} style={styles.image} />
      )}
      {item.image2 && (
        <Image source={{ uri: item.image2 }} style={styles.image} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sweepstakes</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <>
          {currentArticles.length > 0 && (
            <>
              <Text style={styles.subHeader}>Current</Text>
              <FlatList
                data={currentArticles}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
              />
            </>
          )}
          {previousArticles.length > 0 && (
            <>
              <Text style={styles.subHeader}>Previous</Text>
              <FlatList
                data={previousArticles}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
              />
            </>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 5,
    color: "#333",
  },
  articleContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
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
    color: "#444",
    marginBottom: 4,
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
    borderRadius: 10,
    marginTop: 10,
  },
});

export default SweepstakesScreen;
