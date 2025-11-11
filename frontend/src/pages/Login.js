import { useEffect, useRef } from 'react';
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
    <div className="flex min-h-screen w-full items-center justify-center bg-transparent px-4 py-12">
      <div className="glass-card relative w-full max-w-[460px] overflow-hidden rounded-3xl p-10">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <h1 className="text-center text-[1.75rem] font-bold mb-2 text-slate-900 tracking-tight leading-tight">Welcome back</h1>
        <p className="text-center text-[0.9375rem] text-slate-600 mb-8 leading-relaxed">Sign in to your account to continue</p>

        {errors.root && (
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
          className="flex flex-col gap-5"
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

        <p className="text-center mt-6 text-sm text-slate-600 leading-relaxed">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-primary no-underline font-semibold transition-colors duration-200 cursor-pointer hover:text-primary-dark focus:outline-none focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:rounded"
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
