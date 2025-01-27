import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import AuthInput from "../components/AuthContainer";
import RoundedBox from "../components/RoundedBox";
import { customerSignUp, customerSignIn } from "../api/shopifyApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignUpScreen = ({ route, navigation }) => {
  // State for managing input values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSignUp = async () => {
    try {
      if (!email || !password || !firstName || !lastName) {
        console.error("All fields are required");
        return;
      }

      // Call the sign-up API
      const signUpResponse = await customerSignUp(
        firstName,
        lastName,
        email,
        password
      );
      console.log("customerSignUp response:", signUpResponse);

      if (signUpResponse?.id) {
        console.log("Sign-up successful. Attempting to sign in...");

        // Call the sign-in API
        const signInResponse = await customerSignIn(email, password);
        const accessToken = signInResponse?.accessToken;
        const expiresAt = signInResponse?.expiresAt;

        if (accessToken && expiresAt) {
          await AsyncStorage.setItem("shopifyAccessToken", accessToken);
          await AsyncStorage.setItem("accessTokenExpiry", expiresAt);

          console.log("Signed in successfully. Access Token:", accessToken);
          navigation.replace("MainScreen"); // Navigate to MainScreen
        } else {
          console.error("Failed to retrieve access token during sign-in.");
        }
      } else {
        console.error("Sign-up failed. No customer ID returned.");
      }
    } catch (error) {
      console.error("Sign-up error:", error.message || error);
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
          <Text style={styles.header}>JOIN NOW</Text>
          <Text style={styles.subHeader}>
            Sign up to unlock your rewards and benefits.
          </Text>
        </View>

        {/* Input Fields Section */}
        <View style={styles.authContainer}>
          <View style={styles.topContainer}>
            <AuthInput
              label="First Name"
              placeholder="First name"
              value={firstName}
              onChangeText={setFirstName}
              borderColor="#ccc"
              labelColor="#000"
              textColor="#000"
              width={"49%"}
            />
            <AuthInput
              label="Last Name"
              placeholder="Last name"
              value={lastName}
              onChangeText={setLastName}
              borderColor="#ccc"
              labelColor="#000"
              textColor="#000"
              width={"49%"}
            />
          </View>
          <View style={{ marginTop: 10 }} />

          <AuthInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            borderColor="#ccc"
            labelColor="#000"
            textColor="#000"
          />
          <View style={{ marginTop: 10 }} />
          <AuthInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            borderColor="#ccc"
            labelColor="#000"
            textColor="#000"
            secureTextEntry={true}
          />
        </View>
        <View style={styles.buttonContainer}>
          <RoundedBox
            isFilled={true}
            fillColor="#C8102F"
            borderColor="#C8102F"
            borderWidth={2}
            borderRadius={10}
            text="Create Account"
            textColor="white"
            fontVariant="medium"
            textSize={18}
            onClick={handleSignUp}
            isDisabled={!email || !password || !firstName || !lastName}
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
            Already have an account?{" "}
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
  topContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default SignUpScreen;
