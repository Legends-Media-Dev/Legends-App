import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Linking,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  fetchCollections,
  fetchAllProductsCollection,
  fetchBlogArticles,
} from "../../api/shopifyApi";
import ContentBox from "../../components/ContentBox";
import { WebView } from "react-native-webview";

const { width, height } = Dimensions.get("window");

const VipPortalScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [screenData, setScreenData] = useState([]);
  const [showWheel, setShowWheel] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const collectionsData = await fetchCollections();
        const vipCollections = collectionsData
          .filter((c) => c.title.includes("VIP DIGITAL DOWNLOADS"))
          .map((item) => ({ ...item, type: "collection" }));

        const blog = await fetchBlogArticles("vip");
        const blogArticles = (blog.articles?.edges || [])
          .map((edge) => {
            const image = edge.node.image?.src;
            const title = edge.node.title;
            const description = edge.node.contentHtml;
            return image && description && title
              ? { image, description, title, type: "vipArticle" }
              : null;
          })
          .filter(Boolean);

        setScreenData([
          { type: "header" },
          { type: "section", title: "EXCLUSIVE COLLECTIONS" },
          ...vipCollections,
          { type: "section", title: "VIP BLOG ARTICLES" },
          ...blogArticles,
        ]);
      } catch (err) {
        console.error("Error loading screen data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const renderParsedText = (html) => {
    if (!html) return null;

    // Handle anchor tags separately first
    const anchorTagRegex = /<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi;

    let parsed = [];
    let lastIndex = 0;
    let match;

    // Temporarily replace links with a placeholder to preserve them
    const placeholders = [];
    html = html.replace(anchorTagRegex, (full, url, text) => {
      const id = placeholders.length;
      placeholders.push({ url, text });
      return `[[LINK_${id}]]`;
    });

    // Strip all remaining tags and replace block tags with line breaks
    const clean = html
      .replace(/<[^>]+>/g, "") // Remove all HTML tags
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\n{3,}/g, "\n\n") // Prevent too many newlines
      .trim();

    // Split on placeholder markers
    const parts = clean.split(/\[\[LINK_(\d+)\]\]/g);

    parts.forEach((part, index) => {
      if (index % 2 === 0) {
        // Plain text
        if (part) parsed.push(part);
      } else {
        // Link part
        const link = placeholders[Number(part)];
        parsed.push(
          <Text
            key={`link-${part}`}
            style={{ color: "#1DB954", textDecorationLine: "underline" }}
            onPress={() => Linking.openURL(link.url)}
          >
            {link.text}
          </Text>
        );
      }
    });

    return parsed;
  };

  const handleCollectionPress = async (handle, title) => {
    try {
      const data = await fetchAllProductsCollection(handle);
      navigation.navigate("Collection", {
        handle,
        title,
        products: data.products,
      });
    } catch (error) {
      console.error("Error navigating to collection:", error);
    }
  };

  const renderItem = ({ item }) => {
    // if (item.type === "header") {
    //   return (
    //     <TouchableOpacity
    //       style={styles.benefitsButton}
    //       onPress={() => setShowWheel(true)}
    //     >
    //       <Text style={styles.benefitsButtonText}>EARN MONTHLY BENEFITS</Text>
    //     </TouchableOpacity>
    //   );
    // }

    if (item.type === "section") {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }

    if (item.type === "collection") {
      return (
        <TouchableOpacity
          style={styles.collectionItem}
          onPress={() => handleCollectionPress(item.handle, item.title)}
        >
          <Text style={styles.collectionText}>{item.title}</Text>
        </TouchableOpacity>
      );
    }

    if (item.type === "vipArticle") {
      return (
        <TouchableOpacity style={{ marginBottom: 8 }}>
          <ContentBox
            topTitle={item.title}
            image={
              item.image
                ? { uri: item.image }
                : require("../../assets/vip-background.png")
            }
            onPress={() => setSelectedArticle(item)} // ✅ Override ContentBox press behavior
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return loading ? (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="small" />
    </View>
  ) : (
    <>
      <FlatList
        data={screenData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />

      {/* <Modal
        visible={showWheel}
        animationType="slide"
        onRequestClose={() => setShowWheel(false)}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => setShowWheel(false)}
            style={{
              padding: 12,
              backgroundColor: "#C8102F",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontFamily: "Futura-Bold" }}>
              Close
            </Text>
          </TouchableOpacity>
          <WebView
            source={{ uri: "https://yourpage.com/spinwheel" }}
            style={{ flex: 1 }}
          />
        </View>
      </Modal> */}
      <Modal
        visible={!!selectedArticle}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedArticle(null)}
      >
        {/* Semi-transparent dark background */}
        <View style={styles.modalOverlay}>
          {/* Modal content */}
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setSelectedArticle(null)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color="#000" />
            </TouchableOpacity>

            {selectedArticle && (
              <>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.articleTitle}>
                    {selectedArticle.title}
                  </Text>
                  <Image
                    source={{ uri: selectedArticle.image }}
                    style={styles.articleImage}
                  />
                  <Text style={styles.articleDescription}>
                    {renderParsedText(selectedArticle.description)}
                  </Text>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
    marginVertical: 16,
    color: "#000",
  },
  collectionItem: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    paddingVertical: 16,
    marginVertical: 8,
    marginHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  collectionText: {
    fontSize: 18,
    fontFamily: "Futura-Bold",
    color: "#000",
  },
  benefitsButton: {
    backgroundColor: "#C8102F",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  benefitsButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Futura-Bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // translucent gray overlay
    justifyContent: "flex-start",
    paddingTop: height * 0.08,
  },

  modalContent: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },

  closeText: {
    fontFamily: "Futura-Bold",
    fontSize: 16,
    marginBottom: 20,
    color: "#C8102F",
  },

  articleTitle: {
    fontSize: 24,
    fontFamily: "Futura-Bold",
    marginBottom: 16,
  },

  articleImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },

  articleDescription: {
    fontFamily: "Futura-Regular",
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginBottom: 20,
  },
});

export default VipPortalScreen;
