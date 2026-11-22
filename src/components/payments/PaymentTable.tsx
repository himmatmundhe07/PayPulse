"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

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

export default function PaymentTable({
  payments,
  onUpdateStatus,
}: {
  payments: Payment[];
  onUpdateStatus?: (id: string, status: string) => void;
}) {
  function statusClass(status: Payment["status"]) {
    switch (status) {
      case "Successful":
        return "bg-green-100 text-green-700";
      case "Failed":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
    }
  }

  return (
    <div className="rounded-xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Invoice #</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {payments.length > 0 ? (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  <div>{payment.customer.name}</div>
                  <div className="text-xs text-gray-500">{payment.customer.email}</div>
                </TableCell>
                <TableCell>{payment.invoice.invoiceNumber}</TableCell>
                <TableCell>${payment.amount.toFixed(2)}</TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(payment.status)}`}
                  >
                    {payment.status}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(payment.paidAt ?? payment.createdAt).toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell className="text-gray-500">
                  {payment.reference || "—"}
                </TableCell>
                <TableCell>
                  {onUpdateStatus && (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {payment.status === "Pending" && (
                          <>
                            <DropdownMenuItem onClick={() => onUpdateStatus(payment.id, "Successful")} className="text-green-600">
                              Simulate: Mark Successful
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(payment.id, "Failed")} className="text-red-600">
                              Simulate: Mark Failed
                            </DropdownMenuItem>
                          </>
                        )}
                        {payment.status === "Failed" && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(payment.id, "Successful")} className="text-green-600">
                            Retry: Mark Successful
                          </DropdownMenuItem>
                        )}
                        {payment.status === "Successful" && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(payment.id, "Pending")}>
                            Revert: Mark Pending
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                No payments found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
