
# ClientDocs - Client Document Manager

A secure MERN stack application for managing client documents with role-based access control, file uploads, and sharing capabilities.

## 📁 Project Structure

```
ClientDocs/
├── backend/                # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/        # Configuration files (DB, Cloudinary, etc.)
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Custom middleware (auth, validation, etc.)
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Helper functions
│   │   └── app.js         # Express app setup
│   ├── uploads/           # Local file storage (if not using Cloudinary)
│   ├── .env.example       # Environment variables template
│   └── package.json
│
├── frontend/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── api/           # API service functions
│   │   ├── contexts/      # React Context for state management
│   │   ├── utils/         # Helper functions
│   │   ├── hooks/         # Custom React hooks
│   │   ├── App.js         # Main App component
│   │   └── main.js        # Entry point
│   ├── .env.example       # Frontend environment variables
│   └── package.json
│
├── docs/                   # Documentation
│   ├── architecture.md    # Architecture overview
│   ├── database-schema.md # Database schema documentation
│   └── decision-log.md    # Decision log
│
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clientdocs
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

## 📚 Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- Multer for file uploads
- Cloudinary for file storage (optional)
- Zod for validation
- Helmet for security
- CORS for cross-origin requests
- Express Rate Limit for rate limiting

### Frontend
- React 18
- Vite
- React Router
- Axios for API calls
- Context API for state management

## 🔒 Security Features

- JWT-based authentication with expiry
- File type validation (PDF, PNG, DOCX only)
- File size limit (5 MB)
- Filename sanitization
- Input validation with Zod
- CORS protection
- Helmet security headers
- Rate limiting
- MongoDB least-privilege access
- Access control middleware

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Clients
- `GET /api/clients` - Get all clients (authenticated user)
- `POST /api/clients` - Create a new client
- `GET /api/clients/:id` - Get client by ID
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Documents
- `GET /api/documents` - Get documents (with filters)
- `POST /api/documents` - Upload new document
- `GET /api/documents/:id` - Get document by ID
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/share` - Share document with users

## 🧪 Testing

### Seed Database
```bash
cd backend
npm run seed
```

### Test Scripts
```bash
cd backend
npm run test
```

## 📦 Deliverables

- ✅ Git repository with readable commits
- ✅ README with setup instructions
- ✅ Architecture documentation
- ✅ Database schema diagram
- ✅ Postman collection
- ✅ Screen recording (to be added)
- ✅ Walkthrough document
- ✅ Decision log
- ✅ Seed & test scripts

## 👨‍💻 Developer

Kanchan

## 📅 Deadline

Friday, November 7, 2025 – 6:00 PM IST
>>>>>>> main
