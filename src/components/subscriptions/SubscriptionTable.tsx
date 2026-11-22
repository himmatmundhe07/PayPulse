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

type Subscription = {
  id: string;
  customer: { _id: string; name: string; email: string };
  product: { _id: string; name: string; billingCycle: string };
  status: "Active" | "Paused" | "Cancelled" | "Past Due";
  startDate: string;
  nextBillingDate: string;
  price: number;
  billingCycle: "Monthly" | "Yearly" | "One-time";
};

type SubscriptionTableProps = {
  subscriptions: Subscription[];
  onUpdateStatus: (id: string, status: string) => void;
  onOpenUpgrade?: (sub: Subscription) => void;
  onGenerateInvoice?: (id: string) => void;
};

function statusBadgeClass(status: Subscription["status"]) {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700";
    case "Paused":
      return "bg-yellow-100 text-yellow-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    case "Past Due":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN");
}

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

function StatusActions({
  subscription,
  onUpdateStatus,
  onOpenUpgrade,
  onGenerateInvoice,
}: {
  subscription: Subscription;
  onUpdateStatus: (id: string, status: string) => void;
  onOpenUpgrade?: (sub: Subscription) => void;
  onGenerateInvoice?: (id: string) => void;
}) {
  const { status, id } = subscription;

  if (status === "Cancelled") {
    return (
      <span className="rounded-full px-2 py-1 text-xs bg-red-100 text-red-700">
        Cancelled
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon">
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onOpenUpgrade && (
          <DropdownMenuItem onClick={() => onOpenUpgrade(subscription)}>
            Change / Upgrade Plan
          </DropdownMenuItem>
        )}
        {onGenerateInvoice && status === "Active" && (
          <DropdownMenuItem onClick={() => onGenerateInvoice(id)}>
            Generate Invoice
          </DropdownMenuItem>
        )}
        {status === "Active" && (
          <>
            <DropdownMenuItem onClick={() => onUpdateStatus(id, "Paused")}>
              Pause
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUpdateStatus(id, "Cancelled")}
              className="text-red-600 focus:text-red-600"
            >
              Cancel
            </DropdownMenuItem>
          </>
        )}
        {status === "Paused" && (
          <>
            <DropdownMenuItem onClick={() => onUpdateStatus(id, "Active")}>
              Resume
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUpdateStatus(id, "Cancelled")}
              className="text-red-600 focus:text-red-600"
            >
              Cancel
            </DropdownMenuItem>
          </>
        )}
        {status === "Past Due" && (
          <>
            <DropdownMenuItem onClick={() => onUpdateStatus(id, "Active")}>
              Mark Active
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onUpdateStatus(id, "Cancelled")}
              className="text-red-600 focus:text-red-600"
            >
              Cancel
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function SubscriptionTable({
  subscriptions,
  onUpdateStatus,
  onOpenUpgrade,
  onGenerateInvoice,
}: SubscriptionTableProps) {
  return (
    <div className="rounded-xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Billing Cycle</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Next Billing</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {subscriptions.length > 0 ? (
            subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{sub.customer.name}</p>
                    <p className="text-xs text-gray-500">{sub.customer.email}</p>
                  </div>
                </TableCell>
                <TableCell>{sub.product.name}</TableCell>
                <TableCell>{sub.billingCycle}</TableCell>
                <TableCell>{formatPrice(sub.price)}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${statusBadgeClass(sub.status)}`}
                  >
                    {sub.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(sub.startDate)}</TableCell>
                <TableCell>{formatDate(sub.nextBillingDate)}</TableCell>
                <TableCell>
                  <StatusActions
                    subscription={sub}
                    onUpdateStatus={onUpdateStatus}
                    onOpenUpgrade={onOpenUpgrade}
                    onGenerateInvoice={onGenerateInvoice}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-32 text-center text-gray-500"
              >
                No subscriptions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
