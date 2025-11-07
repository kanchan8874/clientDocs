import React, { useEffect, useRef } from 'react';
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
    md: 'max-w-[40rem]',
    lg: 'max-w-[52rem]',
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
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start md:items-center justify-center z-[1040] p-4 pt-20 md:pt-4"
      onClick={handleOverlayClick}
    >
      <div className={`
        relative bg-white/95 rounded-3xl
        ${title ? 'p-8' : 'p-6'}
        w-full max-h-[85vh] overflow-y-auto overflow-x-hidden scrollbar-hidden
        shadow-soft-glow border border-white/70 backdrop-blur-xl
        outline-none flex flex-col
        ${sizeClasses[size] || sizeClasses.md}
      `.trim().replace(/\s+/g, ' ')}>
        {(title || onClose) && (
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/60">
            {title && (
              <h2 id="modal-title" className="text-2xl font-semibold text-slate-900 m-0 leading-tight">
                {title}
              </h2>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="bg-transparent border-none cursor-pointer text-slate-600 p-2 rounded-lg flex items-center justify-center min-w-[44px] min-h-[44px] transition-colors duration-200 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
