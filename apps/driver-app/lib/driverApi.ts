import { ApiResponse, AuthUser, DriverProfileDto, RideDto } from "@cab/shared";

const getApiUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `http://${hostname}:5000`;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
};

const API_URL = getApiUrl();

async function request<T>(path: string, options: RequestInit = {}, token?: string, retries = 1): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch (error: any) {
    if (retries > 0) return request<T>(path, options, token, retries - 1);
    throw new Error(`Backend is not reachable at ${API_URL}${path}. Details: ${error?.message || error}`);
  }

  const json = (await response.json()) as ApiResponse<T>;
  if (!response.ok) throw new Error(json.message ?? "Request failed");
  return json.data;
}

export const driverApi = {
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    vehicleInfo: { make: string; model: string; plateNumber: string; color?: string };
  }) => request<AuthUser>("/api/auth/driver/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: { phone: string; password: string }) =>
    request<AuthUser>("/api/auth/driver/login", { method: "POST", body: JSON.stringify(payload) }),
  online: (token: string, payload?: { lat?: number; lng?: number }) =>
    request<{ isOnline: boolean }>("/api/driver/online", { method: "POST", body: JSON.stringify(payload ?? {}) }, token),
  offline: (token: string) => request<{ isOnline: boolean }>("/api/driver/offline", { method: "POST" }, token),
  acceptRide: (token: string, rideId: string) => request<RideDto>(`/api/rides/${rideId}/accept`, { method: "POST" }, token),
  arrive: (token: string, rideId: string) => request<RideDto>(`/api/rides/${rideId}/arrive`, { method: "POST" }, token),
  rejectRide: (token: string, rideId: string) => request<{ rideId: string }>(`/api/rides/${rideId}/reject`, { method: "POST" }, token),
  startTrip: (token: string, rideId: string, otp: string) =>
    request<RideDto>(`/api/rides/${rideId}/start`, { method: "POST", body: JSON.stringify({ otp }) }, token),
  completeTrip: (token: string, rideId: string) => request<RideDto>(`/api/rides/${rideId}/complete`, { method: "POST" }, token),
  profile: (token: string) => request<DriverProfileDto>("/api/driver/profile", {}, token),
  history: (token: string) => request<RideDto[]>("/api/driver/history", {}, token),
  updateLocation: (token: string, payload: { lat: number; lng: number; rideId?: string }) =>
    request("/api/tracking/location", { method: "POST", body: JSON.stringify(payload) }, token)
};
