import React from "react";

const RoundedBox = ({
  width = 386,
  height = 50,
  isFilled = true,
  fillColor = "#000",
  borderColor = "#000",
  borderWidth = 0,
  borderRadius = 12,
  text = "Button Text",
  textColor = "#fff",
  textSize = 16,
  onClick,
  fontVariant = "bold",
}) => {
  const fontFamily = fontVariant === "bold" ? "Futura-Bold" : "Futura-Medium";

  return (
    <div
      onClick={onClick}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: isFilled ? fillColor : "transparent",
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: `${borderRadius}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          color: textColor,
          fontSize: `${textSize}px`,
          fontWeight: "bold",
          fontFamily,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default RoundedBox;
