import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Subscription from '@/models/Subscription';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Run all queries in parallel for performance
    const [
      totalCustomers,
      activeSubscriptions,
      pendingInvoicesCount,
      overdueInvoicesCount,
      upcomingRenewals,
      activeSubscriptionsForMRR,
      paidInvoicesTotal,
      upcomingRenewalsList,
      recentInvoices,
      recentPayments,
      monthlyRevenueRaw,
    ] = await Promise.all([
      Customer.countDocuments(),
      Subscription.countDocuments({ status: 'Active' }),
      Invoice.countDocuments({ status: 'Pending' }),
      Invoice.countDocuments({ status: 'Overdue' }),
      Subscription.countDocuments({
        status: 'Active',
        nextBillingDate: { $gte: now, $lte: thirtyDaysFromNow },
      }),
      Subscription.find({ status: 'Active' }).select('price billingCycle'),
      Payment.aggregate([
        { $match: { status: 'Successful' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Subscription.find({
        status: 'Active',
        nextBillingDate: { $gte: now, $lte: thirtyDaysFromNow },
      })
        .populate('customer', 'name email')
        .populate('product', 'name')
        .sort({ nextBillingDate: 1 })
        .limit(10)
        .select('customer product price billingCycle nextBillingDate'),
      Invoice.find()
        .populate('customer', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('invoiceNumber customer total dueDate status'),
      Payment.find()
        .populate('customer', 'name')
        .populate('invoice', 'invoiceNumber')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('customer invoice amount paymentMethod status createdAt'),
      // Monthly revenue for the past 12 months (from paid payments)
      Payment.aggregate([
        { $match: { status: 'Successful' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    // MRR calculation
    let mrr = 0;
    for (const sub of activeSubscriptionsForMRR) {
      if (sub.billingCycle === 'Monthly') {
        mrr += sub.price;
      } else if (sub.billingCycle === 'Yearly') {
        mrr += sub.price / 12;
      }
      // One-time subscriptions don't contribute to MRR
    }

    const totalRevenue = paidInvoicesTotal[0]?.total ?? 0;

    // Format monthly revenue for chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = monthlyRevenueRaw.map((m: { _id: { year: number; month: number }; revenue: number }) => ({
      month: monthNames[m._id.month - 1],
      revenue: m.revenue,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        mrr: Math.round(mrr * 100) / 100,
        activeSubscriptions,
        totalCustomers,
        pendingInvoices: pendingInvoicesCount,
        overdueInvoices: overdueInvoicesCount,
        upcomingRenewals,
        upcomingRenewalsList,
        recentInvoices,
        recentPayments,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

