import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ProductCard = ({ image, name, price, onLikePress }) => {
    return (
        <View style={styles.card}>
            {/* Product Image */}
            <View style={styles.imageContainer}>
                <Image source={{uri: image}} style={styles.image} />
                <TouchableOpacity style={styles.heartIcon} onPress={onLikePress}>
                    <Ionicons name="heart-outline" size={20} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Product Name */}
            <Text style={styles.productName}>{name}</Text>

            {/* Product Price */}
            <Text style={styles.productPrice}>${price}</Text>
        </View>
    )
};

const styles = StyleSheet.create({
    card: {
        width: 160, 
        backgroundColor: "#3333",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        margin: 10,
    },
    imageContainer:{
        position: "relative",
        width: "100%",
        height: 200,
        borderTopLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    heartIcon: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "#E8EAED",
        borderRadius: 20,
        padding: 5,
        elevation: 3,
    },
    productName: {
        textAlign: "left",
        fontSize: 12,
        fontFamily: "Futura-Bold",
        color: "#777777",
        padding: 10,
    },
    productPrice: {
        textAlign: "left",
        fontSize: 12,
        fontFamily: "Futura-Bold",
        color: "#777777",
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
});

export default ProductCard;