import React, { useLayoutEffect, useState } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassHeader from "../../components/GlassHeader";
import { HEADER_OFFSET_BELOW_GLASS } from "../../constants/layout";

const WebViewScreen = ({ route }) => {
  const { checkoutUrl } = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { resetCart } = useCart();
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleNavigationChange = (navState) => {
    const { url } = navState;

    if (url.includes("/thank-you")) {
      setCheckoutComplete(true);
      resetCart();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <GlassHeader />
      <WebView
        source={{ uri: checkoutUrl }}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState={true}
        style={{ flex: 1, marginTop: insets.top + HEADER_OFFSET_BELOW_GLASS }}
      />
    </View>
  );
};

export default WebViewScreen;
