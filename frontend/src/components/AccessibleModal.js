import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';


const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  children,
  ariaLabel,
  ariaDescribedBy,
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  closeOnOverlayClick = true,
  closeOnEscape = true
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      
      setTimeout(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 100);

      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap
  useEffect(() => {
    const handleTab = (e) => {
      if (!isOpen || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleTab);
    }

    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-[28rem]',
    md: 'max-w-[42rem]',
    lg: 'max-w-[54rem]',
    xl: 'max-w-[72rem]'
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      ref={modalRef}
      tabIndex={-1}
      className="fixed inset-0 z-[1040] flex items-center justify-center bg-neutral-900/40 px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-10 lg:py-16 backdrop-blur-lg"
      onClick={handleOverlayClick}
    >
      <div className={`
        relative flex w-full flex-col overflow-x-hidden overflow-y-auto rounded-3xl border border-border bg-white/95 scrollbar-hidden
        ${title ? 'p-6 sm:p-7 lg:p-8' : 'p-5 sm:p-6 lg:p-7'}
        max-h-[85vh] sm:max-h-[80vh] md:max-h-[75vh] lg:max-h-[70vh]
        shadow-surface backdrop-blur-sm outline-none
        ${sizeClasses[size] || sizeClasses.md}
      `.trim().replace(/\s+/g, ' ')}>
        {(title || onClose) && (
          <div className="mb-6 flex items-start justify-between border-b border-border pb-4">
            {title && (
              <h2 id="modal-title" className="m-0 text-2xl font-semibold leading-tight text-text">
                {title}
              </h2>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl border border-transparent bg-transparent p-2 text-text-subtle transition-colors duration-200 hover:bg-primary-50 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <X size={20} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default AccessibleModal;
