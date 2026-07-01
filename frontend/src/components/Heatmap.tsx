import React from "react";

export interface CalendarDay {
  date: string;
  count: number;
  level: number; // 0 to 4
}

interface HeatmapProps {
  weeks: CalendarDay[][];
  type: "github" | "leetcode";
  onHoverCell: (e: React.MouseEvent, text: string, color: string) => void;
  onLeaveCell: () => void;
  year?: number | null;
}

export const Heatmap: React.FC<HeatmapProps> = ({
  weeks,
  type,
  onHoverCell,
  onLeaveCell,
  year,
}) => {
  const isGithub = type === "github";
  
  const colors = isGithub
    ? [
        "var(--gh-green-0)",
        "var(--gh-green-1)",
        "var(--gh-green-2)",
        "var(--gh-green-3)",
        "var(--gh-green-4)",
      ]
    : [
        "var(--lc-orange-0)",
        "var(--lc-orange-1)",
        "var(--lc-orange-2)",
        "var(--lc-orange-3)",
        "var(--lc-orange-4)",
      ];

  const activeColor = isGithub ? "var(--gh-green-3)" : "var(--lc-orange-3)";

  // Parse months for the header
  const getMonthsHeader = () => {
    const headers: { text: string; index: number }[] = [];
    let lastMonth = "";

    weeks.forEach((week, colIdx) => {
      const validDay = week.find((day) => day.date !== "");
      if (validDay) {
        const dateObj = new Date(validDay.date);
        
        // If a specific year is selected, ignore month labels from the previous year
        if (year && dateObj.getFullYear() < year) {
          return;
        }

        const monthName = dateObj.toLocaleString("default", { month: "short" });
        if (monthName !== lastMonth) {
          headers.push({ text: monthName, index: colIdx });
          lastMonth = monthName;
        }
      }
    });

    // Create a matching array of 53 elements to render in grid
    const resultSpans = Array(weeks.length).fill("");
    headers.forEach((h) => {
      if (h.index < resultSpans.length) {
        resultSpans[h.index] = h.text;
      }
    });

    return resultSpans;
  };

  const monthSpans = getMonthsHeader();

  return (
    <div className="heatmap-section">
      <div className="heatmap-header-row">
        <span className="heatmap-year-label">{year ? `${year} Activity` : "Past Year Activity"}</span>
        <div className="legend">
          <span className="legend-label">Less</span>
          <div className="legend-cells">
            {colors.map((color, idx) => (
              <div
                key={idx}
                className="cell legend-cell"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="legend-label">More</span>
        </div>
      </div>

      <div className="heatmap-scroll-container">
        <div className="heatmap-grid-wrapper">
          {/* Days Column */}
          <div className="days-column">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Grid Content */}
          <div className="heatmap-content">
            {/* Months Header Row */}
            <div className="months-header">
              {monthSpans.map((text, idx) => (
                <span key={idx}>{text}</span>
              ))}
            </div>

            {/* Cells Grid */}
            <div className="cells-grid">
              {weeks.map((week, colIdx) =>
                week.map((day, rowIdx) => {
                  const cellColor = colors[day.level] || colors[0];
                  
                  const dateLabel = day.date
                    ? new Date(day.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "";

                  const hoverText = `${day.count} ${
                    isGithub ? "contributions" : "submissions"
                  } on ${dateLabel}`;

                  return (
                    <div
                      key={`${colIdx}-${rowIdx}`}
                      className="cell"
                      style={{
                        backgroundColor: cellColor,
                        color: cellColor,
                      }}
                      onMouseEnter={(e) => onHoverCell(e, hoverText, activeColor)}
                      onMouseMove={(e) => onHoverCell(e, hoverText, activeColor)}
                      onMouseLeave={onLeaveCell}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
