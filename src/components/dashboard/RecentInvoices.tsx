import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type RecentInvoice = {
  _id: string;
  invoiceNumber: string;
  customer: { name: string };
  total: number;
  dueDate: string;
  status: string;
};

type Props = { invoices: RecentInvoice[] };

const statusColors: Record<string, string> = {
  Draft:   "bg-gray-100 text-gray-600",
  Pending: "bg-yellow-100 text-yellow-700",
  Paid:    "bg-green-100 text-green-700",
  Overdue: "bg-red-100 text-red-700",
};

export default function RecentInvoices({ invoices }: Props) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Recent Invoices</h2>
        <p className="text-sm text-gray-500">Latest billing activity</p>
      </div>
      {invoices.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No invoices yet</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                <TableCell>{item.customer?.name}</TableCell>
                <TableCell>${Number(item.total).toFixed(2)}</TableCell>
                <TableCell>{new Date(item.dueDate).toLocaleDateString("en-IN")}</TableCell>
                <TableCell>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[item.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {item.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
