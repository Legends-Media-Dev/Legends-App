import React, { useState, useRef, forwardRef } from "react";
import { Animated, TextInput, View, StyleSheet, Platform } from "react-native";

const AuthInput = (
  {
    width = "100%",
    height = 50,
    borderColor = "#ccc",
    borderWidth = 1,
    borderRadius = 8,
    label = "Email",
    textColor = "#000",
    labelColor = "#000",
    placeholder = "",
    value,
    onChangeText,
    secureTextEntry = false,
    returnKeyType = "done",
    onSubmitEditing = () => {},
  },
  ref
) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedLabelPosition = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedLabelPosition, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!value) {
      setIsFocused(false);
      Animated.timing(animatedLabelPosition, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    position: "absolute",
    fontFamily: "Futura-Medium",
    left: 22,
    top: animatedLabelPosition.interpolate({
      inputRange: [-0.3, 1],
      outputRange: [height / 2 - 8, 5],
    }),
    fontSize: animatedLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: labelColor,
  };

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderColor,
          borderWidth,
          borderRadius,
        },
      ]}
    >
      <Animated.Text allowFontScaling={false} style={labelStyle}>{label}</Animated.Text>
      <TextInput
        allowFontScaling={false}
        ref={ref}
        style={[styles.textInput, { color: textColor }]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={isFocused ? placeholder : ""}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    borderRadius: 5,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === "ios" ? 18 : 10,
    paddingBottom: 5,
  },
});

// ✅ Correct way to export a forwardRef component
export default forwardRef(AuthInput);
