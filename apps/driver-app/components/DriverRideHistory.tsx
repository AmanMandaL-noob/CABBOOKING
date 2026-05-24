import { RideDto } from "@cab/shared";

export function DriverRideHistory({ rides }: { rides: RideDto[] }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-slate-100 max-h-[400px] overflow-y-auto transition-all duration-300 hover:border-slate-700/50">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
        <h2 className="text-sm font-extrabold tracking-wide uppercase text-slate-400">Dispatch Log History</h2>
        <span className="text-[10px] font-bold text-slate-600 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
          {rides.length} Runs
        </span>
      </div>

      {rides.length === 0 ? (
        <div className="text-center py-6 text-xs font-semibold text-slate-600">
          No dispatch runs archived yet.
        </div>
      ) : (
        <ul className="space-y-3.5">
          {rides.map((ride) => {
            const isCompleted = ride.status === "COMPLETED";
            return (
              <li 
                key={ride.id} 
                className="rounded-2xl border border-slate-900 bg-slate-900/40 p-4 transition-all hover:bg-slate-900/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-500 font-mono tracking-wider">
                    ID: {ride.id.slice(-6).toUpperCase()}
                  </span>
                  <span className={`rounded-md px-2 py-0.5 text-[9px] font-extrabold tracking-widest uppercase border ${
                    isCompleted 
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                      : "bg-blue-500/10 border-blue-500/25 text-blue-400"
                  }`}>
                    {ride.status}
                  </span>
                </div>
                <div className="mt-2.5 text-[11px] text-slate-400 space-y-1">
                  <p className="truncate">
                    📍 <span className="font-semibold text-slate-500">Pick:</span>{" "}
                    <span className="font-mono text-[10px]">{ride.pickup.lat.toFixed(5)}, {ride.pickup.lng.toFixed(5)}</span>
                  </p>
                  <p className="truncate">
                    🏁 <span className="font-semibold text-slate-500">Drop:</span>{" "}
                    <span className="font-mono text-[10px]">{ride.destination.lat.toFixed(5)}, {ride.destination.lng.toFixed(5)}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
