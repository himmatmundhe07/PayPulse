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

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: "Active" | "Inactive";
};

type Props = {
  customer: Customer | null;
  onClose: () => void;
  onUpdate: (customer: Customer) => Promise<void>;
};

function CustomerEditForm({
  customer,
  onClose,
  onUpdate,
}: {
  customer: Customer;
  onClose: () => void;
  onUpdate: (customer: Customer) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onUpdate({
        ...customer,
        ...formData,
      });
      onClose();
    } catch (error) {
      console.error("Customer update failed:", error);
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
        <Label>Email</Label>
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label>Phone</Label>
        <Input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label>Billing Address</Label>
        <Input
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Updating..." : "Update Customer"}
      </Button>
    </form>
  );
}

export default function EditCustomerDialog({
  customer,
  onClose,
  onUpdate,
}: Props) {
  return (
    <Dialog
      open={!!customer}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>

        {customer && (
          <CustomerEditForm
            key={customer.id}
            customer={customer}
            onClose={onClose}
            onUpdate={onUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
