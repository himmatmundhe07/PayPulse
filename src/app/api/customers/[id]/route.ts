import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Subscription from "@/models/Subscription";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import mongoose from "mongoose";

type props = {
    params: Promise<{id: string}>
}

export async function GET(
    _req: Request,
    {params}: props
){
    try {
        const {id} = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid customer ID" }, { status: 400 });
        }

        await connectDB();

        const [customer, subscriptions, invoices, payments] = await Promise.all([
            Customer.findById(id),
            Subscription.find({ customer: id }).populate('product', 'name price billingCycle').sort({ createdAt: -1 }),
            Invoice.find({ customer: id }).sort({ createdAt: -1 }),
            Payment.find({ customer: id }).populate('invoice', 'invoiceNumber').sort({ createdAt: -1 })
        ]);

        if (!customer) {
            return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                customer,
                subscriptions,
                invoices,
                payments
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Fetch customer details error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch customer details" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    {params}: props
){
    try{
        const {id} = await params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return NextResponse.json(
                {success: false,
                    message: "Invalid customer ID"
                },
                {status: 400}
            )
        }

        await connectDB();

        const body = await req.json();

        const customer = await Customer.findByIdAndUpdate(
            id,
            {
                name: body.name,
                email: body.email,
                phone: body.phone,
                address: body.address
            },
            {
                new: true,
                runValidators: true
            }
        );

        if(!customer){
            return NextResponse.json(
                {
                    success: false,
                    message: "Customer not found"
                },
                {status: 404}
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: "Customer update successfully",
                data: customer
            },
            {status: 200}
        )
    }
    catch(error){
        console.error("Customer update error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update customer"
            },
            {status: 500}
        )
    }
}


export async function DELETE(
    req: Request,
    {params}: props
){
    try{
        const {id} = await params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid customer Id",
                },
                {status: 400}
            )
        }

        await connectDB();

        const customer = await Customer.findByIdAndDelete(id);

        if(!customer){
            return NextResponse.json(
                {
                    success: false,
                    message: "customer not found"
                },
                {status: 404}
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: "Customer deleted successfully"
            },
            {status: 200}
        )
    }
    catch(error){
        console.error("Customer deletion error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete customer"
            },
            {status: 500}
        )
    }
}
