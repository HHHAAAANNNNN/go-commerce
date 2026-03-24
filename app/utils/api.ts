import { mockFetch } from "./mockFetch";

/** True when NEXT_PUBLIC_DEMO_MODE=true (Vercel demo deployment, no backend needed) */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/**
 * Backend base URL.
 * In DEMO_MODE this is deliberately "" so that:
 *   - Image paths:  "" + "/assets/products/..." → "/assets/..." served from Next.js public/
 *   - API paths:    "" + "/api/products"        → "/api/products" handled by mockFetch
 */
let backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
if (backendUrl.endsWith("/api")) {
  backendUrl = backendUrl.slice(0, -4);
}
export const BACKEND = DEMO_MODE ? "" : backendUrl;

/**
 * authFetch — fetch wrapper that automatically attaches the JWT Bearer token
 * stored in localStorage. Use for any API call to a protected endpoint.
 *
 * In DEMO_MODE all requests are intercepted by mockFetch — no real HTTP calls are made.
 */
export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // ── Demo mode: return mock response without touching the network ──────────
  if (DEMO_MODE) {
    return mockFetch(url, options);
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type for non-FormData bodies (FormData sets its own boundary)
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers }).then((res) => {
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return res;
  });
}

/**
 * publicFetch — like authFetch but for public (unauthenticated) endpoints.
 * In DEMO_MODE routes through mockFetch; otherwise plain fetch.
 */
export function publicFetch(url: string, options: RequestInit = {}): Promise<Response> {
  if (DEMO_MODE) return mockFetch(url, options);
  return fetch(url, options);
}

/** Retrieve the current user from localStorage, or null if not logged in */
export function getStoredUser<T = { id: number; role: string }>(): T | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Returns true if the stored user has role === 'admin' */
export function isAdmin(): boolean {
  const user = getStoredUser<{ role?: string }>();
  return user?.role === "admin";
}

/** Returns true if the stored user has role === 'customer' */
export function isCustomer(): boolean {
  const user = getStoredUser<{ role?: string }>();
  return user?.role === "customer";
}
