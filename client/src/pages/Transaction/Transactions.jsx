
import React, { useState } from "react";
import {
  Search,
  CalendarDays,
  ArrowDownUp,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  IndianRupee,
  CheckCircle2,
  Clock3,
  XCircle,
  LoaderCircle,
  Package,
  RefreshCw,
} from "lucide-react";
import {
  useGetTransactionHistory,
  useGetTransactionSummary,
} from "../../Apis/query";

const currency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

const typeStyles = {
  SALE: "bg-emerald-50 text-emerald-700",
  PURCHASE: "bg-blue-50 text-blue-700",
  STOCK_IN: "bg-sky-50 text-sky-700",
  STOCK_OUT: "bg-amber-50 text-amber-700",
  RETURN: "bg-purple-50 text-purple-700",
  ADJUSTMENT: "bg-slate-100 text-slate-700",
  BILL_CANCELLED: "bg-rose-50 text-rose-700",
};

const typeLabel = (type = "") =>
  type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

const getPaymentLabel = (method) => {
  if (!method) return "—";

  const labels = {
    cash: "Cash",
    card: "Card",
    upi: "UPI",
    other: "Other",
  };

  return labels[String(method).toLowerCase()] || method;
};

const Transactions = () => {
  const [searchId, setSearchId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const {
    data: response,
    isLoading: historyLoading,
    isFetching: historyFetching,
    isError: historyError,
    error: historyErrorDetails,
    refetch: refetchHistory,
  } = useGetTransactionHistory({
    fromDate: startDate,
    toDate: endDate,
    payment_method:
      paymentFilter === "All" ? "" : paymentFilter.toLowerCase(),
    search: searchId.trim(),
    page,
    limit,
  });

  const {
    data: summaryResponse,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryErrorDetails,
    refetch: refetchSummary,
  } = useGetTransactionSummary();

  // The history API returns { success, data: [], pagination: {} }.
  const transactions = Array.isArray(response?.data) ? response.data : [];
  const pagination = response?.pagination;

  const totalRecords = Number(pagination?.totalRecords ?? 0);
  const totalPages = Number(pagination?.totalPages ?? 0);
  const currentPage = Number(pagination?.currentPage ?? page);

  // The summary API returns { success, data: { totalTransactions, totalSales, totalSalesAmount } }.
  const summary = summaryResponse?.data ?? {};

  const totalTransactions = Number(summary.totalTransactions ?? 0);
  const totalSales = Number(summary.totalSales ?? 0);
  const totalSalesAmount = Number(summary.totalSalesAmount ?? 0);

  const resetFilters = () => {
    setSearchId("");
    setStartDate("");
    setEndDate("");
    setPaymentFilter("All");
    setPage(1);
  };

  const refreshAll = () => {
    refetchHistory();
    refetchSummary();
  };

  const changeSearch = (value) => {
    setSearchId(value);
    setPage(1);
  };

  const changeStartDate = (value) => {
    setStartDate(value);
    setPage(1);
  };

  const changeEndDate = (value) => {
    setEndDate(value);
    setPage(1);
  };

  const changePayment = (value) => {
    setPaymentFilter(value);
    setPage(1);
  };

  const isInitialLoading = historyLoading && !response;

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and search your stock transaction history.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refreshAll}
            disabled={historyFetching || summaryLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={historyFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <RotateCcw size={16} />
            Reset filters
          </button>
        </div>
      </div>

      {/* Overall summary cards - not affected by history filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Transactions
            </p>
            <span className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <ReceiptText size={20} />
            </span>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {summaryLoading ? "—" : totalTransactions.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            All recorded stock transactions
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Sales</p>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 size={20} />
            </span>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {summaryLoading ? "—" : totalSales.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Transactions with type SALE
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total Sales Amount
            </p>
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <IndianRupee size={20} />
            </span>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {summaryLoading ? "—" : currency(totalSalesAmount)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Combined amount of SALE transactions
          </p>
        </div>
      </div>

      {summaryError && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <span>
            Failed to load summary:{" "}
            {summaryErrorDetails?.message || "Unknown error"}
          </span>
          <button
            type="button"
            onClick={refetchSummary}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <ArrowDownUp size={18} className="text-slate-500" />
          <h2 className="font-semibold text-slate-800">Search & Filters</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Invoice / Reference Number
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={searchId}
                onChange={(event) => changeSearch(event.target.value)}
                placeholder="Search invoice or reference..."
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              From Date
            </label>
            <div className="relative">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => changeStartDate(event.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              To Date
            </label>
            <div className="relative">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => changeEndDate(event.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Payment Method
            </label>
            <select
              value={paymentFilter}
              onChange={(event) => changePayment(event.target.value)}
              className={inputClass}
            >
              <option value="All">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Transaction History
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {totalRecords.toLocaleString("en-IN")} matching records
              {historyFetching && !historyLoading ? " · Updating..." : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Rows:</span>
            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 outline-none focus:border-orange-400"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {historyError && (
          <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-semibold">Failed to load transactions.</p>
            <p className="mt-1">
              {historyErrorDetails?.message || "Please try again."}
            </p>
            <button
              type="button"
              onClick={refetchHistory}
              className="mt-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Reference</th>
                <th className="px-5 py-3.5 font-semibold">Date & Time</th>
                <th className="px-5 py-3.5 font-semibold">Product</th>
                <th className="px-5 py-3.5 text-center font-semibold">
                  Quantity
                </th>
                <th className="px-5 py-3.5 font-semibold">Type</th>
                <th className="px-5 py-3.5 font-semibold">Payment</th>
                <th className="px-5 py-3.5 font-semibold">Amount</th>
                <th className="px-5 py-3.5 font-semibold">Performed By</th>
                <th className="px-5 py-3.5 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isInitialLoading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center">
                    <LoaderCircle
                      size={24}
                      className="mx-auto mb-2 animate-spin text-orange-600"
                    />
                    <p className="text-sm text-slate-500">
                      Loading transactions...
                    </p>
                  </td>
                </tr>
              ) : !historyError && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">
                        {transaction.invoice_number || "—"}
                      </span>
                      {transaction.billing_id && (
                        <p className="mt-1 text-xs text-slate-400">
                          Bill:{" "}
                          {typeof transaction.billing_id === "object"
                            ? transaction.billing_id._id
                            : transaction.billing_id}
                        </p>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(transaction.created_at)}
                    </td>

                    <td className="max-w-[220px] px-5 py-4">
                      <span className="font-medium text-slate-800">
                        {transaction.product_id?.product_name ||
                          transaction.product_name ||
                          "—"}
                      </span>
                      {transaction.description && (
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {transaction.description}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-center text-slate-600">
                      {Number(transaction.quantity ?? 0).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                          typeStyles[transaction.transaction_type] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {typeLabel(transaction.transaction_type)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {getPaymentLabel(transaction.payment_method)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                      {currency(transaction.amount)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {transaction.performed_by?.name ||
                        transaction.performed_by?.username ||
                        "—"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTransaction(transaction)}
                        title="View transaction"
                        aria-label="View transaction details"
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <Package size={32} className="mb-3 text-slate-300" />
                      <p className="font-medium text-slate-700">
                        {historyError
                          ? "Transactions could not be loaded"
                          : "No transactions found"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {historyError
                          ? "Retry the request or check the API connection."
                          : "Try changing your search or date range."}
                      </p>
                      {!historyError && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-700"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server-side pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm text-slate-500">
            {totalRecords === 0
              ? "No results"
              : `Showing ${((currentPage - 1) * limit) + 1}–${Math.min(
                  currentPage * limit,
                  totalRecords,
                )} of ${totalRecords}`}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                currentPage <= 1 ||
                historyFetching ||
                historyLoading ||
                totalPages === 0
              }
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="whitespace-nowrap px-2 text-sm text-slate-600">
              {totalPages === 0 ? 0 : currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={
                currentPage >= totalPages ||
                historyFetching ||
                historyLoading ||
                totalPages === 0
              }
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction details modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-modal-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="transaction-modal-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Transaction Details
                </h2>
                <p className="mt-1 break-all text-sm text-slate-500">
                  {selectedTransaction.invoice_number || "No invoice reference"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close transaction details"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                ["Transaction ID", selectedTransaction._id],
                ["Invoice Number", selectedTransaction.invoice_number || "—"],
                ["Billing ID", selectedTransaction.billing_id?._id || selectedTransaction.billing_id || "—"],
                ["Date & Time", formatDate(selectedTransaction.created_at)],
                ["Product", selectedTransaction.product_id?.product_name || selectedTransaction.product_name || "—"],
                ["Transaction Type", typeLabel(selectedTransaction.transaction_type)],
                ["Quantity", Number(selectedTransaction.quantity ?? 0).toLocaleString("en-IN")],
                ["Payment Method", getPaymentLabel(selectedTransaction.payment_method)],
                ["Performed By", selectedTransaction.performed_by?.name || selectedTransaction.performed_by?.username || "—"],
                ["Description", selectedTransaction.description || "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 text-sm"
                >
                  <span className="shrink-0 text-slate-500">{label}</span>
                  <span className="max-w-[65%] break-words text-right font-medium text-slate-800">
                    {value}
                  </span>
                </div>
              ))}

              <div className="border-t border-dashed border-slate-200 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-slate-700">
                    Transaction Amount
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    {currency(selectedTransaction.amount)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTransaction(null)}
              className="mt-6 w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
