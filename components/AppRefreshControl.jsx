import React from "react";
import { RefreshControl, Platform } from "react-native";

/** Brand tint for pull-to-refresh spinners (iOS + Android). */
export const REFRESH_TINT = "#C8102F";

/**
 * Consistent pull-to-refresh control for main scroll surfaces (matches Legends red).
 * @param {boolean} props.refreshing
 * @param {() => void} props.onRefresh
 * @param {number} [props.progressViewOffset] - Android only; use when content has large top inset under a floating header
 */
export default function AppRefreshControl({ refreshing, onRefresh, progressViewOffset }) {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={REFRESH_TINT}
      colors={[REFRESH_TINT]}
      progressViewOffset={Platform.OS === "android" ? progressViewOffset : undefined}
    />
  );
}
