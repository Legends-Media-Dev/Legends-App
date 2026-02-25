import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";

const CategoryGrid = ({ collections = [] }) => {
  const navigation = useNavigation();

  if (!collections.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Explore</Text>

      <View style={styles.grid}>
        {collections.map((collection) => (
          <TouchableOpacity
            key={collection.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate("Collection", {
                handle: collection.handle,
                title: collection.title,
              })
            }
          >
            <Image
              source={{ uri: collection.image?.src }}
              style={styles.image}
              contentFit="cover"
            />
            <Text style={styles.label}>{collection.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default CategoryGrid;

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 28,
    fontFamily: "Futura-Bold",
    marginBottom: 30,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "49%",
  },

  image: {
    aspectRatio: 1,
    borderRadius: 2,
    backgroundColor: "#F2F2F2",
  },

  label: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: "Futura-Medium",
  },
});