import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import HeroImage from "../../components/HeroImage";
import ContentBox from "../../components/ContentBox";
import YoutubeContentBox from "../../components/YoutubeContentBox";
import { fetchLatestYouTubeVideo } from "../../api/shopifyApi"; // ✅ Make sure this is the correct path

const NewsScreen = () => {
  const [latestVideo, setLatestVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const data = await fetchLatestYouTubeVideo();
        setLatestVideo(data);
      } catch (err) {
        console.error("Failed to load video:", err);
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🔹 Hero Banner */}
      <View style={styles.topHero}>
        <HeroImage
          title="THE NEW RELEASE IS LIVE!"
          subtitle="YOUR NEXT FAVORITE PIECES JUST DROPPED. GET IT BEFORE IT'S GONE!"
          backgroundColor="#D32F2F"
          collectionHandle="new-release"
        />
      </View>

      {/* 🔹 Latest YouTube Video Box */}
      <View style={styles.contentContainer}>
        <View style={styles.contentWrapper}>
          {loading ? (
            <ActivityIndicator />
          ) : latestVideo ? (
            <YoutubeContentBox
              topTitle={latestVideo.title}
              thumbnail={latestVideo.thumbnail}
              videoId={latestVideo.videoId} // 👈 Pass the YouTube video ID here
            />
          ) : null}
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
          title="THE NEW RELEASE IS LIVE!"
          subtitle="YOUR NEXT FAVORITE PIECES JUST DROPPED. GET IT BEFORE IT'S GONE!"
          backgroundColor="#D32F2F"
          collectionHandle="tshirts"
        />
      </View>
    </ScrollView>
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
});

export default NewsScreen;
