// import React from "react";
// import { WebView } from "react-native-webview";

// const WebViewScreen = ({ route }) => {
//   const { checkoutUrl } = route.params;

//   return <WebView source={{ uri: checkoutUrl }} />;
// };

// export default WebViewScreen;
import React, { useLayoutEffect, useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";
import { Ionicons } from "@expo/vector-icons";

const WebViewScreen = ({ route }) => {
  const { checkoutUrl } = route.params;
  const navigation = useNavigation();
  const { resetCart } = useCart();
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  useLayoutEffect(() => {
    if (checkoutComplete) {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            style={{ marginLeft: 15, marginBottom: 10 }}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "HOME",
                    state: {
                      routes: [{ name: "MainScreen" }],
                    },
                  },
                ],
              });
            }}
          >
            <Ionicons
              name="close"
              size={28}
              color="#000"
              style={{ marginRight: 0 }}
            />
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        headerLeft: undefined, // fallback to default back arrow
      });
    }
  }, [checkoutComplete]);

  const handleNavigationChange = (navState) => {
    const { url } = navState;

    if (url.includes("/thank-you")) {
      setCheckoutComplete(true);
      resetCart();
    }
  };

  return (
    <WebView
      source={{ uri: checkoutUrl }}
      onNavigationStateChange={handleNavigationChange}
      startInLoadingState={true}
    />
  );
};

export default WebViewScreen;
