import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import RoundedBox from "../../components/RoundedBox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCustomerDetails } from "../../api/shopifyApi"; // Import API function

const AccountScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

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

  // console.log(customerData.email);

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
          <Text style={styles.loadingText}></Text>
        ) : customerData ? (
          <View style={styles.profileContainer}>
            <Text style={styles.customerName}>
              Hi, {customerData.firstName}.
            </Text>
          </View>
        ) : (
          <Text>No customer data available.</Text>
        )}
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
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
});

export default AccountScreen;
