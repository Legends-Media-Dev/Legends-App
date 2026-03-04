import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { getCustomerInfo } from "../utils/storage";
import { useGiveaway } from "../context/GiveawayContext";

const TICKET_ICON_URI =
  "https://cdn.shopify.com/s/files/1/0003/8977/5417/files/admit_one_ticket.png?v=1683922022";

function getVipMultiplier(tags) {
  if (!Array.isArray(tags)) return 1;
  if (tags.includes("VIP Platinum")) return 10;
  if (tags.includes("VIP Gold")) return 5;
  if (tags.includes("VIP Silver")) return 2;
  if (tags.includes("Inactive Subscriber")) return 1;
  return 1;
}

const ProductCardDiscovery = ({ product, onPress, customerTags: customerTagsProp }) => {
  const image = product?.images?.edges?.[0]?.node?.src;
  const variant = product?.variants?.edges?.[0]?.node;
  const { multiplier: giveawayMultiplier } = useGiveaway();
  const [customerTags, setCustomerTags] = useState(customerTagsProp ?? null);

  useEffect(() => {
    if (customerTagsProp != null) {
      setCustomerTags(customerTagsProp);
      return;
    }
    let cancelled = false;
    getCustomerInfo().then((info) => {
      if (!cancelled && info?.tags) setCustomerTags(info.tags);
    });
    return () => { cancelled = true; };
  }, [customerTagsProp]);

  const price = parseFloat(variant?.price?.amount || 0);
  const compare = parseFloat(variant?.compareAtPrice?.amount || 0);
  const hasDiscount = compare > price;
  const allVariants = product?.variants?.edges ?? [];
  const isSoldOut = allVariants.length > 0 && allVariants.every((e) => !e?.node?.availableForSale);

  const showGiveaway =
    giveawayMultiplier > 0 && !Number.isNaN(price) && price >= 0;
  const vipMult = getVipMultiplier(customerTags ?? []);
  const entries = showGiveaway
    ? Math.floor(price * giveawayMultiplier * vipMult * 1)
    : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          contentFit="cover"
        />
        {showGiveaway && entries > 0 && (
          <View style={styles.entriesBadge}>
            <Image
              source={{ uri: TICKET_ICON_URI }}
              style={styles.entriesTicketIcon}
            />
            <Text allowFontScaling={false} style={styles.entriesText}>
              {entries} ENTRIES
            </Text>
          </View>
        )}
        {isSoldOut && (
          <View
            style={
              showGiveaway
                ? styles.soldOutBadgeBottomRight
                : styles.soldOutBadge
            }
          >
            <Text allowFontScaling={false} style={styles.soldOutText}>SOLD OUT</Text>
          </View>
        )}
      </View>

      <Text numberOfLines={2} style={styles.name}>
        {product.title}
      </Text>

      <View style={styles.priceRow}>
        <Text style={[styles.price, hasDiscount && styles.discounted]}>
          ${price.toFixed(2)}
        </Text>

        {hasDiscount && (
          <Text style={styles.compare}>
            ${compare.toFixed(2)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 170,
  },

  imageWrapper: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  entriesBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
    gap: 4,
  },
  entriesTicketIcon: {
    width: 24,
    height: 24,
  },
  entriesText: {
    fontFamily: "Futura-Bold",
    fontSize: 11,
    color: "#000",
  },
  soldOutBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#C8102F",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  soldOutBadgeBottomRight: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "#C8102F",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  soldOutText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Futura-Bold",
  },

  name: {
    fontSize: 14,
    fontFamily: "Futura-Medium",
    marginTop: 10,
    color: "#222",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },

  price: {
    fontSize: 14,
    fontFamily: "Futura-Bold",
    color: "#000",
  },

  discounted: {
    color: "#C8102F",
  },

  compare: {
    fontSize: 13,
    color: "#999",
    textDecorationLine: "line-through",
  },
});

export default ProductCardDiscovery;