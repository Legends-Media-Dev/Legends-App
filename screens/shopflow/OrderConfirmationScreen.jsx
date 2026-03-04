import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassHeader from "../../components/GlassHeader";
import { getScreenContentPadding, HEADER_OFFSET_BELOW_GLASS } from "../../constants/layout";

const OrderConfirmationScreen = ({ route }) => {
  const insets = useSafeAreaInsets();
  const { orderUrl } = route.params;
  const [isLoading, setIsLoading] = useState(true);

  if (!orderUrl) {
    return (
      <View style={styles.container}>
        <GlassHeader />
        <View style={[styles.centered, getScreenContentPadding(insets)]}>
          <Text allowFontScaling={false}>No order URL provided.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GlassHeader />
      {isLoading && <ActivityIndicator size="small" style={styles.loader} />}
      <WebView
        source={{ uri: orderUrl }}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator size="small" style={styles.loader} />
        )}
        style={[styles.webview, { marginTop: (insets?.top ?? 0) + HEADER_OFFSET_BELOW_GLASS }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
  webview: {
    flex: 1,
  },
});

export default OrderConfirmationScreen;
