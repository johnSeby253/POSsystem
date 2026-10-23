import { useState } from "react";
import {
  ShoppingCart,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  Package,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";

import CustomModal from "../common/CustomModal";
import Button from "../common/Button";
import { toast } from "sonner";
import { useLoginUser } from "../Apis/query";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import { useAuthStore } from "../store/authStore";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const { mutate: login, isPending, isError, error } = useLoginUser();
  const authLogin = useAuthStore((state) => state.login);

  const handleSubmit = (e) => {
    e.preventDefault();

    login(
      {
        email,
        password,
      },
      {
        onSuccess: (data) => {
          console.log("Login response:", data);

          if (data?.success && data?.token && data?.user) {
            // Update global authentication state
            authLogin(data.user, data.token);

            toast.success(data.message || "Login successful!");

            setLoginModalOpen(false);

            // Navigate after Zustand state is updated
            navigate("/dashboard", { replace: true });
          } else {
            toast.error(data?.message || "Invalid login response");
          }
        },

        onError: (error) => {
          toast.error(
            error?.response?.data?.message || error?.message || "Login failed",
          );
        },
      },
    );
  };

  const loginFields = (prefix = "") => (
    <>
      {/* Email */}
      <div>
        <label
          htmlFor={`${prefix}email`}
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Email or username
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
          <Mail size={19} className="shrink-0 text-slate-400" />

          <input
            id={`${prefix}email`}
            type="text"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email or username"
            className="w-full min-w-0 bg-transparent py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor={`${prefix}password`}
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Password
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
          <LockKeyhole size={19} className="shrink-0 text-slate-400" />

          <input
            id={`${prefix}password`}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full min-w-0 bg-transparent py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="shrink-0 text-slate-400 hover:text-slate-700"
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
      </div>

      {/* Remember me and forgot password */}
      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-slate-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 accent-blue-600"
          />
          Remember me
        </label>

        <button
          type="button"
          onClick={() => {
            // Add your forgot-password flow here.
          }}
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          Forgot password?
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-white lg:flex-row">
      {/* LEFT: Shopping background and application information */}
      <section className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-slate-950 p-7 text-white sm:p-10 lg:min-h-screen lg:w-[70%] lg:p-14">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=85')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/35" />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-xl bg-blue-500 p-2.5">
            <ShoppingCart size={28} />
          </div>

          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Thread & Co.</h1>
            <p className="text-sm text-slate-300">POS Billing Software</p>
          </div>
        </div>

        {/* Description */}
        <div className="relative z-10 my-12 max-w-2xl lg:my-0">
          <span className="mb-5 inline-block rounded-full border border-blue-400/30 bg-blue-500/15 px-4 py-2 text-sm text-blue-200">
            Simplify your retail business
          </span>

          <h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl xl:text-6xl">
            Smarter Billing.
            <br />
            <span className="text-blue-400">Better Business.</span>
          </h2>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Manage your products, track inventory, process customer bills, and
            monitor sales from one simple and reliable point-of-sale system.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 sm:gap-6">
            <Feature icon={Zap} title="Fast & Easy" subtitle="Billing" />

            <Feature icon={Package} title="Inventory" subtitle="Management" />

            <Feature
              icon={ChartNoAxesColumnIncreasing}
              title="Sales"
              subtitle="Reports"
            />
          </div>

          {/* Mobile login button */}
          <div className="mt-8 lg:hidden">
            <Button
              type="button"
              size="lg"
              fullWidth
              onClick={() => setLoginModalOpen(true)}
            >
              Sign In to Your Account
              <ArrowRight size={19} />
            </Button>
          </div>
        </div>

        <p className="relative z-10 hidden text-sm text-slate-400 lg:block">
          One system. Better control. Smarter decisions.
        </p>
      </section>

      {/* RIGHT: Desktop login panel */}
      <section className="hidden w-full items-center justify-center bg-white px-8 lg:flex lg:min-h-screen lg:w-[30%] xl:px-12">
        <div className="w-full max-w-md">
          <Brand />

          <div className="mb-8">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome Back
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to your account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {loginFields("desktop-")}

            <Button type="submit" size="lg" fullWidth>
              Sign In
              <ArrowRight size={19} />
            </Button>
          </form>

          <SecurityFooter />
        </div>
      </section>

      {/* MOBILE: Reusable login modal */}
      <CustomModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        title="Welcome Back"
        description="Sign in to your Thread & Co. account."
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {loginFields("mobile-")}

          <Button type="submit" size="lg" fullWidth>
            Sign In
            <ArrowRight size={19} />
          </Button>
        </form>

        <SecurityFooter />
      </CustomModal>
    </div>
  );
};

const Brand = () => (
  <div className="mb-10 flex items-center gap-3 lg:mb-12">
    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
      <ShoppingCart size={28} />
    </div>

    <div>
      <h2 className="text-xl font-bold text-slate-900">Thread & Co.</h2>
      <p className="text-sm text-slate-500">POS Billing Software</p>
    </div>
  </div>
);

const SecurityFooter = () => (
  <div className="mt-8 flex items-center gap-3 text-xs text-slate-400">
    <div className="h-px flex-1 bg-slate-200" />
    Secure · Reliable · Easy to Use
    <div className="h-px flex-1 bg-slate-200" />
  </div>
);

const Feature = ({ icon: Icon, title, subtitle }) => (
  <div className="border-l border-white/20 pl-3 sm:pl-5">
    <Icon size={23} className="mb-3 text-blue-400" />
    <p className="text-sm font-semibold sm:text-base">{title}</p>
    <p className="mt-1 text-xs text-slate-300 sm:text-sm">{subtitle}</p>
  </div>
);

export default Login;
