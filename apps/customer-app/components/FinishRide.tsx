"use client";

import { useState } from "react";

interface FinishRideProps {
  driverName?: string;
  vehicleType?: string;
  pickupLocation?: string;
  dropLocation?: string;
  distance?: number;
  duration?: number;
  baseFare?: number;
  distanceFare?: number;
  taxes?: number;
  totalFare?: number;
  onPayment?: () => void;
  onRating?: (rating: number) => void;
  isProcessing?: boolean;
}

export function FinishRide({
  driverName = "Rajesh Kumar",
  vehicleType = "Maruti Suzuki Swift",
  pickupLocation = "President's Estate, Delhi",
  dropLocation = "Rohini, Delhi",
  distance = 12.5,
  duration = 45,
  baseFare = 150,
  distanceFare = 75,
  taxes = 27,
  totalFare = 252,
  onPayment,
  onRating,
  isProcessing = false
}: FinishRideProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleRating = (rating: number) => {
    setSelectedRating(rating);
    if (onRating) onRating(rating);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      {/* Success Header */}
      <div className="text-center mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
        <div className="text-4xl mb-2 animate-bounce">✅</div>
        <h3 className="text-lg font-extrabold text-emerald-900 mb-1">
          Ride Completed!
        </h3>
        <p className="text-sm text-emerald-700">
          Thank you for riding with us
        </p>
      </div>

      {/* Trip Summary */}
      <div className="space-y-3 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex gap-3">
          <span className="text-lg">👨‍💼</span>
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-500 uppercase mb-0.5">Driver</div>
            <div className="font-bold text-slate-900">{driverName}</div>
            <div className="text-xs text-slate-500">{vehicleType}</div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3 flex gap-3">
          <span className="text-lg">📍</span>
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Route</div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-700">
                From: <span className="text-slate-900 font-bold">{pickupLocation}</span>
              </div>
              <div className="text-xs font-medium text-slate-700">
                To: <span className="text-slate-900 font-bold">{dropLocation}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3 flex gap-3">
          <span className="text-lg">⏱️</span>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-0.5">Distance</div>
                <div className="font-bold text-slate-900">{distance} km</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-0.5">Duration</div>
                <div className="font-bold text-slate-900">{duration} min</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fare Breakdown */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6 space-y-2">
        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-3">
          💵 Fare Breakdown
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">Base Fare</span>
            <span className="text-slate-900 font-bold">₹{baseFare}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">Distance ({distance} km)</span>
            <span className="text-slate-900 font-bold">₹{distanceFare}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">Taxes & Fees</span>
            <span className="text-slate-900 font-bold">₹{taxes}</span>
          </div>
          <div className="border-t border-slate-300 pt-2 flex justify-between items-center font-bold">
            <span className="text-slate-800 uppercase text-xs tracking-wide">Total</span>
            <span className="text-teal-600 text-lg">₹{totalFare}</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-3">
          ⭐ Rate Your Ride
        </h4>
        <div className="flex justify-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              className="text-3xl transition-transform hover:scale-110 active:scale-95"
              style={{
                opacity: selectedRating >= star ? 1 : 0.3
              }}
            >
              {selectedRating >= star ? "⭐" : "☆"}
            </button>
          ))}
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your feedback (optional)"
          className="w-full p-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:border-teal-500 focus:outline-none resize-none"
          rows={2}
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={onPayment}
          disabled={isProcessing}
          className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs transition-colors shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing Payment..." : "💳 Proceed to Payment"}
        </button>
        <button className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors">
          📧 Share Receipt
        </button>
      </div>

      {/* Support Link */}
      <button className="w-full mt-3 py-2 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs transition-colors">
        ❌ Report Issue
      </button>
    </div>
  );
}
