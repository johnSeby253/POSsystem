import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  IndianRupee,
  Package,
  PackageCheck,
  RefreshCw,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  TriangleAlert,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { useDashboardQuery } from "../Apis/query";
import { useAuthStore } from "../store/authStore";

// Change the import path above to match your project structure.

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

const number = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value ?? 0));

const shortCurrency = (value) => {
  const amount = Number(value ?? 0);

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }

  return `₹${amount.toFixed(0)}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const titleCase = (value) =>
  String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

function SectionHeading({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>

      {action}
    </div>
  );
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "orange",
  trend,
}) {
  const colors = {
    orange: "bg-orange-50 text-orange-600 ring-orange-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
    green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    red: "bg-red-50 text-red-600 ring-red-100",
  };

  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${colors[color]}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-4 flex min-h-5 items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{subtitle}</p>

        {trend !== undefined && trend !== null && (
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              Number(trend) >= 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {Number(trend) >= 0 ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}
            {Math.abs(Number(trend))}%
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-center">
      <div className="rounded-full bg-slate-100 p-3">
        <Package size={21} className="text-slate-400" />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

function SalesChart({ data }) {
  const maxRevenue = Math.max(
    ...data.map((item) => Number(item.revenue ?? 0)),
    1,
  );

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Sales in the last 7 days</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {currency(
              data.reduce((sum, item) => sum + Number(item.revenue ?? 0), 0),
            )}
          </p>
        </div>

        <div className="rounded-lg bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
          <CalendarDays size={14} className="mr-1 inline" />
          Last 7 days
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState message="No sales chart data available." />
      ) : (
        <>
          <div className="flex h-48 gap-3">
            <div className="flex flex-col justify-between pb-7 text-right text-[10px] text-slate-400">
              <span>{shortCurrency(maxRevenue)}</span>
              <span>{shortCurrency(maxRevenue / 2)}</span>
              <span>₹0</span>
            </div>

            <div className="relative min-w-0 flex-1">
              <div className="pointer-events-none absolute inset-0 bottom-7 flex flex-col justify-between">
                {[0, 1, 2].map((line) => (
                  <div
                    key={line}
                    className="border-t border-dashed border-slate-200"
                  />
                ))}
              </div>

              <div className="relative flex h-full items-end justify-around gap-2">
                {data.map((item, index) => {
                  const revenue = Number(item.revenue ?? 0);
                  const height =
                    revenue > 0 ? Math.max((revenue / maxRevenue) * 100, 4) : 0;

                  return (
                    <div
                      key={item.date ?? `${item.day}-${index}`}
                      className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                    >
                      {revenue > 0 && (
                        <div className="pointer-events-none absolute bottom-[calc(1.75rem+var(--bar-height))] z-10 mb-1 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1.5 text-xs text-white shadow-lg group-hover:block">
                          {currency(revenue)}
                          <br />
                          {number(item.bills)} bills
                        </div>
                      )}

                      <div className="flex h-[calc(100%-1.75rem)] w-full items-end justify-center">
                        <div
                          style={{
                            height: `${height}%`,
                            minHeight: revenue > 0 ? "5px" : "0",
                          }}
                          className={`w-full max-w-10 rounded-t-md transition-all duration-300 ${
                            index === data.length - 1
                              ? "bg-orange-500"
                              : "bg-orange-200 group-hover:bg-orange-400"
                          }`}
                          title={`${item.date ?? ""}: ${currency(revenue)} · ${item.bills ?? 0} bills`}
                        />
                      </div>

                      <span className="mt-2 h-5 text-xs font-medium text-slate-500">
                        {item.day ?? "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
            Daily revenue
            <span className="ml-auto">Hover bars for details</span>
          </div>
        </>
      )}
    </div>
  );
}

function PaymentBreakdown({ payments }) {
  const totalPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.amountPaid ?? 0),
    0,
  );

  const colors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
  ];

  return (
    <div>
      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Total amount collected</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {currency(totalPaid)}
        </p>
      </div>

      {payments.length === 0 ? (
        <EmptyState message="No payment data available." />
      ) : (
        <div className="mt-4 space-y-5">
          {payments.map((payment, index) => {
            const amount = Number(payment.amountPaid ?? 0);
            const percentage = totalPaid > 0 ? (amount / totalPaid) * 100 : 0;

            return (
              <div
                key={`${payment.paymentType}-${payment.paymentStatus}-${index}`}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${colors[index % colors.length]}`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {titleCase(payment.paymentType)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {number(payment.bills)} bills ·{" "}
                        {titleCase(payment.paymentStatus)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {currency(amount)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${colors[index % colors.length]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-500">
                  Billed: {currency(payment.billedAmount)} · Due:{" "}
                  {currency(payment.balanceDue)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status ?? "").toLowerCase();

  const classes =
    normalized === "paid" || normalized === "completed" || normalized === "sale"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "pending" ||
          normalized === "partially_paid" ||
          normalized === "return"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {titleCase(status || "Unknown")}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="h-80 animate-pulse rounded-2xl bg-slate-200 xl:col-span-2" />
        <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDashboardQuery();

  // Supports either an Axios response or a query function that returns response.data.
  const dashboard = useMemo(() => {
    const body = response?.data ?? response;

    if (body?.data && typeof body.data === "object") {
      return body.data;
    }

    return body ?? {};
  }, [response]);

  const overview = dashboard.overview ?? {};
  const inventory = dashboard.inventory ?? {};
  const employees = dashboard.employees ?? {};
  const suppliers = dashboard.suppliers ?? {};
  const payments = dashboard.payments ?? [];
  const salesChart = dashboard.salesChart ?? [];
  const recentBills = dashboard.recentBills ?? [];
  const lowStockProducts = inventory.lowStockProducts ?? [];
  const recentTransactions = dashboard.transactions?.recent ?? [];
  const transactionSummary = dashboard.transactions?.summary ?? [];

  const stats = {
    todayRevenue: Number(overview.todayRevenue ?? 0),
    todayBills: Number(overview.todayBillCount ?? 0),
    paidBills: Number(overview.todayPaidBills ?? 0),
    monthlyRevenue: Number(overview.monthlyRevenue ?? 0),
    monthlyBills: Number(overview.monthlyBills ?? 0),
    previousMonthRevenue: Number(overview.previousMonthRevenue ?? 0),
    monthlyGrowth: Number(overview.monthlyGrowth ?? 0),
    averageBillValue: Number(overview.averageBillValue ?? 0),
    totalBills: Number(overview.totalBills ?? 0),
    totalProducts: Number(inventory.totalProducts ?? 0),
    totalStockUnits: Number(inventory.totalStockUnits ?? 0),
    lowStockCount: Number(inventory.lowStockCount ?? lowStockProducts.length),
    estimatedCostValue: Number(inventory.estimatedCostValue ?? 0),
    estimatedSellingValue: Number(inventory.estimatedSellingValue ?? 0),
    totalAdmins: Number(employees.totalAdmins ?? 0),
    totalStaff: Number(employees.totalStaff ?? 0),
    totalUsers: Number(employees.totalUsers ?? 0),
    activeSuppliers: Number(suppliers.activeSuppliers ?? 0),
    returnedUnits: Number(suppliers.returnedUnits ?? 0),
    suppliersWithReturns: Number(suppliers.suppliersWithReturns ?? 0),
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const firstName =
    user?.username?.split(" ")[0] || user?.name?.split(" ")[0] || "there";

  const monthlyGrowth = stats.monthlyGrowth;
  const hasPreviousMonthRevenue = stats.previousMonthRevenue > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-50 px-5 text-center">
        <div className="rounded-2xl bg-red-50 p-4">
          <XCircle size={30} className="text-red-600" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">
          Unable to load dashboard
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          {error?.response?.data?.message ||
            error?.message ||
            "Something went wrong while fetching your dashboard data."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
              <Store size={15} />
              Thread & Co. / Overview
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, {firstName}!
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Here's what's happening with your store today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-600 shadow-sm">
              <CalendarDays size={17} className="text-orange-600" />
              {today}
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        {/* Highlight banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-sm sm:p-7">
          <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl" />{" "}
          <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-40 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid gap-7 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-orange-400 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold">
                <Activity size={14} />
                STORE PERFORMANCE
              </span>

              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                Your store at a glance
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-white/85">
                Monitor your sales, track inventory, and stay on top of your
                store operations from one place.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {user?.role?.toUpperCase() !== "STAFF" && (
                  <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                    <p className="text-xs text-white/80">Today's revenue</p>
                    <p className="mt-1 text-xl font-bold">
                      {currency(stats.todayRevenue)}
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                  <p className="text-xs text-white/80">Today's bills</p>
                  <p className="mt-1 text-xl font-bold">
                    {number(stats.todayBills)}
                  </p>
                </div>

                {user?.role?.toUpperCase() !== "STAFF" && (
                  <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                    <p className="text-xs text-white/80">Average bill</p>
                    <p className="mt-1 text-xl font-bold">
                      {currency(stats.averageBillValue)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                
              {user?.role?.toUpperCase() == "STAFF" && <div className=""></div>}
              {user?.role?.toUpperCase() !== "STAFF" && (
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <Wallet size={21} className="text-white/80" />
                  <p className="mt-4 text-xs text-white/80">Monthly revenue</p>
                  <p className="mt-1 break-words text-xl font-bold sm:text-2xl">
                    {currency(stats.monthlyRevenue)}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <Receipt size={21} className="text-white/80" />
                <p className="mt-4 text-xs text-white/80">Monthly bills</p>
                <p className="mt-1 text-xl font-bold sm:text-2xl">
                  {number(stats.monthlyBills)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Primary metrics */}
        {user?.role?.toUpperCase() !== "STAFF" && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Business overview
              </h2>
              <span className="text-xs text-slate-500">Live API data</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Today's Revenue"
                value={currency(stats.todayRevenue)}
                subtitle={`${number(stats.paidBills)} paid bills`}
                icon={IndianRupee}
                color="green"
              />

              <MetricCard
                title="Monthly Revenue"
                value={currency(stats.monthlyRevenue)}
                subtitle={
                  hasPreviousMonthRevenue
                    ? `Previous: ${currency(stats.previousMonthRevenue)}`
                    : "No previous-month revenue"
                }
                icon={Banknote}
                color="orange"
                trend={hasPreviousMonthRevenue ? monthlyGrowth : undefined}
              />

              <MetricCard
                title="Total Bills"
                value={number(stats.totalBills)}
                subtitle={`${number(stats.monthlyBills)} bills this month`}
                icon={ShoppingCart}
                color="blue"
              />

              <MetricCard
                title="Average Bill Value"
                value={currency(stats.averageBillValue)}
                subtitle="Average value per bill"
                icon={Receipt}
                color="violet"
              />
            </div>
          </section>
        )}

        {/* Sales chart and payments */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Panel className="xl:col-span-2">
            <SectionHeading
              title="Sales performance"
              subtitle="Revenue generated across the last seven days"
            />
            <SalesChart data={salesChart} />
          </Panel>

          <Panel>
            <SectionHeading
              title="Payment breakdown"
              subtitle="Collected amount by payment method"
            />
            <PaymentBreakdown payments={payments} />
          </Panel>
        </div>

        {/* Inventory and business summaries */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Panel className="xl:col-span-2">
            <SectionHeading
              title="Inventory overview"
              subtitle="Stock availability and estimated inventory value"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total products</p>
                    <p className="text-xl font-bold text-slate-900">
                      {number(stats.totalProducts)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                    <PackageCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total stock units</p>
                    <p className="text-xl font-bold text-slate-900">
                      {number(stats.totalStockUnits)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-sm text-slate-500">
                  Estimated purchase value
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {currency(stats.estimatedCostValue)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-sm text-slate-500">
                  Estimated selling value
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {currency(stats.estimatedSellingValue)}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <SectionHeading
                title="Low-stock alerts"
                subtitle={`${number(stats.lowStockCount)} products need attention`}
              />

              {lowStockProducts.length === 0 ? (
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
                  <CheckCircle2
                    size={22}
                    className="shrink-0 text-emerald-600"
                  />
                  <p className="text-sm text-emerald-800">
                    All products are above the low-stock threshold.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product._id ?? product.product_Id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-orange-100 bg-orange-50/60 p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-orange-100 p-2.5 text-orange-700">
                          <TriangleAlert size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {product.product_name}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            SKU: {product.product_Id ?? "—"}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-orange-700">
                          {number(product.stock_quantity)}{" "}
                          {product.unit ?? "units"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {currency(product.purchase_price)} / unit
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel>
              <SectionHeading
                title="Team overview"
                subtitle="Registered employees and users"
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600">
                      <Users size={19} />
                    </div>
                    <span className="text-sm text-slate-600">Total users</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">
                    {number(stats.totalUsers)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                      <ShieldCheck size={19} />
                    </div>
                    <span className="text-sm text-slate-600">
                      Administrators
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {number(stats.totalAdmins)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                      <Users size={19} />
                    </div>
                    <span className="text-sm text-slate-600">Staff</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {number(stats.totalStaff)}
                  </span>
                </div>
              </div>
            </Panel>

            <Panel>
              <SectionHeading
                title="Supplier overview"
                subtitle="Supplier and return activity"
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600">
                      <Truck size={19} />
                    </div>
                    <span className="text-sm text-slate-600">
                      Active suppliers
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">
                    {number(stats.activeSuppliers)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
                      <RefreshCw size={19} />
                    </div>
                    <span className="text-sm text-slate-600">
                      Returned units
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {number(stats.returnedUnits)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-50 p-2.5 text-red-600">
                      <TriangleAlert size={19} />
                    </div>
                    <span className="text-sm text-slate-600">
                      Suppliers with returns
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {number(stats.suppliersWithReturns)}
                  </span>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Recent bills */}
        <Panel className="overflow-hidden">
          <SectionHeading
            title="Recent bills"
            subtitle="Latest billing activity from your store"
            action={
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                <Receipt size={14} />
                {number(recentBills.length)} records
              </span>
            }
          />

          {recentBills.length === 0 ? (
            <EmptyState message="No bills have been recorded yet." />
          ) : (
            <div className="-mx-5 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3 font-semibold">
                      Invoice / Customer
                    </th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">Payment</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentBills.slice(0, 5).map((bill) => (
                    <tr
                      key={bill._id ?? bill.bill_number}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {bill.bill_number ?? "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {bill.customer_name || "Walk-in Customer"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatDateTime(bill.purchase_date ?? bill.created_at)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {titleCase(bill.payment_type)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={bill.payment_status} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {currency(bill.total_amount)}
                        </p>

                        {Number(bill.balance_due ?? 0) > 0 && (
                          <p className="mt-1 text-xs text-amber-600">
                            Due: {currency(bill.balance_due)}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Recent transactions */}
        {user?.role?.toUpperCase() !== "STAFF" && (
          <Panel className="overflow-hidden">
            <SectionHeading
              title="Recent transactions"
              subtitle="Recent stock and sales movements"
              action={
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                  <Activity size={14} />
                  {number(recentTransactions.length)} records
                </span>
              }
            />

            {transactionSummary.length > 0 && (
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {transactionSummary.slice(0, 5).map((item) => (
                  <div
                    key={item._id}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {titleCase(item._id)}
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {number(item.count)} transactions
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>Quantity: {number(item.quantity)}</span>
                      <span>Amount: {currency(item.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {recentTransactions.length === 0 ? (
              <EmptyState message="No recent transactions available." />
            ) : (
              <div className="-mx-5 overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse text-left">
                  <thead>
                    <tr className="border-y border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3 font-semibold">Product</th>
                      <th className="px-5 py-3 font-semibold">Invoice</th>
                      <th className="px-5 py-3 font-semibold">Type</th>
                      <th className="px-5 py-3 text-right font-semibold">
                        Quantity
                      </th>
                      <th className="px-5 py-3 text-right font-semibold">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {recentTransactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                              <ShoppingBag size={17} />
                            </div>
                            <span className="text-sm font-semibold text-slate-800">
                              {transaction.product_name || "—"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {transaction.invoice_number || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={transaction.transaction_type} />
                        </td>

                        <td className="px-5 py-4 text-right text-sm text-slate-700">
                          {number(transaction.quantity)}
                        </td>

                        <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                          {currency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        )}

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Thread & Co. Store Management</p>
          <p className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Dashboard data fetched from your backend
          </p>
        </footer>
      </div>
    </div>
  );
}
