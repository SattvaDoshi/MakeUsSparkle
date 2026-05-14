// "use client";

// import React, { useMemo } from "react";

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface Milestone {
//   label: string;
//   threshold: number;
//   icon: "gift" | "shipping" | "organiser";
// }

// interface CartGoalMeterProps {
//   /** Current cart value in rupees */
//   cartValue: number;
//   milestones?: Milestone[];
//   className?: string;
// }

// // ─── Default milestones (matches the reference image) ─────────────────────────

// const DEFAULT_MILESTONES: Milestone[] = [
//   { label: "Free Shipping", threshold: 598, icon: "shipping" },
//   { label: "Free Gift", threshold: 699, icon: "gift" },
//   { label: "Free Organiser", threshold: 1199, icon: "organiser" },
// ];

// // ─── SVG Icons ────────────────────────────────────────────────────────────────

// const CheckIcon = ({ color }: { color: string }) => (
//   <svg viewBox="0 0 236.988 236.988" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
//     <polygon
//       points="198.098,24.326 87.543,134.881 38.891,86.229 0,125.121 87.543,212.662 236.988,63.217"
//       fill={color}
//     />
//   </svg>
// );

// const TruckIcon = ({ color }: { color: string }) => (
//   <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
//     <path
//       fill={color}
//       d="M21.89,11.55,20.17,8.1A2,2,0,0,0,18.38,7H17V6a2,2,0,0,0-2-2H4A2,2,0,0,0,2,6V16a2,2,0,0,0,2,2H5.18a3,3,0,0,0,5.64,0h2.36a3,3,0,0,0,5.64,0H20a2,2,0,0,0,2-2V12A1,1,0,0,0,21.89,11.55ZM8,18a1,1,0,1,1,1-1A1,1,0,0,1,8,18Zm8,0a1,1,0,1,1,1-1A1,1,0,0,1,16,18Zm4-2H18.83s0-.05,0-.08a3.78,3.78,0,0,0-.17-.35l-.11-.21a3.29,3.29,0,0,0-.33-.41.8.8,0,0,0-.13-.13,3.29,3.29,0,0,0-.41-.33l-.21-.11-.35-.17-.08,0V9h1.39L20,12.24Z"
//     />
//   </svg>
// );

// const GiftIcon = ({ color }: { color: string }) => (
//   <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
//     <path
//       fill={color}
//       d="M20,6H17.82A3,3,0,1,0,12,4.72,3,3,0,1,0,6.18,6H4A1,1,0,0,0,3,7V9a1,1,0,0,0,1,1H20a1,1,0,0,0,1-1V7A1,1,0,0,0,20,6ZM10,4a1,1,0,1,1,1,1H10Zm3,1a1,1,0,1,1,1-1A1,1,0,0,1,13,5ZM4,11v9a1,1,0,0,0,1,1H19a1,1,0,0,0,1-1V11Z"
//     />
//   </svg>
// );

// const OrganiserIcon = ({ color }: { color: string }) => (
//   <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
//     <path
//       fill={color}
//       d="M19,3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V5A2,2,0,0,0,19,3ZM9,17H7V7H9Zm4,0H11V10h2Zm4,0H15V13h2Z"
//     />
//   </svg>
// );

// const ICON_MAP = {
//   shipping: TruckIcon,
//   gift: GiftIcon,
//   organiser: OrganiserIcon,
// };

// // ─── Colours (green + beige theme) ───────────────────────────────────────────

// const COLORS = {
//   accent: "#5A7A4A",       // muted forest green  – filled bar & active icon bg
//   accentIcon: "#FFFFFF",   // icon colour on filled (green) background
//   trackBg: "#D9CDB8",      // warm beige – unfilled track
//   inactiveIconBg: "#EDE8DF", // slightly lighter beige for inactive icon bg
//   inactiveIcon: "#8A8575",   // muted brown-grey for inactive icons
//   text: "#3B3A30",            // dark olive text
//   subText: "#6B6657",         // lighter olive for labels
// } as const;

// // ─── Helper: compute per-segment fill percentages ────────────────────────────

// function computeSegments(cartValue: number, milestones: Milestone[]) {
//   const maxThreshold = milestones[milestones.length - 1].threshold;
//   // Each segment spans between prev milestone (or 0) and current milestone
//   return milestones.map((m, i) => {
//     const segStart = i === 0 ? 0 : milestones[i - 1].threshold;
//     const segEnd = m.threshold;
//     const segLen = segEnd - segStart;
//     const filled = Math.min(Math.max(cartValue - segStart, 0), segLen);
//     const pct = (filled / segLen) * 100;
//     return { pct, reached: cartValue >= m.threshold };
//   });
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// export default function CartGoalMeter({
//   cartValue,
//   milestones = DEFAULT_MILESTONES,
//   className = "",
// }: CartGoalMeterProps) {
//   const maxThreshold = milestones[milestones.length - 1].threshold;
//   const allReached = cartValue >= maxThreshold;

//   // Next unmet milestone
//   const nextMilestone = useMemo(
//     () => milestones.find((m) => cartValue < m.threshold),
//     [cartValue, milestones]
//   );

//   const segments = useMemo(
//     () => computeSegments(cartValue, milestones),
//     [cartValue, milestones]
//   );

//   const bannerText = allReached
//     ? "🎉 You've unlocked all rewards!"
//     : nextMilestone
//     ? `Add ₹\u00A0${nextMilestone.threshold - cartValue} more to get ${nextMilestone.label} on this order`
//     : "";

//   return (
//     <div
//       className={`w-full font-sans ${className}`}
//       style={{ color: COLORS.text }}
//     >
//       {/* ── Banner text ── */}
//       <p
//         className="text-center text-xs sm:text-sm font-medium mb-3 px-2 leading-snug"
//         style={{ color: COLORS.text }}
//       >
//         {bannerText}
//       </p>

//       {/* ── Track + milestone icons ── */}
//       <div className="relative flex items-center w-full px-2 sm:px-4">
//         {/* The coloured track bar lives behind the icons */}
//         <div
//           className="absolute inset-x-2 sm:inset-x-4 flex items-center"
//           style={{ height: "8px", top: "50%", transform: "translateY(-50%)" }}
//           aria-hidden
//         >
//           {segments.map((seg, i) => {
//             const isFirst = i === 0;
//             const isLast = i === segments.length - 1;
//             return (
//               <div
//                 key={i}
//                 className="relative h-full overflow-hidden"
//                 style={{
//                   flex: i === segments.length - 1 ? "0 0 25%" : "1 1 0%",
//                   borderRadius: isFirst
//                     ? "9999px 0 0 9999px"
//                     : isLast
//                     ? "0 9999px 9999px 0"
//                     : "0",
//                   background: COLORS.trackBg,
//                 }}
//               >
//                 {/* Filled portion */}
//                 <div
//                   className="absolute inset-y-0 left-0 transition-all duration-700 ease-in-out"
//                   style={{
//                     width: `${seg.pct}%`,
//                     background: COLORS.accent,
//                     borderRadius: isFirst
//                       ? "9999px 0 0 9999px"
//                       : isLast
//                       ? "0 9999px 9999px 0"
//                       : "0",
//                   }}
//                 />
//               </div>
//             );
//           })}
//         </div>

//         {/* Milestone icon nodes – positioned over the track at each threshold */}
//         <div className="relative flex w-full justify-between items-center">
//           {milestones.map((m, i) => {
//             const reached = segments[i].reached;
//             const IconComp = reached ? CheckIcon : ICON_MAP[m.icon];
//             const bgColor = reached ? COLORS.accent : COLORS.inactiveIconBg;
//             const iconColor = reached ? COLORS.accentIcon : COLORS.inactiveIcon;

//             return (
//               <div
//                 key={m.threshold}
//                 className="flex flex-col items-center z-10"
//                 style={{ flex: i === milestones.length - 1 ? "0 0 auto" : "0 0 auto" }}
//               >
//                 {/* Circle icon */}
//                 <div
//                   className="rounded-full flex items-center justify-center transition-colors duration-500"
//                   style={{
//                     width: "clamp(28px, 5vw, 36px)",
//                     height: "clamp(28px, 5vw, 36px)",
//                     background: bgColor,
//                     border: reached
//                       ? `2px solid ${COLORS.accent}`
//                       : `2px solid ${COLORS.trackBg}`,
//                     padding: "5px",
//                   }}
//                   aria-label={m.label}
//                 >
//                   <IconComp color={iconColor} />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* ── Milestone labels below the track ── */}
//       <div className="flex w-full px-2 sm:px-4 mt-2">
//         {milestones.map((m, i) => {
//           const reached = segments[i].reached;
//           const isLast = i === milestones.length - 1;
//           return (
//             <div
//               key={m.threshold}
//               className="text-center leading-tight"
//               style={{
//                 flex: isLast ? "0 0 auto" : "1 1 0%",
//                 minWidth: isLast ? "25%" : undefined,
//                 color: reached ? COLORS.accent : COLORS.subText,
//                 fontSize: "clamp(9px, 2.2vw, 11px)",
//                 fontWeight: reached ? 600 : 400,
//               }}
//             >
//               <span>{m.label}</span>
//               <br />
//               <span>on ₹{m.threshold}!</span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


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

// ─── Default milestones ───────────────────────────────────────────────────────

const DEFAULT_MILESTONES: Milestone[] = [
  { label: "Free Shipping", threshold: 1000,  icon: "shipping"  },
  { label: "Free Gift",     threshold: 1700,  icon: "gift"      },
  { label: "Free Organiser",threshold: 3000, icon: "organiser" },
];

// ─── Colour palette (pastel green + beige) ───────────────────────────────────

const C = {
  // track
  trackEmpty  : "#D9CDB8",   // warm beige – unfilled
  trackFilled : "#8BB87C",   // pastel sage green – filled

  // icon circles
  circleDone  : "#8BB87C",   // filled circle bg (reached)
  circleTodo  : "#EDE8DF",   // empty circle bg  (not reached)
  borderDone  : "#8BB87C",
  borderTodo  : "#C9BEA8",

  checkmark   : "#FFFFFF",   // tick on reached circle
  iconTodo    : "#A09884",   // icon colour when not reached

  // text
  labelDone   : "#4A6B39",   // darker green for reached labels
  labelTodo   : "#8A8070",   // muted brown for pending labels
  bannerText  : "#3B3A30",   // dark olive
  bannerAccent: "#4A6B39",   // green highlight in banner
} as const;

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const CheckIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "55%", height: "55%" }}>
    <polyline points="4,12 9,17 20,7" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TruckIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: "58%", height: "58%" }}>
    <path fill={color} d="M21.89,11.55,20.17,8.1A2,2,0,0,0,18.38,7H17V6a2,2,0,0,0-2-2H4A2,2,0,0,0,2,6V16a2,2,0,0,0,2,2H5.18a3,3,0,0,0,5.64,0h2.36a3,3,0,0,0,5.64,0H20a2,2,0,0,0,2-2V12A1,1,0,0,0,21.89,11.55ZM8,18a1,1,0,1,1,1-1A1,1,0,0,1,8,18Zm8,0a1,1,0,1,1,1-1A1,1,0,0,1,16,18Zm4-2H18.83a3.78,3.78,0,0,0-.17-.35l-.11-.21a3.29,3.29,0,0,0-.33-.41.8.8,0,0,0-.13-.13,3.29,3.29,0,0,0-.41-.33l-.21-.11-.35-.17V9h1.39L20,12.24Z"/>
  </svg>
);

const GiftIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: "58%", height: "58%" }}>
    <path fill={color} d="M20,6H17.82A3,3,0,1,0,12,4.72,3,3,0,1,0,6.18,6H4A1,1,0,0,0,3,7V9a1,1,0,0,0,1,1H20a1,1,0,0,0,1-1V7A1,1,0,0,0,20,6ZM10,4a1,1,0,1,1,1,1H10Zm3,1a1,1,0,1,1,1-1A1,1,0,0,1,13,5ZM4,11v9a1,1,0,0,0,1,1H19a1,1,0,0,0,1-1V11Z"/>
  </svg>
);

const OrganiserIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: "58%", height: "58%" }}>
    <path fill={color} d="M19,3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V5A2,2,0,0,0,19,3ZM9,17H7V7H9Zm4,0H11V10h2Zm4,0H15V13h2Z"/>
  </svg>
);

const ICON_MAP = {
  shipping  : TruckIcon,
  gift      : GiftIcon,
  organiser : OrganiserIcon,
};

// ─── Segment fill computation ─────────────────────────────────────────────────

function computeSegments(cartValue: number, milestones: Milestone[]) {
  return milestones.map((m, i) => {
    const segStart = i === 0 ? 0 : milestones[i - 1].threshold;
    const segEnd   = m.threshold;
    const segLen   = segEnd - segStart;
    const filled   = Math.min(Math.max(cartValue - segStart, 0), segLen);
    return {
      pct    : (filled / segLen) * 100,
      reached: cartValue >= m.threshold,
    };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CartGoalMeter({
  cartValue,
  milestones = DEFAULT_MILESTONES,
  className  = "",
}: CartGoalMeterProps) {
  const maxThreshold = milestones[milestones.length - 1].threshold;
  const allReached   = cartValue >= maxThreshold;

  const nextMilestone = useMemo(
    () => milestones.find((m) => cartValue < m.threshold),
    [cartValue, milestones],
  );

  const segments = useMemo(
    () => computeSegments(cartValue, milestones),
    [cartValue, milestones],
  );

  const bannerText = allReached
    ? null
    : nextMilestone
    ? { prefix: "Add ", amount: `₹\u00A0${nextMilestone.threshold - cartValue}`, suffix: ` more to get ${nextMilestone.label} on this order` }
    : null;

  // How many milestones are between nodes?
  // We render: [node] [track] [node] [track] [node]
  // Track segments sit BETWEEN nodes, so count = milestones.length - 1
  const trackSegments = milestones.length - 1;

  return (
    <div
      className={`cgm-root ${className}`}
      style={{
        fontFamily: "'Jost', 'Inter', sans-serif",
        color      : C.bannerText,
        width      : "100%",
      }}
    >
      <style>{`
        .cgm-root { box-sizing: border-box; }
        .cgm-root *, .cgm-root *::before, .cgm-root *::after { box-sizing: border-box; }

        /* ── Banner ── */
        .cgm-banner {
          text-align: center;
          font-size: clamp(11px, 2.5vw, 13px);
          font-weight: 400;
          line-height: 1.5;
          margin-bottom: 14px;
          padding: 0 8px;
          letter-spacing: 0.01em;
        }
        .cgm-banner-amount {
          font-weight: 700;
          color: ${C.bannerAccent};
        }
        .cgm-banner-done {
          text-align: center;
          font-size: clamp(11px, 2.5vw, 13px);
          font-weight: 600;
          color: ${C.bannerAccent};
          margin-bottom: 14px;
        }

        /* ── Track row: nodes + connecting tracks ── */
        .cgm-track-row {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0 4px;
          position: relative;
        }

        /* ── Node (circle) ── */
        .cgm-node {
          position: relative;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease;
          /* Size via CSS variable set inline */
          width : var(--node-size, 34px);
          height: var(--node-size, 34px);
          border : 2px solid;
          z-index: 2;
        }
        .cgm-node--done {
          background   : ${C.circleDone};
          border-color : ${C.borderDone};
          box-shadow   : 0 2px 10px rgba(139,184,124,0.35);
        }
        .cgm-node--todo {
          background   : ${C.circleTodo};
          border-color : ${C.borderTodo};
        }

        /* ── Connecting track segment ── */
        .cgm-segment {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          background: ${C.trackEmpty};
          overflow: hidden;
          position: relative;
          z-index: 1;
        }
        .cgm-segment-fill {
          position: absolute;
          top: 0; left: 0; bottom: 0;
          background: ${C.trackFilled};
          border-radius: 2px;
          transition: width 0.65s cubic-bezier(.22,.68,0,1.18);
        }

        /* ── Labels row ── */
        .cgm-labels {
          display: flex;
          align-items: flex-start;
          width: 100%;
          padding: 8px 0 0;
          /* Mirror the track row: label cells match node positions */
        }
        .cgm-label-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex-shrink: 0;
          /* Width must match node width so labels align under circles */
          width: var(--node-size, 34px);
          line-height: 1.3;
        }
        /* Gap spacers between label cells (mirrors track segments) */
        .cgm-label-gap {
          flex: 1;
        }

        .cgm-label-text {
          font-size: clamp(9px, 2vw, 11px);
          font-weight: 500;
          transition: color 0.4s ease, font-weight 0.4s ease;
          white-space: nowrap;
        }
        .cgm-label-text--done {
          color       : ${C.labelDone};
          font-weight : 700;
        }
        .cgm-label-text--todo {
          color: ${C.labelTodo};
        }
        /* On very small screens allow wrapping */
        @media (max-width: 360px) {
          .cgm-label-text { white-space: normal; }
        }
      `}</style>

      {/* ── Banner ── */}
      {allReached ? (
        <div className="cgm-banner-done">🎉 You've unlocked all rewards!</div>
      ) : bannerText ? (
        <div className="cgm-banner">
          {bannerText.prefix}
          <span className="cgm-banner-amount">{bannerText.amount}</span>
          {bannerText.suffix}
        </div>
      ) : null}

      {/* ── Track row ── */}
      <div
        className="cgm-track-row"
        style={
          {
            "--node-size": "clamp(28px, 5.5vw, 36px)",
          } as React.CSSProperties
        }
      >
        {milestones.map((m, i) => {
          const { pct, reached } = segments[i];
          const IconComp = ICON_MAP[m.icon];
          const isLast   = i === milestones.length - 1;

          // Fill % for the segment BEFORE this node (between node i-1 and node i)
          const segFill = pct; // already computed per-segment in computeSegments

          return (
            <React.Fragment key={m.threshold}>
              {/* Connecting track before this node (skip for first) */}
              {i > 0 && (
                <div className="cgm-segment">
                  <div
                    className="cgm-segment-fill"
                    style={{ width: `${segments[i].pct}%` }}
                  />
                </div>
              )}

              {/* Node circle */}
              <div
                className={`cgm-node ${reached ? "cgm-node--done" : "cgm-node--todo"}`}
                aria-label={`${m.label} – ${reached ? "unlocked" : "locked"}`}
              >
                {reached ? (
                  <CheckIcon color={C.checkmark} />
                ) : (
                  <IconComp color={C.iconTodo} />
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Labels row ── */}
      <div
        className="cgm-labels"
        style={
          {
            "--node-size": "clamp(28px, 5.5vw, 36px)",
          } as React.CSSProperties
        }
      >
        {milestones.map((m, i) => {
          const { reached } = segments[i];
          const isLast      = i === milestones.length - 1;

          return (
            <React.Fragment key={m.threshold}>
              {i > 0 && <div className="cgm-label-gap" />}
              <div className="cgm-label-cell">
                <span
                  className={`cgm-label-text ${reached ? "cgm-label-text--done" : "cgm-label-text--todo"}`}
                >
                  {m.label}
                </span>
                <span
                  className={`cgm-label-text ${reached ? "cgm-label-text--done" : "cgm-label-text--todo"}`}
                >
                  on ₹{m.threshold}!
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
