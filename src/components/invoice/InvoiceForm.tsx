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
import { Plus, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type Customer = { id: string; name: string; email: string };

type LineItemRow = {
  description: string;
  quantity: number;
  unitPrice: number;
};

type InvoiceFormProps = {
  customers: Customer[];
  onAdd: (data: {
    customerId: string;
    lineItems: Array<{ description: string; quantity: number; unitPrice: number }>;
    discountPercent: number;
    taxPercent: number;
    invoiceDate: string;
    dueDate: string;
    status: string;
    notes: string;
  }) => Promise<void>;
};

const today = new Date().toISOString().split("T")[0];

function emptyLineItem(): LineItemRow {
  return { description: "", quantity: 1, unitPrice: 0 };
}

export default function InvoiceForm({ customers, onAdd }: InvoiceFormProps) {
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Draft");
  const [notes, setNotes] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [lineItems, setLineItems] = useState<LineItemRow[]>([emptyLineItem()]);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxPercent) / 100;
  const total = taxableAmount + taxAmount;

  function updateLineItem(index: number, field: keyof LineItemRow, value: string | number) {
    setLineItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, emptyLineItem()]);
  }

  function removeLineItem(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setCustomerId("");
    setInvoiceDate(today);
    setDueDate("");
    setStatus("Draft");
    setNotes("");
    setDiscountPercent(0);
    setTaxPercent(0);
    setLineItems([emptyLineItem()]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!customerId) {
      alert("Please select a customer.");
      return;
    }
    if (!dueDate) {
      alert("Please select a due date.");
      return;
    }
    for (const item of lineItems) {
      if (!item.description.trim()) {
        alert("All line items must have a description.");
        return;
      }
      if (item.quantity < 1) {
        alert("Quantity must be at least 1.");
        return;
      }
      if (item.unitPrice < 0) {
        alert("Unit price cannot be negative.");
        return;
      }
    }

    const payload = {
      customerId,
      lineItems: lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      discountPercent,
      taxPercent,
      invoiceDate,
      dueDate,
      status,
      notes,
    };

    try {
      setSubmitting(true);
      await onAdd(payload);
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Invoice creation failed:", error);
      alert("Failed to create invoice. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <Plus size={16} />
          Create Invoice
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer */}
          <div>
            <Label>Customer</Label>
            <Select value={customerId} onValueChange={(val) => setCustomerId(val || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} — {c.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Invoice Date</Label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(val) => setStatus(val || "Draft")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Line Items
            </h3>

            <div className="space-y-3">
              {lineItems.map((item, index) => {
                const rowTotal = item.quantity * item.unitPrice;
                return (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_80px_100px_80px_32px] items-center gap-2"
                  >
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(index, "description", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateLineItem(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <span className="text-right text-sm font-medium text-gray-700">
                      ${rowTotal.toFixed(2)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={addLineItem}
            >
              <Plus size={14} />
              Add Line Item
            </Button>
          </div>

          <Separator />

          {/* Discount & Tax */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Discount (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={discountPercent}
                onChange={(e) =>
                  setDiscountPercent(parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <Label>Tax (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={taxPercent}
                onChange={(e) =>
                  setTaxPercent(parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-gray-50 p-4 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Discount ({discountPercent}%)</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax ({taxPercent}%)</span>
              <span>+${taxAmount.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-gray-800 pt-1">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Additional notes or payment instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating..." : "Create Invoice"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
