"use client";

interface CaptainDetailsProps {
  driverName?: string;
  driverRating?: number;
  driverImage?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  distanceAway?: number;
  estimatedArrival?: number;
  phoneNumber?: string;
  onTrackDriverLive?: () => void; // FIXED: Added callback type definitions to props interface
}

export function CaptainDetails({
  driverName = "Rajesh Kumar",
  driverRating = 4.8,
  driverImage = "👨‍💼",
  vehicleNumber = "DL 01 AB 1234",
  vehicleType = "Maruti Suzuki Swift",
  distanceAway = 2.5,
  estimatedArrival = 7,
  phoneNumber = "+91 98765 43210",
  onTrackDriverLive // FIXED: Destructured tracking handler callback instance here
}: CaptainDetailsProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <h3 className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wide">
        👨‍💼 Your Driver
      </h3>

      {/* Driver Card */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4 mb-4 border border-teal-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center text-2xl shadow-sm">
              {driverImage}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{driverName}</h4>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-xs font-semibold text-slate-700">{driverRating}</span>
              </div>
            </div>
          </div>
          <button className="bg-white rounded-full p-2 hover:bg-slate-100 transition-colors shadow-sm border border-slate-200">
            <span className="text-lg">📞</span>
          </button>
        </div>

        {/* Vehicle Info */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
            <span className="text-slate-600 font-medium">Vehicle</span>
            <span className="font-bold text-slate-900">{vehicleType}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
            <span className="text-slate-600 font-medium">Plate No.</span>
            <span className="font-mono font-bold text-slate-900 tracking-wide">{vehicleNumber}</span>
          </div>
        </div>
      </div>

      {/* ETA & Distance */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="text-xs text-slate-500 font-semibold mb-1">Distance Away</div>
          <div className="text-xl font-bold text-slate-900">{distanceAway} km</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="text-xs text-slate-500 font-semibold mb-1">ETA</div>
          <div className="text-xl font-bold text-slate-900">{estimatedArrival} min</div>
        </div>
      </div>

      {/* Contact */}
      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
        <div className="text-xs text-emerald-700 font-semibold mb-2">Driver Contact</div>
        <div className="font-mono text-sm font-bold text-emerald-900 tracking-wider">{phoneNumber}</div>
      </div>

      {/* Live Tracking Button */}
      <button 
        onClick={onTrackDriverLive} // FIXED: Bound click callback method execution directly to the button event layer
        className="w-full mt-4 py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs transition-colors shadow-md active:scale-95"
      >
        📍 Track Driver Live
      </button>
    </div>
  );
}
