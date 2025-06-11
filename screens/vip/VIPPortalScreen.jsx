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
  ImageBackground,
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
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

const VipPortalScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [screenData, setScreenData] = useState([]);
  const [showWheel, setShowWheel] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const partnerLogos = [
    {
      id: "ghost",
      uri: "https://cdn.shopify.com/s/files/1/0003/8977/5417/files/Ghost.png?v=1684369049",
      url: "https://www.ghostlifestyle.com/",
    },
    {
      id: "meguiars",
      uri: "https://cdn.shopify.com/s/files/1/0003/8977/5417/files/Meguiar_s.png?v=1684369049",
      url: "https://www.meguiars.com/#/",
    },
    {
      id: "toprank",
      uri: "https://cdn.shopify.com/s/files/1/0003/8977/5417/files/Top_Rank.png?v=1684369049",
      url: "https://www.importavehicle.com/",
    },
    {
      id: "fitment",
      uri: "https://cdn.shopify.com/s/files/1/0003/8977/5417/files/Fitment_Industries.png?v=1684369049",
      url: "https://www.fitmentindustries.com/?utm_source=google&utm_medium=cpc&utm_campaign=6773145759&utm_content=125574610510&utm_term=fitment%20industries&gclid=CjwKCAjw9pGjBhB-EiwAa5jl3DY1dU77CLtJtYRvmNOzgP82JC30ikAThr0p8epIMKkT9SUrC-DozBoCVMIQAvD_BwE",
    },
    {
      id: "miller",
      uri: "https://cdn.shopify.com/s/files/1/0003/8977/5417/files/Miller.png?v=1684369049",
      url: "https://www.millerwelds.com/?gclid=CjwKCAjw9pGjBhB-EiwAa5jl3KylMNeXDs1r-Qk7v6d68ug1DpU7hJOCwkrnRasl0RgMV5SHvLTdqRoC-JsQAvD_BwE",
    },
    {
      id: "act",
      uri: "https://cdn.shopify.com/s/files/1/0003/8977/5417/files/ACT.png?v=1684369049",
      url: "https://www.advancedclutch.com/",
    },
    {
      id: "bridgestone",
      uri: "https://cdn.shopify.com/s/files/1/0003/8977/5417/files/Bridgestone.png?v=1684369049",
      url: "https://www.bridgestonetire.com/sem/bridgestone-tire/?https://ad.doubleclick.net/ddm/clk/546719407;355536812;q&lw_cmp=sem_bst-us_g_con_brand&keyword=bridgestone%20tires&campaign=10134808723&adgroup=101970748296&gad=1&gclid=CjwKCAjw9pGjBhB-EiwAa5jl3A2eegjgfI6FPudRRdlsLKeKNPVaSaliOMxxSdCY79dZ4peOKJWMMRoCFWwQAvD_BwE&ef_id=ZGVz-QAAAFjKhANx:20230518004327:s",
    },
    // add the rest...
  ];

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
          { type: "section", title: "EXCLUSIVE COLLECTIONS" },
          ...vipCollections,
          { type: "section", title: "VIP BLOG ARTICLES" },
          ...blogArticles,
          { type: "section", title: "PARTNERS" },
          { type: "partnerGrid", data: partnerLogos }, // 👈 new section type
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
    if (item.type === "section") {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }

    if (item.type === "collection") {
      return (
        <>
          {/* VIP Exclusive Product Card */}
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

          {/* VIP Facebook Group Card */}
          <TouchableOpacity
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Linking.openURL(
                "https://www.facebook.com/groups/626026679443756"
              );
            }}
            activeOpacity={1}
          >
            <View
              style={{
                backgroundColor: "#ADD8E6",
                borderRadius: 12,
                marginTop: -3,
              }}
            >
              <View style={styles.vipCardContent}>
                <Text style={styles.vipExclusiveButtonText}>
                  VIP FACEBOOK GROUP
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </>
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

    if (item.type === "partnerGrid") {
      return (
        <View style={styles.partnerGridContainer}>
          {item.data.map((partner) => (
            <TouchableOpacity
              key={partner.id}
              style={styles.partnerLogoBox}
              onPress={() => {
                if (partner.url) {
                  Linking.openURL(partner.url);
                }
              }}
            >
              <Image
                source={{ uri: partner.uri }}
                style={styles.partnerImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
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
  partnerGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  partnerLogoBox: {
    width: (width - 48) / 3, // 3 logos per row with margin
    height: 100,
    backgroundColor: "#f5f5f5",
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },

  partnerImage: {
    width: "70%",
    height: "70%",
  },
});

export default VipPortalScreen;
