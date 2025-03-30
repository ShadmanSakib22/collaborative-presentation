"use client";

import { useEffect, useRef } from "react";
import { redirect } from "next/navigation";
import { Canvas } from "fabric";
import { jsPDF } from "jspdf";
import debounce from "lodash.debounce";
import StyleToolbar from "./StyleToolbar";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";
import { usePresentationStore } from "@/app/context/usePresentationStore";
import UserList from "@/app/components/UserList";
import Toolbar from "@/app/components/Toolbar";
import SlideList from "@/app/components/SlideList";

interface PresentationProps {
  presentationId: string;
}

export default function Presentation({ presentationId }: PresentationProps) {
  const {
    username,
    role,
    setCanvas,
    slides,
    setSlides,
    currentSlideIndex,
    setCurrentSlideIndex,
    setUsers,
  } = usePresentationStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const isMountedRef = useRef(true);

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
    }

    return () => {
      isMountedRef.current = false;
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
        setCanvas(null);
      }
    };
  }, [username, setCanvas]);

  useEffect(() => {
    if (!presentationId || !username) return;

    const presentationRef = doc(db, "presentations", presentationId);

    const unsubscribe = onSnapshot(presentationRef, (doc) => {
      if (!doc.exists() || !isMountedRef.current) return;

      const data = doc.data();
      const currentUsers = data.users || [];
      setUsers(currentUsers);
      setSlides(data.slides || []);

      const currentSlideData = data.slides[currentSlideIndex]?.canvasData;
      if (currentSlideData && fabricRef.current) {
        // Clear the canvas first
        fabricRef.current.clear();

        fabricRef.current.loadFromJSON(currentSlideData, () => {
          // Force a complete re-render
          fabricRef.current?.requestRenderAll();

          // Make sure all objects are properly initialized
          fabricRef.current?.getObjects().forEach((obj) => {
            obj.setCoords();
          });

          // Force another render to be safe
          setTimeout(() => {
            fabricRef.current?.requestRenderAll();
          }, 50);
        });
      }
    });

    return () => unsubscribe();
  }, [
    presentationId,
    username,
    currentSlideIndex,
    setCurrentSlideIndex,
    setSlides,
    setUsers,
  ]);

  const debouncedSave = useRef(
    debounce(async (canvasData: string) => {
      if (!isMountedRef.current || !presentationId) return;

      try {
        // Create a deep copy to avoid reference issues
        const updatedSlides = JSON.parse(JSON.stringify(slides));

        // Update only the current slide
        updatedSlides[currentSlideIndex] = {
          ...updatedSlides[currentSlideIndex],
          canvasData,
        };

        await updateDoc(doc(db, "presentations", presentationId), {
          slides: updatedSlides,
          lastEdited: new Date(),
        });

        setSlides(updatedSlides);
      } catch (error) {
        console.error("Failed to save canvas state:", error);
      }
    }, 500)
  ).current;

  // Add this function to force a save
  const forceSaveCanvas = () => {
    if (!fabricRef.current) return;
    const canvasData = JSON.stringify(fabricRef.current.toJSON());

    // Save immediately without debouncing
    const updatedSlides = slides.map((slide, index) =>
      index === currentSlideIndex ? { ...slide, canvasData } : slide
    );

    updateDoc(doc(db, "presentations", presentationId), {
      slides: updatedSlides,
      lastEdited: new Date(),
    }).catch((error) => {
      console.error("Failed to force save canvas state:", error);
    });
  };

  useEffect(() => {
    if (!fabricRef.current || role === "viewer") return;

    const handleCanvasChange = () => {
      if (!fabricRef.current) return;
      console.log("Canvas changed, saving...");
      const canvasData = JSON.stringify(fabricRef.current.toJSON());
      console.log("Canvas data:", canvasData); // Debug log
      debouncedSave(canvasData);
    };

    fabricRef.current.on("object:modified", handleCanvasChange);
    fabricRef.current.on("object:added", handleCanvasChange);
    fabricRef.current.on("object:removed", handleCanvasChange);
    fabricRef.current.on("path:created", handleCanvasChange);

    return () => {
      if (!fabricRef.current) return;
      fabricRef.current.off("object:modified", handleCanvasChange);
      fabricRef.current.off("object:added", handleCanvasChange);
      fabricRef.current.off("object:removed", handleCanvasChange);
      fabricRef.current.off("path:created", handleCanvasChange);
      debouncedSave.cancel();
    };
  }, [currentSlideIndex, debouncedSave, role]);

  const addSlide = async () => {
    if (role === "viewer") return;

    const newSlide = {
      canvasData: JSON.stringify({ version: "6.6.1", objects: [] }),
    };

    const updatedSlides = [...slides, newSlide];

    // Await the updateDoc call to ensure the slide is saved to Firestore
    await updateDoc(doc(db, "presentations", presentationId), {
      slides: updatedSlides,
      lastEdited: new Date(),
    });

    setSlides(updatedSlides);
    setCurrentSlideIndex(updatedSlides.length - 1);

    // Load empty canvas for new slide
    if (fabricRef.current) {
      fabricRef.current.loadFromJSON(newSlide.canvasData, () => {
        fabricRef.current?.renderAll();
      });
    }
  };

  const removeSlide = async () => {
    if (role === "viewer" || slides.length <= 1) return;

    // Remove current slide from slides array
    const updatedSlides = slides.filter(
      (_, index) => index !== currentSlideIndex
    );
    const newIndex = currentSlideIndex > 0 ? currentSlideIndex - 1 : 0;

    // First update Firestore with the new slides array
    await updateDoc(doc(db, "presentations", presentationId), {
      slides: updatedSlides,
      lastEdited: new Date(),
    });

    // Update local state
    setSlides(updatedSlides);
    setCurrentSlideIndex(newIndex);

    // Load the previous slide content
    if (fabricRef.current) {
      fabricRef.current.loadFromJSON(updatedSlides[newIndex].canvasData, () => {
        fabricRef.current?.renderAll();
      });
    }
  };

  const switchSlide = async (index: number) => {
    if (!fabricRef.current || index === currentSlideIndex) return;

    // For viewers, just switch the slide without saving changes
    if (role === "viewer") {
      setCurrentSlideIndex(index);
      fabricRef.current.clear();
      fabricRef.current.loadFromJSON(slides[index].canvasData, () => {
        fabricRef.current?.requestRenderAll();
      });
      return;
    }

    // For editors and creators, save changes before switching
    try {
      // Save current canvas state
      const currentCanvasData = JSON.stringify(fabricRef.current.toJSON());

      // Deep copy the slides array
      const updatedSlides = JSON.parse(JSON.stringify(slides));

      // Update the current slide's canvas data
      updatedSlides[currentSlideIndex] = {
        ...updatedSlides[currentSlideIndex],
        canvasData: currentCanvasData,
      };

      // Update Firestore
      await updateDoc(doc(db, "presentations", presentationId), {
        slides: updatedSlides,
        lastEdited: new Date(),
      });

      // Update local state
      setSlides(updatedSlides);

      // Switch to the new slide
      setCurrentSlideIndex(index);

      // Load the new slide's canvas data
      fabricRef.current.clear();
      fabricRef.current.loadFromJSON(slides[index].canvasData, () => {
        fabricRef.current?.requestRenderAll();
      });
    } catch (error) {
      console.error("Failed to switch slides:", error);
    }
  };

  const exportToPdf = () => {
    const canvas = document.querySelector("canvas");

    if (!canvas) return;

    // use jspdf
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1024, 768],
    });

    // get the canvas data url
    const data = canvas.toDataURL();

    // add the image to the pdf
    doc.addImage(data, "PNG", 0, 0, canvas.width, canvas.height);

    // download the pdf
    doc.save("canvas.pdf");
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
            presentationId={presentationId}
            onSlideSelect={switchSlide}
            onAddSlide={addSlide}
            onRemoveSlide={removeSlide}
          />
        </div>

        {/* Only show style toolbar to non-viewers */}
        {role !== "viewer" && (
          <div className="p-4 border-t-4 border-accent-content">
            <h2 className="font-semibold bg-accent-content p-2 text-center mb-4 uppercase">
              Styles
            </h2>
            <StyleToolbar canvas={fabricRef.current} userRole={role} />
          </div>
        )}
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
              onSave={forceSaveCanvas}
              onExport={() => exportToPdf()}
              userRole={role}
            />
          </div>
        </div>
      </div>

      <div className="w-1/6 bg-base-300 overflow-y-auto">
        <h2 className="font-semibold bg-accent-content p-2 text-center">
          USERS
        </h2>
        <UserList presentationId={presentationId} />
      </div>
    </div>
  );
}
