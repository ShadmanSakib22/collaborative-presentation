"use client";

interface Slide {
  id: string;
  canvasData: string;
}

interface SlideListProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideSelect: (slideId: string) => void;
  onAddSlide: () => void;
  onRemoveSlide: () => void;
  userRole: string;
}

export default function SlideList({
  slides,
  currentSlideIndex,
  onSlideSelect,
  onAddSlide,
  onRemoveSlide,
  userRole,
}: SlideListProps) {
  const isDisabled = userRole === "viewer";

  return (
    <div className="p-2">
      <div className="flex justify-between mb-4">
        <button
          onClick={onAddSlide}
          disabled={isDisabled}
          className={`px-3 py-1 bg-base-200 text-white border-2 border-accent rounded ${
            isDisabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-accent-content"
          }`}
        >
          Add Slide
        </button>
        <button
          onClick={onRemoveSlide}
          disabled={isDisabled || slides.length <= 1}
          className={`px-3 py-1 bg-red-500 text-white rounded ${
            isDisabled || slides.length <= 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-red-600"
          }`}
        >
          Remove
        </button>
      </div>

      <div className="space-y-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => onSlideSelect(slide.id)}
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
