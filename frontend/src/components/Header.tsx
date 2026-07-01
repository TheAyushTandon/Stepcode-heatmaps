import React from "react";
import { motion } from "framer-motion";

export const Header: React.FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="logo-container">
        <span className="logo-main">StepCode</span>
        <span className="logo-slash">//</span>
        <span className="logo-sub">Heatmaps</span>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        Seamlessly track and visualize GitHub contributions and LeetCode solve records in a fluid glassmorphic interface.
      </motion.p>
    </motion.header>
  );
};
