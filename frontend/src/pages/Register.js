import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../contexts/AuthContext.js";
import { registerSchema } from "../utils/validation.js";
import Logo from "../components/Logo.js";
import AccessibleInput from "../components/AccessibleInput.js";
import AccessibleButton from "../components/AccessibleButton.js";
import Footer from "../components/Footer.js";

const Register = () => {
  const { register: registerUser } = useAuth();
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
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Watch form values to determine if form can be submitted
  const watchedValues = watch();
  const nameValue = watchedValues.name?.trim() || "";
  const emailValue = watchedValues.email?.trim() || "";
  const passwordValue = watchedValues.password?.trim() || "";

  // Check if all required fields have values
  const hasAllFields =
    nameValue.length > 0 && emailValue.length > 0 && passwordValue.length > 0;

  // Check if there are any validation errors
  const hasErrors = !!(errors.name || errors.email || errors.password);

  // Form can be submitted if all fields are filled and there are no errors
  const canSubmit = hasAllFields && !hasErrors && !isSubmitting;

  // Focus management on mount
  useEffect(() => {
    const firstInput = formRef.current?.querySelector("input");
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }, []);

  // Announce errors to screen readers
  useEffect(() => {
    if (errors.root?.message && errorRef.current) {
      errorRef.current.focus();
    }
  }, [errors.root?.message]);

  const onSubmit = async (data) => {
    const result = await registerUser(data);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError("root", {
        type: "manual",
        message: result.error || "Registration failed.",
      });
      if (errorRef.current) {
        errorRef.current.focus();
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col w-full bg-transparent">
    <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-10">
      <div className="relative w-full max-w-[460px] max-h-[83vh] overflow-y-auto scrollbar-hidden rounded-3xl p-8 sm:p-9 md:p-10 bg-gradient-to-br from-white via-primary-50 to-primary-100 border border-primary-200/50 shadow-[0_0_0_1px_rgba(59,130,246,0.1),0_8px_32px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.8)]">
  
        <div className="flex justify-center mb-5">
          <Logo size="lg" />
        </div>
  
        <h1 className="mb-2 text-center text-[1.75rem] font-bold leading-tight tracking-tight text-text">
          Create your account
        </h1>
  
        <p className="mb-5 text-center text-[0.9375rem] leading-relaxed text-text-muted">
          Get started with ClientDocs today.
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
          className="flex flex-col gap-4"
          aria-label="Registration form"
          noValidate
        >
          <AccessibleInput
            id="register-name"
            label="Full name"
            type="text"
            {...register("name")}
            error={errors.name?.message}
            required
            placeholder="Enter your full name"
            ariaLabel="Full name"
            autoComplete="name"
            helperText="Minimum 3 characters."
          />
  
          <AccessibleInput
            id="register-email"
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
            id="register-password"
            label="Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
            required
            placeholder="Create a password"
            ariaLabel="Password"
            autoComplete="new-password"
            helperText="Minimum 8 characters with uppercase, lowercase, and number."
            showPasswordToggle
            maxLength={128}
          />
  
          <AccessibleButton
            type="submit"
            variant="primary"
            disabled={!canSubmit}
            loading={isSubmitting}
            ariaLabel={
              isSubmitting
                ? "Creating account, please wait"
                : canSubmit
                ? "Create your account"
                : "Please fill all required fields correctly to create account."
            }
            aria-describedby={
              !canSubmit && hasAllFields ? "form-errors-summary" : undefined
            }
            className="w-full mt-3"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </AccessibleButton>
  
          {!canSubmit && hasAllFields && hasErrors && (
            <div
              id="form-errors-summary"
              className="sr-only"
              role="alert"
              aria-live="polite"
            >
              Form has validation errors. Please correct the following:{" "}
              {[
                errors.name?.message,
                errors.email?.message,
                errors.password?.message,
              ]
                .filter(Boolean)
                .join(", ")}
            </div>
          )}
        </form>
  
        <p className="mt-4 text-center text-sm leading-relaxed text-text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 no-underline font-semibold transition-colors duration-200 cursor-pointer hover:text-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:rounded"
            aria-label="Navigate to login page"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  
    <Footer />
  </div>
  
  );
};

export default Register;
