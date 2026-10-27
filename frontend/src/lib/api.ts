import { Product, ProductListResponse } from "@/types/product";

const API_BASE = "/api/v1";

export async function fetchProducts(search?: string, category?: string): Promise<ProductListResponse> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category && category !== "all") params.append("category", category);

  const res = await fetch(`${API_BASE}/products?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.statusText}`);
  }
  return res.json();
}

export async function createProduct(payload: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to create product: ${res.statusText}`);
  }
  return res.json();
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to update product: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete product: ${res.statusText}`);
  }
}

export async function uploadAttachment(
  productId: string,
  file: File,
  fileType: string = "invoice"
): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("file_type", fileType);

  const res = await fetch(`${API_BASE}/products/${productId}/attachments`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed: ${errorText || res.statusText}`);
  }
  return res.json();
}

export async function deleteAttachment(productId: string, attachmentId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${productId}/attachments/${attachmentId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete attachment: ${res.statusText}`);
  }
}

export async function checkBackendHealth(): Promise<{ status: string; app: string; version: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

