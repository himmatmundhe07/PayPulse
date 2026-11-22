"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SubscriptionForm from "@/components/subscriptions/SubscriptionForm";
import SubscriptionTable from "@/components/subscriptions/SubscriptionTable";
import UpgradePlanDialog from "@/components/subscriptions/UpgradePlanDialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Subscription = {
  id: string;
  customer: { _id: string; name: string; email: string };
  product: { _id: string; name: string; billingCycle: string };
  status: "Active" | "Paused" | "Cancelled" | "Past Due";
  startDate: string;
  nextBillingDate: string;
  price: number;
  billingCycle: "Monthly" | "Yearly" | "One-time";
};

type Customer = { id: string; name: string; email: string };
type Product = {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  status: string;
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [upgradeSub, setUpgradeSub] = useState<Subscription | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [subRes, custRes, prodRes] = await Promise.all([
          fetch("/api/subscriptions"),
          fetch("/api/customers"),
          fetch("/api/products"),
        ]);

        const [subData, custData, prodData] = await Promise.all([
          subRes.json(),
          custRes.json(),
          prodRes.json(),
        ]);

        if (!subRes.ok) {
          throw new Error(subData.message || "Failed to fetch subscriptions");
        }
        if (!custRes.ok) {
          throw new Error(custData.message || "Failed to fetch customers");
        }
        if (!prodRes.ok) {
          throw new Error(prodData.message || "Failed to fetch products");
        }

        const formattedSubs = subData.data.map(
          (sub: Subscription & { _id: string }) => ({
            ...sub,
            id: sub._id,
          })
        );

        const formattedCustomers = custData.data.map(
          (c: Customer & { _id: string }) => ({
            ...c,
            id: c._id,
          })
        );

        const formattedProducts = prodData.data.map(
          (p: Product & { _id: string }) => ({
            ...p,
            id: p._id,
          })
        );

        setSubscriptions(formattedSubs);
        setCustomers(formattedCustomers);
        setProducts(formattedProducts);
      } catch (err) {
        console.error(err);
        setError("Unable to load subscriptions");
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  async function handleCreateSubscription(data: {
    customerId: string;
    productId: string;
    startDate: string;
  }) {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to create subscription");
    const newSub = { ...result.data, id: result.data._id };
    setSubscriptions((prev) => [newSub, ...prev]);
    toast.success("Subscription created successfully");
  }

  async function handleUpdateStatus(id: string, status: string) {
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const result = await res.json();
    if (!res.ok) {
      toast.error(result.message || "Failed to update");
      return;
    }
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...result.data, id: result.data._id } : s
      )
    );
    toast.success(`Subscription ${status.toLowerCase()}`);
  }

  async function handleUpgradePlan(id: string, productId: string) {
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const result = await res.json();
    if (!res.ok) {
      toast.error(result.message || "Failed to update plan");
      return;
    }
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...result.data, id: result.data._id } : s
      )
    );
    toast.success("Subscription plan updated successfully");
  }

  async function handleGenerateInvoice(id: string) {
    try {
      const res = await fetch(`/api/subscriptions/${id}/invoice`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to generate invoice");
      toast.success(`Invoice ${result.data.invoiceNumber} created for subscription`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate invoice";
      toast.error(msg);
    }
  }

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      sub.customer.name.toLowerCase().includes(searchTerm) ||
      sub.product.name.toLowerCase().includes(searchTerm) ||
      sub.status.toLowerCase().includes(searchTerm);
    const matchesStatus = statusFilter === "All" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout title="Subscriptions">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscriptions</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer subscriptions
          </p>
        </div>

        <SubscriptionForm
          customers={customers}
          products={products}
          onAdd={handleCreateSubscription}
        />
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <Input
          placeholder="Search by customer or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-xs outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Past Due">Past Due</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-gray-500">
          Loading subscriptions...
        </p>
      ) : error ? (
        <p className="py-10 text-center text-red-500">{error}</p>
      ) : (
        <SubscriptionTable
          subscriptions={filteredSubscriptions}
          onUpdateStatus={handleUpdateStatus}
          onOpenUpgrade={setUpgradeSub}
          onGenerateInvoice={handleGenerateInvoice}
        />
      )}

      <UpgradePlanDialog
        subscription={upgradeSub}
        products={products}
        open={upgradeSub !== null}
        onClose={() => setUpgradeSub(null)}
        onUpgrade={handleUpgradePlan}
      />
    </DashboardLayout>
  );
}
