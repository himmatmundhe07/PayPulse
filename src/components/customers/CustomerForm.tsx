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
import { toast } from "sonner";


const customerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
   email: z.string().email("Please enter a valid email"),
   phone: z.string().min(10, "Phone must contain at least 10 digits"),
   address: z.string().min(5, "Address is required") 
})

type CustomerFormValues = z.infer<typeof customerSchema >;

type CustomerFormProps = {
  onAdd: (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }) => Promise<void>;
};


export default function CustomerForm({onAdd} : CustomerFormProps) {
    const [open, setOpen] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
        reset,
    } = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema)
    })

    async function onSubmit(data: CustomerFormValues){
        try{
            await onAdd(data);

            reset();
            setOpen(false);
        }
        catch(error: unknown){
            const message = error instanceof Error ? error.message : "Failed to create customer";
            toast.error(message);
        }
    }

    return(
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger>
                <Button>
                    <Plus size={16} />
                    Add Customer
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Name</Label>
                        <Input {...register("name")} placeholder="Customer name" />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <Label>Email</Label>
                        <Input {...register("email")} placeholder="customer@xyz.com" />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <Label>Phone</Label>
                        <Input {...register("phone")} placeholder="Phone number" />
                        {errors.phone && (
                            <p className="text-sm text-red-500">{errors.phone.message}</p>
                        )}
                    </div>

                    <div>
                        <Label>Billing Address</Label>
                        <Input {...register("address")} placeholder="Billing address" />
                        {errors.address && (
                            <p className="text-sm text-red-500">{errors.address.message}</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Customer"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
