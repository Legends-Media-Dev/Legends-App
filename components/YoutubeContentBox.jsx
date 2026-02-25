import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const YoutubeContentBox = ({ topTitle, thumbnail, videoId }) => {
  const handlePress = () => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    Linking.openURL(youtubeUrl).catch((err) =>
      console.error("Failed to open YouTube link:", err)
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
      <Ionicons name="logo-youtube" size={30} color="#000" />
      <Text style={styles.sectionTitle}>YouTube</Text>
    </View>

      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.thumbnailWrapper}>
          <Image
            source={{ uri: thumbnail }}
            style={styles.thumbnail}
            contentFit="cover"
          />

          {/* Soft Play Button */}
          <View style={styles.playButton}>
            <Ionicons name="play" size={22} color="#000" />
          </View>
        </View>

        <Text
          allowFontScaling={false}
          numberOfLines={2}
          style={styles.title}
        >
          {topTitle}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 40,
    paddingHorizontal: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 28,
    fontFamily: "Futura-Bold",
    marginLeft: 8,
  },

  card: {
    width: "100%",
  },

  thumbnailWrapper: {
    aspectRatio: 16 / 9,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F2F2F2",
    position: "relative",
  },

  thumbnail: {
    width: "100%",
    height: "100%",
  },

  playButton: {
    position: "absolute",
    alignSelf: "center",
    top: "45%",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 14,
    borderRadius: 100,
  },

  title: {
    marginTop: 14,
    fontSize: 16,
    fontFamily: "Futura-Medium",
  },
});

export default YoutubeContentBox;