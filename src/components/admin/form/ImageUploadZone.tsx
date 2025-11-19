// src/components/admin/ImageUploadZone.tsx
import React, { useState, useCallback, useRef } from "react";
import "./image-upload-zone.css";

interface ImageUploadZoneProps {
  onImageUploaded: (markdown: string) => void;
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  onImageUploaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [customFilename, setCustomFilename] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const uploadImage = async (file: File, filename: string) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("filename", filename);

      const response = await fetch("/api/upload-image-handler", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();

      // Generate ResponsiveImage component syntax
      const componentMarkup = `
<ResponsiveImage
  imageName="${data.imageName}"
  alt="${data.alt || "Image"}"
  originalImageWidth={${data.originalWidth}}
  widths={[480, 800, 1200]}
  sizesAttr="(max-width: 768px) 100vw, 800px"
  imgClass="content-image"
/>
`;

      onImageUploaded(componentMarkup);

      // Reset state
      setPendingFile(null);
      setCustomFilename("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelected = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    // Extract filename without extension
    const originalName = file.name.replace(/\.[^/.]+$/, "");

    setPendingFile(file);
    setCustomFilename(originalName);
    setError(null);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelected(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelected(files[0]);
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  const handleClick = () => {
    if (!pendingFile) {
      fileInputRef.current?.click();
    }
  };

  const handleConfirmUpload = () => {
    if (pendingFile && customFilename.trim()) {
      uploadImage(pendingFile, customFilename.trim());
    }
  };

  const handleCancelUpload = () => {
    setPendingFile(null);
    setCustomFilename("");
    setError(null);
  };

  return (
    <div className="image-upload-container">
      {!pendingFile ? (
        <div
          className={`image-upload-zone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          <p className="upload-text">
            {isDragging ? "Drop image here" : "Drop image or click to upload"}
          </p>
          <p className="upload-hint">JPG, PNG, WebP • Max 10MB</p>
        </div>
      ) : (
        <div className="image-upload-confirm">
          <div className="confirm-header">
            <span className="file-preview">{pendingFile.name}</span>
          </div>

          <div className="filename-input-group">
            <label htmlFor="custom-filename">Save as:</label>
            <input
              id="custom-filename"
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder="Enter filename"
              disabled={isUploading}
              autoFocus
            />
          </div>

          <div className="confirm-actions">
            <button
              onClick={handleConfirmUpload}
              disabled={isUploading || !customFilename.trim()}
              className="btn-upload"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
            <button
              onClick={handleCancelUpload}
              disabled={isUploading}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <div className="upload-error">{error}</div>}
    </div>
  );
};
