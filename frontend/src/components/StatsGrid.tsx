import React, { useEffect, useState } from "react";
import { animate } from "framer-motion";

interface CounterProps {
  value: number;
}

export const Counter: React.FC<CounterProps> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
};

interface StatsGridProps {
  total: number;
  activeDays: number;
  streak: number;
  type: "github" | "leetcode";
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  total,
  activeDays,
  streak,
  type,
}) => {
  const stats = [
    {
      label: type === "github" ? "Total Contributions" : "Total Submissions",
      value: total,
      isPrimary: true,
    },
    {
      label: "Active Days",
      value: activeDays,
      isPrimary: false,
    },
    {
      label: "Max Streak",
      value: streak,
      isPrimary: false,
    },
  ];

  const primaryColor = type === "github" ? "var(--gh-green-4)" : "var(--lc-orange-4)";

  return (
    <div className="stats-strip">
      {stats.map((stat, idx) => (
        <React.Fragment key={stat.label}>
          {idx > 0 && <div className="stats-divider" />}
          <div className="stat-item">
            <span className="stat-label">{stat.label}</span>
            <span 
              className="stat-value"
              style={{ color: stat.isPrimary ? primaryColor : "var(--text-primary)" }}
            >
              <Counter value={stat.value} />
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
