# Architecture Overview

## System Architecture

### High-Level Architecture

ClientDocs follows a **3-tier architecture**:

1. **Presentation Layer (Frontend)**: React + Vite
2. **Application Layer (Backend)**: Node.js + Express
3. **Data Layer**: MongoDB

## Backend Architecture

### Directory Structure

```
backend/
├── src/
│   ├── config/         # Configuration (DB, Cloudinary)
│   ├── controllers/    # Request handlers (business logic)
│   ├── middleware/     # Custom middleware (auth, validation, upload)
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API route definitions
│   ├── utils/          # Helper functions
│   ├── scripts/        # Seed and test scripts
│   ├── app.js          # Express app configuration
│   └── server.js       # Server entry point
└── uploads/            # File storage directory
```

### Request Flow

1. Client makes HTTP request → Express server
2. Route matches → Middleware chain (CORS, Helmet, Rate Limit)
3. Authentication middleware (authGuard) verifies JWT
4. Validation middleware (Zod) validates input
5. Controller handles business logic
6. Model interacts with MongoDB
7. Response sent back to client

### Security Layers

1. **Helmet**: Security headers
2. **CORS**: Cross-origin resource sharing (restricted origin)
3. **Rate Limiting**: Prevent abuse
4. **JWT Authentication**: Token-based auth
5. **Input Validation**: Zod schemas
6. **File Validation**: Type and size checks
7. **Filename Sanitization**: Path traversal prevention

## Frontend Architecture

### Directory Structure

```
frontend/
├── src/
│   ├── api/            # API service functions
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React Context (state management)
│   ├── pages/          # Page components
│   ├── utils/          # Helper functions
│   ├── hooks/          # Custom React hooks
│   ├── App.js          # Main app component with routing
│   └── main.js         # Entry point
```

### State Management

- **React Context API**: For authentication state
- **Local State**: Component-level state with useState
- **API Calls**: Centralized in `/api` directory

### Routing

- **React Router**: Client-side routing
- **Private Routes**: Protected routes requiring authentication
- **Public Routes**: Login and Register pages

## Database Schema

### Relationships

- **User** → **Client** (One-to-Many)
- **Client** → **Document** (One-to-Many)
- **User** → **Document** (One-to-Many, creator relationship)
- **User** ↔ **Document** (Many-to-Many, sharing relationship)

### Indexes

- User: `email` (unique)
- Client: `createdBy`, `createdBy + createdAt` (compound)
- Document: `category`, `uploadDate`, `accessLevel`, `clientId`, `createdBy`, `createdBy + uploadDate` (compound), `accessLevel + sharedWith`, `title + description` (text search)

## API Design

### RESTful Endpoints

- `/api/auth/*` - Authentication
- `/api/clients/*` - Client management
- `/api/documents/*` - Document management

### Response Format

```json
{
  "success": true/false,
  "message": "Optional message",
  "data": { ... }
}
```

## File Storage

### Options

1. **Local Storage**: Files stored in `backend/uploads/`
2. **Cloudinary** (Optional): Cloud-based storage

### File Metadata

Stored in MongoDB:
- Original filename
- Sanitized filename
- File path/URL
- File type (MIME)
- File size
- Cloudinary ID (if applicable)

## Security Considerations

1. **Authentication**: JWT with expiry
2. **Authorization**: Owner-based access control
3. **File Upload**: Type and size validation
4. **Input Sanitization**: Zod validation
5. **Filename Sanitization**: Path traversal prevention
6. **Environment Variables**: Sensitive data in .env
7. **Error Handling**: No stack traces in production
