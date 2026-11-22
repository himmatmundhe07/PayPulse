"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import ProductForm from "@/components/products/ProductForm";
import ProductTable from "@/components/products/ProductTable";
import EditProductDialog from "@/components/products/EditProductDialog";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: "Monthly" | "Yearly" | "One-time";
  status: "Active" | "Inactive";
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Failed to fetch products");
        }

        const formattedProducts = result.data.map((product: {
          _id: string;
          name: string;
          description: string;
          price: number;
          billingCycle: "Monthly" | "Yearly" | "One-time";
          status: "Active" | "Inactive";
        }) => ({
          ...product,
          id: product._id,
        }));

        setProducts(formattedProducts);
      } catch (err) {
        console.error(err);
        setError("Unable to load products");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  async function handleAddProduct(data: {
    name: string;
    description: string;
    price: number;
    billingCycle: "Monthly" | "Yearly" | "One-time";
    status: "Active" | "Inactive";
  }) {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.message || "Failed to create product");
      throw new Error(result.message || "Failed to create product");
    }

    const newProduct = {
      ...result.data,
      id: result.data._id,
    };

    setProducts((prev) => [...prev, newProduct]);
    toast.success("Product added successfully");
  }

  async function handleDeleteProduct(id: string) {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted successfully");
    } catch (err) {
      console.error("Product deletion failed:", err);
      toast.error("Failed to delete product. Please try again.");
    }
  }

  async function handleEditProduct(updatedProduct: Product) {
    const res = await fetch(`/api/products/${updatedProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.message || "Failed to update product");
      throw new Error(result.message || "Failed to update product");
    }

    const updatedData = {
      ...result.data,
      id: result.data._id,
    };

    setProducts((prev) =>
      prev.map((p) => (p.id === updatedData.id ? updatedData : p))
    );
    toast.success("Product updated successfully");
  }

  const filteredProducts = products.filter((product) => {
    const searchTerm = search.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <DashboardLayout title="Products">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalog
          </p>
        </div>

        <ProductForm onAdd={handleAddProduct} />
      </div>

      <div className="mb-4 relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="py-10 text-center text-gray-500">Loading products...</p>
      ) : error ? (
        <p className="py-10 text-center text-red-500">{error}</p>
      ) : (
        <ProductTable
          products={filteredProducts}
          onDelete={handleDeleteProduct}
          onEdit={setSelectedProduct}
        />
      )}

      <EditProductDialog
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onUpdate={handleEditProduct}
      />
    </DashboardLayout>
  );
}
