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

  setUserName: (name: string) => void;
  setRole: (role: Role) => void;
  setActiveSlide: (slideId: string) => void;
}

export const usePresentationStore = create<PresentationState>((set) => ({
  username: "", // No default name initially
  role: "viewer", // Default role for users
  activeSlide: "",

  setUserName: (name) => set({ username: name }), // Sets the username dynamically when joining/creating a room
  setRole: (role) => set({ role }),
  resetUser: () => set({ username: "", role: "viewer" }), // Reset username and role when user leaves or app reloads
  setActiveSlide: (slideId) => set({ activeSlide: slideId }),
}));
