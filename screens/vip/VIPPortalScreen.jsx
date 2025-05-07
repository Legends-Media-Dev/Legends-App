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
  ImageBackground,
} from "react-native";
import {
  fetchCollections,
  fetchAllProductsCollection,
  fetchBlogArticles,
} from "../../api/shopifyApi";
import ContentBox from "../../components/ContentBox";
import * as Haptics from "expo-haptics";

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
    if (item.type === "section") {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }

    if (item.type === "collection") {
      return (
        <TouchableOpacity
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleCollectionPress(item.handle, item.title);
          }}
          activeOpacity={1}
        >
          <ImageBackground
            source={require("../../assets/vip-dark-background.png")}
            style={styles.vipCard}
            imageStyle={styles.vipCardImage}
          >
            <View style={styles.vipCardContent}>
              <Text style={styles.vipExclusiveButtonText}>
                VIP EXCLUSIVE PRODUCT
              </Text>
            </View>
          </ImageBackground>
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
      <ActivityIndicator size="small" />
    </View>
  ) : (
    <FlatList
      data={screenData}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.type}-${index}`}
      contentContainerStyle={styles.container}
      style={{ backgroundColor: "#FFFFFF" }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  vipCard: {
    marginHorizontal: 4,
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  vipCardImage: {
    resizeMode: "cover",
    borderRadius: 12,
  },
  vipCardContent: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  vipExclusiveButtonText: {
    color: "#fff",
    fontFamily: "Futura-Bold",
    fontSize: 16,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VipPortalScreen;
