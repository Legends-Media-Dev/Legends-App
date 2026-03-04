/**
 * Single source of truth for screen layout.
 * Change these to adjust padding and header spacing app-wide.
 */

/** Horizontal padding for screen content (left/right). */
export const SCREEN_PADDING_HORIZONTAL = 25;

/** Extra space (px) below the glass header. paddingTop = insets.top + HEADER_OFFSET_BELOW_GLASS */
export const HEADER_OFFSET_BELOW_GLASS = 40;

/**
 * Padding for content that sits below GlassHeader.
 * @param {{ top: number }} insets - from useSafeAreaInsets()
 * @returns {{ paddingTop: number, paddingHorizontal: number }}
 */
export function getScreenContentPadding(insets) {
  return {
    paddingTop: (insets?.top ?? 0) + HEADER_OFFSET_BELOW_GLASS,
    paddingHorizontal: SCREEN_PADDING_HORIZONTAL,
  };
}

/**
 * Full wrapper style for a screen's main content (below GlassHeader).
 * Use for the View that wraps the whole screen body.
 * @param {{ top: number }} insets - from useSafeAreaInsets()
 * @param {{ flex?: boolean }} [opts] - if true, adds flex: 1 (default true)
 */
export function getScreenContentWrapperStyle(insets, opts = {}) {
  const { flex = true } = opts;
  return {
    ...getScreenContentPadding(insets),
    ...(flex ? { flex: 1 } : {}),
  };
}
