import { Coordinates, DriverProfileDto, RideDto } from "@cab/shared";
import { create } from "zustand";

interface DriverState {
  isOnline: boolean;
  incomingRide?: RideDto;
  activeRide?: RideDto;
  rideHistory: RideDto[];
  profile?: DriverProfileDto;
  liveLocation?: Coordinates;
  setOnline: (isOnline: boolean) => void;
  setIncomingRide: (ride?: RideDto) => void;
  setActiveRide: (ride?: RideDto) => void;
  setRideHistory: (rides: RideDto[]) => void;
  setProfile: (profile: DriverProfileDto) => void;
  setLiveLocation: (location: Coordinates) => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  isOnline: false,
  rideHistory: [],
  setOnline: (isOnline) => set({ isOnline }),
  setIncomingRide: (incomingRide) => set({ incomingRide }),
  setActiveRide: (activeRide) => set({ activeRide }),
  setRideHistory: (rideHistory) => set({ rideHistory }),
  setProfile: (profile) => set({ profile }),
  setLiveLocation: (liveLocation) => set({ liveLocation })
}));
