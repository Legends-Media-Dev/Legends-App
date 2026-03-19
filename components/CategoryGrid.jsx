import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { fetchCategoryGridCompInfo, fetchCollections } from "../api/shopifyApi";

const CategoryGrid = ({ collections: collectionsProp = [], reloadKey = 0 }) => {
  const navigation = useNavigation();
  const [sectionTitle, setSectionTitle] = useState("Explore");
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [config, shopifyCollections] = await Promise.all([
          fetchCategoryGridCompInfo(),
          fetchCollections(),
        ]);

        if (config?.items?.length > 0 && Array.isArray(shopifyCollections)) {
          setSectionTitle(config.sectionTitle || "Explore");
          const merged = [];
          for (const { handle, displayName } of config.items) {
            const match = shopifyCollections.find(
              (c) => c.handle?.toLowerCase() === handle?.toLowerCase()
            );
            if (match) {
              merged.push({
                ...match,
                title: displayName,
              });
            }
          }
          // Ensure even count so grid rows are full (2 columns)
          const evenCount = merged.length % 2 === 0 ? merged.length : merged.length - 1;
          setCollections(merged.slice(0, Math.max(0, evenCount)));
        } else if (collectionsProp.length > 0) {
          const evenCount =
            collectionsProp.length % 2 === 0
              ? collectionsProp.length
              : collectionsProp.length - 1;
          setCollections(collectionsProp.slice(0, Math.max(0, evenCount)));
        }
      } catch (err) {
        console.error("CategoryGrid load failed:", err);
        if (collectionsProp.length > 0) {
          const evenCount =
            collectionsProp.length % 2 === 0
              ? collectionsProp.length
              : collectionsProp.length - 1;
          setCollections(collectionsProp.slice(0, Math.max(0, evenCount)));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reloadKey]);

  const displayList = collections.length > 0 ? collections : collectionsProp;
  if (loading && displayList.length === 0) return null;
  if (!displayList.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>

      <View style={styles.grid}>
        {displayList.map((collection) => (
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
    marginBottom: 15,
  },

  image: {
    aspectRatio: 1,
    borderRadius: 5,
    backgroundColor: "#F2F2F2",
  },

  label: {
    marginTop: 6,
    fontSize: 15,
    fontFamily: "Futura-Medium",
  },
});