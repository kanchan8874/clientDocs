import React, { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';

/**
 * Accessible File Upload Component
 * WCAG 2.2 Level AA Compliant
 * 
 * Features:
 * - Keyboard accessible
 * - ARIA labels and error announcements
 * - Drag-and-drop with keyboard alternative
 * - Minimum touch target sizes
 */
const FileUpload = ({ 
  onFileSelect, 
  accept = '.pdf,.png,.docx', 
  maxSize = 5 * 1024 * 1024,
  id,
  ariaLabel,
  ariaDescribedBy,
  error
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [internalError, setInternalError] = useState('');
  const fileInputRef = useRef(null);
  const uploadZoneRef = useRef(null);
  
  const displayError = error || internalError;
  const inputId = id || `file-upload-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = displayError ? `${inputId}-error` : undefined;

  const validateFile = (file) => {
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      const errorMsg = `Invalid file type. Allowed: ${accept}`;
      setInternalError(errorMsg);
      return false;
    }

    if (file.size > maxSize) {
      const errorMsg = `File size exceeds ${maxSize / (1024 * 1024)}MB limit`;
      setInternalError(errorMsg);
      return false;
    }

    setInternalError('');
    return true;
  };

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      onFileSelect(null);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setInternalError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const uploadZoneClasses = `
    flex flex-col items-center justify-center
    p-8
    border-2 border-dashed rounded-md
    bg-gray-50
    cursor-pointer text-center
    transition-all duration-200
    min-h-[10rem]
    outline-none
    focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2
    ${isDragging ? 'border-primary bg-primary-light scale-[1.02]' : 'border-gray-300'}
    ${displayError ? 'border-red-600 bg-red-50' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        id={inputId}
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        aria-label={ariaLabel || 'File upload'}
        aria-describedby={[ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined}
        aria-invalid={displayError ? 'true' : 'false'}
      />
      
      {!selectedFile ? (
        <div
          ref={uploadZoneRef}
          role="button"
          tabIndex={0}
          aria-label={ariaLabel || 'Drag and drop file here or click to browse'}
          aria-describedby={ariaDescribedBy}
          onKeyDown={handleKeyDown}
          onClick={() => fileInputRef.current?.click()}
          className={uploadZoneClasses}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload size={36} className={isDragging ? 'text-primary' : 'text-gray-600'} aria-hidden="true" />
          <p className="text-base text-gray-800 my-4 mt-2 leading-normal">
            Drag & drop your file here, or <span className="text-primary font-semibold underline underline-offset-2">browse</span>
          </p>
          <p className="text-sm text-gray-600 m-0 leading-normal">
            Accepted: {accept.replace(/\./g, '').toUpperCase()} • Max size: {maxSize / (1024 * 1024)}MB
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-4 bg-white p-4 rounded-md border border-gray-300 shadow-sm">
          <File size={24} className="text-primary" aria-hidden="true" />
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-base text-gray-800 font-medium leading-normal">{selectedFile.name}</span>
            <span className="text-sm text-gray-600 leading-normal">{formatFileSize(selectedFile.size)}</span>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            aria-label={`Remove ${selectedFile.name}`}
            className="bg-transparent border-none cursor-pointer p-2 rounded-md flex items-center justify-center min-w-[44px] min-h-[44px] text-red-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:outline-2 focus-visible:outline-red-600 focus-visible:outline-offset-2"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}
      
      {displayError && (
        <span
          id={errorId}
          role="alert"
          aria-live="polite"
          className="block text-xs text-red-700 mt-1 leading-normal"
        >
          {displayError}
        </span>
      )}
    </div>
  );
};

export default FileUpload;
