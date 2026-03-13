import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import ProductCardDiscovery from "./ProductCardDiscovery";

const HorizontalProductRow = ({
  title,
  subtitle,
  products,
  onPressItem,
  contentPaddingHorizontal = 20,
  titleFontSize = 28,
  marginBottom,
}) => {
  const padding = contentPaddingHorizontal ?? 20;
  return (
    <View style={[styles.container, marginBottom != null && { marginBottom }]}>
      <Text
        allowFontScaling={true}
        style={[
          styles.title,
          { marginLeft: padding, fontSize: titleFontSize },
        ]}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          allowFontScaling={true}
          style={[styles.subtitle, { marginLeft: padding }]}
        >
          {subtitle}
        </Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: padding,
          paddingRight: padding || 20,
        }}
      >
        {Array.isArray(products) &&
          products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <ProductCardDiscovery
                product={product}
                onPress={() => onPressItem(product)}
              />
            </View>
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
    fontFamily: "Futura-Bold",
  },

  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 4,
    marginBottom: 14,
  },
  productCard: {
    marginRight: 18,
  },
});

export default HorizontalProductRow;