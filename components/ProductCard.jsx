import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import { getCustomerInfo } from "../utils/storage";
import { useGiveaway } from "../context/GiveawayContext";

const { height } = Dimensions.get("window");

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

const ProductCard = ({
  image,
  name,
  price,
  compareAtPrice,
  availableForSale,
  giveawayMultiplier: giveawayMultiplierProp,
  customerTags: customerTagsProp,
}) => {
  const { multiplier: giveawayMultiplierFromContext } = useGiveaway();
  const giveawayMultiplier = giveawayMultiplierProp ?? giveawayMultiplierFromContext ?? 0;
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

  const hasDiscount =
    compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price);

  const priceNum = parseFloat(price);
  const showGiveaway =
    giveawayMultiplier > 0 && !Number.isNaN(priceNum) && priceNum >= 0;
  const vipMult = getVipMultiplier(customerTags ?? []);
  const entries = showGiveaway
    ? Math.floor(priceNum * giveawayMultiplier * vipMult * 1)
    : 0;

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image transition={300} source={{ uri: image }} style={styles.image} />
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
        {!availableForSale && (
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

      <View style={styles.textContainer}>
        <Text allowFontScaling={false} numberOfLines={2} style={styles.productName}>
          {name}
        </Text>

        <View style={styles.priceContainer}>
          <Text
            allowFontScaling={false}
            style={[styles.productPrice, hasDiscount && styles.discountedPrice]}
          >
            ${parseFloat(price).toFixed(2)}
          </Text>

          {hasDiscount && (
            <Text allowFontScaling={false} style={styles.compareAtPrice}>
              ${parseFloat(compareAtPrice).toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 12,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    contentFit: "cover",
    borderRadius: 12,
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
  textContainer: {
    width: "90%",
  },
  productName: {
    textAlign: "left",
    fontSize: 12,
    fontFamily: "Futura-Bold",
    paddingHorizontal: 8,
    color: "#000000",
    textTransform: "uppercase",
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    marginTop: 5,
    gap: 8,
  },
  productPrice: {
    fontSize: 12,
    fontFamily: "Futura-Medium",
    color: "#000000",
  },
  discountedPrice: {
    color: "#C8102F",
    fontSize: 12,
    fontFamily: "Futura-Bold",
  },
  compareAtPrice: {
    fontSize: 12,
    fontFamily: "Futura-Medium",
    color: "#A09E9E",
    textDecorationLine: "line-through",
  },
});

export default ProductCard;
