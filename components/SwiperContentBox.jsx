import React, { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, PanResponder, Dimensions } from "react-native";
import { useNavigation, userNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const SwiperContentBox = ({
    title,
    description1,
    description2,
    image1,
    image2,
}) => {
    const dragX = useRef(new Animated.Value(width / 2)).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                let newX = gestureState.moveX;
                if (newX < 0) newX = 0;
                if (newX > width) newX = width;
                dragX.setValue(newX);
            },
        })
    ).current

    return (
        <View style={styles.boxContainer}>
            {/* Text Box */}
            <Text style={styles.title}>{title}</Text>
            {description1 ? (
                <Text style={styles.description}>{description1}</Text>
            ) : null}
            {description2 ? (
                <Text style={styles.description}>{description2}</Text>
            ) : null}

            {/* Show Image Reveal */}
            <View style={styles.imageContainer}>
                {/* Left locked image (Before) */}
                <Image source={{ uri: image2 }} style={styles.image} />

                {/* Rigth image clipped and revealed */}
                <Animated.View style={[styles.overlayContainer, { width: dragX }]}>
                    <Image source={{ uri: image1 }} style={styles.image} />
                </Animated.View>

                {/* Drag hanlde */}
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[styles.dragHandle, { left: dragX }]}
                >
                    <View style={styles.dragLine} />
                </Animated.View>

                {/* Text overlay */}
                <Text style={[styles.label, { left: 10 }]}>BEFORE</Text>
                <Text style={[styles.label, { right: 10 }]}>AFTER</Text>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    boxContainer: {
      marginBottom: 30,
    },
    title: {
      fontSize: 18,
      fontFamily: "Futura-Bold",
      color: "#000",
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      fontFamily: "Futura-Regular",
      color: "#444",
      marginBottom: 2,
    },
    imageContainer: {
      width: "100%",
      height: 200,
      borderRadius: 10,
      overflow: "hidden",
      position: "relative",
      marginTop: 12,
    },
    image: {
      width: "100%",
      height: "100%",
      position: "absolute",
    },
    overlayContainer: {
      position: "absolute",
      height: "100%",
      overflow: "hidden",
    },
    dragHandle: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: 30,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },
    dragLine: {
      width: 4,
      height: 40,
      backgroundColor: "#fff",
      borderRadius: 2,
    },
    label: {
      position: "absolute",
      bottom: 10,
      color: "#fff",
      fontSize: 12,
      fontWeight: "bold",
      backgroundColor: "rgba(0,0,0,0.5)",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
  });

export default SwiperContentBox;