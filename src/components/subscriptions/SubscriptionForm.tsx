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
import { Plus } from "lucide-react";
import { useState } from "react";

type Customer = { id: string; name: string; email: string };
type Product = {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  status: string;
};

type SubscriptionFormProps = {
  customers: Customer[];
  products: Product[];
  onAdd: (data: {
    customerId: string;
    productId: string;
    startDate: string;
  }) => Promise<void>;
};

const subscriptionSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  productId: z.string().min(1, "Please select a product"),
  startDate: z.string().min(1, "Please select a start date"),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

export default function SubscriptionForm({
  customers,
  products,
  onAdd,
}: SubscriptionFormProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      customerId: "",
      productId: "",
      startDate: "",
    },
  });

  const selectedProductId = watch("productId");
  const activeProducts = products.filter((p) => p.status === "Active");
  const selectedProduct = activeProducts.find(
    (p) => p.id === selectedProductId
  );

  async function onSubmit(data: SubscriptionFormValues) {
    try {
      await onAdd(data);
      reset();
      setOpen(false);
    } catch (error) {
      console.error("Subscription creation failed:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <Plus size={16} />
          Add Subscription
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subscription</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Customer</Label>
            <select
              {...register("customerId")}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-sm text-red-500">
                {errors.customerId.message}
              </p>
            )}
          </div>

          <div>
            <Label>Product</Label>
            <select
              {...register("productId")}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a product</option>
              {activeProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — ${product.price.toFixed(2)} /{" "}
                  {product.billingCycle}
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="mt-1 text-sm text-red-500">
                {errors.productId.message}
              </p>
            )}
            {selectedProduct && (
              <p className="mt-1 text-sm text-muted-foreground">
                Price: ${selectedProduct.price.toFixed(2)} /{" "}
                {selectedProduct.billingCycle}
              </p>
            )}
          </div>

          <div>
            <Label>Start Date</Label>
            <Input type="date" {...register("startDate")} className="mt-1" />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Create Subscription
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
