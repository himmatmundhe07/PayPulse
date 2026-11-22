"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowUpRight } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  status: string;
};

type Subscription = {
  id: string;
  customer: { _id: string; name: string; email: string };
  product: { _id: string; name: string; billingCycle: string };
  price: number;
  billingCycle: string;
  status: string;
};

export default function UpgradePlanDialog({
  subscription,
  products,
  open,
  onClose,
  onUpgrade,
}: {
  subscription: Subscription | null;
  products: Product[];
  open: boolean;
  onClose: () => void;
  onUpgrade: (subscriptionId: string, newProductId: string) => Promise<void>;
}) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  if (!subscription) return null;

  const activeProducts = products.filter((p) => p.status === "Active");
  const selectedProduct = activeProducts.find((p) => p.id === selectedProductId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subscription || !selectedProductId) return;

    setSubmitting(true);
    try {
      await onUpgrade(subscription.id, selectedProductId);
      onClose();
    } catch (err) {
      console.error("Upgrade plan error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ArrowUpRight className="h-5 w-5 text-blue-600" />
            Upgrade / Change Plan
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border bg-gray-50 p-3 text-sm">
            <p className="text-gray-500">Customer: <span className="font-semibold text-gray-900">{subscription.customer.name}</span></p>
            <p className="text-gray-500 mt-1">Current Plan: <span className="font-semibold text-gray-900">{subscription.product.name} (${subscription.price.toFixed(2)} / {subscription.billingCycle})</span></p>
          </div>

          <div>
            <Label>Select New Plan / Product</Label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="">-- Choose a new plan --</option>
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === subscription.product._id}>
                  {p.name} — ${p.price.toFixed(2)} ({p.billingCycle}) {p.id === subscription.product._id ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-sm">
              <p className="font-medium text-blue-900">New Plan Summary:</p>
              <div className="mt-1 flex justify-between text-blue-800">
                <span>{selectedProduct.name}</span>
                <span className="font-bold">${selectedProduct.price.toFixed(2)} / {selectedProduct.billingCycle}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedProductId || submitting}>
              {submitting ? "Updating Plan..." : "Confirm Plan Change"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

