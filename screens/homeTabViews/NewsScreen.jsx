import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import HeroImage from "../../components/HeroImage";
import ContentBox from "../../components/ContentBox";
import YoutubeContentBox from "../../components/YoutubeContentBox";
import {
  fetchLatestYouTubeVideo,
  fetchCollectionByHandle,
  fetchBlogArticles,
} from "../../api/shopifyApi";

const NewsScreen = () => {
  const [latestVideo, setLatestVideo] = useState(null);
  const [heroImage, setHeroImage] = useState(null);
  const [heroImageTs, setHeroImageTs] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [heroImageLoading, setHeroImageLoading] = useState(true);
  const [heroImageLoadingTs, setHeroImageLoadingTs] = useState(true);
  const [sweepstakesImage, setSweepstakesImage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const hasFetchedVideo = useRef(false);
  const loading = heroImageLoading || heroImageLoadingTs;

  const extractFirstImageFromHtml = (html) => {
    const match = html?.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
  };

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

  const fetchHeroTs = async () => {
    try {
      const collection = await fetchCollectionByHandle("tshirts");
      setHeroImageTs(collection.image?.src);
    } catch (err) {
      console.error("Failed to load hero image:", err);
    } finally {
      setHeroImageLoadingTs(false);
    }
  };

  const fetchSweepstakesImage = async () => {
    try {
      const blog = await fetchBlogArticles("sweepstakes");
      const articles = blog.articles?.edges || [];

      const currentSweepstakes = articles
        .map((edge) => edge.node)
        .find((article) => article.tags.includes("current"));

      if (currentSweepstakes) {
        const firstImage = extractFirstImageFromHtml(
          currentSweepstakes.contentHtml
        );
        setSweepstakesImage(firstImage);
      }
    } catch (error) {
      console.error("Failed to fetch sweepstakes image:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchHero(),
        fetchHeroTs(),
        loadVideo(),
        fetchSweepstakesImage(),
      ]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHero();
    fetchHeroTs();
    loadVideo();
    fetchSweepstakesImage();
  }, []);

  return (
    <>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 🔹 Hero Banner */}
        <View style={styles.topHero}>
          <HeroImage
            title="THE NEW RELEASE IS LIVE!"
            subtitle="YOUR NEXT FAVORITE PIECES JUST DROPPED. GET IT BEFORE IT'S GONE!"
            backgroundColor="#D32F2F"
            collectionHandle="new-release"
            image={heroImage}
          />
        </View>

        {/* 🔹 Latest YouTube Video Box */}
        <View style={styles.contentContainer}>
          <View style={styles.contentWrapper}>
            {latestVideo && (
              <YoutubeContentBox
                topTitle={latestVideo.title}
                thumbnail={latestVideo.thumbnail}
                videoId={latestVideo.videoId}
              />
            )}
          </View>

          <View style={styles.contentWrapper}>
            <ContentBox
              topTitle="MORE PERKS? SAY LESS. JOIN VIP."
              image={require("../../assets/vip-background.png")}
              screenName="JoinVIPScreen"
              handle="vip"
            />
          </View>
        </View>

        <View style={styles.lowerHero}>
          <HeroImage
            title="SHOP ALL TEES!"
            subtitle="FROM EVERYDAY STAPLES TO STANDOUT GRAPHICS, YOUR NEW FAVORITE TEE IS WAITING."
            backgroundColor="#D32F2F"
            collectionHandle="tshirts"
            image={heroImageTs}
          />
        </View>

        {/* 🔹 Latest YouTube Video Box */}
        <View style={{ marginTop: 8, marginBottom: 10 }}>
          <View style={styles.contentWrapper}>
            <ContentBox
              topTitle="CURIOUS ABOUT OUR SWEEPSTAKES?"
              image={
                sweepstakesImage
                  ? { uri: sweepstakesImage }
                  : require("../../assets/vip-background.png")
              }
              screenName="Sweepstakes"
            />
          </View>
        </View>
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
    marginBottom: 10,
  },
  contentContainer: {
    gap: 5,
  },
  contentWrapper: {
    paddingLeft: 5,
    paddingRight: 5,
  },
  lowerHero: {
    marginTop: 10,
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
});

export default NewsScreen;
