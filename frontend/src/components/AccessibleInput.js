import { forwardRef, useState, useCallback } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getAutoCapitalizeAttribute } from '../utils/textTransform.js';


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
  autoCapitalize = null, // null = auto-detect, true = force capitalize, false = no capitalize
  ...props
}, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const describedBy = [errorId, helperId, ariaDescribedBy].filter(Boolean).join(' ') || undefined;

  // Extract handlers from props to merge with our custom handlers
  const { onBlur: propsOnBlur, onChange: propsOnChange, name, ...restProps } = props;
  
  // Calculate computed type (needed for handleChange)
  const computedType = type === 'password' && showPasswordToggle ? (isPasswordVisible ? 'text' : 'password') : type;
  
  // Determine if auto-capitalization should be enabled
  const shouldAutoCapitalize = autoCapitalize !== null 
    ? autoCapitalize 
    : (type === 'text' && type !== 'email' && type !== 'password' && type !== 'tel');
  
  // Create transformed onChange handler
  const handleChange = useCallback((e) => {
    const input = e.target;
    const originalValue = input.value;
    
    // Get cursor position only for input types that support selection
    const supportsSelection = ['text', 'password', 'search', 'tel', 'url'].includes(computedType);
    const cursorPosition = supportsSelection ? (input.selectionStart || 0) : 0;
    
    let transformedValue = originalValue;
    
    if (type === 'email') {
      // Email: always lowercase
      transformedValue = originalValue.toLowerCase();
    } else if (shouldAutoCapitalize && originalValue.length > 0) {
      // Text fields: always capitalize first letter (only if it's alphabetic)
      const firstChar = originalValue.charAt(0);
      const rest = originalValue.slice(1);
      
      // Only capitalize if first character is a lowercase letter
      if (firstChar && /[a-z]/.test(firstChar)) {
        transformedValue = firstChar.toUpperCase() + rest;
      }
      // If first char is already uppercase, number, or special char - keep as is (transformedValue = originalValue)
    }
    
    // Always create synthetic event with transformed value
    // This ensures react-hook-form always gets the transformed value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: transformedValue,
        name: input.name || name,
        id: input.id || inputId
      },
      currentTarget: {
        ...e.currentTarget,
        value: transformedValue,
        name: input.name || name,
        id: input.id || inputId
      }
    };
    
    // Call original onChange handlers with transformed value
    // This is critical for react-hook-form to receive the transformed value
    if (propsOnChange) {
      propsOnChange(syntheticEvent);
    }
    if (onChange && onChange !== propsOnChange) {
      onChange(syntheticEvent);
    }
    
    // If value was transformed, update DOM immediately and restore cursor position
    if (transformedValue !== originalValue) {
      // Update the input value immediately for visual feedback
      // This works because react-hook-form uses uncontrolled inputs
      input.value = transformedValue;
      
      // Restore cursor position only for input types that support selection
      if (supportsSelection) {
        setTimeout(() => {
          if (input && document.activeElement === input) {
            try {
              // Cursor position should remain the same since we only changed the first char
              const newCursorPosition = Math.min(cursorPosition, transformedValue.length);
              input.setSelectionRange(newCursorPosition, newCursorPosition);
            } catch (err) {
              // Silently fail if setSelectionRange is not supported
              // This can happen for certain input types or browser states
            }
          }
        }, 0);
      }
    }
  }, [type, shouldAutoCapitalize, propsOnChange, onChange, computedType, name, inputId]);
  
  // Merge onBlur handlers
  const handleBlur = (e) => {
    if (propsOnBlur) {
      propsOnBlur(e);
    }
    if (onBlur && onBlur !== propsOnBlur) {
      onBlur(e);
    }
  };
  
  // Get autoCapitalize attribute for mobile
  const autoCapitalizeAttr = autoCapitalize !== null
    ? (autoCapitalize ? 'sentences' : 'none')
    : getAutoCapitalizeAttribute(type, name || id || '');

  const inputClasses = `
    w-full text-[0.9375rem] leading-normal text-text placeholder:text-text-subtle
    ${disabled ? 'bg-neutral-100' : 'bg-white'}
    ${error ? 'border-2 border-red-600' : 'border border-border'}
    rounded-[14px]
    ${showPasswordToggle && type === 'password' ? 'pr-11' : ''}
    px-4 py-3.5
    min-h-[44px]
    transition-all duration-200 ease-out
    outline-none
    focus:border-accent focus:ring-4 focus:ring-accent/20
    disabled:opacity-60 disabled:cursor-not-allowed
    ${error ? 'focus:border-red-600 focus:ring-red-600/30' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`${className} w-full mb-0`}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold leading-tight text-text"
        >
          {label}
          {required && (
            <span aria-label="required" className="ml-1 text-red-600">
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
          autoCapitalize={autoCapitalizeAttr}
          autoCorrect={type === 'email' ? 'off' : 'on'}
          className={inputClasses}
          {...(value !== undefined && { value })}
          onChange={handleChange}
          {...restProps}
          onBlur={handleBlur}
        />
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isPasswordVisible}
            onClick={() => setIsPasswordVisible((v) => !v)}
            className="absolute right-2 top-1/2 flex min-h-8 min-w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-transparent bg-transparent p-1 text-neutral-400 transition-colors duration-200 hover:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
          >
            {isPasswordVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      
      {helperText && !error && (
        <span id={helperId} className="mt-2 block text-[0.8125rem] leading-tight text-text-muted">
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
