import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Linking,
  ImageBackground,
} from "react-native";
import HeroImage from "../../components/HeroImage";
import ContentBox from "../../components/ContentBox";

const NewsScreen = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🔹 Hero Banner */}
      <HeroImage
        title="THE NEW RELEASE IS LIVE!"
        subtitle="YOUR NEXT FAVORITE PIECES JUST DROPPED. GET IT BEFORE IT'S GONE!"
        backgroundColor="#D32F2F"
      />

      {/* 🔹 News Content Boxes */}
      <View style={styles.contentWrapper}>
        <ContentBox
          topTitle="GHOST® ENERGY 'PEACHES' SECURE A CAN"
          bottomTitle="GHOST® APPAREL 'KNITS' LOOKBOOK"
          topColor="#E64A19"
          bottomColor="#263238"
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
  contentWrapper: {
    padding: 4,
    gap: 15, // Space between content boxes
  },
});

export default NewsScreen;
