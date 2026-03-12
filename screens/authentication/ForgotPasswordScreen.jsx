import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthInput from "../../components/AuthContainer";
import RoundedBox from "../../components/RoundedBox";
import GlassHeader from "../../components/GlassHeader";
import { getScreenContentWrapperStyle } from "../../constants/layout";
import { forgotPassword } from "../../api/shopifyApi";
import { Image } from "expo-image";

const ForgotPasswordScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async () => {
    try {
      setMessage("");
      setError("");

      if (!email) {
        setError("Email is required.");
        return;
      }

      const response = await forgotPassword(email);

      if (response && response.success) {
        setMessage("Password reset link sent to your email.");
        setEmail("");

        // Navigate back to Sign In with a "pop" effect after 3 seconds
        setTimeout(() => {
          navigation.goBack(); // Use goBack for a pop-like effect
        }, 3000);
      } else {
        setError("Failed to send reset link. Please try again.");
      }
    } catch (error) {
      console.error("Forgot Password Error:", error.message);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <View style={styles.outerContainer}>
      <GlassHeader />
      <View style={[getScreenContentWrapperStyle(insets), { flex: 1 }]}>
        {/* Logo Section */}
        <View style={styles.imageContainer}>
          <Image
            transition={300}
            source={require("../../assets/legends_logo.png")}
            style={styles.headerImage}
          />
        </View>

        {/* Header Text Section */}
        <View style={styles.infoContainer}>
          <Text allowFontScaling={false} style={styles.header}>FORGOT PASSWORD</Text>
          <Text allowFontScaling={false} style={styles.subHeader}>
            Enter your email below, and we’ll send you a link to reset your
            password.
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
            height={45}
            labelColor="#000"
            textColor="#000"
          />
        </View>

        {/* Error or Success Message */}
        {message ? (
          <Text allowFontScaling={false} style={styles.successMessage}>{message}</Text>
        ) : error ? (
          <Text allowFontScaling={false} style={styles.errorMessage}>{error}</Text>
        ) : null}

        <View style={styles.buttonContainer}>
          <RoundedBox
            isFilled={true}
            fillColor="#C8102F"
            borderColor="#C8102F"
            borderWidth={2}
            borderRadius={10}
            text="Reset Password"
            textColor="white"
            fontVariant="medium"
            textSize={16}
            height={40}
            onClick={handleForgotPassword}
            isDisabled={!email}
            style={{ width: "90%", alignSelf: "center" }}
          />
        </View>

        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        <View style={{ width: "90%", alignSelf: "center" }}>
          <RoundedBox
            isFilled={false}
            fillColor="transparent"
            borderColor="#C8102F"
            borderWidth={2}
            borderRadius={10}
            text="Back to Sign In"
            textColor="#000"
            fontVariant="medium"
            textSize={16}
            height={40}
            onClick={() => navigation.goBack()}
            style={{ width: "100%", marginTop: 15 }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "40%",
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
    fontSize: 24, // Corrected as a number
  },
  subHeader: {
    fontFamily: "Futura-Medium",
    textAlign: "center",
    fontSize: 16, // Corrected as a number
    width: "85%",
  },
  authContainer: {
    display: "flex",
    width: "90%",
    alignSelf: "center", // Align inputs and text within the container
    marginTop: 30,
  },
  buttonContainer: {
    display: "flex",
    alignItems: "center",
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
  successMessage: {
    color: "green",
    textAlign: "center",
    marginTop: 10,
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 5,
    width: "90%",
    alignSelf: "center",
  },
  
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  
  orText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: "#999",
    fontFamily: "Futura-Medium",
  },
});

export default ForgotPasswordScreen;
