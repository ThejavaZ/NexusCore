import { describe, it, expect, vi, afterEach } from "vitest";
import { getToken, getAuthHeaders, api } from "@/utils/api";

describe("api utils", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getToken devuelve null sin localStorage", () => {
    // jsdom doesn't have localStorage by default in some setups
    localStorage.removeItem("nexuscore_token");
    expect(getToken()).toBeNull();
  });

  it("getToken devuelve el token guardado", () => {
    localStorage.setItem("nexuscore_token", "abc123");
    expect(getToken()).toBe("abc123");
    localStorage.removeItem("nexuscore_token");
  });

  it("getAuthHeaders devuelve vacío sin token", () => {
    localStorage.removeItem("nexuscore_token");
    expect(getAuthHeaders()).toEqual({});
  });

  it("getAuthHeaders incluye Bearer token", () => {
    localStorage.setItem("nexuscore_token", "abc123");
    expect(getAuthHeaders()).toEqual({ Authorization: "Bearer abc123" });
    localStorage.removeItem("nexuscore_token");
  });

  it("api conserva los headers de autorización del llamador", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await api("users", { headers: { Authorization: "Bearer tok-123" } });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok-123");
  });

  it("api no fuerza Content-Type en GET sin body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await api("products");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBeUndefined();
  });

  it("api envía Content-Type JSON cuando hay body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await api("auth/login", { method: "POST", body: JSON.stringify({}) });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
  });
});
