import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const _pageStoreAtom = atom<string>("");
export const pageStoreAtom = atom(
  (get) => get(_pageStoreAtom),
  (_get, set, newPage: string) => set(_pageStoreAtom, String(newPage)),
);

export const starsToggleAtom = atomWithStorage("starsToggle", false);
