import { RideStatus } from "@cab/shared";

const styles: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  ACCEPTED: "bg-cyan-100 text-cyan-800",
  ARRIVING: "bg-blue-100 text-blue-800",
  STARTED: "bg-violet-100 text-violet-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-slate-200 text-slate-700"
};

export function RideStatusBadge({ status }: { status: RideStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span>;
}
