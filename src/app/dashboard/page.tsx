"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentInvoices from "@/components/dashboard/RecentInvoices";
import UpcomingRenewalsDialog from "@/components/dashboard/UpcomingRenewalsDialog";
import { useEffect, useState } from "react";
import { Users, CreditCard, FileText, TrendingUp, AlertCircle, Calendar } from "lucide-react";

type DashboardData = {
  totalRevenue: number;
  mrr: number;
  activeSubscriptions: number;
  totalCustomers: number;
  pendingInvoices: number;
  overdueInvoices: number;
  upcomingRenewals: number;
  upcomingRenewalsList?: Array<{
    _id: string;
    customer?: { name: string; email: string };
    product?: { name: string };
    price: number;
    billingCycle: string;
    nextBillingDate: string;
  }>;
  recentInvoices: Array<{
    _id: string;
    invoiceNumber: string;
    customer: { name: string };
    total: number;
    dueDate: string;
    status: string;
  }>;
  recentPayments: Array<{
    _id: string;
    customer: { name: string };
    invoice: { invoiceNumber: string };
    amount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
  }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRenewalsDialog, setShowRenewalsDialog] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <DashboardLayout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Overview</h2>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s what&apos;s happening with your business.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-white p-5 shadow-sm animate-pulse">
              <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-7 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-32 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Total Revenue"
              value={fmt(data.totalRevenue)}
              description="Lifetime paid invoices"
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title="Monthly Recurring Revenue"
              value={fmt(data.mrr)}
              description="From active subscriptions"
              icon={CreditCard}
              color="green"
            />
            <StatCard
              title="Active Subscriptions"
              value={data.activeSubscriptions.toString()}
              description="Currently active"
              icon={CreditCard}
              color="purple"
            />
            <StatCard
              title="Total Customers"
              value={data.totalCustomers.toString()}
              description="All registered customers"
              icon={Users}
              color="orange"
            />
            <StatCard
              title="Pending Invoices"
              value={data.pendingInvoices.toString()}
              description={`${data.overdueInvoices} overdue invoices`}
              icon={FileText}
              color="yellow"
            />
            <StatCard
              title="Upcoming Renewals"
              value={data.upcomingRenewals.toString()}
              description="Within next 30 days (Click to view)"
              icon={Calendar}
              color="red"
              onClick={() => setShowRenewalsDialog(true)}
            />
          </div>

          <div className="mt-6">
            <RevenueChart data={data.monthlyRevenue} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentInvoices invoices={data.recentInvoices} />
            <RecentPayments payments={data.recentPayments} />
          </div>

          <UpcomingRenewalsDialog
            open={showRenewalsDialog}
            onClose={() => setShowRenewalsDialog(false)}
            renewals={data.upcomingRenewalsList || []}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">Failed to load dashboard data. Please refresh.</p>
        </div>
      )}
    </DashboardLayout>
  );
}

function RecentPayments({
  payments,
}: {
  payments: DashboardData["recentPayments"];
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Recent Payments</h2>
        <p className="text-sm text-gray-500">Latest payment activity</p>
      </div>
      {payments.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No payments yet</p>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p._id} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{p.customer?.name}</p>
                <p className="text-xs text-gray-500">{p.invoice?.invoiceNumber} · {p.paymentMethod}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">${Number(p.amount).toFixed(2)}</p>
                <span
                  className={`text-xs rounded-full px-2 py-0.5 ${
                    p.status === "Successful"
                      ? "bg-green-100 text-green-700"
                      : p.status === "Failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
