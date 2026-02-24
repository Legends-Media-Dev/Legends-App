import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
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

const ProductCardMini = ({
  image,
  name,
  price,
  compareAtPrice,
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

  const priceAmount = parseFloat(price?.amount ?? price ?? 0);
  const compareAmount = parseFloat(compareAtPrice?.amount ?? compareAtPrice ?? 0);
  const hasDiscount = compareAmount > priceAmount;

  const showGiveaway =
    giveawayMultiplier > 0 && !Number.isNaN(priceAmount) && priceAmount >= 0;
  const vipMult = getVipMultiplier(customerTags ?? []);
  const entries = showGiveaway
    ? Math.floor(priceAmount * giveawayMultiplier * vipMult * 1)
    : 0;

  return (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: image }} transition={300} style={styles.image} />
      </View>

      <View style={styles.textContainer}>
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

        <Text allowFontScaling={false} numberOfLines={2} style={styles.productName}>
          {name}
        </Text>

        <View style={styles.priceRow}>
          <Text
            allowFontScaling={false}
            style={[styles.productPrice, hasDiscount && styles.discountedPrice]}
          >
            ${priceAmount.toFixed(2)}
          </Text>

          {hasDiscount && (
            <Text allowFontScaling={false} style={styles.compareAtPrice}>
              ${compareAmount.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    width: "100%",
  },
  imageWrapper: {
    width: 50,
    height: 50,
    marginRight: 12,
    justifyContent: "center",
    alignSelf: "center",
  },
  image: {
    width: 50,
    height: 50,
    contentFit: "contain",
    borderRadius: 6,
  },
  entriesBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 6,
    gap: 4,
  },
  entriesTicketIcon: {
    width: 22,
    height: 22,
  },
  entriesText: {
    fontFamily: "Futura-Bold",
    fontSize: 11,
    color: "#000",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 13,
    fontFamily: "Futura-Bold",
    color: "#444",
    textTransform: "uppercase",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  productPrice: {
    fontSize: 13,
    fontFamily: "Futura-Medium",
    color: "#000",
  },
  discountedPrice: {
    color: "#C8102F",
    fontSize: 12,
    fontFamily: "Futura-Bold",
  },
  compareAtPrice: {
    fontSize: 13,
    fontFamily: "Futura-Medium",
    color: "#A09E9E",
    textDecorationLine: "line-through",
  },
});

export default ProductCardMini;
