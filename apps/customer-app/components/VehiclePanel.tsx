"use client";

import { useState } from "react";

interface RideOption {
  tier: "UberGo" | "UberPremier" | "UberXL";
  icon: string;
  name: string;
  description: string;
  baseFare: number;
  pricePerKm: number;
  color: string;
}

// Pricing Rules: Base Fare + Per-KM rate to hit your target configuration
const RIDE_OPTIONS_CONFIG: RideOption[] = [
  {
    tier: "UberGo",
    icon: "🚗",
    name: "UberGo",
    description: "Budget-friendly rides",
    baseFare: 15,      // ₹15 Base + (₹35 * 1km) = ₹50 total for 1 km
    pricePerKm: 35, 
    color: "teal"
  },
  {
    tier: "UberPremier",
    icon: "💎",
    name: "UberPremier",
    description: "Premium comfort",
    baseFare: 25,      // ₹25 Base + (₹55 * 1km) = ₹80 total for 1 km
    pricePerKm: 55,
    color: "amber"
  },
  {
    tier: "UberXL",
    icon: "🚙",
    name: "UberXL",
    description: "Spacious for groups",
    baseFare: 40,      // ₹40 Base + (₹75 * 1km) = ₹115 total for 1 km
    pricePerKm: 75,
    color: "blue"
  }
];

interface VehiclePanelProps {
  selectedTier: "UberGo" | "UberPremier" | "UberXL";
  onSelect: (tier: "UberGo" | "UberPremier" | "UberXL") => void;
  estimatedTime?: number;
  estimatedDistance?: number;
}

export function VehiclePanel({
  selectedTier,
  onSelect,
  estimatedTime = 5,
  estimatedDistance = 2.5
}: VehiclePanelProps) {
  
  // Dynamic calculation tool ensuring a minimum fallback base fare structure
  const calculateOptionFare = (baseFare: number, pricePerKm: number) => {
    if (estimatedDistance === 0) return 0;
    return Math.max(50, Math.round(baseFare + estimatedDistance * pricePerKm)); 
  };

  const selectedOption = RIDE_OPTIONS_CONFIG.find(o => o.tier === selectedTier);
  const selectedEstimatedFare = selectedOption 
    ? calculateOptionFare(selectedOption.baseFare, selectedOption.pricePerKm) 
    : 150;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <h3 className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wide">
        🚗 Choose Your Ride
      </h3>

      <div className="space-y-3 mb-6">
        {RIDE_OPTIONS_CONFIG.map((option) => {
          const isSelected = selectedTier === option.tier;
          const dynamicPrice = calculateOptionFare(option.baseFare, option.pricePerKm);

          const bgColor = {
            teal: "bg-teal-50 border-teal-200",
            amber: "bg-amber-50 border-amber-200",
            blue: "bg-blue-50 border-blue-200"
          };
          const textColor = {
            teal: "text-teal-700",
            amber: "text-amber-700",
            blue: "text-blue-700"
          };

          return (
            <button
              key={option.tier}
              onClick={() => onSelect(option.tier)}
              className={`w-full p-4 rounded-2xl border-2 transition-all ${
                isSelected
                  ? `border-${option.color}-500 ${bgColor[option.color as keyof typeof bgColor]}`
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{option.icon}</span>
                    <h4 className={`font-bold text-sm ${isSelected ? textColor[option.color as keyof typeof textColor] : "text-slate-800"}`}>
                      {option.name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">{option.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-slate-800">₹{dynamicPrice}</div>
                  <div className="text-xs text-slate-400">ETA: {estimatedTime} min</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Trip Summary */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between font-medium text-slate-700">
            <span>Trip Distance</span>
            <span className="font-bold text-slate-900">{estimatedDistance.toFixed(2)} km</span>
          </div>
          <div className="flex justify-between font-medium text-slate-700">
            <span>Estimated Time</span>
            <span className="font-bold text-slate-900">{estimatedTime} mins</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800">
            <span>Estimated Fare</span>
            <span className="text-teal-600">₹{selectedEstimatedFare}</span>
          </div>
        </div>
      </div>
    </div>
  );
}