"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import InvoiceTable from "@/components/invoice/InvoiceTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  customer: { _id: string; name: string; email: string };
  lineItems: LineItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  status: "Draft" | "Pending" | "Paid" | "Overdue";
  invoiceDate: string;
  dueDate: string;
  notes: string;
};

type Customer = { id: string; name: string; email: string };

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    async function fetchData() {
      try {
        const [invoicesRes, customersRes] = await Promise.all([
          fetch("/api/invoices"),
          fetch("/api/customers"),
        ]);

        const invoicesResult = await invoicesRes.json();
        const customersResult = await customersRes.json();

        if (!invoicesRes.ok) {
          throw new Error(invoicesResult.message || "Failed to fetch invoices");
        }
        if (!customersRes.ok) {
          throw new Error(
            customersResult.message || "Failed to fetch customers"
          );
        }

        const formattedInvoices = invoicesResult.data.map(
          (invoice: Invoice & { _id: string }) => ({
            ...invoice,
            id: invoice._id ?? invoice.id,
          })
        );

        const formattedCustomers = customersResult.data.map(
          (customer: Customer & { _id: string }) => ({
            ...customer,
            id: customer._id ?? customer.id,
          })
        );

        setInvoices(formattedInvoices);
        setCustomers(formattedCustomers);
      } catch (err) {
        console.error(err);
        setError("Unable to load invoices");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  async function handleCreateInvoice(data: {
    customerId: string;
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    discountPercent: number;
    taxPercent: number;
    invoiceDate: string;
    dueDate: string;
    status: string;
    notes: string;
  }) {
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Failed to create invoice");
    }

    const newInvoice = {
      ...result.data,
      id: result.data._id ?? result.data.id,
    };

    setInvoices((prev) => [...prev, newInvoice]);
    toast.success("Invoice created successfully");
  }

  async function handleUpdateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to update status");
      }

      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === id
            ? { ...inv, status: status as Invoice["status"] }
            : inv
        )
      );
      toast.success(`Invoice marked as ${status}`);
    } catch (err) {
      console.error("Status update failed:", err);
      toast.error("Failed to update invoice status");
    }
  }

  async function handleDeleteInvoice(id: string) {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to delete invoice");
      }

      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      toast.success("Invoice deleted");
    } catch (err) {
      console.error("Invoice deletion failed:", err);
      toast.error("Failed to delete invoice");
    }
  }

  function handleDownloadPDF(id: string) {
    window.open(`/api/invoices/${id}/pdf`, "_blank");
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
      invoice.customer.name.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "All" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout title="Invoices">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoices</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage invoices and billing
          </p>
        </div>

        <InvoiceForm customers={customers} onAdd={handleCreateInvoice} />
      </div>

      <div className="mb-4 flex items-center gap-3">
        <Input
          placeholder="Search by invoice # or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "All")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="py-10 text-center text-gray-500">Loading invoices...</p>
      ) : error ? (
        <p className="py-10 text-center text-red-500">{error}</p>
      ) : (
        <InvoiceTable
          invoices={filteredInvoices}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteInvoice}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </DashboardLayout>
  );
}
