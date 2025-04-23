import React, { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, PanResponder, Dimensions } from "react-native";
import { useNavigation, userNavigation } from "@react-navigation/native";
import SweepstakesScreen from "../screens/core/SweepstakesScreen";

const { width } = Dimensions.get("window");

// const SwiperContentBox = ({
//     topTitle,
//     frontImage,
//     rearImage,
//     topColor = "#4CAF50",
//     screenName,
//     handle = null,
//     }) => {
//         const navigation = useNavigation();
//         const dragX = useRef(new Animated.Value(width / 2)).current;

//         const panResponder = useRef(
//             PanResponder.create({
//                 onMoveShouldSetPanResponder: () => true,
//                 onPanResponderMove: (_, gestureState) => {
//                     let newX = gestureState.moveX;
//                     if (newX < 0) newX = 0;
//                     if (newX > width) newX = width;
//                     dragX.setValue(newX);
//                 },
//             })
//         ).current
// })

const style = StyleSheet.create({
    container: {
        width: "100%",
        marginVertical: 16,
    },
    imageContainer: {
        width: "100%",
        height: 180,
        overflow: "hidden",
        borderRadius: 10,
        position: "relative",
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
    titleOverlay: {
        position: "absolute",
        bottom: 12,
        left: 12,
        backgroundColor: "#00000080",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    title: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Future-Bold",
    },
});

export default SwiperContentBox;