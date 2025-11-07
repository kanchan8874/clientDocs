import multer from 'multer';

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Max file size: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Use memory storage; files will be streamed to Cloudinary in the controller
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file type is allowed
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: PDF, PNG, DOCX`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

// Single file upload middleware
export const uploadSingle = upload.single('file');

// Error handler for multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5 MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};
