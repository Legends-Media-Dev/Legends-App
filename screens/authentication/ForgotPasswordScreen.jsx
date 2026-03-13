import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AuthInput from "../../components/AuthContainer";
import RoundedBox from "../../components/RoundedBox";
import { forgotPassword } from "../../api/shopifyApi";
import { Image } from "expo-image";

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
      <View style={styles.contentCenter}>
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
            textSize={18}
            onClick={handleForgotPassword}
            isDisabled={!email}
          />
        </View>

        <View style={styles.textLinkRow}>
          <Text allowFontScaling={false} style={styles.textLinkLabel}>
            Remember your password?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text allowFontScaling={false} style={styles.textLinkAction}>
              Sign in.
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
    alignItems: "center",
    marginTop: 50,
    gap: 15,
    paddingHorizontal: 28,
    maxWidth: "100%",
  },
  header: {
    fontFamily: "Futura-Bold",
    fontSize: 24,
  },
  subHeader: {
    fontFamily: "Futura-Medium",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 8,
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
