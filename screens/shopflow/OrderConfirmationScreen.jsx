import React, { useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const OrderConfirmationScreen = ({ route }) => {
  const { orderUrl } = route.params;
  const [isLoading, setIsLoading] = useState(true);

  if (!orderUrl) {
    return (
      <View style={styles.centered}>
        <Text>No order URL provided.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      )}

      <WebView
        source={{ uri: orderUrl }}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onLoadEnd={() => setIsLoading(false)} // Hide loader when page loads
        style={styles.webview} // Control the height of the visible section
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  webview: {
    flex: 1,
    marginTop: "-20%", // Shift the WebView up to hide the top section
  },
});

export default OrderConfirmationScreen;
