import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import {
  fetchCollections,
  fetchAllProductsCollection,
  fetchBlogArticles,
} from "../../api/shopifyApi";
import ContentBox from "../../components/ContentBox";

const { width, height } = Dimensions.get("window");

const VipPortalScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [screenData, setScreenData] = useState([]);

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
            return image && title ? { image, title, type: "vipArticle" } : null;
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
    if (item.type === "header") {
      return (
        <TouchableOpacity
          style={styles.benefitsButton}
          onPress={() => console.log("PRESS")}
        >
          <Text style={styles.benefitsButtonText}>EARN MONTHLY BENEFITS</Text>
        </TouchableOpacity>
      );
    }

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
        <View style={{ marginBottom: 8 }}>
          <ContentBox
            topTitle={item.title}
            image={
              item.image
                ? { uri: item.image }
                : require("../../assets/vip-background.png")
            }
            screenName="Sweepstakes"
          />
        </View>
      );
    }

    return null;
  };

  return loading ? (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" />
    </View>
  ) : (
    <FlatList
      data={screenData}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.type}-${index}`}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
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
});

export default VipPortalScreen;
