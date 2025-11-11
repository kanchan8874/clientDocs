import { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';

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
    rounded-xl border-2 border-dashed border-slate-200 bg-white/90
    p-8 text-center shadow-sm
    transition-all duration-200 ease-out
    min-h-[10rem]
    cursor-pointer outline-none
    focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:ring-offset-2
    ${isDragging ? 'border-primary bg-primary/12 scale-[1.01]' : ''}
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
          <Upload size={36} className={isDragging ? 'text-primary' : 'text-slate-500'} aria-hidden="true" />
          <p className="my-4 mt-2 text-base leading-normal text-slate-900">
            Drag &amp; drop your file here, or <span className="font-semibold text-primary underline underline-offset-2">browse</span>
          </p>
          <p className="m-0 text-sm leading-normal text-slate-600">
            Accepted: {accept.replace(/\./g, '').toUpperCase()} • Max size: {maxSize / (1024 * 1024)}MB
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-md">
          <File size={24} className="text-primary" aria-hidden="true" />
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-base font-medium leading-normal text-slate-900">{selectedFile.name}</span>
            <span className="text-sm leading-normal text-slate-600">{formatFileSize(selectedFile.size)}</span>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            aria-label={`Remove ${selectedFile.name}`}
            className="flex min-w-[44px] min-h-[44px] items-center justify-center rounded-lg border border-transparent bg-transparent p-2 text-red-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
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
