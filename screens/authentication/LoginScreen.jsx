import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AuthInput from "../../components/AuthContainer";
import RoundedBox from "../../components/RoundedBox";
import { customerSignIn, fetchCustomerDetails } from "../../api/shopifyApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { registerForPushNotificationsAsync } from "../../utils/notifications";

// 🔹 import helpers for push token linking
import { setCustomerInfo } from "../../utils/storage";

const LoginScreen = ({ route, navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const passwordInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1️⃣ Sign in with Shopify credentials
      const response = await customerSignIn(email, password);
      const accessToken = response?.accessToken;
      const expiresAt = response?.expiresAt;

      if (!accessToken || !expiresAt) {
        setError("Incorrect email or password.");
        return;
      }

      // 2️⃣ Save auth info
      await AsyncStorage.setItem("shopifyAccessToken", accessToken);
      await AsyncStorage.setItem("accessTokenExpiry", expiresAt);

      // 3️⃣ Fetch customer details from Cloud Function
      let customer = null;
      try {
        // console.log("📡 Fetching Shopify customer details...");
        const customerData = await fetchCustomerDetails(accessToken);

        if (customerData?.email) {
          customer = {
            id: customerData?.email, // 🔹 Use email as stable unique identifier
            email: customerData?.email,
            firstName: customerData?.firstName || "",
            lastName: customerData?.lastName || "",
            tags: customerData?.tags || [],
          };

          await setCustomerInfo(customer);
          // console.log("👤 Saved customer info:", customer.email);
        } else {
          console.warn(
            "⚠️ No valid customer data returned from fetchCustomerDetails"
          );
        }
      } catch (err) {
        console.error("❌ Error fetching customer info:", err);
      }

      // 4️⃣ Update Firestore push token with linked user
      try {
        // console.log("📲 Linking Expo push token to logged-in user...");
        await registerForPushNotificationsAsync(true); // force Firestore update
        // console.log("✅ Firestore push token linked successfully");
      } catch (err) {
        console.warn("⚠️ Could not update push token after login:", err);
      }

      // 5️⃣ Navigate to Account screen
      navigation.reset({
        index: 0,
        routes: [{ name: "ACCOUNT" }],
      });
    } catch (error) {
      console.error("❌ Sign-in error:", error.message);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" />
        </View>
      )}

      <View style={styles.contentCenter}>
        {/* Logo */}
        <View style={styles.imageContainer}>
          <Image
            transition={300}
            source={require("../../assets/legends_logo.png")}
            style={styles.headerImage}
          />
        </View>

        {/* Header */}
        <View style={styles.infoContainer}>
          <Text allowFontScaling={false} style={styles.header}>SIGN IN</Text>
          <Text allowFontScaling={false} style={styles.subHeader}>
            Sign in to view your rewards and benefits.
          </Text>
        </View>

        {/* Inputs */}
        <View style={styles.authContainer}>
          <AuthInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            borderColor="#ccc"
            labelColor="#000"
            textColor="#000"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
            returnKeyType="next"
          />
          <View style={{ marginTop: 10 }} />
          <AuthInput
            ref={passwordInputRef}
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            borderColor="#ccc"
            labelColor="#000"
            textColor="#000"
            secureTextEntry={true}
            returnKeyType="done"
          />
          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPasswordScreen")}
            >
              <Text allowFontScaling={false} style={styles.forgotPasswordText}>
                Forgot your password?
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {error !== "" && (
          <Text allowFontScaling={false} style={{ color: "red", textAlign: "center", marginTop: 10 }}>
            {error}
          </Text>
        )}

        {/* Submit button */}
        <View style={styles.buttonContainer}>
          <RoundedBox
            isFilled={true}
            fillColor="#C8102F"
            borderColor="#C8102F"
            borderWidth={2}
            borderRadius={10}
            text="Sign In"
            textColor="white"
            fontVariant="medium"
            textSize={18}
            onClick={handleSignIn}
            isDisabled={!email || !password}
            style={{ width: "100%" }}
          />
        </View>

        <View style={styles.textLinkRow}>
          <Text allowFontScaling={false} style={styles.textLinkLabel}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")} activeOpacity={0.7}>
            <Text allowFontScaling={false} style={styles.textLinkAction}>
              Sign up.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: "white",
    flex: 1,
  },
  contentCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    alignItems: "center",
  },
  headerImage: {
    width: 230,
    height: 40,
    contentFit: "contain",
  },
  infoContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: 50,
    gap: 15,
  },
  header: {
    fontFamily: "Futura-Bold",
    fontSize: 24,
  },
  subHeader: {
    fontFamily: "Futura-Medium",
    fontSize: 16,
  },
  authContainer: {
    display: "flex",
    width: "90%",
    alignSelf: "center",
    marginTop: 30,
  },
  forgotPasswordContainer: {
    marginTop: 10,
    paddingRight: 5,
    width: "100%",
    alignItems: "flex-end",
  },
  forgotPasswordText: {
    color: "black",
    fontSize: 14,
    fontFamily: "Futura-Medium",
  },
  buttonContainer: {
    width: "90%",
    alignSelf: "center",
    marginTop: 30,
  },
  textLinkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  textLinkLabel: {
    fontFamily: "Futura-Medium",
    fontSize: 16,
    color: "#444",
  },
  textLinkAction: {
    fontFamily: "Futura-Bold",
    fontSize: 16,
    color: "#C8102F",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});

export default LoginScreen;
