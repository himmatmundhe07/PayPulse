"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import PaymentForm from "@/components/payments/PaymentForm";
import PaymentTable from "@/components/payments/PaymentTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Payment = {
  id: string;
  customer: { _id: string; name: string; email: string };
  invoice: { _id: string; invoiceNumber: string; total: number; status: string };
  amount: number;
  paymentMethod: string;
  status: "Successful" | "Failed" | "Pending";
  reference: string;
  notes: string;
  paidAt?: string;
  createdAt: string;
};

type Customer = { id: string; name: string; email: string };
type Invoice = {
  id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  customer: { _id: string; name: string };
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [paymentsRes, customersRes, invoicesRes] = await Promise.all([
          fetch("/api/payments"),
          fetch("/api/customers"),
          fetch("/api/invoices"),
        ]);

        const [paymentsData, customersData, invoicesData] = await Promise.all([
          paymentsRes.json(),
          customersRes.json(),
          invoicesRes.json(),
        ]);

        if (!paymentsRes.ok) throw new Error(paymentsData.message || "Failed to fetch payments");
        if (!customersRes.ok) throw new Error(customersData.message || "Failed to fetch customers");
        if (!invoicesRes.ok) throw new Error(invoicesData.message || "Failed to fetch invoices");

        const formattedPayments: Payment[] = paymentsData.data.map(
          (p: Payment & { _id: string }) => ({ ...p, id: p._id ?? p.id })
        );

        const formattedCustomers: Customer[] = customersData.data.map(
          (c: { _id: string; name: string; email: string }) => ({
            id: c._id,
            name: c.name,
            email: c.email,
          })
        );

        const formattedInvoices: Invoice[] = invoicesData.data.map(
          (inv: {
            _id: string;
            invoiceNumber: string;
            total: number;
            status: string;
            customer: { _id: string; name: string };
          }) => ({
            id: inv._id,
            invoiceNumber: inv.invoiceNumber,
            total: inv.total,
            status: inv.status,
            customer: inv.customer,
          })
        );

        setPayments(formattedPayments);
        setCustomers(formattedCustomers);
        setInvoices(formattedInvoices);
      } catch (err) {
        console.error(err);
        setError("Unable to load payments data.");
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  async function handleRecordPayment(data: {
    customerId: string;
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    status: string;
    reference: string;
    notes: string;
  }) {
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.message || "Failed to record payment.");
      throw new Error(result.message || "Failed to record payment.");
    }

    const newPayment: Payment = {
      ...result.data,
      id: result.data._id ?? result.data.id,
    };

    setPayments((prev) => [newPayment, ...prev]);
    toast.success("Payment recorded successfully!");
  }

  async function handleUpdateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update payment status");
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...result.data, id: result.data._id } : p))
      );
      toast.success(`Payment simulated as ${status}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update payment status";
      toast.error(msg);
    }
  }

  const filteredPayments = payments.filter((p) => {
    const term = search.toLowerCase();
    const matchesSearch =
      p.customer.name.toLowerCase().includes(term) ||
      p.invoice.invoiceNumber.toLowerCase().includes(term) ||
      p.paymentMethod.toLowerCase().includes(term) ||
      p.reference.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "All" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout title="Payments">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payments</h2>
          <p className="mt-1 text-sm text-gray-500">Track and manage payments</p>
        </div>

        <PaymentForm
          customers={customers}
          invoices={invoices}
          onAdd={handleRecordPayment}
        />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by customer, invoice, method or reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />

        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "All")}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Successful">Successful</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <p className="py-10 text-center text-gray-500">Loading payments...</p>
      ) : error ? (
        <p className="py-10 text-center text-red-500">{error}</p>
      ) : (
        <PaymentTable payments={filteredPayments} onUpdateStatus={handleUpdateStatus} />
      )}
    </DashboardLayout>
  );
}
