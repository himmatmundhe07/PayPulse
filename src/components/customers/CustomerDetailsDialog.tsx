"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Mail, Phone, MapPin, Calendar, CreditCard, FileText, Wallet } from "lucide-react";

type Subscription = {
  _id: string;
  product: { name: string; price: number; billingCycle: string };
  price: number;
  billingCycle: string;
  status: "Active" | "Paused" | "Cancelled" | "Past Due";
  nextBillingDate: string;
  startDate: string;
};

type Invoice = {
  _id: string;
  invoiceNumber: string;
  total: number;
  status: "Draft" | "Pending" | "Paid" | "Overdue";
  invoiceDate: string;
  dueDate: string;
};

type Payment = {
  _id: string;
  amount: number;
  paymentMethod: string;
  status: "Successful" | "Failed" | "Pending";
  invoice?: { invoiceNumber: string };
  createdAt: string;
};

type CustomerData = {
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: "Active" | "Inactive";
    createdAt: string;
  };
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
};

export default function CustomerDetailsDialog({
  customerId,
  open,
  onClose,
}: {
  customerId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"subscriptions" | "invoices" | "payments">("subscriptions");

  useEffect(() => {
    if (!customerId || !open) return;

    let isMounted = true;
    async function fetchCustomerDetails() {
      setLoading(true);
      try {
        const res = await fetch(`/api/customers/${customerId}`);
        const result = await res.json();
        if (result.success && isMounted) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Failed to load customer details", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCustomerDetails();
    return () => {
      isMounted = false;
    };
  }, [customerId, open]);

  const customer = data?.customer;

  function statusColor(status: string) {
    switch (status) {
      case "Active":
      case "Paid":
      case "Successful":
        return "bg-green-100 text-green-700";
      case "Pending":
      case "Paused":
        return "bg-yellow-100 text-yellow-700";
      case "Cancelled":
      case "Failed":
      case "Overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <User className="h-5 w-5 text-blue-600" />
            Customer Profile & History
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">Loading customer history...</div>
        ) : customer ? (
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="rounded-xl border bg-gray-50/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                  <p className="text-xs text-gray-400">ID: {customer._id}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(customer.status)}`}>
                  {customer.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{customer.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b text-sm font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("subscriptions")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2 transition-colors ${
                  activeTab === "subscriptions"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Subscriptions ({data?.subscriptions.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("invoices")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2 transition-colors ${
                  activeTab === "invoices"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <FileText className="h-4 w-4" />
                Invoices ({data?.invoices.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("payments")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2 transition-colors ${
                  activeTab === "payments"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <Wallet className="h-4 w-4" />
                Payments ({data?.payments.length || 0})
              </button>
            </div>

            {/* Tab Contents */}
            <div>
              {activeTab === "subscriptions" && (
                <div className="rounded-lg border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan / Product</TableHead>
                        <TableHead>Cycle</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Next Billing</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.subscriptions && data.subscriptions.length > 0 ? (
                        data.subscriptions.map((sub) => (
                          <TableRow key={sub._id}>
                            <TableCell className="font-medium">{sub.product?.name || "Product"}</TableCell>
                            <TableCell>{sub.billingCycle}</TableCell>
                            <TableCell>${sub.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor(sub.status)}`}>
                                {sub.status}
                              </span>
                            </TableCell>
                            <TableCell>{new Date(sub.nextBillingDate).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="py-6 text-center text-gray-400">
                            No subscriptions found for this customer.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {activeTab === "invoices" && (
                <div className="rounded-lg border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.invoices && data.invoices.length > 0 ? (
                        data.invoices.map((inv) => (
                          <TableRow key={inv._id}>
                            <TableCell className="font-semibold text-blue-600">{inv.invoiceNumber}</TableCell>
                            <TableCell>{new Date(inv.invoiceDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">${inv.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor(inv.status)}`}>
                                {inv.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="py-6 text-center text-gray-400">
                            No invoices found for this customer.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {activeTab === "payments" && (
                <div className="rounded-lg border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.payments && data.payments.length > 0 ? (
                        data.payments.map((p) => (
                          <TableRow key={p._id}>
                            <TableCell className="font-medium">{p.invoice?.invoiceNumber || "—"}</TableCell>
                            <TableCell>{p.paymentMethod}</TableCell>
                            <TableCell className="font-medium">${p.amount.toFixed(2)}</TableCell>
                            <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor(p.status)}`}>
                                {p.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="py-6 text-center text-gray-400">
                            No payments found for this customer.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">Customer details not found.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

