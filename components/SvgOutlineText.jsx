import React from "react";
import { View } from "react-native";
import Svg, { Text as SvgText } from "react-native-svg";

const SvgOutlineText = ({ children, size = 25, stroke = "#000", fill = "transparent", weight = "bold", style }) => {
  return (
    <View style={style}>
      <Svg height={size + 10} width="100%">
        <SvgText
          stroke={stroke}
          strokeWidth={1.5}
          fill={fill}
          fontSize={size}
          fontWeight={weight}
          x="0"
          y={size}
          fontFamily="Futura-Bold"
        >
          {children}
        </SvgText>
      </Svg>
    </View>
  );
};

export default SvgOutlineText;
