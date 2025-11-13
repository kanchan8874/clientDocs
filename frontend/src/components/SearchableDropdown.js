import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

const SearchableDropdown = ({
  id,
  label,
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  error,
  required = false,
  ariaLabel,
  className = '',
  maxHeight = '200px',
  showSearch = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search query (only if search is enabled)
  const filteredOptions = showSearch 
    ? options.filter(option => {
        const searchLower = searchQuery.toLowerCase();
        const optionLabel = typeof option === 'string' ? option : option.label || option.name || '';
        return optionLabel.toLowerCase().includes(searchLower);
      })
    : options;

  // Get selected option label
  const selectedOption = options.find(opt => {
    const optValue = typeof opt === 'string' ? opt : opt.value || opt._id || '';
    return optValue === value;
  });
  const selectedLabel = selectedOption 
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label || selectedOption.name || '')
    : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens (only if search is enabled)
      if (showSearch) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Calculate dropdown position to stay within viewport
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If not enough space below but enough above, show above
      if (spaceBelow < 250 && spaceAbove > 250) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  const handleSelect = (optionValue, optionLabel) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery('');
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-text">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        onClick={handleToggle}
        aria-label={ariaLabel || label || 'Select option'}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={error ? 'true' : 'false'}
        className={`w-full flex items-center justify-between cursor-pointer rounded-2xl border px-4 py-3.5 text-sm font-sans text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
          error 
            ? 'border-red-500 bg-white' 
            : isOpen 
              ? 'border-accent bg-white' 
              : 'border-border bg-white hover:border-accent/50'
        }`}
      >
        <span className={`flex-1 text-left truncate ${value ? 'text-text' : 'text-text-muted'}`}>
          {selectedLabel}
        </span>
        <ChevronDown 
          size={18} 
          className={`flex-shrink-0 ml-2 text-text-subtle transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="listbox"
          className={`absolute z-[1050] w-full mt-1 rounded-xl border border-slate-200 bg-white shadow-lg backdrop-blur-sm ${
            dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full'
          }`}
          style={{ maxHeight: maxHeight, overflow: 'hidden' }}
        >
          {/* Search Input - Only show if search is enabled */}
          {showSearch && (
            <div className="sticky top-0 bg-white border-b border-slate-200 p-2 z-10">
              <div className="relative">
                <Search 
                  size={16} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" 
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  aria-label="Search options"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div 
            className="overflow-y-auto scrollbar-hidden"
            style={{ maxHeight: showSearch ? `calc(${maxHeight} - 60px)` : maxHeight }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option.value || option._id || '';
                const optionLabel = typeof option === 'string' ? option : option.label || option.name || '';
                const isSelected = optionValue === value;

                return (
                  <button
                    key={optionValue || index}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(optionValue, optionLabel)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${
                      isSelected
                        ? 'bg-accent/10 text-accent font-medium'
                        : 'text-text hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && (
                      <Check size={16} className="flex-shrink-0 text-accent" aria-hidden="true" />
                    )}
                    <span className={`flex-1 truncate ${isSelected ? '' : 'ml-6'}`} title={optionLabel}>
                      {optionLabel}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
};

export default SearchableDropdown;

