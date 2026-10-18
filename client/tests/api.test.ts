import { describe, it, expect } from "vitest";
import { getToken, getAuthHeaders } from "@/utils/api";

describe("api utils", () => {
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
});
