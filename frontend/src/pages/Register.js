import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext.js';
import { registerSchema } from '../utils/validation.js';
import Logo from '../components/Logo.js';
import AccessibleInput from '../components/AccessibleInput.js';
import AccessibleButton from '../components/AccessibleButton.js';


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
    watch
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
    name: '',
    email: '',
    password: ''
    }
  });

  // Watch form values to determine if form can be submitted
  const watchedValues = watch();
  const nameValue = watchedValues.name?.trim() || '';
  const emailValue = watchedValues.email?.trim() || '';
  const passwordValue = watchedValues.password?.trim() || '';
  
  // Check if all required fields have values
  const hasAllFields = nameValue.length > 0 && emailValue.length > 0 && passwordValue.length > 0;
  
  // Check if there are any validation errors
  const hasErrors = !!(errors.name || errors.email || errors.password);
  
  // Form can be submitted if all fields are filled and there are no errors
  const canSubmit = hasAllFields && !hasErrors && !isSubmitting;

  // Focus management on mount
  useEffect(() => {
    const firstInput = formRef.current?.querySelector('input');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }, []);

  // Announce errors to screen readers
  useEffect(() => {
    if (errors.root && errorRef.current) {
      errorRef.current.focus();
    }
  }, [errors.root]);

  const onSubmit = async (data) => {
    const result = await registerUser(data);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError('root', {
        type: 'manual',
        message: result.error || 'Registration failed'
      });
      if (errorRef.current) {
        errorRef.current.focus();
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-6 bg-gradient-to-br from-blue-50/30 to-green-50/30">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 w-full max-w-[420px] max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-center mb-5">
          <Logo size="lg" />
        </div>
        <h1 className="text-center text-[1.75rem] font-bold mb-2 text-gray-800 tracking-tight leading-tight">Create your account</h1>
        <p className="text-center text-[0.9375rem] text-gray-600 mb-6 leading-relaxed">Get started with ClientDocs today</p>

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
          className="flex flex-col gap-4"
          aria-label="Registration form"
          noValidate
        >
          <AccessibleInput
            id="register-name"
            label="Full name"
            type="text"
            {...register('name')}
            error={errors.name?.message}
            required
            placeholder="Enter your full name"
            ariaLabel="Full name"
            autoComplete="name"
            helperText="Minimum 3 characters"
          />

          <AccessibleInput
            id="register-email"
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
            id="register-password"
            label="Password"
              type="password"
            {...register('password')}
            error={errors.password?.message}
              required
            placeholder="Create a password"
            ariaLabel="Password"
            autoComplete="new-password"
            helperText="Minimum 8 characters with uppercase, lowercase, and number"
            showPasswordToggle
          />

          <AccessibleButton
            type="submit"
            variant="primary"
            disabled={!canSubmit}
            loading={isSubmitting}
            ariaLabel={
              isSubmitting 
                ? 'Creating account, please wait' 
                : canSubmit 
                  ? 'Create your account' 
                  : 'Please fill all required fields correctly to create account'
            }
            aria-describedby={!canSubmit && hasAllFields ? 'form-errors-summary' : undefined}
            className="w-full mt-4"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </AccessibleButton>

          {/* Hidden summary of errors for screen readers */}
          {!canSubmit && hasAllFields && hasErrors && (
            <div 
              id="form-errors-summary" 
              className="sr-only" 
              role="alert" 
              aria-live="polite"
            >
              Form has validation errors. Please correct the following: {
                [
                  errors.name?.message,
                  errors.email?.message,
                  errors.password?.message
                ].filter(Boolean).join(', ')
              }
          </div>
          )}
        </form>

        <p className="text-center mt-5 text-sm text-gray-600 leading-relaxed">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-primary no-underline font-semibold transition-colors duration-200 cursor-pointer hover:text-primary-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:rounded"
            aria-label="Navigate to login page"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
