import React from "react";

interface TooltipProps {
  content: string;
  x: number;
  y: number;
  visible: boolean;
  borderColor?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  x,
  y,
  visible,
  borderColor = "rgba(255, 255, 255, 0.15)",
}) => {
  if (!visible) return null;

  return (
    <div
      className="tooltip"
      style={{
        position: "fixed",
        left: x + 14,
        top: y + 14,
        borderColor,
        display: "block",
        transformOrigin: "top left",
      }}
    >
      {content}
    </div>
  );
};
