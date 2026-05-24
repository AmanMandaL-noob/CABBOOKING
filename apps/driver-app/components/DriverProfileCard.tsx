import { DriverProfileDto } from "@cab/shared";

export function DriverProfileCard({ profile }: { profile?: DriverProfileDto }) {
  if (!profile) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-slate-500 font-semibold text-xs shadow-lg">
        <h2 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">Driver Profile</h2>
        <p className="animate-pulse">Loading profile credentials...</p>
      </section>
    );
  }

  // Get initials for profile badge
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-slate-100 transition-all duration-300 hover:border-slate-700/50">
      <div className="flex items-center gap-4">
        {/* Sleek Pilot Initials Avatar */}
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 font-black text-white text-base shadow-lg shadow-blue-500/20">
          {initials || "DP"}
        </div>
        <div>
          <h3 className="text-base font-extrabold text-white leading-tight">{profile.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{profile.email}</p>
          <p className="text-[10px] text-blue-400/80 font-mono mt-0.5">{profile.phone}</p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-900 space-y-3.5">
        <div>
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Vehicle Assigned</span>
          <p className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-2">
            🚗 {profile.vehicleInfo.color} {profile.vehicleInfo.make} {profile.vehicleInfo.model}
          </p>
        </div>

        <div>
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">License Plate</span>
          <span className="inline-block rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-1.5 font-mono text-xs font-black tracking-widest text-yellow-500 shadow-inner">
            {profile.vehicleInfo.plateNumber}
          </span>
        </div>
      </div>
    </section>
  );
}
