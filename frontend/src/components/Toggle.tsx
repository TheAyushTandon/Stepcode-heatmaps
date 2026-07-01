import React from "react";
import { motion } from "framer-motion";

export type ViewType = "combined" | "github" | "leetcode";

interface ToggleProps {
  currentView: ViewType;
  onChange: (view: ViewType) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ currentView, onChange }) => {
  const options: { value: ViewType; label: string }[] = [
    { value: "combined", label: "Dashboard" },
    { value: "github", label: "GitHub Stats" },
    { value: "leetcode", label: "LeetCode Stats" },
  ];

  return (
    <div className="toggle-wrapper">
      <div className="toggle-container">
        {options.map((option) => {
          const isActive = currentView === option.value;
          return (
            <button
              key={option.value}
              className={`toggle-btn ${isActive ? "active" : ""}`}
              onClick={() => onChange(option.value)}
              style={{ position: "relative" }}
            >
              {isActive && (
                <motion.div
                  layoutId="active-toggle-pill"
                  className="toggle-pill"
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
