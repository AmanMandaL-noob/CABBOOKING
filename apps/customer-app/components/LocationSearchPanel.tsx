"use client";

import { useState } from "react";

export interface LocationSearchPanelProps {
  pickupSearch: string;
  destSearch: string;
  pickupSuggestions: any[];
  destSuggestions: any[];
  showPickupDropdown: boolean;
  showDestDropdown: boolean;
  onPickupChange: (value: string) => void;
  onDestChange: (value: string) => void;
  onPickupFocus: () => void;
  onDestFocus: () => void;
  onPickupBlur?: () => void;
  onDestBlur?: () => void;
  onPickupSelect: (suggestion: any) => void;
  onDestSelect: (suggestion: any) => void;
  onCurrentLocation: () => void;
  isLoading: boolean;
}

export function LocationSearchPanel({
  pickupSearch,
  destSearch,
  pickupSuggestions,
  destSuggestions,
  showPickupDropdown,
  showDestDropdown,
  onPickupChange,
  onDestChange,
  onPickupFocus,
  onDestFocus,
  onPickupBlur,
  onDestBlur,
  onPickupSelect,
  onDestSelect,
  onCurrentLocation,
  isLoading
}: LocationSearchPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="space-y-4">
        {/* Pickup Location */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
            📍 Pickup Location
          </label>
          <div className="relative">
            <input
              type="text"
              value={pickupSearch}
              onChange={(e) => onPickupChange(e.target.value)}
              onFocus={onPickupFocus}
              onBlur={onPickupBlur}
              placeholder="Enter pickup location"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none transition-colors bg-slate-50/50 text-slate-900 placeholder-slate-400"
            />
            {pickupSuggestions.length > 0 && showPickupDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                {pickupSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.place_id}
                    onClick={() => onPickupSelect(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-teal-50 border-b border-slate-100 last:border-0 text-xs font-medium text-slate-700 transition-colors"
                  >
                    {suggestion.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Destination Location */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
            🏁 Drop Location
          </label>
          <div className="relative">
            <input
              type="text"
              value={destSearch}
              onChange={(e) => onDestChange(e.target.value)}
              onFocus={onDestFocus}
              onBlur={onDestBlur}
              placeholder="Enter destination"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none transition-colors bg-slate-50/50 text-slate-900 placeholder-slate-400"
            />
            {destSuggestions.length > 0 && showDestDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                {destSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.place_id}
                    onClick={() => onDestSelect(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-teal-50 border-b border-slate-100 last:border-0 text-xs font-medium text-slate-700 transition-colors"
                  >
                    {suggestion.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current Location Button */}
        <button
          onClick={onCurrentLocation}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⚙️</span>
              Detecting Location...
            </>
          ) : (
            <>
              📍 Use Current Location
            </>
          )}
        </button>
      </div>
    </div>
  );
}
