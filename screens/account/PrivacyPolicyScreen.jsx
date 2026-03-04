import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlassHeader from "../../components/GlassHeader";
import { getScreenContentWrapperStyle } from "../../constants/layout";

function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <GlassHeader />
      <View style={getScreenContentWrapperStyle(insets)}>
        <Text allowFontScaling={false} style={styles.header}>PRIVACY POLICY</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { fontSize: 20, fontFamily: "Futura-Bold" },
});

export default PrivacyPolicyScreen;
