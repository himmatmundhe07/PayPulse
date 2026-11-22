"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard } from "lucide-react";

type Customer = { id: string; name: string; email: string };
type Invoice = {
  id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  customer: { _id: string; name: string };
};

type PaymentFormProps = {
  customers: Customer[];
  invoices: Invoice[];
  onAdd: (data: {
    customerId: string;
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    status: string;
    reference: string;
    notes: string;
  }) => Promise<void>;
};

export default function PaymentForm({ customers, invoices, onAdd }: PaymentFormProps) {
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("Successful");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.customer._id === customerId &&
      (inv.status === "Pending" || inv.status === "Overdue")
  );

  function handleCustomerChange(value: string | null) {
    const val = value || "";
    setCustomerId(val);
    setInvoiceId("");
    setAmount("");
  }

  function handleInvoiceChange(value: string | null) {
    const val = value || "";
    setInvoiceId(val);
    const selectedInvoice = invoices.find((inv) => inv.id === val);
    if (selectedInvoice) {
      setAmount(selectedInvoice.total.toFixed(2));
    }
  }

  function resetForm() {
    setCustomerId("");
    setInvoiceId("");
    setAmount("");
    setPaymentMethod("");
    setStatus("Successful");
    setReference("");
    setNotes("");
    setValidationError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError("");

    if (!customerId) {
      setValidationError("Please select a customer.");
      return;
    }
    if (!invoiceId) {
      setValidationError("Please select an invoice.");
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setValidationError("Please enter a valid amount.");
      return;
    }
    if (!paymentMethod) {
      setValidationError("Please select a payment method.");
      return;
    }

    setSubmitting(true);
    try {
      await onAdd({
        customerId,
        invoiceId,
        amount: parseFloat(amount),
        paymentMethod,
        status,
        reference,
        notes,
      });
      resetForm();
      setOpen(false);
    } catch {
      setValidationError("Failed to record payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger>
        <Button>
          <CreditCard size={16} />
          Record Payment
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer */}
          <div>
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={handleCustomerChange}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Invoice */}
          <div>
            <Label>Invoice</Label>
            <Select
              value={invoiceId}
              onValueChange={handleInvoiceChange}
              disabled={!customerId}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue
                  placeholder={
                    customerId
                      ? filteredInvoices.length === 0
                        ? "No pending invoices"
                        : "Select invoice"
                      : "Select a customer first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredInvoices.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — ${inv.total.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div>
            <Label>Amount ($)</Label>
            <Input
              className="mt-1"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Payment Method */}
          <div>
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val || "")}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Card (Simulated)">Card (Simulated)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(val) => setStatus(val || "Successful")}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Successful">Successful</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reference */}
          <div>
            <Label>Reference (optional)</Label>
            <Input
              className="mt-1"
              placeholder="e.g. transaction ID"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              className="mt-1"
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Disclaimer */}
          <p className="rounded-md bg-yellow-50 px-3 py-2 text-xs text-yellow-700 border border-yellow-200">
            Note: This is a simulated payment for demonstration purposes.
          </p>

          {validationError && (
            <p className="text-sm text-red-500">{validationError}</p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Recording..." : "Record Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
