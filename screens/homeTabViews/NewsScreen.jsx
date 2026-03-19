import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Animated,
} from "react-native";
import AppRefreshControl from "../../components/AppRefreshControl";
import { useCart } from "../../context/CartContext";
import { useGiveaway } from "../../context/GiveawayContext";
import HeroImage from "../../components/HeroImage";
import YoutubeContentBox from "../../components/YoutubeContentBox";
import CategoryGrid from "../../components/CategoryGrid";
import { useNavigation } from "@react-navigation/native";
import {
  fetchLatestYouTubeVideo,
  fetchCollectionByHandle,
  fetchAllProductsCollection,
} from "../../api/shopifyApi";

import { getCustomerInfo } from "../../utils/storage";
import HorizontalProductRow from "../../components/HorizontalProductRow";
import HomeGiveawayPreview from "../core/HomeGiveawayPreview";
import { HOME_FEATURED_COLLECTION } from "../../constants/appConfig";

const NewsScreen = ({ scrollY: scrollYProp }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollYToUse = scrollYProp ?? scrollY;
  const { getCartDetails } = useCart();
  const { refetch: refetchGiveaway } = useGiveaway();
  const [latestVideo, setLatestVideo] = useState(null);
  const [heroImage, setHeroImage] = useState(null);
  const [heroHeader, setHeroHeader] = useState("");
  const [heroSubheader, setHeroSubheader] = useState("");
  const [heroImageLoading, setHeroImageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  /** Bumps on pull-to-refresh so embedded sections (giveaway card, category grid) refetch. */
  const [homeContentReloadKey, setHomeContentReloadKey] = useState(0);
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);
  const [customerVIPStatus, setCustomerVIPStatus] = useState(false);
  const navigation = useNavigation();

  const hasFetchedVideo = useRef(false);
  const loading = heroImageLoading;

  const loadVideo = async () => {
    if (hasFetchedVideo.current) return; // prevent rerun on initial mount
    hasFetchedVideo.current = true;

    try {
      const data = await fetchLatestYouTubeVideo();
      setLatestVideo(data);
    } catch (err) {
      console.error("Failed to load video:", err);
      setLatestVideo(null);
    }
  };

  const parseHeroTextFromDescription = (description) => {
    if (!description || typeof description !== "string") return {};
    const headerMatch = description.match(/HEADER:\s*"([^"]*)"/) ?? description.match(/HEADER:\s*\{([^}]*)\}/);
    const subheaderMatch = description.match(/SUBHEADER:\s*"([^"]*)"/) ?? description.match(/SUBHEADER:\s*\{([^}]*)\}/);
    return {
      header: headerMatch?.[1]?.trim() ?? "",
      subheader: subheaderMatch?.[1]?.trim() ?? "",
    };
  };

  const fetchHero = async () => {
    try {
      const collection = await fetchCollectionByHandle("app-main-collection");
      setHeroImage(collection.image?.src);
      const { header, subheader } = parseHeroTextFromDescription(collection?.description);
      if (header) setHeroHeader(header);
      if (subheader) setHeroSubheader(subheader);
    } catch (err) {
      console.error("Failed to load hero image:", err);
    } finally {
      setHeroImageLoading(false);
    }
  };

  const fetchNewArrivals = async () => {
    try {
      const handle = HOME_FEATURED_COLLECTION?.handle ?? "new-release";
      const data = await fetchAllProductsCollection(handle);
      const products =
        data?.products?.edges?.map((edge) => edge.node) || [];
      setNewArrivalProducts(products);
    } catch (err) {
      console.error("Failed to load featured collection:", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    hasFetchedVideo.current = false; // allow loadVideo to refetch on refresh
    try {
      setHomeContentReloadKey((k) => k + 1);
      await Promise.all([
        fetchHero(),
        fetchNewArrivals(),
        loadVideo(),
        loadCustomerInfo(),
        refetchGiveaway?.(),
        getCartDetails?.(),
      ]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadCustomerInfo = async () => {
    const data = await getCustomerInfo();

    if (data && Array.isArray(data.tags)) {
      const customerTags = data.tags;
      const isVIP =
        customerTags.includes("Active Subscriber") ||
        customerTags.includes("VIP Gold");

      setCustomerVIPStatus(isVIP);
    } else {
      setCustomerVIPStatus(false);
    }
  };

  useEffect(() => {
    loadCustomerInfo();
    fetchHero();
    fetchNewArrivals();
    loadVideo();
  }, []);

  return (
    <>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" />
        </View>
      )}
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollYToUse } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Banner */}
        <View style={styles.topHero}>
          <HeroImage
            title={heroHeader}
            subtitle={heroSubheader}
            backgroundColor="#D32F2F"
            collectionHandle="app-main-collection"
            image={heroImage}
          />
        </View>
        {/* Product shower */}
        <HorizontalProductRow
          title={HOME_FEATURED_COLLECTION?.title ?? "APP MAIN COLLECTION"}
          subtitle={HOME_FEATURED_COLLECTION?.subtitle}
          products={newArrivalProducts}
          onPressItem={(product) =>
            navigation.navigate("Product", { product })
          }
        />
        {/* YouTube video from Firebase (fetchLatestYouTubeVideo) */}
        {latestVideo?.videoId && (
          <YoutubeContentBox
            topTitle={latestVideo.title ?? ""}
            thumbnail={latestVideo.thumbnail ?? ""}
            videoId={latestVideo.videoId}
          />
        )}
        {/* Content Grid */}
        <CategoryGrid reloadKey={homeContentReloadKey} />

        {!customerVIPStatus && (
          <View style={styles.vipWrapper}>
            <ImageBackground
              source={require("../../assets/vip-dark-background.png")}
              style={styles.vipBackground}
              imageStyle={{ borderRadius: 28 }}
            >
              {/* Dark overlay */}
              <View style={styles.vipOverlay} />

              <View style={styles.vipContent}>
                <Text style={styles.vipTitle}>VIP Access</Text>

                <Text style={styles.vipSubtitle}>
                  Early drops. Exclusive releases. Members-only perks.
                </Text>

                <TouchableOpacity
                  style={styles.vipButton}
                  onPress={() => navigation.navigate("JoinVIPScreen")}
                  activeOpacity={0.9}
                >
                  <Text style={styles.vipButtonText}>Join VIP</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        )}
        <HomeGiveawayPreview reloadKey={homeContentReloadKey} />

      </Animated.ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  topHero: {
    marginBottom: 15,
  },
  contentContainer: {
    gap: 16,
    marginVertical: 20,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  contentWrapper: {
    paddingLeft: 5,
    paddingRight: 5,
  },
  lowerHero: {
    marginTop: 15,
  },
  fullscreenLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA", // Match your screen's background
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    alignItems: "center",
  },
  vipWrapper: {
    marginTop: 30,
    marginHorizontal: 20,
  },

  vipBackground: {
    borderRadius: 28,
    overflow: "hidden",
    padding: 32,
    justifyContent: "center",
  },

  vipOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)", // adjust darkness here
  },

  vipContent: {
    zIndex: 2,
  },

  vipTitle: {
    fontSize: 24,
    fontFamily: "Futura-Bold",
    color: "#fff",
  },

  vipSubtitle: {
    marginTop: 12,
    marginBottom: 24,
    fontSize: 15,
    fontFamily: "Futura-Medium",
    color: "#ddd",
  },

  vipButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: "center",
  },

  vipButtonText: {
    fontFamily: "Futura-Bold",
    fontSize: 14,
    textTransform: "uppercase",
  },
});

export default NewsScreen;
