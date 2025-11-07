import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext.js';
import { loginSchema } from '../utils/validation.js';
import Logo from '../components/Logo.js';
import AccessibleInput from '../components/AccessibleInput.js';
import AccessibleButton from '../components/AccessibleButton.js';



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
    watch
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Watch form values to determine if form can be submitted
  const watchedValues = watch();
  const emailValue = watchedValues.email?.trim() || '';
  const passwordValue = watchedValues.password?.trim() || '';
  
  const hasAllFields = emailValue.includes('@') && passwordValue.length > 0;
  const hasErrors = errors.email || errors.password;
  const canSubmit = hasAllFields && !hasErrors && !isSubmitting;

  // Focus management on mount
  useEffect(() => {
    const firstInput = formRef.current?.querySelector('input');
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  // Announce errors to screen readers
  useEffect(() => {
    if (errors.root && errorRef.current) {
      errorRef.current.focus();
    }
  }, [errors.root]);

  const onSubmit = async (data) => {
    const result = await login(data);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError('root', {
        type: 'manual',
        message: result.error || 'Login failed'
      });
      if (errorRef.current) {
        errorRef.current.focus();
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-16 sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-28 right-[-80px] h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[440px] overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-10 shadow-soft-glow backdrop-blur-xl">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-400/10" />

        <div className="relative z-10 flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <h1 className="relative z-10 text-center text-[1.75rem] font-bold mb-2 text-slate-900 tracking-tight leading-tight">Welcome back</h1>
        <p className="relative z-10 text-center text-[0.9375rem] text-slate-600 mb-8 leading-relaxed">Sign in to your account to continue</p>

        {errors.root && (
          <div 
            ref={errorRef}
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
            className="relative z-10 bg-red-50 text-red-700 py-3.5 px-4 rounded-[12px] mb-4 border border-red-600 text-sm outline-none leading-normal shadow-ambient-glow"
          >
            {errors.root.message}
          </div>
        )}

        <form 
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)} 
          className="relative z-10 flex flex-col gap-5"
          aria-label="Login form"
          noValidate
        >
          <AccessibleInput
            id="login-email"
            label="Email address"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            required
            placeholder="Enter your email"
            ariaLabel="Email address"
            autoComplete="email"
          />

          <AccessibleInput
            id="login-password"
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            required
            placeholder="Enter your password"
            ariaLabel="Password"
            autoComplete="current-password"
            showPasswordToggle
          />

          <AccessibleButton
            type="submit"
            variant="primary"
            disabled={!canSubmit}
            loading={isSubmitting}
            ariaLabel={
              isSubmitting 
                ? 'Logging in, please wait' 
                : canSubmit 
                  ? 'Sign in to your account' 
                  : 'Please fill all required fields correctly to sign in'
            }
            className="w-full mt-4"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </AccessibleButton>
        </form>

        <p className="relative z-10 text-center mt-6 text-sm text-slate-600 leading-relaxed">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-primary no-underline font-semibold transition-colors duration-200 cursor-pointer hover:text-primary-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:rounded"
            aria-label="Navigate to registration page"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
