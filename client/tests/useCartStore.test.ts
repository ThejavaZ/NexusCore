import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/store/useCartStore";

const product = {
  id: 1,
  name: "RTX 5090",
  price: "30000",
  stock: 5,
  image_url: null,
};

describe("useCartStore", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it("inicia vacío", () => {
    const { cart, count } = useCartStore.getState();
    expect(cart).toHaveLength(0);
    expect(count).toBe(0);
  });

  it("addToCart agrega producto y actualiza count", () => {
    useCartStore.getState().addToCart(product);

    const { cart, count } = useCartStore.getState();
    expect(cart).toHaveLength(1);
    expect(count).toBe(1);
    expect(cart[0].name).toBe("RTX 5090");
  });

  it("removeFromCart elimina por id", () => {
    useCartStore.getState().addToCart(product);
    useCartStore.getState().addToCart({ ...product, id: 2, name: "RX 7900" });

    useCartStore.getState().removeFromCart(1);

    const { cart, count } = useCartStore.getState();
    expect(cart).toHaveLength(1);
    expect(count).toBe(1);
    expect(cart[0].id).toBe(2);
  });

  it("clearCart vacía el carrito", () => {
    useCartStore.getState().addToCart(product);
    useCartStore.getState().addToCart({ ...product, id: 2 });

    useCartStore.getState().clearCart();

    const { cart, count } = useCartStore.getState();
    expect(cart).toHaveLength(0);
    expect(count).toBe(0);
  });
});
