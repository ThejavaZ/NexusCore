import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/store/useAuthStore";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("inicia sin usuario ni token", () => {
    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it("setAuth guarda user y token", () => {
    const mockUser = {
      id: 1,
      name: "Admin",
      email: "admin@nexuscore.dev",
      role: "admin" as const,
      is_active: true,
    };

    useAuthStore.getState().setAuth(mockUser, "test-token-123");

    const { user, token } = useAuthStore.getState();
    expect(user?.name).toBe("Admin");
    expect(user?.role).toBe("admin");
    expect(token).toBe("test-token-123");
  });

  it("logout limpia user y token", () => {
    useAuthStore.getState().setAuth(
      { id: 1, name: "Test", email: "t@t.com", role: "customer", is_active: true },
      "token",
    );
    useAuthStore.getState().logout();

    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it("isAdmin devuelve true solo para admin", () => {
    useAuthStore.getState().setAuth(
      { id: 1, name: "A", email: "a@a.com", role: "admin", is_active: true },
      "t",
    );
    expect(useAuthStore.getState().isAdmin()).toBe(true);

    useAuthStore.getState().setAuth(
      { id: 2, name: "S", email: "s@s.com", role: "staff", is_active: true },
      "t",
    );
    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });

  it("isStaff devuelve true para admin y staff", () => {
    useAuthStore.getState().setAuth(
      { id: 1, name: "A", email: "a@a.com", role: "admin", is_active: true },
      "t",
    );
    expect(useAuthStore.getState().isStaff()).toBe(true);

    useAuthStore.getState().setAuth(
      { id: 2, name: "S", email: "s@s.com", role: "staff", is_active: true },
      "t",
    );
    expect(useAuthStore.getState().isStaff()).toBe(true);

    useAuthStore.getState().setAuth(
      { id: 3, name: "C", email: "c@c.com", role: "customer", is_active: true },
      "t",
    );
    expect(useAuthStore.getState().isStaff()).toBe(false);
  });
});
