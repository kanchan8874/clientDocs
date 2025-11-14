const AccessibleButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  icon,
  iconPosition = 'left', // 'left' or 'right'
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-sm px-5 py-2.5 min-w-0',
    md: 'text-[0.9375rem] px-6 py-3.5',
    lg: 'text-lg px-8 py-4'
  };

  const variantClasses = {
    primary: disabled || loading
      ? 'bg-neutral-300 text-white shadow-none'
      : 'bg-gradient-to-r from-accent to-primary-600 text-white shadow-soft-glow hover:shadow-[0_10px_30px_-5px_rgba(59,130,246,0.4),0_0_15px_rgba(59,130,246,0.2)] hover:-translate-y-0.5 active:translate-y-0',
    secondary: disabled || loading
      ? 'bg-neutral-100 text-text-muted border border-border shadow-none'
      : 'bg-white text-accent border border-border shadow-sm hover:bg-primary-50 hover:text-primary-700',
    danger: disabled || loading
      ? 'bg-rose-300 text-white shadow-none'
      : 'bg-danger text-white shadow-md hover:bg-danger-dark hover:shadow-lg',
    ghost: disabled || loading
      ? 'bg-transparent text-text-muted border border-border shadow-none'
      : 'bg-transparent text-text border border-border hover:bg-primary-50'
  };

  const baseClasses = `
    font-semibold leading-normal
    min-h-[44px] min-w-[44px]
    rounded-2xl
    transition-all duration-200 ease-in-out
    inline-flex items-center justify-center gap-2
    focus:outline-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/25 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && !loading && onClick) {
        onClick(e);
      }
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      className={baseClasses}
      {...props}
    >
      {loading && (
        <span
          role="status"
          aria-live="polite"
          aria-label="Loading"
          className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${
            iconPosition === 'left' ? 'mr-2' : iconPosition === 'right' ? 'ml-2' : ''
          }`}
        />
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {!loading && children}
      {!loading && icon && iconPosition === 'right' && icon}
      {loading && <span className="sr-only">Loading...</span>}
    </button>
  );
};

export default AccessibleButton;
