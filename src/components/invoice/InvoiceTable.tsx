"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

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

type InvoiceTableProps = {
  invoices: Invoice[];
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onDownloadPDF: (id: string) => void;
};

function StatusBadge({ status }: { status: Invoice["status"] }) {
  const styles: Record<Invoice["status"], string> = {
    Draft: "bg-gray-100 text-gray-600",
    Pending: "bg-yellow-100 text-yellow-700",
    Paid: "bg-green-100 text-green-700",
    Overdue: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function InvoiceTable({
  invoices,
  onUpdateStatus,
  onDelete,
  onDownloadPDF,
}: InvoiceTableProps) {
  return (
    <div className="rounded-xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{invoice.customer.name}</p>
                    <p className="text-xs text-gray-500">
                      {invoice.customer.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell>
                  {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell className="font-medium">
                  ${invoice.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onDownloadPDF(invoice.id)}
                      >
                        Download PDF
                      </DropdownMenuItem>

                      {invoice.status === "Draft" && (
                        <DropdownMenuItem
                          onClick={() =>
                            onUpdateStatus(invoice.id, "Pending")
                          }
                        >
                          Mark as Pending
                        </DropdownMenuItem>
                      )}

                      {(invoice.status === "Pending" ||
                        invoice.status === "Overdue") && (
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(invoice.id, "Paid")}
                        >
                          Mark as Paid
                        </DropdownMenuItem>
                      )}

                      {invoice.status === "Pending" && (
                        <DropdownMenuItem
                          onClick={() =>
                            onUpdateStatus(invoice.id, "Overdue")
                          }
                        >
                          Mark as Overdue
                        </DropdownMenuItem>
                      )}

                      {invoice.status === "Draft" && (
                        <DropdownMenuItem
                          onClick={() => onDelete(invoice.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-32 text-center text-gray-500"
              >
                No invoices found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
