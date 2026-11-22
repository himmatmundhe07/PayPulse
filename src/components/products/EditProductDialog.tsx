"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: "Monthly" | "Yearly" | "One-time";
  status: "Active" | "Inactive";
};

type Props = {
  product: Product | null;
  onClose: () => void;
  onUpdate: (product: Product) => Promise<void>;
};

function ProductEditForm({
  product,
  onClose,
  onUpdate,
}: {
  product: Product;
  onClose: () => void;
  onUpdate: (product: Product) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    billingCycle: product.billingCycle,
    status: product.status,
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onUpdate({
        ...product,
        ...formData,
      });
      onClose();
    } catch (error) {
      console.error("Product update failed:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div>
        <Label>Price ($)</Label>
        <Input
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label>Billing Cycle</Label>
        <select
          name="billingCycle"
          value={formData.billingCycle}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
          <option value="One-time">One-time</option>
        </select>
      </div>

      <div>
        <Label>Status</Label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Updating..." : "Update Product"}
      </Button>
    </form>
  );
}

export default function EditProductDialog({ product, onClose, onUpdate }: Props) {
  return (
    <Dialog
      open={!!product}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        {product && (
          <ProductEditForm
            key={product.id}
            product={product}
            onClose={onClose}
            onUpdate={onUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
