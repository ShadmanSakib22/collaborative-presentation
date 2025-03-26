/* 
src: app\context\usePresentationStore.ts
purpose: Zustand store for user roles & active slide
*/

import { create } from "zustand";

type Role = "creator" | "editor" | "viewer";

interface PresentationState {
  username: string;
  role: Role;
  activeSlide: string;
  setRole: (role: Role) => void;
  setUsername: (name: string) => void;
  setActiveSlide: (slideId: string) => void;
}

export const usePresentationStore = create<PresentationState>((set) => ({
  username: "Annon0",
  role: "viewer",
  activeSlide: "",
  setRole: (role) => set({ role }),
  setUsername: (name) => set({ username: name }),
  setActiveSlide: (slideId) => set({ activeSlide: slideId }),
}));
