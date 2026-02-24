import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { fetchGiveawayInfo } from "../api/shopifyApi";

const GiveawayContext = createContext({
  multiplier: 0,
  startDate: null,
  endDate: null,
  loading: true,
});

export const useGiveaway = () => useContext(GiveawayContext);

function isNowInRange(startISO, endISO) {
  if (!startISO || !endISO) return false;
  const now = new Date();
  const start = new Date(startISO);
  const end = new Date(endISO);
  return now >= start && now <= end;
}

/**
 * Fetches giveaway info on app first load (when this provider mounts).
 * multiplier is only non-zero when current time is within [start_date, end_date].
 */
export const GiveawayProvider = ({ children }) => {
  const [rawMultiplier, setRawMultiplier] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchGiveawayInfo();
        if (cancelled) return;
        console.log("[Giveaway] API response:", JSON.stringify(data));

        const giveaway = data?.giveaways?.[0];
        const mult =
          giveaway?.entries_multiplier ??
          data?.portal_multiplier ??
          data?.multiplier ??
          data?.standard_value ??
          0;
        const start =
          giveaway?.start_date ??
          data?.giveaway_start_date ??
          data?.startDate ??
          data?.start_date ??
          null;
        const end =
          giveaway?.end_date ??
          data?.giveaway_end_date ??
          data?.endDate ??
          data?.end_date ??
          null;

        const multiplierNum = Number(mult) || 0;
        const startNorm = start ? (start.includes("T") ? start : `${start}T00:00:00.000Z`) : null;
        const endNorm = end ? (end.includes("T") ? end : `${end}T23:59:59.999Z`) : null;

        console.log("[Giveaway] Parsed:", { multiplier: multiplierNum, startDate: startNorm, endDate: endNorm });

        setRawMultiplier(multiplierNum);
        setStartDate(startNorm);
        setEndDate(endNorm);
      } catch (err) {
        if (!cancelled) {
          console.warn("[Giveaway] Fetch failed:", err?.message || err);
          setRawMultiplier(0);
          setStartDate(null);
          setEndDate(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Re-check date range every minute so multiplier goes 0 when period ends (or becomes active at start)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const multiplier = useMemo(() => {
    if (!isNowInRange(startDate, endDate)) return 0;
    return rawMultiplier;
  }, [rawMultiplier, startDate, endDate, tick]);

  const value = useMemo(
    () => ({ multiplier, startDate, endDate, loading }),
    [multiplier, startDate, endDate, loading]
  );

  return (
    <GiveawayContext.Provider value={value}>
      {children}
    </GiveawayContext.Provider>
  );
};
