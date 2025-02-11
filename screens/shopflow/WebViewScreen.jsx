import React from "react";
import { WebView } from "react-native-webview";

const WebViewScreen = ({ route }) => {
  const { checkoutUrl } = route.params;

  return <WebView source={{ uri: checkoutUrl }} />;
};

export default WebViewScreen;
