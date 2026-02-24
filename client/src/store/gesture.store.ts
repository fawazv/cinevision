import { create } from 'zustand';
import type { GestureState } from '../types/gesture.types';

interface GestureStoreState {
    currentGesture: GestureState | null;
    setGesture: (state: GestureState) => void;
}

export const useGestureStore = create<GestureStoreState>((set) => ({
    currentGesture: null,
    setGesture: (state) => set({ currentGesture: state }),
}));
