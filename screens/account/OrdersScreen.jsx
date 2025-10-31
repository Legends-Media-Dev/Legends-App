import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchAllCustomerOrders } from "../../api/shopifyApi"; // Adjust path if needed

function OrdersScreen({ route }) {
  const { accessToken } = route.params || {}; // Get accessToken from params
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

  //   console.log(orders[0].lineItems.edges[0].node.quantity);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Past Orders</Text>
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" />
        </View>
      ) : orders.length > 0 ? (
        <FlatList
          style={{ paddingTop: 10 }}
          data={orders}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.orderItem}
              onPress={() => handleOrderPress(item.statusUrl)}
            >
              <View style={styles.topContainer}>
                <View style={styles.topLeftContainer}>
                  <Text style={styles.orderText}>Order Number</Text>
                  <Text style={styles.orderInfoText}>{item.orderNumber}</Text>
                </View>
                <View style={styles.topRightContainer}>
                  <Text style={styles.orderText}>Order Date</Text>
                  <Text style={styles.orderInfoText}>
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
                  <Text style={styles.orderInfoTextBig}>
                    {item.lineItems.edges[0].node.quantity} item
                  </Text>
                </View>
                <View>
                  <Text style={styles.orderInfoTextBig}>
                    ${parseFloat(item.totalPrice.amount).toFixed(2)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noOrders}>No orders found.</Text>
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
  orderItem: {
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2, // Slightly increased for more visibility
    shadowOffset: { width: 4, height: 2 }, // Increased width for left/right shadow
    shadowRadius: 6, // Slightly increased for a softer spread
    elevation: 5, // For Android, higher value = more prominent shadow
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    marginTop: 8,
    fontSize: 14,
    color: "#007AFF",
    textDecorationLine: "underline",
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
    fontSize: 18,
    color: "#000000",
    fontFamily: "Futura-Medium",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
