"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, AlertCircle } from "lucide-react";

type UpcomingRenewal = {
  _id: string;
  customer?: { name: string; email: string };
  product?: { name: string };
  price: number;
  billingCycle: string;
  nextBillingDate: string;
};

export default function UpcomingRenewalsDialog({
  open,
  onClose,
  renewals,
}: {
  open: boolean;
  onClose: () => void;
  renewals: UpcomingRenewal[];
}) {
  const totalUpcomingAmount = renewals.reduce((sum, r) => sum + (r.price || 0), 0);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Calendar className="h-5 w-5 text-blue-600" />
            Upcoming Renewals (Next 30 Days)
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg border bg-blue-50/50 p-3 text-sm">
          <div>
            <p className="text-gray-500">Total Projected Renewals</p>
            <p className="text-xl font-bold text-blue-700">${totalUpcomingAmount.toFixed(2)}</p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {renewals.length} {renewals.length === 1 ? "subscription" : "subscriptions"} due
          </span>
        </div>

        <div className="rounded-xl border bg-white mt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product / Plan</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Renewal Amount</TableHead>
                <TableHead>Renewal Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renewals.length > 0 ? (
                renewals.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-gray-900">{r.customer?.name || "Customer"}</p>
                        <p className="text-xs text-gray-400">{r.customer?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{r.product?.name || "Plan"}</TableCell>
                    <TableCell>{r.billingCycle}</TableCell>
                    <TableCell className="font-bold text-emerald-600">${r.price.toFixed(2)}</TableCell>
                    <TableCell>{new Date(r.nextBillingDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                    <AlertCircle className="mx-auto mb-2 h-6 w-6 text-gray-400" />
                    No renewals due within the next 30 days.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

