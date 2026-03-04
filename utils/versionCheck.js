/**
 * App version check for "update required" flow.
 * Compare current app version to a minimum required version from your backend.
 *
 * Backend should return JSON: { minVersion: "1.0.3", iosStoreUrl?: "...", androidStoreUrl?: "..." }
 * When you release a new build, set minVersion to that version so older apps show the update modal.
 */

import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Parse "1.0.2" into [1, 0, 2] for comparison.
 */
export function parseVersion(versionString) {
  if (!versionString || typeof versionString !== "string") return [0, 0, 0];
  const parts = versionString.trim().replace(/^v/i, "").split(".");
  return [
    parseInt(parts[0], 10) || 0,
    parseInt(parts[1], 10) || 0,
    parseInt(parts[2], 10) || 0,
  ];
}

/**
 * Returns true if current < required (current is older).
 */
export function isVersionLessThan(current, required) {
  const a = parseVersion(current);
  const b = parseVersion(required);
  for (let i = 0; i < 3; i++) {
    if (a[i] < b[i]) return true;
    if (a[i] > b[i]) return false;
  }
  return false;
}

/**
 * Current app version from app.json (expo).
 */
export function getAppVersion() {
  return Constants.expoConfig?.version ?? Constants.manifest?.version ?? "1.0.0";
}

/**
 * Default store URLs when backend doesn't provide them.
 * App Store ID from App Store Connect (General Information → Apple ID).
 */
const IOS_APP_STORE_ID = "6754783945";
const ANDROID_PACKAGE = "com.legendsmedia.legends";

export function getDefaultStoreUrl() {
  if (Platform.OS === "ios") {
    return `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`;
  }
  return `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
}
