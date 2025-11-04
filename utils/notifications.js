import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { saveUserNotificationToken } from "../api/shopifyApi";
import { getCustomerInfo } from "./storage";

const PROJECT_ID = "53372938-06cb-43b4-8f47-24a1359a4711";

export async function registerForPushNotificationsAsync(forceUpdate = false) {
  if (!Device.isDevice) {
    alert("Must use physical device for Push Notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.warn("Notification permissions not granted");
    return;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: PROJECT_ID,
  });

  const cachedToken = await AsyncStorage.getItem("expoPushToken");

  // ✅ Skip only if unchanged and not forced
  if (!forceUpdate && cachedToken === token) {
    // console.log("ℹ️ Token unchanged — skipping Firestore save");
    return token;
  }

  await AsyncStorage.setItem("expoPushToken", token);

  // ✅ Get customer info from storage
  let userInfo = null;
  try {
    userInfo = await getCustomerInfo();
  } catch (err) {
    console.warn(
      "⚠️ Could not load customer info for notification token:",
      err
    );
  }

  const userId = userInfo?.email || userInfo?.id || "anonymous";
  const email = userInfo?.email || null;

  const deviceInfo = {
    token,
    brand: Device.brand,
    modelName: Device.modelName,
    osVersion: Device.osVersion,
    platform: Platform.OS,
    userId,
    email,
    updatedAt: new Date().toISOString(),
  };

  //   console.log("📤 Preparing to save push token to Firestore:", {
  //     userId,
  //     email,
  //     deviceInfo,
  //   });

  try {
    const response = await saveUserNotificationToken(token, deviceInfo);
    // console.log("✅ Firestore response:", response);
    // console.log("✅ Push token saved successfully");
  } catch (error) {
    console.error("❌ Failed to save push token:", error);
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}
