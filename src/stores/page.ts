import { create } from "zustand";

interface PageState {
  previousPage: string
  setPreviousPage: (page: string) => void
}
const usePageStore = create<PageState>((set) => {
  return {
    previousPage: '',
    setPreviousPage: (page: string) => set(() => ({ previousPage: page }))
  }
})

export default usePageStore
