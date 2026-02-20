import { create } from "zustand";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const _pageStoreAtom = atom<string>("");
export const pageStoreAtom = atom(
  (get) => get(_pageStoreAtom),
  (_get, set, newPage: string) => set(_pageStoreAtom, String(newPage)),
);

interface PageState {
  previousPage: string;
  setPreviousPage: (page: string) => void;
}
const usePageStore = create<PageState>((set) => {
  return {
    previousPage: "",
    setPreviousPage: (page: string) => set(() => ({ previousPage: page })),
  };
});

export default usePageStore;

export const starsToggleAtom = atomWithStorage("starsToggle", false);
