import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassHeader from "../../components/GlassHeader";
import { getScreenContentWrapperStyle, SCREEN_PADDING_HORIZONTAL } from "../../constants/layout";
import { fetchAllCustomerOrders } from "../../api/shopifyApi";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

function OrdersScreen({ route }) {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { accessToken } = route.params || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const getOrders = async () => {
      if (!accessToken) {
        console.log("No access token provided.");
        setLoading(false);
        return;
      }

      try {
        const fetchedOrders = await fetchAllCustomerOrders(accessToken);

        // Sort orders by processedAt in descending order (newest first)
        const sortedOrders = [...fetchedOrders].sort((a, b) => {
          return new Date(b.processedAt) - new Date(a.processedAt);
        });

        setOrders(sortedOrders);
      } catch (error) {
        console.error("Failed to fetch customer orders:", error.message);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, [accessToken]);

  const handleOrderPress = (orderUrl) => {
    if (orderUrl) {
      console.log("Navigating to order URL:", orderUrl);
      navigation.navigate("OrderConfirmationScreen", { orderUrl });
    } else {
      alert("Order details are not available.");
    }
  };

  return (
    <View style={styles.container}>
      <GlassHeader variant="dark" scrollY={scrollY} />
      <View style={getScreenContentWrapperStyle(insets)}>
        <Text allowFontScaling={false} style={styles.header}>Past Orders</Text>
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" />
          </View>
        ) : orders.length > 0 ? (
          <View style={styles.listContainer}>
            <AnimatedFlatList
              style={{ paddingTop: 10 }}
              contentContainerStyle={styles.listContent}
              data={orders}
              keyExtractor={(item, index) => index.toString()}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.orderItem}
                  onPress={() => handleOrderPress(item.statusUrl)}
                >
                  <View style={styles.topContainer}>
                    <View style={styles.topLeftContainer}>
                      <Text allowFontScaling={false} style={styles.orderText}>Order Number</Text>
                      <Text allowFontScaling={false} style={styles.orderInfoText}>{item.orderNumber}</Text>
                    </View>
                    <View style={styles.topRightContainer}>
                      <Text allowFontScaling={false} style={styles.orderText}>Order Date</Text>
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
                    <View>
                      <Text allowFontScaling={false} style={styles.orderInfoTextBig}>
                        {item.lineItems?.edges?.[0]?.node?.quantity ?? 0} item
                      </Text>
                    </View>
                    <View>
                      <Text allowFontScaling={false} style={styles.orderInfoTextBig}>
                        ${parseFloat(item.totalPrice?.amount ?? 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          <Text allowFontScaling={false} style={styles.noOrders}>No orders found.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    marginTop: 15,
    fontSize: 20,
    textAlign: "left",
    fontFamily: "Futura-Bold",
  },
  listContainer: {
    marginHorizontal: -SCREEN_PADDING_HORIZONTAL,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  orderItem: {
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
  noOrders: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
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

export default OrdersScreen;
