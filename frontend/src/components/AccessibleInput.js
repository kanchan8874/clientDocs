import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';


const AccessibleInput = forwardRef(({
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
    w-full text-[0.9375rem] leading-normal text-slate-900 placeholder:text-slate-400
    ${disabled ? 'bg-slate-100' : 'bg-white'}
    ${error ? 'border-2 border-red-600' : 'border border-slate-200'}
    rounded-[12px]
    ${showPasswordToggle && type === 'password' ? 'pr-11' : ''}
    px-4 py-3.5
    min-h-[44px]
    transition-all duration-200 ease-out
    outline-none
    focus:border-primary focus:ring-4 focus:ring-primary/20
    disabled:opacity-60 disabled:cursor-not-allowed
    ${error ? 'focus:border-red-600 focus:ring-red-600/30' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`${className} w-full mb-0`}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold leading-tight text-slate-900"
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
            className="absolute right-2 top-1/2 flex min-w-8 min-h-8 -translate-y-1/2 transform items-center justify-center rounded-lg border border-transparent bg-transparent p-1 text-slate-500 transition-colors duration-200 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            {isPasswordVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      
      {helperText && !error && (
        <span id={helperId} className="mt-2 block text-[0.8125rem] leading-tight text-slate-600">
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
