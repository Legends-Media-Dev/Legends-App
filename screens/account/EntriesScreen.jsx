import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { fetchAllCustomerOrders } from "../../api/shopifyApi";
import { getCustomerInfo } from "../../utils/storage";
import { useGiveaway } from "../../context/GiveawayContext";

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

function EntriesScreen({ route }) {
  const { accessToken } = route.params || {};
  const { multiplier: giveawayMultiplier, startDate, endDate } = useGiveaway();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerTags, setCustomerTags] = useState(null);
  const navigation = useNavigation();

  const periodStart = startDate ? new Date(startDate).getTime() : Infinity;
  const periodEnd = endDate ? new Date(endDate).getTime() : -Infinity;

  useEffect(() => {
    getCustomerInfo().then((info) => {
      if (info?.tags) setCustomerTags(info.tags);
    });
  }, []);

  // Match Shopify: order in date range and not Refunded
  const isOrderInGiveawayPeriod = (order) => {
    const orderDate =
      order.processedAt ??
      order.processed_at ??
      order.createdAt ??
      order.created_at;
    if (!orderDate) return false;
    const orderTime = new Date(orderDate).getTime();
    if (Number.isNaN(orderTime)) return false;
    if (orderTime < periodStart || orderTime > periodEnd) return false;
    const status =
      order.financial_status_label ??
      order.financialStatusLabel ??
      order.financialStatus ??
      "";
    const isRefunded =
      String(status).toLowerCase() === "refunded" ||
      String(status).toUpperCase() === "REFUNDED";
    return !isRefunded;
  };

  useEffect(() => {
    const getOrders = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAllCustomerOrders(accessToken);
        const fetchedOrders = Array.isArray(data) ? data : data?.orders ?? [];
        const inGiveawayPeriod = fetchedOrders.filter(isOrderInGiveawayPeriod);

        const sortedOrders = [...inGiveawayPeriod].sort((a, b) => {
          const dateA = a.processedAt ?? a.createdAt ?? a.created_at;
          const dateB = b.processedAt ?? b.createdAt ?? b.created_at;
          return new Date(dateB) - new Date(dateA);
        });

        setOrders(sortedOrders);
      } catch (error) {
        console.error("Failed to fetch customer orders:", error.message);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, [accessToken, periodStart, periodEnd]);

  // Parse a price value that might be dollars ("45.00") or cents (4500)
  const parsePriceToDollars = (raw) => {
    if (raw == null || raw === "") return 0;
    const num = typeof raw === "number" ? raw : parseFloat(String(raw).replace(/[^0-9.-]/g, ""));
    if (Number.isNaN(num)) return 0;
    if (Number.isInteger(num) && num >= 100) return num / 100;
    return num;
  };

  // Shopify logic: use subtotal only (merchandise), never total (which includes shipping)
  const getOrderSubtotalDollars = (order) => {
    const rawSubtotal =
      order.subtotalPrice?.amount ??
      order.subtotalPriceSet?.shopMoney?.amount ??
      order.subtotal_price ??
      order.subtotalPrice ??
      order.subtotal;
    const fromSubtotal = parsePriceToDollars(rawSubtotal);
    if (fromSubtotal > 0) return fromSubtotal;

    const rawLines =
      order.lineItems?.edges ??
      order.lineItems ??
      order.line_items ??
      [];
    const lines = Array.isArray(rawLines) ? rawLines : [];
    const fromLines = lines.reduce((sum, edge) => {
      const node = edge?.node ?? edge;
      const qty = node?.quantity ?? 0;
      const unitPrice = parsePriceToDollars(
        node?.variant?.price?.amount ??
        node?.originalUnitPriceSet?.shopMoney?.amount ??
        node?.unitPriceSet?.shopMoney?.amount ??
        node?.unitPrice?.amount ??
        node?.merchandise?.price?.amount ??
        node?.price?.amount ??
        node?.price ??
        node?.unit_price ??
        node?.original_unit_price
      );
      return sum + unitPrice * qty;
    }, 0);
    if (fromLines > 0) return fromLines;

    return 0;
  };

  const vipMult = getVipMultiplier(customerTags ?? []);
  const totalEntries = useMemo(() => {
    if (giveawayMultiplier <= 0 || !orders.length) return 0;
    const orderData = orders.reduce(
      (sum, order) => sum + getOrderSubtotalDollars(order),
      0
    );
    return Math.floor(orderData * giveawayMultiplier * vipMult);
  }, [orders, customerTags, giveawayMultiplier]);

  const handleOrderPress = (orderUrl) => {
    if (orderUrl) {
      navigation.navigate("OrderConfirmationScreen", { orderUrl });
    } else {
      alert("Order details are not available.");
    }
  };

  return (
    <View style={styles.container}>
      <Text allowFontScaling={false} style={styles.header}>
        Giveaway Orders
      </Text>
      <View style={styles.totalEntriesRow}>
        <Text allowFontScaling={false} style={styles.totalEntriesLabel}>
          Total Entries:
        </Text>
        <View style={styles.totalEntriesValueRow}>
          <Image
            source={{ uri: TICKET_ICON_URI }}
            style={styles.totalEntriesIcon}
          />
          <Text allowFontScaling={false} style={styles.totalEntriesValue}>
            {totalEntries}
          </Text>
        </View>
      </View>
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" />
        </View>
      ) : orders.length > 0 ? (
        <FlatList
          style={{ paddingTop: 10 }}
          data={orders}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const orderEntries = Math.floor(
              getOrderSubtotalDollars(item) * giveawayMultiplier * vipMult
            );
            return (
              <TouchableOpacity
                style={styles.orderItem}
                onPress={() => handleOrderPress(item.statusUrl)}
              >
                <View style={styles.topContainer}>
                  <View style={styles.topLeftContainer}>
                    <Text allowFontScaling={false} style={styles.orderText}>
                      Order Number
                    </Text>
                    <Text allowFontScaling={false} style={styles.orderInfoText}>
                      {item.orderNumber}
                    </Text>
                  </View>
                  <View style={styles.topRightContainer}>
                    <Text allowFontScaling={false} style={styles.orderText}>
                      Order Date
                    </Text>
                    <Text allowFontScaling={false} style={styles.orderInfoText}>
                      {new Date(item.processedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.bottomContainer}>
                  <View style={styles.orderEntriesRow}>
                    <Image
                      source={{ uri: TICKET_ICON_URI }}
                      style={styles.orderEntriesIcon}
                    />
                    <Text allowFontScaling={false} style={styles.orderInfoTextBig}>
                      {orderEntries} ENTRIES
                    </Text>
                  </View>
                  <View>
                    <Text allowFontScaling={false} style={styles.orderInfoTextBig}>
                      ${parseFloat(item.totalPrice.amount).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <Text allowFontScaling={false} style={styles.noOrders}>
          No orders found during the giveaway period.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 15,
  },
  header: {
    fontSize: 20,
    textAlign: "left",
    paddingLeft: 16,
    fontFamily: "Futura-Bold",
  },
  totalEntriesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  totalEntriesLabel: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Futura-Bold",
  },
  totalEntriesValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  totalEntriesValue: {
    fontSize: 18,
    fontWeight: "medium",
    fontFamily: "Futura-Medium",
  },
  totalEntriesIcon: {
    width: 22,
    height: 22,
  },
  orderItem: {
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 4, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  topContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "#E0E0E0",
    borderBottomWidth: 1,
  },
  bottomContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 2,
  },
  orderEntriesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderEntriesIcon: {
    width: 20,
    height: 20,
  },
  orderText: {
    fontSize: 12,
    color: "#BEBEBE",
    fontFamily: "Futura-Regular",
    marginBottom: 4,
  },
  orderInfoText: {
    fontSize: 14,
    color: "#000000",
    fontFamily: "Futura-Medium",
    marginBottom: 12,
  },
  orderInfoTextBig: {
    fontSize: 17,
    color: "#000000",
    fontFamily: "Futura-Medium",
  },
  noOrders: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EntriesScreen;
