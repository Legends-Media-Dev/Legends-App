import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  Animated
} from "react-native";
import HeroImage from "../../components/HeroImage";
import YoutubeContentBox from "../../components/YoutubeContentBox";
import CategoryGrid from "../../components/CategoryGrid";
import { useNavigation } from "@react-navigation/native";

import {
  fetchLatestYouTubeVideo,
  fetchCollectionByHandle,
  fetchCollections,
  fetchAllProductsCollection,
} from "../../api/shopifyApi";

import { getCustomerInfo } from "../../utils/storage";
import HorizontalProductRow from "../../components/HorizontalProductRow";
import HomeGiveawayPreview from "../core/HomeGiveawayPreview";

const NewsScreen = () => {
  const [latestVideo, setLatestVideo] = useState(null);
  const [heroImage, setHeroImage] = useState(null);
  const [heroImageLoading, setHeroImageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);
  const [customerVIPStatus, setCustomerVIPStatus] = useState(false);
  const [categoryCollections, setCategoryCollections] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const hasFetchedVideo = useRef(false);
  const loading = heroImageLoading;

  const loadVideo = async () => {
    if (hasFetchedVideo.current) return; // prevent rerun
    hasFetchedVideo.current = true;

    try {
      const data = await fetchLatestYouTubeVideo();
      setLatestVideo(data);
    } catch (err) {
      console.error("Failed to load video:", err);
    } finally {
      setVideoLoading(false);
    }
  };

  const fetchHero = async () => {
    try {
      const collection = await fetchCollectionByHandle("new-release");
      setHeroImage(collection.image?.src);
    } catch (err) {
      console.error("Failed to load hero image:", err);
    } finally {
      setHeroImageLoading(false);
    }
  };

  const fetchNewArrivals = async () => {
    try {
      const data = await fetchAllProductsCollection("new-release");
      console.log("NEW ARRIVALS:", data);
      const products = 
        data?.products?.edges?.map((edge) => edge.node) || [];
      setNewArrivalProducts(products);
    } catch (err) {
      console.error("Failed to load new arrivals:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await fetchCollections();
  
      const collections = data || [];
  
      const allowedHandles = [
        "tshirts",
        "hats",
        "new-release",
        "stickers"
      ];
  
      const filtered = collections.filter((collection) =>
        allowedHandles.includes(collection.handle)
      );
  
      setCategoryCollections(filtered);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchHero(),
        fetchNewArrivals(),
        loadVideo(),
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
    fetchCategories();
  }, []);

  return (
    <>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" />
        </View>
      )}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Banner */}
        <View style={styles.topHero}>
          <HeroImage
            title="The new release is live"
            subtitle="Your next favorite pieces just dropped. Get it before it's gone."
            backgroundColor="#D32F2F"
            collectionHandle="new-release"
            image={heroImage}
          />
        </View>
        {/* Product shower */}
        <HorizontalProductRow
          title="Just Dropped"
          subtitle="These sell out quickly"
          products={newArrivalProducts}
          onPressItem={(product) =>
            navigation.navigate("Product", { product })
          }
        />
        {/* Youtube video */}
        {/* {latestVideo && (
          <YoutubeContentBox
            topTitle={latestVideo.title}
            thumbnail={latestVideo.thumbnail}
            videoId={latestVideo.videoId}
          />
        )} */}
        {/* Content Grid */}
        <CategoryGrid collections={categoryCollections}/>
        
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
        <HomeGiveawayPreview />

      </ScrollView>
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
