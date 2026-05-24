"use client";

import dynamic from "next/dynamic";
import { Coordinates } from "@cab/shared";

interface DriverMapProps {
  current?: Coordinates;
  pickup?: Coordinates;
  destination?: Coordinates;
}

export const DriverMap = dynamic<DriverMapProps>(
  () => import("./DriverMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 md:h-[480px]">
        <div className="flex flex-col items-center gap-2">
          <span className="animate-bounce text-2xl text-blue-500">🗺️</span>
          <span className="text-xs font-semibold text-slate-500">Loading Driver Navsystem...</span>
        </div>
      </div>
    )
  }
);
