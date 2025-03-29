"use client";

import { useEffect, useState, useRef } from "react";
import { redirect } from "next/navigation";
import { Canvas } from "fabric";
import { jsPDF } from "jspdf";
import StyleToolbar from "./StyleToolbar";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { usePresentationStore } from "@/app/context/usePresentationStore";
import UserList from "@/app/components/UserList";
import Toolbar from "@/app/components/Toolbar";
import SlideList from "@/app/components/SlideList";
import { create } from "zustand";

interface PresentationProps {
  presentationId: string;
}

interface Slide {
  id: string;
  canvasData: string;
}

interface User {
  id: string;
  name: string;
  role: "creator" | "editor" | "viewer";
}

interface CanvasStore {
  canvas: Canvas | null;
  setCanvas: (canvas: Canvas | null) => void;
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
  slides: Slide[];
  setSlides: (slides: Slide[]) => void;
  currentSlideIndex: number;
  setCurrentSlideIndex: (index: number) => void;
  users: User[];
  setUsers: (users: User[]) => void;
}

const useCanvasStore = create<CanvasStore>((set) => ({
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),
  selectedTool: "select",
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  slides: [],
  setSlides: (slides) => set({ slides }),
  currentSlideIndex: 0,
  setCurrentSlideIndex: (currentSlideIndex) => set({ currentSlideIndex }),
  users: [],
  setUsers: (users) => set({ users }),
}));

