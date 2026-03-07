export const BACKEND = "http://localhost:8080";

/**
 * authFetch — fetch wrapper that automatically attaches the JWT Bearer token
 * stored in localStorage. Use for any API call to a protected endpoint.
 */
export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
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

  return fetch(url, { ...options, headers });
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
