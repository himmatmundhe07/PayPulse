"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be a positive number"),
  billingCycle: z.enum(["Monthly", "Yearly", "One-time"]),
  status: z.enum(["Active", "Inactive"]),
});

type ProductFormValues = z.input<typeof productSchema>;

type ProductFormProps = {
  onAdd: (data: {
    name: string;
    description: string;
    price: number;
    billingCycle: "Monthly" | "Yearly" | "One-time";
    status: "Active" | "Inactive";
  }) => Promise<void>;
};

export default function ProductForm({ onAdd }: ProductFormProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: "Active",
      billingCycle: "Monthly",
    },
  });

  async function onSubmit(data: ProductFormValues) {
    try {
      await onAdd({
        name: data.name,
        description: data.description ?? "",
        price: Number(data.price),
        billingCycle: data.billingCycle,
        status: data.status,
      });
      reset();
      setOpen(false);
    } catch (error) {
      console.error("Product creation failed:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <Plus size={16} />
          Add Product
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input {...register("name")} placeholder="Product name" />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              {...register("description")}
              placeholder="Product description (optional)"
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label>Price</Label>
            <Input
              {...register("price")}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>

          <div>
            <Label>Billing Cycle</Label>
            <select
              {...register("billingCycle")}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
              <option value="One-time">One-time</option>
            </select>
            {errors.billingCycle && (
              <p className="text-sm text-red-500">
                {errors.billingCycle.message}
              </p>
            )}
          </div>

          <div>
            <Label>Status</Label>
            <select
              {...register("status")}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Save Product
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
