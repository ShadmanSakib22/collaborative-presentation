"use client";
/*
src: app/components/Presentation.tsx
*/

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { usePresentationStore } from "@/app/context/usePresentationStore";
import { Tldraw, TLDocument } from "tldraw";
import "tldraw/tldraw.css";
import UserList from "@/app/components/UserList";

interface PresentationProps {
  presentationId: string;
}

export default function Presentation({ presentationId }: PresentationProps) {
  const [presentation, setPresentation] = useState<any>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState<TLDocument | null>(null);
  const { username, role, setRole } = usePresentationStore();
  const router = useRouter();

  // Load Presentation Data
  useEffect(() => {
    const docRef = doc(db, "presentations", presentationId);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPresentation(data);
        setSlides(data.slides || []);
        setCurrentSlide(data.slides?.[0] || null);
      }
    });

    return () => unsubscribe();
  }, [presentationId]);

  // Save Slide Changes
  const saveSlide = async (newDoc: TLDocument) => {
    if (!presentation) return;
    const updatedSlides = slides.map((s) =>
      s.id === newDoc.id ? { ...s, content: newDoc } : s
    );
    setSlides(updatedSlides);

    const docRef = doc(db, "presentations", presentationId);
    await updateDoc(docRef, { slides: updatedSlides });
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel - Slide List */}
      <div className="w-1/6 bg-gray-200 p-2">
        <h2 className="text-lg font-bold mb-2">Slides</h2>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`p-2 mb-1 cursor-pointer ${
              currentSlide?.id === slide.id ? "bg-blue-400" : "bg-white"
            }`}
            onClick={() => setCurrentSlide(slide)}
          >
            Slide {index + 1}
          </div>
        ))}
      </div>

      {/* Main Slide Editor */}
      <div className="flex-1">{currentSlide && <Tldraw />}</div>

      {/* Right Panel - Users List */}
      <div className="w-1/6 bg-gray-200 p-2">
        <h2 className="text-lg font-bold mb-2">Users</h2>
        <UserList presentationId={presentationId} />
      </div>
    </div>
  );
}
