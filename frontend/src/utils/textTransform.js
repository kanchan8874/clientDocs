/**
 * Text transformation utilities for form inputs
 * Provides auto-capitalization and email normalization
 */

/**
 * Capitalizes the first letter of a string while preserving the rest
 * @param {string} text - The text to capitalize
 * @returns {string} - Text with first letter capitalized
 */
export const capitalizeFirstLetter = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // If text is empty, return as is
  if (text.length === 0) return text;
  
  // Capitalize first letter, keep rest as is
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Converts email to lowercase
 * @param {string} email - The email to normalize
 * @returns {string} - Lowercase email
 */
export const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return email;
  return email.toLowerCase().trim();
};

/**
 * Handles text transformation based on input type
 * - Email fields: converts to lowercase
 * - Text fields: capitalizes first letter
 * @param {string} value - The input value
 * @param {string} type - The input type (email, text, etc.)
 * @returns {string} - Transformed value
 */
export const transformInputValue = (value, type) => {
  if (!value || typeof value !== 'string') return value;
  
  // Email fields: always lowercase
  if (type === 'email') {
    return normalizeEmail(value);
  }
  
  // Text fields: capitalize first letter
  // This handles name, title, company, etc.
  return capitalizeFirstLetter(value);
};

/**
 * Creates an onChange handler that applies text transformation
 * @param {Function} originalOnChange - The original onChange handler
 * @param {string} type - The input type
 * @param {boolean} autoCapitalize - Whether to auto-capitalize (default: true for text, false for email)
 * @returns {Function} - Wrapped onChange handler
 */
export const createTransformedOnChange = (originalOnChange, type, autoCapitalize = true) => {
  return (e) => {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    const originalValue = input.value;
    
    let transformedValue;
    
    if (type === 'email') {
      // Email: always lowercase
      transformedValue = normalizeEmail(originalValue);
    } else if (autoCapitalize) {
      // Text fields: capitalize first letter
      // Only capitalize if cursor is at the start or if the first character is being changed
      if (cursorPosition === 0 || originalValue.length === 0) {
        transformedValue = capitalizeFirstLetter(originalValue);
      } else {
        // If user is typing in the middle, preserve their input but ensure first letter is capitalized
        const firstChar = originalValue.charAt(0);
        const rest = originalValue.slice(1);
        transformedValue = firstChar.toUpperCase() + rest;
      }
    } else {
      transformedValue = originalValue;
    }
    
    // Update the input value
    input.value = transformedValue;
    
    // Restore cursor position (adjust if length changed)
    const lengthDiff = transformedValue.length - originalValue.length;
    const newCursorPosition = Math.max(0, cursorPosition + lengthDiff);
    
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
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };
};

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

