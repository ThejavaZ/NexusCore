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

  it("addToCart agrega producto con cantidad 1 por defecto", () => {
    useCartStore.getState().addToCart(product);

    const { cart, count } = useCartStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
    expect(count).toBe(1);
  });

  it("addToCart suma cantidad cuando el producto ya está", () => {
    useCartStore.getState().addToCart(product, 2);
    useCartStore.getState().addToCart(product, 2);

    const { cart, count } = useCartStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(4);
    expect(count).toBe(4);
  });

  it("addToCart limita la cantidad al stock", () => {
    useCartStore.getState().addToCart(product, 4);
    useCartStore.getState().addToCart(product, 3);

    const { cart, count } = useCartStore.getState();
    expect(cart[0].quantity).toBe(5); // stock máximo
    expect(count).toBe(5);
  });

  it("updateQuantity cambia cantidad respetando stock", () => {
    useCartStore.getState().addToCart(product);

    useCartStore.getState().updateQuantity(1, 3);
    expect(useCartStore.getState().cart[0].quantity).toBe(3);

    useCartStore.getState().updateQuantity(1, 99);
    expect(useCartStore.getState().cart[0].quantity).toBe(5); // tope = stock
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

  it("count refleja unidades totales", () => {
    useCartStore.getState().addToCart(product, 3);
    useCartStore.getState().addToCart({ ...product, id: 2, stock: 10 }, 2);

    expect(useCartStore.getState().count).toBe(5);
  });

  it("clearCart vacía el carrito", () => {
    useCartStore.getState().addToCart(product, 2);
    useCartStore.getState().addToCart({ ...product, id: 2 });

    useCartStore.getState().clearCart();

    const { cart, count } = useCartStore.getState();
    expect(cart).toHaveLength(0);
    expect(count).toBe(0);
  });
});
