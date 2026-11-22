"use client";

import { CreditCard, FileText, LayoutDashboard, Package, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard",      href: "/dashboard",     icon: LayoutDashboard },
  { name: "Customers",      href: "/customers",     icon: Users },
  { name: "Products",       href: "/products",      icon: Package },
  { name: "Subscriptions",  href: "/subscriptions", icon: CreditCard },
  { name: "Invoices",       href: "/invoices",      icon: FileText },
  { name: "Payments",       href: "/payments",      icon: Wallet },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white p-5 sticky top-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-600">PayPulse</h1>
        <p className="text-sm text-gray-500">Billing & Subscription</p>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t">
        <p className="text-xs text-gray-400 text-center">PayPulse v1.0.0</p>
      </div>
    </aside>
  );
}
