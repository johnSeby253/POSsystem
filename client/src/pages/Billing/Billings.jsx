import { useState } from "react";
import {
  Search,
  ScanBarcode,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  ReceiptText,
  UserRound,
  Package,
  X,
  CheckCircle2,
} from "lucide-react";
import { useDebounce } from "use-debounce";
import { useCreateBill, useGetAllProducts } from "../../Apis/query";

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const Billings = () => {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notice, setNotice] = useState("");
  const [completedBill, setCompletedBill] = useState(null);

  const [debouncedSearch] = useDebounce(search, 300);

  const {
    data: productsResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetAllProducts(1, 9, debouncedSearch);

  const { mutate: createBill, isPending: isCreatingBill } = useCreateBill();

  const products = productsResponse?.data ?? [];

  const subtotal = cart.reduce(
    (sum, item) => sum + item.selling_price * item.quantity,
    0,
  );

  const discountAmount = Math.min(subtotal, Math.max(0, Number(discount) || 0));

  const total = Math.max(0, subtotal - discountAmount);

  const addToCart = (product) => {
    setNotice("");
    setCompletedBill(null);

    const stock = Number(product.stock_quantity) || 0;

    if (stock < 1) {
      setNotice(`${product.product_name} is out of stock.`);
      return;
    }

    setCart((previous) => {
      const existing = previous.find((item) => item._id === product._id);

      if (existing) {
        if (existing.quantity >= stock) {
          setNotice(
            `Only ${stock} units of ${product.product_name} are available.`,
          );
          return previous;
        }

        return previous.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...previous,
        {
          ...product,
          selling_price: Number(product.selling_price) || 0,
          stock_quantity: stock,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (productId, change) => {
    setNotice("");

    setCart((previous) =>
      previous
        .map((item) => {
          if (item._id !== productId) return item;

          const nextQuantity = item.quantity + change;

          if (nextQuantity > item.stock_quantity) {
            setNotice(
              `Only ${item.stock_quantity} units of ${item.product_name} are available.`,
            );
            return item;
          }

          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId) => {
    setCart((previous) => previous.filter((item) => item._id !== productId));
    setNotice("");
  };

  const handleCheckout = () => {
    setNotice("");

    if (cart.length === 0) {
      setNotice("Add at least one product before checkout.");
      return;
    }

    if (customerPhone.trim() && !/^\d{10}$/.test(customerPhone.trim())) {
      setNotice("Enter a valid 10-digit customer phone number.");
      return;
    }

    const payload = {
      customer_name: customerName.trim() || "Walk-in Customer",
      customer_phone: customerPhone.trim(),
      items: cart.map((item) => ({
        product_id: item._id,
        quantity: item.quantity,
      })),
      payment_type: paymentMethod,
      amount_paid: total,
      purchase_date: new Date().toISOString(),
    };

    createBill(payload, {
      onSuccess: (response) => {
        // Adapt this to your actual backend response structure.
        const bill = response?.data ?? response?.bill ?? response;

        setCompletedBill(bill);
        setCart([]);
        setCustomerName("");
        setCustomerPhone("");
        setDiscount("0");
        setPaymentMethod("cash");
        setNotice("");
      },

      onError: (error) => {
        setNotice(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to create bill. Please try again.",
        );
      },
    });
  };

  const resetBill = () => {
    setCompletedBill(null);
    setNotice("");
  };

  return (
    <div className="min-h-full space-y-6 pb-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">Point of Sale</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Billing
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Add products, manage the cart, and complete a customer sale.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3">
          <ReceiptText size={20} className="text-indigo-600" />
          <div>
            <p className="text-xs text-slate-500">New transaction</p>
            <p className="text-sm font-semibold text-slate-800">
              {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Notice */}
      {notice && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Completed bill */}
      {completedBill && (
        <div className="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={24}
              className="mt-0.5 shrink-0 text-emerald-600"
            />
            <div>
              <h2 className="font-semibold text-emerald-900">
                 Sales bill generated successfully
              </h2>
             
              <p className="mt-1 text-xs text-emerald-700">
               This bill transaction record in transaction history.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetBill}
            className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            New Bill
          </button>
        </div>
      )}

      {/* Main workspace */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        {/* Product selection */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Select Products</h2>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search product name..."
                  className={`${inputClass} pl-10`}
                />
              </div>

             

              <button
                type="button"
                onClick={() =>
                  setNotice(
                    "Connect a barcode scanner or barcode input to enable scanning.",
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ScanBarcode size={18} />
                Barcode
              </button>
            </div>
          </div>

          {isError && (
            <p className="px-5 py-4 text-sm text-red-600">
              {error?.message || "Failed to load products."}
            </p>
          )}

          {isFetching && (
            <p className="px-5 py-2 text-xs text-slate-500">
              {isLoading ? "Loading products..." : "Searching products..."}
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 2xl:grid-cols-3">
            {!isLoading &&
              !isError &&
              products.map((product) => {
                const cartItem = cart.find((item) => item._id === product._id);

                const stock = Number(product.stock_quantity) || 0;
                const price = Number(product.selling_price) || 0;
                const outOfStock = stock < 1;
                const atStockLimit = cartItem && cartItem.quantity >= stock;

                return (
                  <article
                    key={product._id}
                    className="flex min-w-0 flex-col rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Package size={20} />
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          outOfStock
                            ? "bg-red-50 text-red-600"
                            : stock <= 5
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {outOfStock ? "Out of stock" : `${stock} in stock`}
                      </span>
                    </div>

                    <h3 className="mt-3 break-words font-semibold text-slate-800">
                      {product.product_name}
                    </h3>

                    <p className="mt-1 break-all text-xs text-slate-500">
                      Category ID: {product.category_id}
                    </p>

                    {product.expiry_date && (
                      <p className="mt-1 text-xs text-slate-500">
                        Expires:{" "}
                        {new Date(product.expiry_date).toLocaleDateString(
                          "en-IN",
                        )}
                      </p>
                    )}

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          {currency(price)}
                        </p>
                        <p className="text-xs text-slate-500">
                          per {product.unit}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={outOfStock || Boolean(atStockLimit)}
                        onClick={() => addToCart(product)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                  </article>
                );
              })}

            {!isLoading && !isError && products.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <Search size={30} className="mx-auto text-slate-300" />
                <p className="mt-3 font-medium text-slate-700">
                  No products found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try another product name.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Cart and checkout */}
        <aside className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white xl:sticky xl:top-4">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Current Bill</h2>
            </div>

            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {cart.reduce((count, item) => count + item.quantity, 0)} items
            </span>
          </div>

          {/* Customer */}
          <div className="space-y-3 border-b border-slate-100 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <UserRound size={17} />
              Customer Details
            </div>

            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Customer name (optional)"
              className={inputClass}
            />

            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="Phone number (optional)"
              className={inputClass}
            />
          </div>

          {/* Cart items */}
          <div className="max-h-[360px] space-y-4 overflow-y-auto p-4 sm:p-5">
            {cart.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart size={32} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  Your cart is empty
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Add products to start billing.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item._id} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Package size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium text-slate-800">
                      {item.product_name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {currency(item.selling_price)} / {item.unit}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center rounded-lg border border-slate-200">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.product_name} quantity`}
                          onClick={() => updateQuantity(item._id, -1)}
                          className="p-1.5 text-slate-600 hover:bg-slate-50"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="min-w-7 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Increase ${item.product_name} quantity`}
                          disabled={item.quantity >= item.stock_quantity}
                          onClick={() => updateQuantity(item._id, 1)}
                          className="p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        aria-label={`Remove ${item.product_name}`}
                        onClick={() => removeFromCart(item._id)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-slate-800">
                    {currency(item.selling_price * item.quantity)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Totals and payment */}
          <div className="space-y-4 border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-800">
                {currency(subtotal)}
              </span>
            </div>
{/* 
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="bill-discount" className="text-sm text-slate-500">
                Discount (₹)
              </label>
              <input
                id="bill-discount"
                type="number"
                min="0"
                step="0.01"
                max={subtotal}
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-right text-sm outline-none focus:border-indigo-500"
              />
            </div> */}

            <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-4">
              <span className="font-semibold text-slate-900">Total Amount</span>
              <span className="text-2xl font-bold text-indigo-700">
                {currency(total)}
              </span>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Payment Method
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "cash", label: "Cash", Icon: Banknote },
                  { id: "card", label: "Card", Icon: CreditCard },
                  { id: "upi", label: "UPI", Icon: Smartphone },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    aria-pressed={paymentMethod === id}
                    className={`flex min-w-0 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-xs font-medium transition ${
                      paymentMethod === id
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={19} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={cart.length === 0 || Boolean(completedBill)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              <ReceiptText size={18} />
              Complete Sale · {currency(total)}
            </button>

            <p className="text-center text-xs text-slate-500">
              Review items and total before completing the sale.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Billings;
