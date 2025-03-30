import { create } from "zustand";
import { Canvas } from "fabric";

interface Slide {
  canvasData: string;
}

interface User {
  username: string;
  role: "creator" | "editor" | "viewer";
}

interface Slide {
  canvasData: string;
}

interface PresentationStore {
  // Canvas State
  canvas: Canvas | null;
  selectedTool: string;
  currentSlideIndex: number;
  slides: Slide[];
  users: User[];

  // User State
  username: string;
  role: "creator" | "editor" | "viewer";

  // Actions
  setCanvas: (canvas: Canvas | null) => void;
  setSelectedTool: (tool: string) => void;
  setSlides: (slides: Slide[]) => void;
  setCurrentSlideIndex: (index: number) => void;
  setUsers: (users: User[]) => void;
  setUsername: (username: string) => void;
  setRole: (role: "creator" | "editor" | "viewer") => void;
}

export const usePresentationStore = create<PresentationStore>((set) => ({
  // Canvas State
  canvas: null,
  selectedTool: "select",
  currentSlideIndex: 0,
  slides: [],
  users: [],

  // User State
  username: "",
  role: "viewer",

  // Actions
  setCanvas: (canvas) => set({ canvas }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setSlides: (slides) => set({ slides }),
  setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),
  setUsers: (users) => set({ users }),
  setUsername: (username) => set({ username: username }),
  setRole: (role) => set({ role }),
}));
