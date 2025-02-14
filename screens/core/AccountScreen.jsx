import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from "react-native";
import ProductCard from "../../components/ProductCard";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import RoundedBox from "../../components/RoundedBox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCustomerDetails, fetchProductById } from "../../api/shopifyApi"; // Import API function
import { getRecentlyViewedProducts } from "../../utils/storage";

const AccountScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loadingRecentlyViewed, setLoadingRecentlyViewed] = useState(true);

  // Fetch customer details when the screen loads
  useEffect(() => {
    const getCustomerData = async () => {
      try {
        setLoading(true);
        const accessToken = await AsyncStorage.getItem("shopifyAccessToken");
        if (!accessToken) {
          console.log("No access token found.");
          setLoading(false);
          return;
        }

        const customerDetails = await fetchCustomerDetails(accessToken);
        setCustomerData(customerDetails);
      } catch (error) {
        console.error("Error fetching customer details:", error);
      } finally {
        setLoading(false);
      }
    };

    getCustomerData();
  }, []);

  // console.log(customerData.tags);

  // Update header with logout button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons
            name="log-out-outline"
            size={26}
            color="#000"
            style={{ marginRight: 30 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const fetchRecentlyViewed = async () => {
        try {
          setLoadingRecentlyViewed(true);

          // Retrieve stored product IDs
          const productIds = await getRecentlyViewedProducts();

          if (productIds.length > 0) {
            // Fetch full product details for each ID
            const products = await Promise.all(
              productIds.map(fetchProductById)
            );
            setRecentlyViewed(products);
          } else {
            setRecentlyViewed([]); // Clear when no recently viewed products exist
          }
        } catch (error) {
          console.error("Error fetching recently viewed products:", error);
        } finally {
          setLoadingRecentlyViewed(false);
        }
      };

      fetchRecentlyViewed();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("shopifyAccessToken");
      await AsyncStorage.removeItem("accessTokenExpiry");
      console.log("User logged out.");
      setModalVisible(false);
      navigation.replace("Login"); // Redirect to login screen after logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logout Confirmation Modal */}
      <Modal
        isVisible={modalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Are you sure you want to log out?
          </Text>
          <View style={styles.buttonContainer}>
            <RoundedBox
              isFilled={true}
              fillColor="transparent"
              borderColor="#C8102F"
              borderWidth={2}
              text="Cancel"
              textColor="#C8102F"
              fontVariant="medium"
              textSize={16}
              onClick={() => setModalVisible(false)}
              width={"50%"}
              height={40}
            />
            <RoundedBox
              isFilled={true}
              fillColor="#C8102F"
              borderColor="#C8102F"
              borderWidth={2}
              text="Log Out"
              textColor="white"
              fontVariant="medium"
              textSize={16}
              onClick={handleLogout}
              width={"50%"}
              height={40}
            />
          </View>
        </View>
      </Modal>

      {/* Display Customer Data */}
      <ScrollView style={styles.screenContainer}>
        {loading ? (
          <Text style={[styles.loadingText, { opacity: 0 }]}>Placeholder</Text>
        ) : customerData ? (
          <View style={styles.profileContainer}>
            <Text style={styles.customerName}>
              Hi, {customerData.firstName}.
            </Text>
          </View>
        ) : (
          <Text>No customer data available.</Text>
        )}

        {/* button Containers */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("OrdersScreen"); // Navigate to Join VIP screen
            }}
            style={styles.topButtonContainer}
          >
            <View style={styles.leftSide}>
              <Ionicons
                name="pricetags-outline"
                size={24}
                color="#000"
                style={{ marginRight: 0 }}
              />
              <Text style={styles.buttonText}>ORDERS</Text>
            </View>
            <View>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="#000"
                style={{ marginRight: 0 }}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.innerButtonContainer}
            onPress={() => {
              if (
                customerData?.tags?.includes("Active Subscriber") &&
                customerData?.tags?.includes("VIP Gold")
              ) {
                navigation.navigate("VIPPortalScreen"); // Navigate to VIP Portal screen
              } else {
                navigation.navigate("JoinVIPScreen"); // Navigate to Join VIP screen
              }
            }}
          >
            <View style={styles.leftSide}>
              <Ionicons name="diamond-outline" size={24} color="#000" />
              <Text style={styles.buttonText}>
                {customerData?.tags?.includes("Active Subscriber") &&
                customerData?.tags?.includes("VIP Gold")
                  ? "VIP PORTAL"
                  : "JOIN VIP"}
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.innerButtonContainer}
            onPress={() => {
              navigation.navigate("SweepstakesScreen"); // Navigate to Join VIP screen
            }}
          >
            <View style={styles.leftSide}>
              <Ionicons name="gift-outline" size={24} color="#000" />
              <Text style={styles.buttonText}>SWEEPSTAKES</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.lowerButtonContainer}
            onPress={() => {
              navigation.navigate("PrivacyPolicyScreen"); // Navigate to Join VIP screen
            }}
          >
            <View style={styles.leftSide}>
              <Ionicons name="newspaper-outline" size={24} color="#000" />
              <Text style={styles.buttonText}>PRIVACY POLICY</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.lowerContainer}>
          <Text style={styles.lowerText}>Recently Viewed</Text>

          {loadingRecentlyViewed ? (
            <Text style={styles.noProductsText}>Loading...</Text>
          ) : recentlyViewed.length === 0 ? (
            <Text style={styles.noProductsText}>
              No recently viewed products.
            </Text>
          ) : (
            <FlatList
              data={recentlyViewed}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentlyViewedScroll}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ width: 150, marginRight: 10 }}
                  onPress={() =>
                    navigation.navigate("Product", { product: item })
                  }
                >
                  <ProductCard
                    image={
                      item.images.edges[0]?.node.src ||
                      "https://via.placeholder.com/100"
                    }
                    name={item.title || "No Name"}
                    price={item.variants.edges[0].node.price.amount || "N/A"}
                  />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: 20, // Add some padding to the sides for better spacing
  },
  profileContainer: {
    alignItems: "flex-start", // Left-align text instead of center
    marginTop: 20,
    width: "100%",
  },
  customerName: {
    fontSize: 24,
    fontFamily: "Futura-Bold",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 7,
    alignItems: "center",
  },
  modalText: {
    fontSize: 14,
    fontFamily: "Futura-Bold",
  },

  buttonContainer: {
    marginTop: 20,
    backgroundColor: "#fff", // Ensure background is set for shadow visibility
    borderRadius: 10, // Rounded corners
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 0.15, // Shadow transparency
    shadowRadius: 5, // Shadow blur
    elevation: 4, // For Android shadows
  },

  buttonText: {
    fontFamily: "Futura-Medium",
    fontSize: 17,
  },
  topButtonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderColor: "#D3D3D3",
    borderBottomWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  innerButtonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderColor: "#D3D3D3",
    borderBottomWidth: 1,
    // borderLeftWidth: 1,
    // borderRightWidth: 1,
  },
  lowerButtonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    // borderBottomWidth: 1,
    // borderLeftWidth: 1,
    // borderRightWidth: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  leftSide: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  lowerContainer: {
    marginTop: 30,
    height: "100%",
  },
  lowerText: {
    fontFamily: "Futura-Medium",
    fontSize: 18,
  },
  recentlyViewedScroll: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  noProductsText: {
    textAlign: "center",
    color: "#888",
    marginTop: 170,
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
  },
});

export default AccountScreen;