export default function Presentation({ presentationId }: PresentationProps) {
  const { username, role, activeSlide, setActiveSlide } =
    usePresentationStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const {
    canvas,
    setCanvas,
    slides,
    setSlides,
    currentSlideIndex,
    setCurrentSlideIndex,
    users,
    setUsers,
  } = useCanvasStore();

  useEffect(() => {
    if (!username || !canvasRef.current) return;

    if (!fabricRef.current) {
      fabricRef.current = new Canvas(canvasRef.current, {
        width: 1024,
        height: 768,
        backgroundColor: "#1C232B",
        preserveObjectStacking: true,
      });

      setCanvas(fabricRef.current);

      let copiedObjects: any[] = [];
      document.addEventListener("keydown", (e) => {
        if (!fabricRef.current) return;

        if ((e.ctrlKey || e.metaKey) && e.key === "c") {
          if (fabricRef.current.getActiveObjects().length > 0) {
            fabricRef.current.getActiveObjects().forEach((obj) => {
              obj.clone((cloned: any) => {
                copiedObjects.push(cloned);
              });
            });
          }
        }

        if ((e.ctrlKey || e.metaKey) && e.key === "v") {
          if (copiedObjects.length > 0) {
            copiedObjects.forEach((obj) => {
              obj.clone((cloned: any) => {
                cloned.set({
                  left: cloned.left + 10,
                  top: cloned.top + 10,
                  evented: true,
                });
                fabricRef.current?.add(cloned);
              });
            });
            fabricRef.current.renderAll();
            saveCanvasState();
          }
        }
      });
    }

    const presentationRef = doc(db, "presentations", presentationId);

    const initializePresentation = async () => {
      const docSnap = await getDoc(presentationRef);

      if (!docSnap.exists()) {
        await setDoc(presentationRef, {
          users: [
            {
              id: Date.now().toString(),
              name: username,
              role: role,
            },
          ],
          slides: [
            {
              id: "slide1",
              canvasData: JSON.stringify({
                version: "5.3.0",
                objects: [],
              }),
            },
          ],
        });
      } else {
        const data = docSnap.data();
        const userExists = data.users.some(
          (user: User) => user.name === username
        );

        if (!userExists) {
          await updateDoc(presentationRef, {
            users: arrayUnion({
              id: Date.now().toString(),
              name: username,
              role: role,
            }),
          });
        }
      }
    };

    initializePresentation();

    const unsubscribe = onSnapshot(presentationRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSlides(data.slides || []);
        setUsers(data.users || []);

        if (data.slides && data.slides.length > 0) {
          if (!activeSlide) {
            setActiveSlide(data.slides[0].id);
          }

          const activeIndex = data.slides.findIndex(
            (slide: Slide) => slide.id === activeSlide
          );
          if (activeIndex !== -1) {
            setCurrentSlideIndex(activeIndex);

            if (fabricRef.current) {
              fabricRef.current.clear();
              fabricRef.current.loadFromJSON(
                data.slides[activeIndex].canvasData,
                fabricRef.current.renderAll.bind(fabricRef.current)
              );
            }
          }
        }
      }
    });

    return () => {
      unsubscribe();
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
        setCanvas(null);
      }
    };
  }, [username]);

  const saveCanvasState = async () => {
    if (!fabricRef.current || slides.length === 0) return;

    const presentationRef = doc(db, "presentations", presentationId);
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      canvasData: JSON.stringify(fabricRef.current.toJSON()),
    };

    await updateDoc(presentationRef, {
      slides: updatedSlides,
    });
  };

  const addSlide = async () => {
    if (role === "viewer") return;

    const presentationRef = doc(db, "presentations", presentationId);
    const newSlideId = `slide${slides.length + 1}`;
    const newSlide = {
      id: newSlideId,
      canvasData: JSON.stringify({
        version: "5.3.0",
        objects: [],
      }),
    };

    await updateDoc(presentationRef, {
      slides: arrayUnion(newSlide),
    });

    setActiveSlide(newSlideId);
  };

  const removeSlide = async () => {
    if (role === "viewer" || slides.length <= 1) return;

    const presentationRef = doc(db, "presentations", presentationId);
    const slideToRemove = slides[currentSlideIndex];

    await updateDoc(presentationRef, {
      slides: arrayRemove(slideToRemove),
    });

    const newIndex = currentSlideIndex > 0 ? currentSlideIndex - 1 : 0;
    if (slides.length > 1) {
      setActiveSlide(
        slides[newIndex === currentSlideIndex ? newIndex + 1 : newIndex].id
      );
    }
  };

  const exportToPdf = () => {
    console.log(slides.length);
    if (slides.length === 0) return;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1024, 768],
    });

    slides.forEach((slide, index) => {
      if (index > 0) {
        pdf.addPage();
      }

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 1024;
      tempCanvas.height = 768;
      const tempFabricCanvas = new Canvas(tempCanvas);

      tempFabricCanvas.loadFromJSON(slide.canvasData, () => {
        const dataUrl = tempFabricCanvas.toDataURL({
          format: "png",
          quality: 1,
        });

        pdf.addImage(dataUrl, "PNG", 0, 0, 1024, 768);

        if (index === slides.length - 1) {
          pdf.save(`presentation-${presentationId}.pdf`);
        }

        tempFabricCanvas.dispose();
      });
    });
  };

  if (!username) {
    return redirect("/");
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/6 bg-base-300 flex flex-col gap-4">
        <div className="overflow-y-auto h-1/2">
          <h2 className="font-semibold bg-accent-content p-2 text-center">
            SLIDES
          </h2>
          <SlideList
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            onSlideSelect={(slideId) => setActiveSlide(slideId)}
            onAddSlide={addSlide}
            onRemoveSlide={removeSlide}
            userRole={role}
          />
        </div>
        <div className="p-4 border-t-4 border-accent-content">
          <h2 className="font-semibold bg-accent-content p-2 text-center mb-4 uppercase">
            Styles
          </h2>
          <StyleToolbar canvas={fabricRef.current} userRole={role} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative bg-base-200">
        <div
          className="relative overflow-auto bg-base-100"
          style={{ width: "1024px", height: "768px" }}
        >
          <canvas ref={canvasRef} id="canvas" />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <Toolbar
              canvas={fabricRef.current}
              onSave={saveCanvasState}
              onExport={exportToPdf}
              userRole={role}
            />
          </div>
        </div>
      </div>

      <div className="w-1/6 bg-base-300 overflow-y-auto">
        <h2 className="font-semibold bg-accent-content p-2 text-center">
          USERS
        </h2>
        <UserList presentationId={presentationId} users={users} />
      </div>
    </div>
  );
}
