"use client"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import { Trash2, Pencil, Eye } from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

type Customer = {
    id: string,
    name: string,
    email: string,
    phone: string,
    address: string,
    status: "Active" | "Inactive"
}

// const customers = [
//   {
//     id: "CUS-001",
//     name: "Acme Inc.",
//     email: "contact@acme.com",
//     phone: "+91 234 567 890",
//     status: "Active",
//   },
//   {
//     id: "CUS-002",
//     name: "Tech Solutions",
//     email: "hello@techsolutions.com",
//     phone: "+91 345 678 901",
//     status: "Active",
//   },
//   {
//     id: "CUS-003",
//     name: "Cloud Systems",
//     email: "info@cloudsystems.com",
//     phone: "+91 456 789 012",
//     status: "Inactive",
//   },
// ];


export default function CustomerTable({customers, onDelete, onEdit, onView}: {
    customers: Customer[];
    onDelete: (id: string) => void;
    onEdit: (customer: Customer) => void;
    onView?: (customer: Customer) => void;
}) {
    const [deleteId, setDeleteId] = useState<string | null>(null)
    return(
        <div className='rounded-xl border bg-white'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {customers.length > 0 ? (
                     customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell>{customer.id}</TableCell>
                            <TableCell className="font-medium">
                                {customer.name}
                            </TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell>
                                <span
                                    className={`rounded-full px-2 py-1 text-xs ${
                                        customer.status === "Active"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {customer.status}
                                </span>
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-1">
                                    {onView && (
                                        <Button variant="ghost" size="icon" title="View History & Details" onClick={() => onView(customer)}>
                                            <Eye size={16} className="text-blue-600" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" title="Edit Customer" onClick={() => onEdit(customer)}>
                                        <Pencil size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" title="Delete Customer" onClick={() => setDeleteId(customer.id)} >
                                        <Trash2 size={16} className='text-red-500' />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))) :(
                        <TableRow>
                            <TableCell colSpan={6} className='h-32 text-center text-gray-500'>
                                No customers found
                            </TableCell>
                        </TableRow>
                )}
                </TableBody>
            </Table>

            <AlertDialog open={deleteId !== null} onOpenChange={(open) => {
                if(!open) setDeleteId(null);
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolute sure? 
                        </AlertDialogTitle>
                        
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this customer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction onClick={() => {
                            if (deleteId){
                                onDelete(deleteId);
                                setDeleteId(null);
                            }
                        }} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}