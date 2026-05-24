import { Coordinates } from "@cab/shared";
import { create } from "zustand";

interface CustomerMapState {
  pickup?: Coordinates;
  destination?: Coordinates;
  setPickup: (pickup: Coordinates) => void;
  setDestination: (destination: Coordinates) => void;
}

export const useCustomerMapStore = create<CustomerMapState>((set) => ({
  setPickup: (pickup) => set({ pickup }),
  setDestination: (destination) => set({ destination })
}));
