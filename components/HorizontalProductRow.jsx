import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import ProductCardDiscovery from "./ProductCardDiscovery";

const HorizontalProductRow = ({ title, subtitle, products, onPressItem }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 20 }}
      >
        {Array.isArray(products) &&
          products.map((product) => (
            <ProductCardDiscovery
              key={product.id}
              product={product}
              onPress={() => onPressItem(product)}
            />
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 32,
  },

  title: {
    fontSize: 28,
    fontFamily: "Futura-Medium",
    marginLeft: 20,
  },

  subtitle: {
    fontSize: 15,
    color: "#666",
    marginLeft: 20,
    marginTop: 4,
    marginBottom: 14,
  },
});

export default HorizontalProductRow;