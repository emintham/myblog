import React, { useState, useEffect, useCallback } from "react";
import Toast from "./Toast";

interface ToastData {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  isAutoSave?: boolean;
  duration?: number;
}

export interface ToastContainerProps {
  formId: string;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ formId }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "info",
      isAutoSave = false,
      duration = 3000
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type, isAutoSave, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const handlePostFormSuccess = (event: Event) => {
      const customEvent = event as CustomEvent<{
        result: { message?: string };
        actionType: "create" | "update";
        isAutoSave?: boolean;
      }>;

      const { result, actionType, isAutoSave } = customEvent.detail;

      // Different messages for auto-save vs manual save
      let message: string;
      if (isAutoSave) {
        message = "Saved";
      } else {
        message =
          result?.message ||
          (actionType === "create"
            ? "Post created successfully!"
            : "Post updated successfully!");
      }

      // Auto-save toasts disappear faster
      const duration = isAutoSave ? 2000 : 3000;

      addToast(message, "success", isAutoSave, duration);
    };

    const handlePostFormError = (event: Event) => {
      const customEvent = event as CustomEvent<{
        error: unknown;
        actionType: "create" | "update";
        isAutoSave?: boolean;
      }>;

      const { error, actionType, isAutoSave } = customEvent.detail;

      // Don't show error toasts for auto-save (too disruptive)
      if (isAutoSave) {
        return;
      }

      const errorMessage =
        (error as { message?: string })?.message || "An error occurred";
      const message = `Error ${actionType === "create" ? "creating" : "updating"} post: ${errorMessage}`;

      addToast(message, "error", false, 5000);
    };

    window.addEventListener("postFormSuccess", handlePostFormSuccess);
    window.addEventListener("postFormError", handlePostFormError);

    return () => {
      window.removeEventListener("postFormSuccess", handlePostFormSuccess);
      window.removeEventListener("postFormError", handlePostFormError);
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isAutoSave={toast.isAutoSave}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
