import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Accessible Input Component
 * WCAG 2.2 Level AA Compliant
 * 
 * Features:
 * - Proper label association
 * - ARIA attributes for errors
 * - Minimum touch target size
 * - Visible focus indicators
 * - Error state handling
 */
const AccessibleInput = React.forwardRef(({
  id,
  label,
  type = 'text',
  error,
  required = false,
  disabled = false,
  placeholder,
  value,
  onChange,
  onBlur,
  ariaLabel,
  ariaDescribedBy,
  helperText,
  className = '',
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const describedBy = [errorId, helperId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

  // Extract handlers from props to merge with our custom handlers
  const { onBlur: propsOnBlur, onChange: propsOnChange, ...restProps } = props;
  
  // Merge onChange handlers
  const handleChange = propsOnChange || onChange;
  
  // Merge onBlur handlers
  const handleBlur = (e) => {
    if (propsOnBlur) {
      propsOnBlur(e);
    }
    if (onBlur && onBlur !== propsOnBlur) {
      onBlur(e);
    }
  };

  const computedType = type === 'password' && showPasswordToggle ? (isPasswordVisible ? 'text' : 'password') : type;

  const inputClasses = `
    w-full text-[0.9375rem] leading-normal text-gray-800
    ${disabled ? 'bg-gray-50' : 'bg-white'}
    ${error ? 'border-2 border-red-600' : 'border border-gray-300'}
    rounded-[10px]
    ${showPasswordToggle && type === 'password' ? 'pr-11' : ''}
    px-4 py-3.5
    min-h-[44px]
    transition-all duration-200 ease-in-out
    outline-none
    focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-30
    disabled:opacity-60 disabled:cursor-not-allowed
    ${error ? 'focus:border-red-600 focus:ring-red-600 focus:ring-opacity-30' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`${className} w-full mb-0`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-gray-800 mb-2 leading-tight"
        >
          {label}
          {required && (
            <span aria-label="required" className="text-red-600 ml-1">
              *
            </span>
          )}
        </label>
      )}
      
      <div className="relative w-full">
        <input
          id={inputId}
          ref={ref}
          type={computedType}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-label={ariaLabel || label}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required}
          className={inputClasses}
          {...(value !== undefined && { value })}
          {...(handleChange && { onChange: handleChange })}
          {...restProps}
          onBlur={handleBlur}
        />
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isPasswordVisible}
            onClick={() => setIsPasswordVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none p-1 rounded-lg cursor-pointer text-gray-600 hover:text-gray-800 focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 min-w-8 min-h-8 flex items-center justify-center"
          >
            {isPasswordVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      
      {helperText && !error && (
        <span id={helperId} className="block text-[0.8125rem] text-gray-600 mt-2 leading-tight">
          {helperText}
        </span>
      )}
      
      {error && (
        <span
          id={errorId}
          role="alert"
          aria-live="polite"
          className="block text-[0.8125rem] text-red-700 mt-2 leading-tight"
        >
          {error}
        </span>
      )}
    </div>
  );
});

AccessibleInput.displayName = 'AccessibleInput';

export default AccessibleInput;
