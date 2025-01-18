import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import AuthInput from "../components/AuthContainer";
import RoundedBox from "../components/RoundedBox";
import { forgotPassword } from "../api/shopifyApi";

const ForgotPasswordScreen = ({ route, navigation }) => {
  // State for managing input values
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
      <View>
        {/* Logo Section */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/legends_logo.png")}
            style={styles.headerImage}
          />
        </View>

        {/* Header Text Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.header}>FORGOT PASSWORD</Text>
          <Text style={styles.subHeader}>
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
            labelColor="#000"
            textColor="#000"
          />
        </View>

        {/* Error or Success Message */}
        {message ? (
          <Text style={styles.successMessage}>{message}</Text>
        ) : error ? (
          <Text style={styles.errorMessage}>{error}</Text>
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
            textSize={18}
            onClick={handleForgotPassword}
            isDisabled={!email}
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
            Remember your password?{" "}
            <Text
              style={styles.signUpButton}
              onPress={() => navigation.goBack()}
            >
              Sign In.
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
    marginTop: "30%",
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
    marginBottom: 50,
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
});

export default ForgotPasswordScreen;
