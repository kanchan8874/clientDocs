import mongoose from 'mongoose';


const clientSchema = new mongoose.Schema({    // clientSchema
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [50, 'Client name cannot exceed 50 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  address: {
    type: String,
    trim: true
  },
  // Reference to the user who created this client
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for faster queries
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});


clientSchema.index({ createdBy: 1, createdAt: -1 });

const Client = mongoose.model('Client', clientSchema);

export default Client;
