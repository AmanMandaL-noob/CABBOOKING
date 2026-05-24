import { DriverLocationDto, RideDto } from "@cab/shared";
import { create } from "zustand";

interface CustomerRideState {
  currentRide?: RideDto;
  latestDriverLocation?: DriverLocationDto;
  setRide: (ride: RideDto) => void;
  setDriverLocation: (location: DriverLocationDto) => void;
  clearRide: () => void;
}

export const useCustomerRideStore = create<CustomerRideState>((set) => ({
  setRide: (ride) => set({ currentRide: ride }),
  setDriverLocation: (location) => set({ latestDriverLocation: location }),
  clearRide: () => set({ currentRide: undefined, latestDriverLocation: undefined })
}));
