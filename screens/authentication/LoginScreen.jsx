import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AuthInput from "../../components/AuthContainer";
import RoundedBox from "../../components/RoundedBox";
import { setItem } from "../../utils/storage";
import { customerSignIn } from "../../api/shopifyApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ route, navigation }) => {
  // State for managing input values
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
      const response = await customerSignIn(email, password);
      const accessToken = response?.accessToken;
      const expiresAt = response?.expiresAt;

      if (accessToken && expiresAt) {
        await AsyncStorage.setItem("shopifyAccessToken", accessToken);
        await AsyncStorage.setItem("accessTokenExpiry", expiresAt);

        navigation.reset({
          index: 0,
          routes: [{ name: "ACCOUNT" }],
        });
      } else {
        setError("Incorrect email or password.");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
      console.error("Sign-in error:", error.message);
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

      <View>
        {/* Logo Section */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/legends_logo.png")}
            style={styles.headerImage}
          />
        </View>

        {/* Header Text Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.header}>SIGN IN</Text>
          <Text style={styles.subHeader}>
            Sign in to view your rewards and benefits.
          </Text>
        </View>

        {/* Input Fields Section */}
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
              <Text style={styles.forgotPasswordText}>
                Forgot your password?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {error !== "" && (
          <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
            {error}
          </Text>
        )}

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
      </View>
      <View style={styles.lowerContainer}>
        <View
          style={{
            height: 1,
            width: "90%",
            backgroundColor: "#CBCBCB",
            marginBottom: 20,
          }}
        />
        <View style={styles.signUpContainer}>
          <Text style={styles.textButton}>
            Don’t have an account?{" "}
            <Text
              style={styles.signUpButton}
              onPress={() => navigation.navigate("SignUpScreen")}
            >
              Sign Up.
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: "white",
    height: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  imageContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "40%",
  },
  headerImage: {
    width: 230,
    height: 40,
    resizeMode: "contain",
  },
  infoContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: 50,
    gap: 15,
  },
  header: {
    fontFamily: "Futura-Bold",
    fontSize: 24, // Corrected as a number
  },
  subHeader: {
    fontFamily: "Futura-Medium",
    fontSize: 16, // Corrected as a number
  },
  authContainer: {
    display: "flex",
    width: "90%",
    alignSelf: "center", // Align inputs and text within the container
    marginTop: 30,
  },
  forgotPasswordContainer: {
    marginTop: 10,
    paddingRight: 5,
    width: "100%", // Ensures the "Forgot your password?" spans the width of the container
    alignItems: "flex-end", // Aligns the text to the right
  },
  forgotPasswordText: {
    color: "black", // Button-like color (blue)
    fontSize: 14,
    fontFamily: "Futura-Medium",
  },
  buttonContainer: {
    width: "90%",
    alignSelf: "center", // Ensures it's centered like your input fields
    marginTop: 30,
  },
  lowerContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: 20,
  },
  textButton: {
    fontFamily: "Futura-Medium",
    fontSize: 16,
  },
  signUpContainer: {
    alignItems: "center", // Center the text
  },
  signUpButton: {
    color: "#C8102F", // Highlight color for the button
    fontWeight: "bold", // Bold to differentiate it as a button
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // or "#FFF" for solid
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});

export default LoginScreen;
