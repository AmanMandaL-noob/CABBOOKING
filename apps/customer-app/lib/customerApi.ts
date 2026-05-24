import { ApiResponse, AuthUser, Coordinates, RideDto } from "@cab/shared";

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

export const customerApi = {
  register: (payload: { name: string; email: string; password: string }) =>
    request<AuthUser>("/api/auth/customer/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<AuthUser>("/api/auth/customer/login", { method: "POST", body: JSON.stringify(payload) }),
  bookRide: (token: string, payload: { pickup: Coordinates; destination: Coordinates }) =>
    request<RideDto>("/api/rides/book", { method: "POST", body: JSON.stringify(payload) }, token),
  getRide: (token: string, rideId: string) => request<RideDto>(`/api/rides/${rideId}`, {}, token),
  completeRideWithOtp: (token: string, rideId: string, otp: string) =>
    request<RideDto>(`/api/rides/${rideId}/complete-by-customer`, { method: "POST", body: JSON.stringify({ otp }) }, token),
  cancelRideWithOtp: (token: string, rideId: string, otp: string) =>
    request<RideDto>(`/api/rides/${rideId}/cancel-by-customer`, { method: "POST", body: JSON.stringify({ otp }) }, token)
};
