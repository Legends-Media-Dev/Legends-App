import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AuthInput from "../../components/AuthContainer";
import RoundedBox from "../../components/RoundedBox";
import { customerSignUp, customerSignIn } from "../../api/shopifyApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";

const MIN_PASSWORD_LENGTH = 5;

const SignUpScreen = ({ route, navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const getErrorMessage = (err) => {
    const msg = err.response?.data?.error;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
    return err.message || "Couldn't create account. Please try again.";
  };

  const handleSignUp = async () => {
    setError("");

    if (!firstName || !lastName || !email || !password) {
      setError("First name, last name, email, and password are required.");
      return;
    }

    const trimmedPassword = password.trim();
    if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== trimmedPassword) {
      setError("Password cannot start or end with spaces.");
      return;
    }

    setLoading(true);
    try {
      const signUpResponse = await customerSignUp(
        firstName.trim(),
        lastName.trim(),
        email.trim(),
        trimmedPassword
      );

      if (signUpResponse?.id) {
        const signInResponse = await customerSignIn(email.trim(), trimmedPassword);
        const accessToken = signInResponse?.accessToken;
        const expiresAt = signInResponse?.expiresAt;

        if (accessToken && expiresAt) {
          await AsyncStorage.setItem("shopifyAccessToken", accessToken);
          await AsyncStorage.setItem("accessTokenExpiry", expiresAt);
          // Reset to HOME tab so user lands on home feed, not Account
          navigation.getParent()?.reset({
            index: 0,
            routes: [{ name: "HOME" }],
          });
        } else {
          setError("Account created but sign-in failed. Please sign in manually.");
        }
      } else {
        setError("Account could not be created. Please try again.");
      }
    } catch (err) {
      console.error("Sign-up error:", err.response?.data || err.message);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}

      <View>
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
          <Text allowFontScaling={false} style={styles.header}>JOIN NOW</Text>
          <Text allowFontScaling={false} style={styles.subHeader}>
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
              onChangeText={(t) => { setFirstName(t); if (error) setError(""); }}
              borderColor="#ccc"
              labelColor="#000"
              textColor="#000"
              width={"49%"}
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
            />
            <AuthInput
              ref={lastNameRef}
              label="Last Name"
              placeholder="Last name"
              value={lastName}
              onChangeText={(t) => { setLastName(t); if (error) setError(""); }}
              borderColor="#ccc"
              labelColor="#000"
              textColor="#000"
              width={"49%"}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </View>
          <View style={{ marginTop: 10 }} />

          <AuthInput
            ref={emailRef}
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(t) => { setEmail(t); if (error) setError(""); }}
            borderColor="#ccc"
            labelColor="#000"
            textColor="#000"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <View style={{ marginTop: 10 }} />
          <AuthInput
            ref={passwordRef}
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(t) => { setPassword(t); if (error) setError(""); }}
            borderColor="#ccc"
            labelColor="#000"
            textColor="#000"
            secureTextEntry={true}
            returnKeyType="done"
          />
          <Text allowFontScaling={false} style={styles.passwordHint}>
            At least {MIN_PASSWORD_LENGTH} characters. No spaces at start or end.
          </Text>

          {error ? (
            <Text allowFontScaling={false} style={styles.errorText}>
              {error}
            </Text>
          ) : null}
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
            isDisabled={
              !email ||
              !password ||
              !firstName ||
              !lastName ||
              loading
            }
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
          <Text allowFontScaling={false} style={styles.textButton}>
            Already have an account?{" "}
            <Text
              allowFontScaling={false}
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
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
    fontSize: 16, // Corrected as a number
  },
  authContainer: {
    display: "flex",
    width: "90%",
    alignSelf: "center",
    marginTop: 30,
  },
  passwordHint: {
    fontFamily: "Futura-Medium",
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    marginHorizontal: 4,
  },
  errorText: {
    fontFamily: "Futura-Medium",
    fontSize: 14,
    color: "#C8102F",
    marginTop: 12,
    marginHorizontal: 4,
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
    alignSelf: "center",
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
