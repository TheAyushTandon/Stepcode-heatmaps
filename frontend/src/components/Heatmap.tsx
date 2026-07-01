import React, { useState, useEffect, useRef } from "react";

export interface CalendarDay {
  date: string;
  count: number;
  level: number;
  githubCount?: number;
  leetcodeCount?: number;
}

// Timing constants
const ENTER_STEP_S  = 0.014;  // seconds between column entrances
const EXIT_STEP_S   = 0.010;  // seconds between column exits (snappier)
const EXIT_ANIM_S   = 0.25;   // per-cell exit animation duration
// Total time for all 53 columns to finish exiting + small buffer
const EXIT_TOTAL_MS = Math.ceil((52 * EXIT_STEP_S + EXIT_ANIM_S) * 1000) + 80; // ~850ms

interface HeatmapProps {
  weeks: CalendarDay[][];
  type: "github" | "leetcode" | "unified";
  onHoverCell: (e: React.MouseEvent, text: string, color: string) => void;
  onLeaveCell: () => void;
  year?: number | null;
  /** Wave direction: ltr = left-to-right (default), rtl = right-to-left */
  direction?: "ltr" | "rtl";
  /** Changing this key triggers exit→enter transition */
  animKey?: string | number;
}

export const Heatmap: React.FC<HeatmapProps> = ({
  weeks,
  type,
  onHoverCell,
  onLeaveCell,
  year,
  direction = "ltr",
  animKey,
}) => {
  const [displayWeeks, setDisplayWeeks] = useState<CalendarDay[][]>(weeks);
  const [phase, setPhase]               = useState<"entering" | "exiting">("entering");
  const isFirstMount = useRef(true);
  const prevAnimKey  = useRef(animKey);
  const pendingWeeks = useRef(weeks);

  // Track latest incoming weeks in a ref so setTimeout can access them
  useEffect(() => { pendingWeeks.current = weeks; }, [weeks]);

  useEffect(() => {
    // Skip transition on very first mount — just enter normally
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    if (prevAnimKey.current === animKey) return;
    prevAnimKey.current = animKey;

    // 1. Wave OLD cells out
    setPhase("exiting");

    // 2. After exit finishes, swap data and wave NEW cells in
    const t = setTimeout(() => {
      setDisplayWeeks(pendingWeeks.current);
      setPhase("entering");
    }, EXIT_TOTAL_MS);

    return () => clearTimeout(t);
  }, [animKey]);

  const colors = type === "github"
    ? ["var(--gh-green-0)","var(--gh-green-1)","var(--gh-green-2)","var(--gh-green-3)","var(--gh-green-4)"]
    : type === "leetcode"
    ? ["var(--lc-orange-0)","var(--lc-orange-1)","var(--lc-orange-2)","var(--lc-orange-3)","var(--lc-orange-4)"]
    : ["var(--sc-red-0)","var(--sc-red-1)","var(--sc-red-2)","var(--sc-red-3)","var(--sc-red-4)"];

  const activeColor = type === "github"
    ? "var(--gh-green-3)"
    : type === "leetcode"
    ? "var(--lc-orange-3)"
    : "var(--sc-red-3)";

  const getMonthsHeader = () => {
    const headers: { text: string; index: number }[] = [];
    let lastMonth = "";
    displayWeeks.forEach((week, colIdx) => {
      const validDay = week.find((day) => day.date !== "");
      if (validDay) {
        const dateObj = new Date(validDay.date);
        if (year && dateObj.getFullYear() < year) return;
        const monthName = dateObj.toLocaleString("default", { month: "short" });
        if (monthName !== lastMonth) {
          headers.push({ text: monthName, index: colIdx });
          lastMonth = monthName;
        }
      }
    });
    const resultSpans = Array(displayWeeks.length).fill("");
    headers.forEach((h) => { if (h.index < resultSpans.length) resultSpans[h.index] = h.text; });
    return resultSpans;
  };

  const monthSpans = getMonthsHeader();
  const isExiting  = phase === "exiting";
  // Unique key per phase-transition so React fully remounts the grid and restarts CSS animations
  const gridKey    = `${phase}-${isExiting ? prevAnimKey.current : animKey}`;

  return (
    <div className="heatmap-section">
      <div className="heatmap-header-row">
        <span className="heatmap-year-label">{year ? `${year} Activity` : "Past Year Activity"}</span>
        <div className="legend">
          <span className="legend-label">Less</span>
          <div className="legend-cells">
            {colors.map((color, idx) => (
              <div key={idx} className="cell legend-cell" style={{ backgroundColor: color }} />
            ))}
          </div>
          <span className="legend-label">More</span>
        </div>
      </div>

      <div className="heatmap-scroll-container">
        <div className="heatmap-grid-wrapper">
          <div className="days-column">
            <span>Sun</span><span>Mon</span><span>Tue</span>
            <span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          <div className="heatmap-content">
            <div className="months-header">
              {monthSpans.map((text, idx) => <span key={idx}>{text}</span>)}
            </div>

            <div key={gridKey} className="cells-grid">
              {displayWeeks.map((week, colIdx) => {
                const totalCols = displayWeeks.length;
                // Both entrance and exit wave in the same direction for a "sweep through" feel
                const waveCol = direction === "rtl"
                  ? (totalCols - 1 - colIdx)
                  : colIdx;
                const step  = isExiting ? EXIT_STEP_S : ENTER_STEP_S;
                const delay = waveCol * step;

                return week.map((day, rowIdx) => {
                  const cellColor = colors[day.level] || colors[0];

                  const dateLabel = day.date
                    ? new Date(day.date).toLocaleDateString(undefined, {
                        weekday: "short", year: "numeric",
                        month: "short",   day: "numeric",
                      })
                    : "";

                  let hoverText = "";
                  if (type === "unified") {
                    hoverText = `${day.githubCount || 0} commits & ${day.leetcodeCount || 0} questions solved on ${dateLabel}`;
                  } else {
                    hoverText = `${day.count} ${type === "github" ? "contributions" : "submissions"} on ${dateLabel}`;
                  }

                  return (
                    <div
                      key={`${colIdx}-${rowIdx}`}
                      className={`cell${isExiting ? " exiting" : ""}`}
                      style={{
                        backgroundColor: cellColor,
                        color: cellColor,
                        animationDelay: `${delay}s`,
                      }}
                      onMouseEnter={(e) => onHoverCell(e, hoverText, activeColor)}
                      onMouseMove={(e)  => onHoverCell(e, hoverText, activeColor)}
                      onMouseLeave={onLeaveCell}
                    />
                  );
                });
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
