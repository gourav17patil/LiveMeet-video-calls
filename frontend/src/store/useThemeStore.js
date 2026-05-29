import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("livemeet-theme") || "halloween",
  setTheme: (theme) => {
    localStorage.setItem("livemeet-theme", theme);
    set({ theme });
  },
}));