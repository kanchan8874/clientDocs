/**
 * Text transformation utilities for form inputs
 * Provides auto-capitalization and email normalization
 */

/**
 * Hook-like function to get auto-capitalize attribute value
 * @param {string} type - Input type
 * @param {string} fieldName - Field name (for context)
 * @returns {string} - autoCapitalize attribute value
 */
export const getAutoCapitalizeAttribute = (type, fieldName = '') => {
  // Email fields: never capitalize
  if (type === 'email') {
    return 'none';
  }
  
  // Password fields: never capitalize
  if (type === 'password') {
    return 'none';
  }
  
  // Phone/tel fields: never capitalize
  if (type === 'tel') {
    return 'none';
  }
  
  // Text fields that should capitalize words (names, titles, etc.)
  const wordFields = ['name', 'title', 'company', 'client'];
  if (wordFields.some(field => fieldName.toLowerCase().includes(field))) {
    return 'words';
  }
  
  // Address and description fields: capitalize sentences
  const sentenceFields = ['address', 'description'];
  if (sentenceFields.some(field => fieldName.toLowerCase().includes(field))) {
    return 'sentences';
  }
  
  // Default: capitalize first letter
  return 'sentences';
};

/**
 * Handles onChange for textarea with auto-capitalization
 * @param {Function} originalOnChange - The original onChange handler
 * @param {string} fieldName - Field name for context
 * @returns {Function} - Wrapped onChange handler
 */
export const createTextareaOnChange = (originalOnChange, fieldName = '') => {
  return (e) => {
    const textarea = e.target;
    const cursorPosition = textarea.selectionStart;
    const originalValue = textarea.value;
    
    let transformedValue;
    
    // For address and description: capitalize first letter of the text
    // For other fields: capitalize first letter
    if (originalValue.length > 0) {
      // Only capitalize if cursor is at the start or if the first character is being changed
      if (cursorPosition === 0 || originalValue.length === 0) {
        transformedValue = originalValue.charAt(0).toUpperCase() + originalValue.slice(1);
      } else {
        // If user is typing in the middle, preserve their input but ensure first letter is capitalized
        const firstChar = originalValue.charAt(0);
        const rest = originalValue.slice(1);
        transformedValue = firstChar.toUpperCase() + rest;
      }
    } else {
      transformedValue = originalValue;
    }
    
    // Create a new event with transformed value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: transformedValue
      }
    };
    
    // Call original onChange with transformed value
    if (originalOnChange) {
      originalOnChange(syntheticEvent);
    }
    
    // Restore cursor position after a brief delay
    setTimeout(() => {
      if (textarea && document.activeElement === textarea) {
        const lengthDiff = transformedValue.length - originalValue.length;
        const newCursorPosition = Math.max(0, Math.min(cursorPosition + lengthDiff, transformedValue.length));
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };
};

