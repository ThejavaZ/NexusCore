"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, PackageSearch, Layers, ImageUp, X } from "lucide-react";
import { api, getAuthHeaders, type Paginated } from "@/utils/api";
import { resolveImageUrl } from "@/utils/image";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Button, DataTable, Modal, Input, Select, Badge, TableSkeleton,
} from "@/components/ui";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
  price: string;
  cost: string;
  image_url: string | null;
  is_active: boolean;
  category: { id: number; name: string } | null;
}

interface Category {
  id: number;
  name: string;
}

const emptyForm = {
  name: "", sku: "", category_id: "", stock: "0", min_stock: "1",
  price: "", cost: "", description: "",
};

export default function DashboardProductsPage() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [stockModal, setStockModal] = useState<Product | null>(null);
  const [stockQty, setStockQty] = useState("");
  const [stockReason, setStockReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const headers = getAuthHeaders();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    const timer = setTimeout(() => {
      api<Paginated<Product>>(`admin/products?${params}`, { headers }).then((res) => {
        if (cancelled) return;
        if (!res.error) {
          setProducts(res.data.data);
          setLastPage(res.data.last_page);
          setTotal(res.data.total);
        }
        setLoading(false);
      });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [token, search, page, refreshKey]);

  const changeSearch = (value: string) => {
    setPage(1);
    setSearch(value);
  };

  useEffect(() => {
    if (!token) return;
    api<Category[]>("admin/categories", { headers: getAuthHeaders() }).then((r) => {
      if (!r.error) setCategories(r.data);
    });
  }, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, sku: p.sku, category_id: String(p.category?.id ?? ""),
      stock: String(p.stock), min_stock: String(p.min_stock),
      price: p.price, cost: p.cost, description: "",
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const headers = getAuthHeaders();
    const body = {
      ...form,
      category_id: form.category_id ? Number(form.category_id) : undefined,
      stock: Number(form.stock),
      min_stock: Number(form.min_stock),
      price: Number(form.price),
      cost: Number(form.cost),
    };

    const res = editing
      ? await api(`admin/products/${editing.id}`, { method: "PUT", headers, body: JSON.stringify(body) })
      : await api("admin/products", { method: "POST", headers, body: JSON.stringify(body) });

    setSaving(false);
    if (res.error) {
      setError(res.message);
      return;
    }
    toast.success(editing ? "Producto actualizado" : "Producto creado");
    setModalOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`¿Desactivar "${p.name}"?`)) return;
    const res = await api(`admin/products/${p.id}`, { method: "DELETE", headers: getAuthHeaders() });
    if (res.error) {
      toast.error(res.message);
      return;
    }
    toast.success("Producto desactivado");
    setRefreshKey((k) => k + 1);
  };

  const handleAdjustStock = async () => {
    if (!stockModal || !stockQty || Number(stockQty) === 0 || !stockReason) return;
    setAdjusting(true);
    const res = await api(`admin/products/${stockModal.id}/adjust-stock`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity: Number(stockQty), reason: stockReason }),
    });
    setAdjusting(false);
    if (res.error) {
      toast.error(res.message);
      return;
    }
    toast.success("Stock ajustado");
    setStockModal(null);
    setStockQty("");
    setStockReason("");
    setRefreshKey((k) => k + 1);
  };

  const handleUploadImage = async (file: File) => {
    if (!editing) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no puede superar 2 MB");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    const res = await api<Product>(`admin/products/${editing.id}/image`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });
    setUploading(false);
    if (res.error) {
      toast.error(res.message);
      return;
    }
    setEditing({ ...editing, image_url: res.data.image_url });
    toast.success("Imagen subida");
    setRefreshKey((k) => k + 1);
  };

  const handleRemoveImage = async () => {
    if (!editing) return;
    setUploading(true);
    const res = await api(`admin/products/${editing.id}/image`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    setUploading(false);
    if (res.error) {
      toast.error(res.message);
      return;
    }
    setEditing({ ...editing, image_url: null });
    toast.success("Imagen eliminada");
    setRefreshKey((k) => k + 1);
  };

  if (!token) return null;

  const lowStock = products.filter((p) => p.stock <= p.min_stock).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Productos</h1>
          <p className="text-slate-500">{total} en catálogo · {lowStock} con stock bajo en esta página</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Nuevo producto</Button>
      </div>

      <div className="relative max-w-sm">
        <PackageSearch size={16} className="absolute left-3 top-3 text-slate-400" />
        <input
          value={search}
          onChange={(e) => changeSearch(e.target.value)}
          placeholder="Buscar por nombre o SKU..."
          className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
        <DataTable
          data={products}
          emptyMessage="No se encontraron productos"
          pagination={{ page, lastPage, total, onPageChange: setPage }}
          columns={[
            { key: "name", header: "Producto", render: (r) => (
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{r.name}</p>
                <p className="text-xs text-slate-400">{r.sku}</p>
              </div>
            )},
            { key: "category", header: "Categoría", render: (r) => r.category?.name || "—" },
            { key: "price", header: "Precio", render: (r) => `$${parseFloat(r.price).toLocaleString()}` },
            { key: "stock", header: "Stock", render: (r) => {
              const low = r.stock <= r.min_stock;
              return <Badge color={r.stock === 0 ? "red" : low ? "yellow" : "green"}>{r.stock}</Badge>;
            }},
            { key: "is_active", header: "Estado", render: (r) => (
              <Badge color={r.is_active ? "green" : "slate"}>{r.is_active ? "Activo" : "Inactivo"}</Badge>
            )},
            { key: "actions", header: "", render: (r) => (
              <div className="flex gap-1">
                <button
                  onClick={() => { setStockModal(r); setStockQty(""); setStockReason(""); }}
                  title="Ajustar stock"
                  className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  <Layers size={15} />
                </button>
                <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(r)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={15} /></button>
              </div>
            )},
          ]}
        />
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar producto" : "Nuevo producto"}>
        <div className="space-y-4">
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl">{error}</div>}
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
          <Select
            label="Categoría"
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            options={[{ value: "", label: "Seleccionar..." }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Precio" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <Input label="Costo" type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {!editing && (
              <Input label="Stock inicial" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            )}
            <Input label="Stock mínimo" type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} />
          </div>

          {/* Imagen (solo al editar: el producto debe existir primero) */}
          {editing && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Imagen</p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                  {resolveImageUrl(editing.image_url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveImageUrl(editing.image_url)!} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageUp size={24} className="text-slate-400" />
                  )}
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadImage(file);
                      e.target.value = "";
                    }}
                  />
                  <Button size="sm" variant="secondary" loading={uploading} onClick={() => fileInputRef.current?.click()}>
                    <ImageUp size={14} /> {editing.image_url ? "Cambiar imagen" : "Subir imagen"}
                  </Button>
                  {editing.image_url && (
                    <Button size="sm" variant="ghost" loading={uploading} onClick={handleRemoveImage}>
                      <X size={14} /> Quitar imagen
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">JPG, PNG, WebP o AVIF · máximo 2 MB</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>{editing ? "Guardar" : "Crear"}</Button>
          </div>
        </div>
      </Modal>

      {/* Stock adjust modal */}
      <Modal open={!!stockModal} onClose={() => setStockModal(null)} title={`Ajustar stock — ${stockModal?.name}`}>
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm">
            Stock actual: <span className="font-black">{stockModal?.stock}</span> unidades
            <span className="text-slate-400 ml-2">(mínimo {stockModal?.min_stock})</span>
          </div>
          <Input
            label="Cantidad (positiva = entrada, negativa = salida)"
            type="number"
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
            placeholder="ej. 10 o -5"
            required
          />
          <Input
            label="Motivo"
            value={stockReason}
            onChange={(e) => setStockReason(e.target.value)}
            placeholder="ej. Conteo físico, daño, reposición..."
            required
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setStockModal(null)}>Cancelar</Button>
            <Button
              className="flex-1"
              loading={adjusting}
              disabled={!stockQty || Number(stockQty) === 0 || !stockReason}
              onClick={handleAdjustStock}
            >
              Ajustar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
