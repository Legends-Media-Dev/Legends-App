import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassHeader from "../../components/GlassHeader";
import AppRefreshControl from "../../components/AppRefreshControl";
import { useCart } from "../../context/CartContext";
import { getScreenContentPadding, SCREEN_PADDING_HORIZONTAL } from "../../constants/layout";
import ProductCard from "../../components/ProductCard";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import RoundedBox from "../../components/RoundedBox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCustomerDetails, fetchProductById } from "../../api/shopifyApi"; // Import API function
import {
  getRecentlyViewedProducts,
  setCustomerInfo,
} from "../../utils/storage";
import { useGiveaway } from "../../context/GiveawayContext";

const AccountScreen = () => {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { multiplier: giveawayMultiplier, refetch: refetchGiveaway } = useGiveaway();
  const { getCartDetails } = useCart();
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loadingRecentlyViewed, setLoadingRecentlyViewed] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomerData = useCallback(async (options = { showGlobalLoader: true }) => {
    const showLoader = options.showGlobalLoader !== false;
    try {
      if (showLoader) setLoading(true);
      const accessToken = await AsyncStorage.getItem("shopifyAccessToken");
      if (!accessToken) {
        console.log("No access token found.");
        setCustomerData(null);
        return;
      }

      const customerDetails = await fetchCustomerDetails(accessToken);
      setCustomerData(customerDetails);
      await setCustomerInfo(customerDetails);
    } catch (error) {
      console.error("Error fetching customer details:", error);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  const fetchRecentlyViewedData = useCallback(async () => {
    try {
      setLoadingRecentlyViewed(true);

      const productIds = await getRecentlyViewedProducts();
      const cachedIdsString = await AsyncStorage.getItem("cachedProductIds");
      const cachedIds = cachedIdsString ? JSON.parse(cachedIdsString) : [];

      const idsAreSame =
        Array.isArray(productIds) &&
        Array.isArray(cachedIds) &&
        productIds.length === cachedIds.length &&
        productIds.every((id, i) => id === cachedIds[i]);

      if (idsAreSame) {
        const cachedProductsString = await AsyncStorage.getItem("cachedProducts");
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
        await AsyncStorage.setItem("cachedProductIds", JSON.stringify(productIds));
        await AsyncStorage.setItem("cachedProducts", JSON.stringify(filtered));
      }
    } catch (error) {
      console.error("Error fetching recently viewed products:", error);
    } finally {
      setLoadingRecentlyViewed(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomerData({ showGlobalLoader: true });
  }, [fetchCustomerData]);

  useFocusEffect(
    useCallback(() => {
      fetchRecentlyViewedData();
    }, [fetchRecentlyViewedData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchCustomerData({ showGlobalLoader: false }),
        fetchRecentlyViewedData(),
        refetchGiveaway?.(),
        getCartDetails?.(),
      ]);
    } catch (e) {
      console.error("Account refresh:", e);
    } finally {
      setRefreshing(false);
    }
  }, [
    fetchCustomerData,
    fetchRecentlyViewedData,
    refetchGiveaway,
    getCartDetails,
  ]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("shopifyAccessToken");
      await AsyncStorage.removeItem("accessTokenExpiry");
      await AsyncStorage.removeItem("customerInfo");

      console.log("User logged out.");
      setModalVisible(false);
      setDeleteAccountModalVisible(false);

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
      <GlassHeader
        variant="dark"
        showSearchOnLeft
        scrollY={scrollY}
        showLogoutOnRight
        onLogoutPress={() => setModalVisible(true)}
      />
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
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text allowFontScaling={false} style={styles.modalTitle}>
            Log out?
          </Text>
          <Text allowFontScaling={false} style={styles.modalText}>
            Are you sure you want to log out?
          </Text>
          <View style={styles.modalButtonContainer}>
            <RoundedBox
              isFilled={true}
              fillColor="transparent"
              borderColor="#C8102F"
              borderWidth={2}
              borderRadius={14}
              text="Cancel"
              textColor="#C8102F"
              fontVariant="medium"
              textSize={16}
              onClick={() => setModalVisible(false)}
              width={"48%"}
              height={48}
            />
            <RoundedBox
              isFilled={true}
              fillColor="#C8102F"
              borderColor="#C8102F"
              borderWidth={2}
              borderRadius={14}
              text="Log Out"
              textColor="white"
              fontVariant="medium"
              textSize={16}
              onClick={handleLogout}
              width={"48%"}
              height={48}
            />
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isVisible={deleteAccountModalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        onBackdropPress={() => setDeleteAccountModalVisible(false)}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text allowFontScaling={false} style={styles.modalTitle}>
            Delete account?
          </Text>
          <Text allowFontScaling={false} style={styles.modalText}>
            This will permanently remove your account. This action cannot be undone.
          </Text>
          <View style={styles.modalButtonContainer}>
            <RoundedBox
              isFilled={true}
              fillColor="transparent"
              borderColor="#C8102F"
              borderWidth={2}
              borderRadius={14}
              text="Cancel"
              textColor="#C8102F"
              fontVariant="medium"
              textSize={16}
              onClick={() => setDeleteAccountModalVisible(false)}
              width={"48%"}
              height={48}
            />
            <RoundedBox
              isFilled={true}
              fillColor="#C8102F"
              borderColor="#C8102F"
              borderWidth={2}
              borderRadius={14}
              text="Delete"
              textColor="white"
              fontVariant="medium"
              textSize={16}
              onClick={handleLogout}
              width={"48%"}
              height={48}
            />
          </View>
        </View>
      </Modal>

      {/* Display Customer Data */}
      <Animated.ScrollView
        style={styles.screenContainer}
        contentContainerStyle={getScreenContentPadding(insets)}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View>
          {loading ? (
            <Text allowFontScaling={false} style={[styles.loadingText, { opacity: 0 }]}>
              Placeholder
            </Text>
          ) : customerData ? (
            <View style={styles.profileContainer}>
              <Text allowFontScaling={false} style={styles.customerName}>
                Hi, {customerData.firstName}.
              </Text>
            </View>
          ) : (
            <Text allowFontScaling={false}>No customer data available.</Text>
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
                <Text allowFontScaling={false} style={styles.buttonText}>ORDERS</Text>
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
            {giveawayMultiplier > 0 && (
              <TouchableOpacity
                style={styles.innerButtonContainer}
                activeOpacity={1}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  const accessToken = await AsyncStorage.getItem(
                    "shopifyAccessToken"
                  );
                  if (accessToken) {
                    navigation.navigate("EntriesScreen", { accessToken });
                  }
                }}
              >
                <View style={styles.leftSide}>
                  <Ionicons name="ticket-outline" size={24} color="#000" style={{ marginRight: 0 }} />
                  <Text allowFontScaling={false} style={styles.buttonText}>ENTRIES</Text>
                </View>
                <View>
                  <Ionicons name="chevron-forward-outline" size={24} color="#000" style={{ marginRight: 0 }} />
                </View>
              </TouchableOpacity>
            )}
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
                <Text allowFontScaling={false} style={styles.buttonText}>
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
                setDeleteAccountModalVisible(true);
              }}
            >
              <View style={styles.leftSide}>
                <Ionicons name="trash-outline" size={24} color="#000" />
                <Text allowFontScaling={false} style={styles.buttonText}>DELETE ACCOUNT</Text>
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
            <View>
              <Text allowFontScaling={false} style={styles.lowerText}>Recently Viewed</Text>
            </View>

            {loadingRecentlyViewed ? (
              <Text allowFontScaling={false} style={styles.noProductsText}>Loading...</Text>
            ) : recentlyViewed.length === 0 ? (
              <Text allowFontScaling={false} style={styles.noProductsText}>
                No recently viewed products.
              </Text>
            ) : (
              <View style={styles.recentlyViewedListWrapper}>
                <FlatList
                  data={recentlyViewed}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recentlyViewedScroll}
                  renderItem={({ item }) => {
                  const variant = item.variants.edges[0]?.node;
                  const price = parseFloat(
                    variant?.price?.amount || "0"
                  ).toFixed(2);
                  const compareAt = variant?.compareAtPrice?.amount
                    ? parseFloat(variant.compareAtPrice.amount).toFixed(2)
                    : null;

                  return (
                    <TouchableOpacity
                    style={{ width: 170, marginRight: 15 }}
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
                          !item.variants.edges.every(
                            (variantEdge) => !variantEdge.node.availableForSale
                          )
                        }
                      />
                    </TouchableOpacity>
                  );
                }}
                />
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
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
    fontSize: 26,
    fontFamily: "Futura-Bold",
    letterSpacing: 0.2,
  },
  modalOverlay: {
    justifyContent: "center",
    alignItems: "center",
    margin: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Futura-Bold",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: {
    fontSize: 15,
    fontFamily: "Futura-Medium",
    color: "#444",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  modalButtonContainer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
  },
  buttonContainer: {
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 18, // was 10
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
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
    marginTop: 20,
    paddingTop: 12,
  },
  lowerText: {
    fontFamily: "Futura-Medium",
    fontSize: 18,
  },
  recentlyViewedListWrapper: {
    marginRight: -SCREEN_PADDING_HORIZONTAL,
  },
  recentlyViewedScroll: {
    marginTop: 10,
    paddingLeft: 0,
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
