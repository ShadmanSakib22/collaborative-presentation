"use client";

import { useState, useEffect } from "react";
import { usePresentationStore } from "@/app/context/usePresentationStore";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";

interface Slide {
  uid: string;
  canvasData: string;
}

interface SlideListProps {
  presentationId: string; // Add presentationId as a prop
  onSlideSelect: (index: number) => void;
  onAddSlide: () => void;
  onRemoveSlide: () => void;
}

export default function SlideList({
  presentationId,
  onSlideSelect,
  onAddSlide,
  onRemoveSlide,
}: SlideListProps) {
  const { role, currentSlideIndex } = usePresentationStore();
  const [slides, setSlides] = useState<Slide[]>([]); // Local state for slides

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "presentations", presentationId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const slides = data.slides || [];
          setSlides(slides);
        } else {
          console.log("No such presentation!");
          setSlides([]);
        }
      },
      (error) => {
        console.error("Error getting slides:", error);
        setSlides([]);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  });

  return (
    <div className="p-2">
      {/* Only show add/remove buttons if user is not a viewer */}
      {role !== "viewer" && (
        <div className="flex justify-between mb-4">
          <button
            onClick={onAddSlide}
            className="px-3 py-1 bg-base-200 text-white border-2 border-accent rounded hover:bg-accent-content"
          >
            Add Slide
          </button>
          <button
            onClick={onRemoveSlide}
            disabled={slides.length <= 1}
            className={`px-3 py-1 bg-red-500 text-white rounded ${
              slides.length <= 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-red-600"
            }`}
          >
            Remove
          </button>
        </div>
      )}

      {/* All users (including viewers) can see and select slides */}
      <div className="space-y-2">
        {slides.map((slide, index) => (
          <div
            key={slide.uid}
            onClick={() => onSlideSelect(index)}
            className={`p-2 border rounded cursor-pointer ${
              currentSlideIndex === index
                ? "border-accent bg-accent-content"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">{index + 1}</span>
              <div className="flex-1 truncate">Slide {index + 1}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
