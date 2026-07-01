import React from "react";
import { motion } from "framer-motion";

export type ConnectionStatus = "loading" | "live" | "warning" | "demo";

interface StatusPillProps {
  status: ConnectionStatus;
  text: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, text }) => {
  return (
    <motion.div
      className="status-banner"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    >
      <div className={`status-pill ${status}`}>
        <span className="status-dot" />
        <span>{text}</span>
      </div>
    </motion.div>
  );
};
