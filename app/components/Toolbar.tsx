"use client";

import { useRef } from "react";
import {
  createRectangle,
  createCircle,
  createTriangle,
  createText,
  enableSelect,
  enableDrawing,
  handleImageUpload,
  deleteSelectedObjects,
} from "@/app/lib/canvasTools";

export default function Toolbar({
  canvas,
  onSave,
  onExport,
  userRole,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDisabled = userRole === "viewer";

  const handleSelect = () => {
    if (!canvas || isDisabled) return;
    enableSelect(canvas);
  };

  const handleRectangle = () => {
    if (!canvas || isDisabled) return;
    createRectangle(canvas);
    onSave();
  };

  const handleCircle = () => {
    if (!canvas || isDisabled) return;
    createCircle(canvas);
    onSave();
  };

  const handleTriangle = () => {
    if (!canvas || isDisabled) return;
    createTriangle(canvas);
    onSave();
  };

  const handleAddText = () => {
    if (!canvas || isDisabled) return;
    createText(canvas);
    onSave();
  };

  const handleFreeDrawing = () => {
    if (!canvas || isDisabled) return;
    enableDrawing(canvas);
  };

  const triggerFileInput = () => {
    if (isDisabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File change event:", e.target.files);
    if (
      !canvas ||
      isDisabled ||
      !e.target.files ||
      e.target.files.length === 0
    ) {
      console.log("File validation check:", {
        canvas,
        isDisabled,
        files: e.target.files,
      });
      return;
    }

    const file = e.target.files[0];
    handleImageUpload(canvas, file);
    onSave();
    e.target.value = "";
  };

  const handleDelete = () => {
    if (!canvas || isDisabled) return;
    deleteSelectedObjects(canvas);
    onSave();
  };

  return (
    <div className="bg-base-300 rounded-lg shadow-lg p-2 flex space-x-2">
      <button
        onClick={handleSelect}
        className={`p-2 rounded ${
          isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-base-200"
        }`}
        disabled={isDisabled}
        title="Select"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
        </svg>
      </button>

      <button
        onClick={handleRectangle}
        className={`p-2 rounded ${
          isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-base-100"
        }`}
        disabled={isDisabled}
        title="Rectangle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        </svg>
      </button>

      <button
        onClick={handleCircle}
        className={`p-2 rounded ${
          isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-base-100"
        }`}
        disabled={isDisabled}
        title="Circle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      </button>

      <button
        onClick={handleTriangle}
        className={`p-2 rounded ${
          isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-base-100"
        }`}
        disabled={isDisabled}
        title="Triangle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 2 22 22 22 12 2"></polygon>
        </svg>
      </button>

      <button
        onClick={handleFreeDrawing}
        className={`p-2 rounded ${
          isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-base-100"
        }`}
        disabled={isDisabled}
        title="Free Drawing"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
          <path d="M2 2l7.586 7.586"></path>
          <circle cx="11" cy="11" r="2"></circle>
        </svg>
      </button>

      <button
        onClick={handleAddText}
        className={`p-2 rounded ${
          isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
        }`}
        disabled={isDisabled}
        title="Add Text"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 7 4 4 20 4 20 7"></polyline>
          <line x1="9" y1="20" x2="15" y2="20"></line>
          <line x1="12" y1="4" x2="12" y2="20"></line>
        </svg>
      </button>

      <button
        onClick={triggerFileInput}
        className={`p-2 rounded ${
          isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-base-100"
        }`}
        disabled={isDisabled}
        title="Upload Image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </button>

      <button
        onClick={handleDelete}
        className={`p-2 rounded ${
          isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-base-100"
        }`}
        disabled={isDisabled}
        title="Delete"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>

      <div className="border-l border-gray-300 mx-2"></div>

      <button
        onClick={onSave}
        className={`p-2 rounded ${
          isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-base-100"
        }`}
        disabled={isDisabled}
        title="Save"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
      </button>

      <button
        onClick={onExport}
        className="p-2 rounded hover:bg-base-100"
        title="Export to PDF"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      </button>
    </div>
  );
}
