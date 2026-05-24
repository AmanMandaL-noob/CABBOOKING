"use client";

import { useState } from "react";

interface LookingForDriverProps {
  estimatedWaitTime?: number;
  selectedTier?: string;
  pickupLocation?: string;
  onCancel?: () => void;
  isCancelling?: boolean;
}

export function LookingForDriver({
  estimatedWaitTime = 2,
  selectedTier = "UberGo",
  pickupLocation = "President's Estate, Delhi",
  onCancel,
  isCancelling = false
}: LookingForDriverProps) {
  const [cancelReason, setCancelReason] = useState("");
  const [showReasons, setShowReasons] = useState(false);

  const cancelReasons = [
    "Driver is taking too long",
    "Wrong location shown",
    "Changed my mind",
    "Need to reschedule",
    "Other"
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      {/* Animated Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-teal-100 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-teal-50"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl animate-bounce">🔍</span>
            </div>
          </div>
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 mb-1">
          Finding your driver...
        </h3>
        <p className="text-sm text-slate-500">
          Estimated wait: <span className="font-bold text-teal-600">{estimatedWaitTime} minutes</span>
        </p>
      </div>

      {/* Trip Details */}
      <div className="space-y-3 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex items-start gap-3">
          <span className="text-xl">🚗</span>
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
              Ride Type
            </div>
            <div className="font-bold text-slate-900">{selectedTier}</div>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-3 flex items-start gap-3">
          <span className="text-xl">📍</span>
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
              Pickup Location
            </div>
            <div className="font-medium text-slate-700 text-sm line-clamp-2">{pickupLocation}</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <div className="flex gap-2">
          <span className="text-lg shrink-0">💡</span>
          <div>
            <h4 className="text-xs font-bold text-blue-900 mb-1">Pro Tip</h4>
            <p className="text-xs text-blue-700">
              Drivers are matched based on your location and route. Keep your location services enabled for faster matching.
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Ride Section */}
      <div className="space-y-2">
        <button
          onClick={() => setShowReasons(!showReasons)}
          disabled={isCancelling}
          className="w-full py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors border border-red-200 disabled:opacity-50"
        >
          {isCancelling ? "Cancelling..." : "Cancel Ride"}
        </button>

        {showReasons && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            {cancelReasons.map((reason) => (
              <button
                key={reason}
                onClick={() => {
                  setCancelReason(reason);
                  if (onCancel) onCancel();
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                {reason}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Animation */}
      <div className="flex justify-center gap-1 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-teal-500"
            style={{
              animation: `bounce 1.4s infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
