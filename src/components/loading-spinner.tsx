import { Spin } from "antd";
import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "default" | "large";
  tip?: string;
  height?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  tip = "Loading...",
  height = "400px",
}) => (
  <div
    data-testid="loading-spinner"
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height,
    }}
  >
    <Spin size={size} tip={tip} />
  </div>
);
