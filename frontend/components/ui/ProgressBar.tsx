"use client";

import React, { useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Milestone {
  label: string;
  threshold: number;
  icon: "gift" | "shipping" | "organiser";
}

interface CartGoalMeterProps {
  /** Current cart value in rupees */
  cartValue: number;
  milestones?: Milestone[];
  className?: string;
}

// ─── Default milestones (matches the reference image) ─────────────────────────

const DEFAULT_MILESTONES: Milestone[] = [
  { label: "Free Shipping", threshold: 598, icon: "shipping" },
  { label: "Free Gift", threshold: 699, icon: "gift" },
  { label: "Free Organiser", threshold: 1199, icon: "organiser" },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const CheckIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 236.988 236.988" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <polygon
      points="198.098,24.326 87.543,134.881 38.891,86.229 0,125.121 87.543,212.662 236.988,63.217"
      fill={color}
    />
  </svg>
);

const TruckIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path
      fill={color}
      d="M21.89,11.55,20.17,8.1A2,2,0,0,0,18.38,7H17V6a2,2,0,0,0-2-2H4A2,2,0,0,0,2,6V16a2,2,0,0,0,2,2H5.18a3,3,0,0,0,5.64,0h2.36a3,3,0,0,0,5.64,0H20a2,2,0,0,0,2-2V12A1,1,0,0,0,21.89,11.55ZM8,18a1,1,0,1,1,1-1A1,1,0,0,1,8,18Zm8,0a1,1,0,1,1,1-1A1,1,0,0,1,16,18Zm4-2H18.83s0-.05,0-.08a3.78,3.78,0,0,0-.17-.35l-.11-.21a3.29,3.29,0,0,0-.33-.41.8.8,0,0,0-.13-.13,3.29,3.29,0,0,0-.41-.33l-.21-.11-.35-.17-.08,0V9h1.39L20,12.24Z"
    />
  </svg>
);

const GiftIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path
      fill={color}
      d="M20,6H17.82A3,3,0,1,0,12,4.72,3,3,0,1,0,6.18,6H4A1,1,0,0,0,3,7V9a1,1,0,0,0,1,1H20a1,1,0,0,0,1-1V7A1,1,0,0,0,20,6ZM10,4a1,1,0,1,1,1,1H10Zm3,1a1,1,0,1,1,1-1A1,1,0,0,1,13,5ZM4,11v9a1,1,0,0,0,1,1H19a1,1,0,0,0,1-1V11Z"
    />
  </svg>
);

const OrganiserIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path
      fill={color}
      d="M19,3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V5A2,2,0,0,0,19,3ZM9,17H7V7H9Zm4,0H11V10h2Zm4,0H15V13h2Z"
    />
  </svg>
);

const ICON_MAP = {
  shipping: TruckIcon,
  gift: GiftIcon,
  organiser: OrganiserIcon,
};

// ─── Colours (green + beige theme) ───────────────────────────────────────────

const COLORS = {
  accent: "#5A7A4A",       // muted forest green  – filled bar & active icon bg
  accentIcon: "#FFFFFF",   // icon colour on filled (green) background
  trackBg: "#D9CDB8",      // warm beige – unfilled track
  inactiveIconBg: "#EDE8DF", // slightly lighter beige for inactive icon bg
  inactiveIcon: "#8A8575",   // muted brown-grey for inactive icons
  text: "#3B3A30",            // dark olive text
  subText: "#6B6657",         // lighter olive for labels
} as const;

// ─── Helper: compute per-segment fill percentages ────────────────────────────

