import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
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

  // Update header with logout button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setModalVisible(true);
          }}
        >
          <Ionicons
            name="log-out-outline"
            size={26}
            color="#000"
            style={{ marginRight: 25 }}
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

          const productIds = await getRecentlyViewedProducts();
          const cachedIdsString = await AsyncStorage.getItem(
            "cachedProductIds"
          );
          const cachedIds = cachedIdsString ? JSON.parse(cachedIdsString) : [];

          const idsAreSame =
            Array.isArray(productIds) &&
            Array.isArray(cachedIds) &&
            productIds.length === cachedIds.length &&
            productIds.every((id, i) => id === cachedIds[i]);

          if (idsAreSame) {
            const cachedProductsString = await AsyncStorage.getItem(
              "cachedProducts"
            );
            const cachedProducts = cachedProductsString
              ? JSON.parse(cachedProductsString)
              : [];
            setRecentlyViewed(cachedProducts);
          } else {
            const products = await Promise.all(
              productIds.map(async (id) => {
                try {
                  return await fetchProductById(id);
                } catch (err) {
                  console.error(`Failed to fetch product ${id}:`, err);
                  return null;
                }
              })
            );

            const filtered = products.filter(Boolean);
            setRecentlyViewed(filtered);
            await AsyncStorage.setItem(
              "cachedProductIds",
              JSON.stringify(productIds)
            );
            await AsyncStorage.setItem(
              "cachedProducts",
              JSON.stringify(filtered)
            );
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

      // Navigate back to the ACCOUNT tab, which will show the Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: "ACCOUNT" }],
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" />
        </View>
      )}
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
          <View style={styles.modalButtonContainer}>
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
        <View style={{ paddingHorizontal: 20 }}>
          {loading ? (
            <Text style={[styles.loadingText, { opacity: 0 }]}>
              Placeholder
            </Text>
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
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                const accessToken = await AsyncStorage.getItem(
                  "shopifyAccessToken"
                );
                console.log(
                  "Access token being passed to OrdersScreen:",
                  accessToken
                );
                if (accessToken) {
                  navigation.navigate("OrdersScreen", { accessToken });
                } else {
                  console.log("Access token not found.");
                }
              }}
              style={styles.topButtonContainer}
              activeOpacity={1}
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
              activeOpacity={1}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
              style={styles.lowerButtonContainer}
              activeOpacity={1}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate("SweepstakesScreen"); // Navigate to Join VIP screen
              }}
            >
              <View style={styles.leftSide}>
                <Ionicons name="gift-outline" size={24} color="#000" />
                <Text style={styles.buttonText}>SWEEPSTAKES</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={24} color="#000" />
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.lowerButtonContainer}
              onPress={() => {
                navigation.navigate("PrivacyPolicyScreen"); // Navigate to Join VIP screen
              }}
            >
              <View style={styles.leftSide}>
                <Ionicons name="car-outline" size={24} color="#000" />
                <Text style={styles.buttonText}>CAR SHOWS</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={24} color="#000" />
            </TouchableOpacity> */}
          </View>
        </View>
        <View>
          <View style={styles.lowerContainer}>
            <View style={{ paddingLeft: 20 }}>
              <Text style={styles.lowerText}>Recently Viewed</Text>
            </View>

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
                renderItem={({ item }) => {
                  console.log(item);
                  const variant = item.variants.edges[0]?.node;
                  const price = parseFloat(
                    variant?.price?.amount || "0"
                  ).toFixed(2);
                  const compareAt = variant?.compareAtPrice?.amount
                    ? parseFloat(variant.compareAtPrice.amount).toFixed(2)
                    : null;

                  return (
                    <TouchableOpacity
                      style={{ width: 150, marginRight: 10 }}
                      activeOpacity={1}
                      onPress={async () => {
                        await Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Medium
                        );
                        navigation.navigate("Product", { product: item });
                      }}
                    >
                      <ProductCard
                        image={
                          item.images.edges[0]?.node.src ||
                          "../assets/Legends.png"
                        }
                        name={item.title || "No Name"}
                        price={
                          item.variants.edges[0]?.node.price?.amount
                            ? parseFloat(
                                item.variants.edges[0].node.price.amount
                              ).toFixed(2)
                            : "N/A"
                        }
                        compareAtPrice={
                          item.variants.edges[0]?.node.compareAtPrice?.amount
                            ? parseFloat(
                                item.variants.edges[0].node.compareAtPrice
                                  .amount
                              ).toFixed(2)
                            : null
                        }
                        availableForSale={
                          item.variants.edges[0]?.node.availableForSale
                        }
                      />
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
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
    // paddingHorizontal: 20, // Add some padding to the sides for better spacing
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
  modalButtonContainer: {
    marginTop: 20,
    display: "flex",
    gap: 10,
    flexDirection: "row",
  },
  buttonContainer: {
    marginTop: 20,
    backgroundColor: "#fff", // Ensure background is set for shadow visibility
    borderRadius: 10, // Rounded corners
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 0.15, // Shadow transparency
    shadowRadius: 5, // Shadow blur
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
    paddingRight: 0,
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AccountScreen;
