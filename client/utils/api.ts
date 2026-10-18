interface ApiOptions extends RequestInit {
  token?: string;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

function mergeHeaders(init?: HeadersInit): Record<string, string> {
  if (!init) return {};
  if (init instanceof Headers) {
    const result: Record<string, string> = {};
    init.forEach((value, key) => { result[key] = value; });
    return result;
  }
  if (Array.isArray(init)) return Object.fromEntries(init);
  return { ...init };
}

export async function api<T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<
  | { error: true; message: string; errors?: Record<string, string[]> }
  | { error: false; data: T }
> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const url = `${baseUrl.replace(/\/$/, "")}/api/v1/${endpoint.replace(/^\//, "")}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...mergeHeaders(options.headers),
  };

  // Content-Type solo con body JSON: FormData lleva su propio boundary
  // y un GET con Content-Type fuerza un preflight CORS innecesario
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });

    const body = await res.json();

    if (!res.ok) {
      return {
        error: true,
        message: body.message || "Error en la solicitud",
        errors: body.errors,
      };
    }

    return { error: false, data: (body.data ?? body) as T };
  } catch {
    return { error: true, message: "Error de conexión" };
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nexuscore_token");
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
