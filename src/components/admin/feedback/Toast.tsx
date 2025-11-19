import React, { useEffect, useState } from "react";
import "./toast.css";

export interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
  isAutoSave?: boolean;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 3000,
  isAutoSave = false,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300); // Match CSS transition duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`toast toast--${type} ${isExiting ? "toast--exiting" : ""} ${isAutoSave ? "toast--auto-save" : ""}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__content">
        <span className="toast__icon">
          {type === "success" && "✓"}
          {type === "error" && "✕"}
          {type === "info" && "ℹ"}
        </span>
        <span className="toast__message">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
