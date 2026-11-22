import {NextResponse} from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function POST(req:Request) {

    try{
        await connectDB();

        const body = await req.json();

        // Validate required fields
        if (!body.name || !body.email || !body.phone || !body.address) {
            return NextResponse.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            );
        }

        // Check for duplicate email
        const existing = await Customer.findOne({ email: body.email.toLowerCase().trim() });
        if (existing) {
            return NextResponse.json(
                { success: false, message: "A customer with this email already exists" },
                { status: 409 }
            );
        }

        const customer = await Customer.create({
            name: body.name,
            email: body.email,
            phone: body.phone,
            address: body.address
        });

        return NextResponse.json(
            {
                success: true,
                message: "Customer created successfully",
                data: customer
            },
            {status: 201}
        )
    }
    catch(error){
        console.error("Customer creation error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create customer"
            },
            { status: 500 }
        )
    }

}


export async function GET(){
    try{
        await connectDB();

        const customers = await Customer.find().sort({
            createdAt: -1
        });

        return NextResponse.json(
            {
                success: true,
                data: customers
            },
            { status: 200 }
        )
    }
    catch(error){
        console.error("Fetching customer error: ", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch customers"
            },
            { status: 500 }
        )
    }
}

