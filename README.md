# PayPulse – Billing & Subscription Management SaaS

![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**PayPulse** is a modern, full-stack Billing and Subscription Management SaaS application designed for freelancers, startups, and high-growth businesses. It centralizes customer profiles, product catalogs, recurring subscription lifecycles, multi-line invoices with branded PDF generation, and simulated payment tracking with executive financial analytics.

---

## 🚀 Key Features

### 1. Centralized Executive Dashboard & Analytics
- **Real-Time Financial Metrics**: Total Lifetime Revenue, Monthly Recurring Revenue (MRR), Active Subscriptions, Total Customers, Pending Invoices, Overdue Invoices, and Upcoming Renewals within 30 days.
- **Accurate MRR Engine**: Monthly subscriptions contribute their full amount; yearly subscriptions contribute `price / 12`; paused, past-due, and cancelled plans are automatically excluded.
- **Interactive Revenue Chart**: Monthly revenue trends visualized using responsive Recharts Area Charts over 12 months.
- **Upcoming Renewals Breakdown**: Interactive modal detailing upcoming subscription renewal dates, customer profiles, and projected renewal dollar amounts.
- **Recent Activity Streams**: Live tables of recent invoices and recorded payments.

### 2. Customer Management
- Complete CRUD operations (Create, Read, Update, Delete) with MongoDB persistence.
- **Customer Profile & History Modal**: Consolidated view displaying a selected customer's active/past subscriptions, generated invoices, and payment records.
- **Live Search & Filter**: Search by name, email, or phone number with status filtering (**All**, **Active**, **Inactive**).
- Form validation via React Hook Form and Zod schemas with duplicate email prevention.

### 3. Product & Pricing Catalog
- Manage products and services across **Monthly**, **Yearly**, and **One-time** billing cycles.
- Active/Inactive status toggling for enabling or disabling pricing tiers.
- Live search by product name and description.

### 4. Subscription Management & Lifecycle
- Create customer subscriptions linked to active catalog plans.
- Automated billing date computation (1 month for Monthly, 1 year for Yearly).
- **Status Lifecycle**: `Active`, `Paused`, `Cancelled`, `Past Due` with business rule enforcement (cancelled subscriptions cannot be reactivated).
- **Plan Upgrades & Downgrades**: Seamlessly switch a customer's active plan to a new product with live price previews and price snapshot preservation.
- **One-Click Invoice Creation**: Generate a pending invoice directly from an active subscription.
- Multi-status filtering dropdown.

### 5. Invoice Management & PDF Generation
- Multi-item line creation with dynamic description, quantity, and unit price.
- **Server-Side Financial Integrity**: Subtotal, percentage discounts, percentage tax, and final totals calculated on the server with client live previews.
- Sequential unique invoice numbering (`INV-0001`, `INV-0002`, ...).
- Status tracking: `Draft`, `Pending`, `Paid`, `Overdue`.
- **Dynamic PDF Generation**: Download branded, formatted PDF invoices generated on-the-fly via `pdf-lib`.

### 6. Simulated Payment Processing
- Record payments linked to customers and outstanding invoices.
- Supports multiple payment methods: **Bank Transfer**, **UPI**, **Cash**, **Cheque**, and **Card (Simulated)**.
- **Simulated Payment Status Transitions**: Action menu to simulate marking payments as `Successful`, `Failed`, or retrying.
- **Automated Invoice Status Synchronization**: Marking a payment as `Successful` automatically marks the invoice as `Paid`; reverting a payment restores the invoice to `Pending`.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org) (App Router with Turbopack) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) & [Base UI](https://base-ui.com) (Vega theme) |
| **Database & ODM** | [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose 9](https://mongoosejs.com) |
| **Charts** | [Recharts](https://recharts.org) |
| **Validation** | [React Hook Form](https://react-hook-form.com) & [Zod](https://zod.dev) |
| **PDF Generation** | [pdf-lib](https://pdf-lib.js.org) |
| **Icons & Notifications** | [Lucide React](https://lucide.dev) & [Sonner](https://sonner.emilkowal.ski) |

---

## 📁 Folder Structure

```
billing/
├── public/                     # Static assets & favicons
├── src/
│   ├── app/                    # Next.js App Router (Pages & API endpoints)
│   │   ├── api/
│   │   │   ├── customers/      # Customer CRUD & [id] profile history
│   │   │   ├── dashboard/      # Executive analytics & renewals API
│   │   │   ├── invoices/       # Invoice CRUD & [id]/pdf endpoint
│   │   │   ├── payments/       # Payment records & [id] simulation API
│   │   │   ├── products/       # Product catalog CRUD
│   │   │   └── subscriptions/  # Subscriptions, [id] upgrades & invoice generator
│   │   ├── customers/          # Customer management page
│   │   ├── dashboard/          # Executive dashboard page
│   │   ├── invoices/           # Invoices page
│   │   ├── payments/           # Payments page
│   │   ├── products/           # Products page
│   │   ├── subscriptions/      # Subscriptions page
│   │   ├── globals.css         # Global styling
│   │   ├── layout.tsx          # Root layout & Toaster provider
│   │   └── page.tsx            # Entry redirect to /dashboard
│   ├── components/
│   │   ├── customers/          # Customer forms, table, edit & details dialogs
│   │   ├── dashboard/          # Stat cards, revenue chart, renewal dialogs
│   │   ├── invoice/            # Invoice creator & invoices table
│   │   ├── layout/             # Header, Sidebar, DashboardLayout
│   │   ├── payments/           # Payment recorder & payments table
│   │   ├── products/           # Product form, table, edit dialog
│   │   ├── subscriptions/      # Subscription form, table, upgrade dialog
│   │   └── ui/                 # Base UI / Shadcn accessible primitives
│   ├── lib/
│   │   ├── mongodb.ts          # Cached Mongoose connection helper
│   │   └── utils.ts            # ClassName merging utilities
│   └── models/                 # Mongoose schemas
│       ├── Customer.ts
│       ├── Invoice.ts
│       ├── Payment.ts
│       ├── Product.ts
│       └── Subscription.ts
├── .env.example                # Example environment variables
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/billing_saas?retryWrites=true&w=majority
```

> **Note**: `.env.local` is listed in `.gitignore` and should never be committed to source control.

---

## 💻 Getting Started Locally

### 1. Clone the repository:
```bash
git clone https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
cd billing
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Configure environment:
Copy `.env.example` to `.env.local` and add your MongoDB Atlas connection string:
```bash
cp .env.example .env.local
```

### 4. Start the development server:
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** (or `http://localhost:3001` if port 3000 is occupied). The app will automatically redirect to `/dashboard`.

---

## 🧪 Testing & Code Quality

Run TypeScript type-checking:
```bash
npx tsc --noEmit
```

Run ESLint:
```bash
npm run lint
```

Build for production:
```bash
npm run build
```

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your PayPulse repository.
4. In **Environment Variables**, set:
   - Key: `MONGODB_URI`
   - Value: Your MongoDB Atlas connection string.
5. In MongoDB Atlas, ensure **Network Access** allows `0.0.0.0/0` (or Vercel's IP ranges).
6. Click **Deploy**. Vercel will build and provision serverless functions for all API endpoints.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
