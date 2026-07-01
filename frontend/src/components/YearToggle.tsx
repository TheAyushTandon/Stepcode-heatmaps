import React from "react";
import { motion } from "framer-motion";

interface YearToggleProps {
  currentYear: number | null;
  onChange: (year: number | null) => void;
}

export const YearToggle: React.FC<YearToggleProps> = ({ currentYear, onChange }) => {
  const years = new Date().getFullYear();
  
  const options: { value: number | null; label: string }[] = [
    { value: null, label: "Recent" },
    { value: years, label: `${years}` },
    { value: years - 1, label: `${years - 1}` },
    { value: years - 2, label: `${years - 2}` },
    { value: years - 3, label: `${years - 3}` },
  ];

  return (
    <div className="year-toggle-wrapper">
      <div className="year-toggle-container">
        {options.map((option) => {
          const isActive = currentYear === option.value;
          return (
            <button
              key={option.label}
              className={`year-toggle-btn ${isActive ? "active" : ""}`}
              onClick={() => onChange(option.value)}
              style={{ position: "relative" }}
            >
              {isActive && (
                <motion.div
                  layoutId="active-year-pill"
                  className="year-toggle-pill"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 8,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
              <span style={{ position: "relative", zIndex: 2 }}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
