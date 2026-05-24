"use client";

interface WaitingForDriverProps {
  driverName?: string;
  driverRating?: number;
  driverImage?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  distanceAway?: number;
  estimatedArrival?: number;
  pickupLocation?: string;
  onArrive?: () => void;
}

export function WaitingForDriver({
  driverName = "Rajesh Kumar",
  driverRating = 4.8,
  driverImage = "👨‍💼",
  vehicleNumber = "DL 01 AB 1234",
  vehicleType = "Maruti Suzuki Swift",
  distanceAway = 0.5,
  estimatedArrival = 2,
  pickupLocation = "President's Estate, Delhi",
  onArrive
}: WaitingForDriverProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      {/* Animated Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-amber-900 uppercase tracking-wide mb-1">
              ⏰ Driver is Arriving
            </h3>
            <p className="text-xs text-amber-700">
              Be ready at your pickup location
            </p>
          </div>
          <span className="text-3xl animate-bounce">🚖</span>
        </div>
      </div>

      {/* Driver Card */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 mb-4 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center text-2xl shadow-sm">
              {driverImage}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{driverName}</h4>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-xs font-semibold text-slate-700">{driverRating}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 font-semibold mb-1">ETA</div>
            <div className="text-xl font-bold text-teal-600">{estimatedArrival} min</div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Vehicle</span>
            <span className="font-bold text-slate-900">{vehicleType}</span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2">
            <span className="text-slate-600 font-medium">Plate</span>
            <span className="font-mono font-bold text-slate-900 tracking-wide">{vehicleNumber}</span>
          </div>
        </div>
      </div>

      {/* Distance & Location Info */}
      <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-lg">📍</span>
          <div className="flex-1">
            <div className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">
              Your Pickup Location
            </div>
            <div className="text-sm font-medium text-slate-900">{pickupLocation}</div>
          </div>
        </div>
        <div className="text-xs text-teal-700 font-semibold p-2 bg-white/50 rounded-lg">
          Driver is {distanceAway} km away
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 mb-4">
        <h4 className="text-xs font-bold text-emerald-900 mb-2 uppercase tracking-wide">
          What to do now
        </h4>
        <ul className="text-xs text-emerald-800 space-y-1.5">
          <li className="flex gap-2">
            <span>✓</span>
            <span>Be ready at the pickup location</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Watch for the vehicle {vehicleType}</span>
          </li>
          <li className="flex gap-2">
            <span>✓</span>
            <span>Confirm the plate number {vehicleNumber}</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={onArrive}
          className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs transition-colors shadow-md active:scale-95"
        >
          ✓ I'm Ready / Driver Arrived
        </button>
        <button className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors">
          📞 Call Driver
        </button>
      </div>

      {/* Live Tracking Link */}
      <button className="w-full mt-3 py-2 px-4 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs transition-colors">
        📍 Track Driver Live
      </button>
    </div>
  );
}
