import React from "react";
import { 
  View, StyleSheet, ScrollView, Text, TouchableOpacity, Linking, ImageBackground 
} from "react-native";
import HeroImage from "../../components/HeroImage";
import ContentBox from "../../components/ContentBox";

const NewsScreen = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 🔹 Hero Banner */}
      <HeroImage 
        title="The new Glow Up™ Tight and Tank"
        subtitle="Structured for a held-in feeling that doesn’t hold you back."
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
