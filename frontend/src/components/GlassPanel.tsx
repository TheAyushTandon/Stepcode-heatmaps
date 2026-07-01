import React, { useRef } from "react";
import { motion } from "framer-motion";

interface GlassPanelProps {
  children: React.ReactNode;
  theme?: "github" | "leetcode";
  id?: string;
  className?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = "",
  theme = "github",
  id,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    panelRef.current.style.setProperty("--mouse-x", `${x}px`);
    panelRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <motion.div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      className={`glass-panel ${theme === "github" ? "github-theme" : "leetcode-theme"} ${className}`}
      id={id}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 0.8,
      }}
    >
      {children}
    </motion.div>
  );
};
