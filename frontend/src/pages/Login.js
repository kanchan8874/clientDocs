import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../contexts/AuthContext.js";
import { loginSchema } from "../utils/validation.js";
import Logo from "../components/Logo.js";
import AccessibleInput from "../components/AccessibleInput.js";
import AccessibleButton from "../components/AccessibleButton.js";
import Footer from "../components/Footer.js";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const errorRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Watch form values to determine if form can be submitted
  const watchedValues = watch();
  const emailValue = watchedValues.email?.trim() || "";
  const passwordValue = watchedValues.password?.trim() || "";

  const hasAllFields = emailValue.includes("@") && passwordValue.length > 0;
  const hasErrors = errors.email || errors.password;
  const canSubmit = hasAllFields && !hasErrors && !isSubmitting;

  // Focus management on mount
  useEffect(() => {
    const firstInput = formRef.current?.querySelector("input");
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  // Announce errors to screen readers
  useEffect(() => {
    if (errors.root?.message && errorRef.current) {
      errorRef.current.focus();
    }
  }, [errors.root?.message]);

  // Auto-dismiss error message after 5 seconds
  useEffect(() => {
    if (errors.root?.message) {
      const timer = setTimeout(() => {
        setError("root", { type: "manual", message: "" });
      }, 5000); // 5 seconds

      // Cleanup timer on unmount or when error changes
      return () => clearTimeout(timer);
    }
  }, [errors.root?.message, setError]);

  const onSubmit = async (data) => {
    // Clear any previous errors
    setError("root", { type: "manual", message: "" });
    
    const result = await login(data);

    if (result.success) {
      navigate("/dashboard");
    } else {
      // Set error message from backend response
      const errorMessage = result.error || "Login failed.";
      setError("root", {
        type: "manual",
        message: errorMessage,
      });
      // Focus error message for accessibility
      setTimeout(() => {
        if (errorRef.current) {
          errorRef.current.focus();
        }
      }, 100);
    }
  };

  return (
    <div className="flex min-h-screen flex-col w-full bg-transparent">
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8 md:py-12">
        <div className="relative w-full max-w-[460px] overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 bg-gradient-to-br from-white via-primary-50 to-primary-100 border border-primary-200/50 shadow-[0_0_0_1px_rgba(59,130,246,0.1),0_8px_32px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="flex justify-center mb-4 sm:mb-6">
          <Logo size="lg" />
        </div>
        <h1 className="mb-2 text-center text-xl sm:text-2xl md:text-[1.75rem] font-bold leading-tight tracking-tight text-text">
          Welcome back
        </h1>
        <p className="mb-6 sm:mb-8 text-center text-sm sm:text-[0.9375rem] leading-relaxed text-text-muted">
          Sign in to your account to continue.
        </p>

        {errors.root?.message && (
          <div
            ref={errorRef}
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
            className="bg-red-50 text-red-700 py-3.5 px-4 rounded-[10px] mb-4 border border-red-600 text-sm outline-none leading-normal"
          >
            {errors.root.message}
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 sm:gap-5"
          aria-label="Login form"
          noValidate
        >
          <AccessibleInput
            id="login-email"
            label="Email address"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            required
            placeholder="Enter your email"
            ariaLabel="Email address"
            autoComplete="email"
            maxLength={254}
          />

          <AccessibleInput
            id="login-password"
            label="Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
            required
            placeholder="Enter your password"
            ariaLabel="Password"
            autoComplete="current-password"
            showPasswordToggle
            maxLength={64}
          />

          <AccessibleButton
            type="submit"
            variant="primary"
            disabled={!canSubmit}
            loading={isSubmitting}
            ariaLabel={
              isSubmitting
                ? "Logging in, please wait."
                : canSubmit
                ? "Sign in to your account."
                : "Please fill all required fields correctly to sign in."
            }
            className="w-full mt-4"
          >
            {isSubmitting ? "Logging in..." : "Sign in"}
          </AccessibleButton>
        </form>

        <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm leading-relaxed text-text-muted">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 no-underline font-semibold transition-colors duration-200 cursor-pointer hover:text-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:rounded"
            aria-label="Navigate to registration page"
          >
            Sign up 
          </Link>
        </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
