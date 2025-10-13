import { create } from "zustand";
import * as THREE from "three";

interface ObjectCache {
  objects: Map<string, THREE.Object3D>;
  // getObject: (name: string) => THREE.Object3D;
  setObject: (name: string, scene: THREE.Object3D) => void;
  removeObject: (name: string) => void;
}

const useObjectCache = create<ObjectCache>((set, get) => {
  return {
    objects: new Map<string, THREE.Object3D>(),
    setObject: (name: string, scene: THREE.Object3D) =>
      set((state) => {
        if (state.objects.has(name)) {
          console.log("no!");
          return state;
        }
        state.objects.set(name, scene);
        return state;
      }),
    removeObject: (name: string) =>
      set((state) => {
        const objectToRemove = state.objects.get(name);
        if (objectToRemove) {
          state.objects.delete(name);
        }
        return state;
      }),
  };
});

export { useObjectCache };
