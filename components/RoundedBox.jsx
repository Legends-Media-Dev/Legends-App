import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

const RoundedBox = ({
  width = 386,
  height = 50,
  isFilled = true,
  fillColor = "#000",
  borderColor = "#000",
  borderWidth = 0,
  borderRadius = 5,
  text = "Button Text",
  textColor = "#fff",
  textSize = 16,
  onClick,
  fontVariant = "bold",
  isDisabled = false,
  style,
}) => {
  const fontFamily = fontVariant === "bold" ? "Futura-Bold" : "Futura-Medium";

  return (
    <TouchableOpacity
      onPress={!isDisabled ? onClick : null} // Prevent clicks if disabled
      style={[
        styles.container,
        {
          width,
          height,
          backgroundColor: isFilled ? fillColor : "transparent",
          borderColor,
          borderWidth,
          borderRadius,
        },
        isDisabled && { opacity: 0.5 }, // Reduce opacity for a disabled state
        style,
      ]}
    > 
      <Text
        allowFontScaling={false}
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: textSize,
            fontFamily,
          },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "bold",
  },
});

export default RoundedBox;
