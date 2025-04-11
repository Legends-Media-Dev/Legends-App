import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Linking,
} from "react-native";

const YoutubeContentBox = ({
  topTitle,
  thumbnail,
  videoId, // 👈 NEW prop
}) => {
  const handlePress = () => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    Linking.openURL(youtubeUrl).catch((err) =>
      console.error("Failed to open YouTube link:", err)
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.95}
    >
      <ImageBackground
        source={{ uri: thumbnail }}
        style={styles.box}
        imageStyle={styles.image}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>{topTitle}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
    paddingBottom: 20,
    paddingLeft: 16,
    paddingRight: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: "Futura-Bold",
    color: "#fff",
    textTransform: "uppercase",
  },
});

export default YoutubeContentBox;