function computeSegments(cartValue: number, milestones: Milestone[]) {
  const maxThreshold = milestones[milestones.length - 1].threshold;
  // Each segment spans between prev milestone (or 0) and current milestone
  return milestones.map((m, i) => {
    const segStart = i === 0 ? 0 : milestones[i - 1].threshold;
    const segEnd = m.threshold;
    const segLen = segEnd - segStart;
    const filled = Math.min(Math.max(cartValue - segStart, 0), segLen);
    const pct = (filled / segLen) * 100;
    return { pct, reached: cartValue >= m.threshold };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CartGoalMeter({
  cartValue,
  milestones = DEFAULT_MILESTONES,
  className = "",
}: CartGoalMeterProps) {
  const maxThreshold = milestones[milestones.length - 1].threshold;
  const allReached = cartValue >= maxThreshold;

  // Next unmet milestone
  const nextMilestone = useMemo(
    () => milestones.find((m) => cartValue < m.threshold),
    [cartValue, milestones]
  );

  const segments = useMemo(
    () => computeSegments(cartValue, milestones),
    [cartValue, milestones]
  );

  const bannerText = allReached
    ? "🎉 You've unlocked all rewards!"
    : nextMilestone
    ? `Add ₹\u00A0${nextMilestone.threshold - cartValue} more to get ${nextMilestone.label} on this order`
    : "";

  return (
    <div
      className={`w-full font-sans ${className}`}
      style={{ color: COLORS.text }}
    >
      {/* ── Banner text ── */}
      <p
        className="text-center text-xs sm:text-sm font-medium mb-3 px-2 leading-snug"
        style={{ color: COLORS.text }}
      >
        {bannerText}
      </p>

      {/* ── Track + milestone icons ── */}
      <div className="relative flex items-center w-full px-2 sm:px-4">
        {/* The coloured track bar lives behind the icons */}
        <div
          className="absolute inset-x-2 sm:inset-x-4 flex items-center"
          style={{ height: "8px", top: "50%", transform: "translateY(-50%)" }}
          aria-hidden
        >
          {segments.map((seg, i) => {
            const isFirst = i === 0;
            const isLast = i === segments.length - 1;
            return (
              <div
                key={i}
                className="relative h-full overflow-hidden"
                style={{
                  flex: i === segments.length - 1 ? "0 0 25%" : "1 1 0%",
                  borderRadius: isFirst
                    ? "9999px 0 0 9999px"
                    : isLast
                    ? "0 9999px 9999px 0"
                    : "0",
                  background: COLORS.trackBg,
                }}
              >
                {/* Filled portion */}
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700 ease-in-out"
                  style={{
                    width: `${seg.pct}%`,
                    background: COLORS.accent,
                    borderRadius: isFirst
                      ? "9999px 0 0 9999px"
                      : isLast
                      ? "0 9999px 9999px 0"
                      : "0",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Milestone icon nodes – positioned over the track at each threshold */}
        <div className="relative flex w-full justify-between items-center">
          {milestones.map((m, i) => {
            const reached = segments[i].reached;
            const IconComp = reached ? CheckIcon : ICON_MAP[m.icon];
            const bgColor = reached ? COLORS.accent : COLORS.inactiveIconBg;
            const iconColor = reached ? COLORS.accentIcon : COLORS.inactiveIcon;

            return (
              <div
                key={m.threshold}
                className="flex flex-col items-center z-10"
                style={{ flex: i === milestones.length - 1 ? "0 0 auto" : "0 0 auto" }}
              >
                {/* Circle icon */}
                <div
                  className="rounded-full flex items-center justify-center transition-colors duration-500"
                  style={{
                    width: "clamp(28px, 5vw, 36px)",
                    height: "clamp(28px, 5vw, 36px)",
                    background: bgColor,
                    border: reached
                      ? `2px solid ${COLORS.accent}`
                      : `2px solid ${COLORS.trackBg}`,
                    padding: "5px",
                  }}
                  aria-label={m.label}
                >
                  <IconComp color={iconColor} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Milestone labels below the track ── */}
      <div className="flex w-full px-2 sm:px-4 mt-2">
        {milestones.map((m, i) => {
          const reached = segments[i].reached;
          const isLast = i === milestones.length - 1;
          return (
            <div
              key={m.threshold}
              className="text-center leading-tight"
              style={{
                flex: isLast ? "0 0 auto" : "1 1 0%",
                minWidth: isLast ? "25%" : undefined,
                color: reached ? COLORS.accent : COLORS.subText,
                fontSize: "clamp(9px, 2.2vw, 11px)",
                fontWeight: reached ? 600 : 400,
              }}
            >
              <span>{m.label}</span>
              <br />
              <span>on ₹{m.threshold}!</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

