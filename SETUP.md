# Setup Guide - ClientDocs

Complete setup instructions for running the ClientDocs application.

## Prerequisites

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB**
   - Local MongoDB: https://www.mongodb.com/try/download/community
   - OR MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
   - Verify installation: `mongod --version`

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with your configuration
# Use a text editor to update the following:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (generate a random secret key)
# - CORS_ORIGIN (frontend URL, default: http://localhost:5173)
# Note: Update MONGODB_URI in backend/.env file
```

**Important .env variables:**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clientdocs
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**Generate JWT Secret:**
```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file (usually doesn't need changes)
# VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup

**Option A: Local MongoDB**

```bash
# Start MongoDB (macOS/Linux)
mongod

# Or if installed via Homebrew (macOS)
brew services start mongodb-community

# Windows
# MongoDB usually runs as a service automatically
```

**Option B: MongoDB Atlas (Cloud)**

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`

### 4. Seed Database (Optional)

```bash
# From backend directory
cd backend

# Run seed script to create test users and clients
npm run seed

# Test credentials will be displayed:
# User 1: john@example.com / password123
# User 2: jane@example.com / password123
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Backend should start on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend should start on: http://localhost:5173

### 6. Access Application

1. Open browser: http://localhost:5173
2. Register a new user or use test credentials:
   - Email: `john@example.com`
   - Password: `password123`

## Verifying Installation

### Backend Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "ClientDocs API is running",
  "timestamp": "2025-11-04T..."
}
```

### MongoDB Connection

Check server logs for:
```
✅ MongoDB Connected: localhost:27017
📊 Database: clientdocs
```

## Troubleshooting

### Issue: Port Already in Use

**Backend (5000):**
```bash
# Find process using port 5000
lsof -ti:5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

**Frontend (5173):**
Change port in `frontend/vite.config.js`:
```javascript
server: {
  port: 3000, // Change to another port
}
```

### Issue: MongoDB Connection Failed

1. Check if MongoDB is running
2. Verify connection string in `.env`
3. Check firewall settings
4. For Atlas: Whitelist your IP address

### Issue: JWT Token Errors

- Ensure `JWT_SECRET` is set in `.env`
- Don't use default secret in production
- Clear browser localStorage if token issues persist

### Issue: CORS Errors

- Verify `CORS_ORIGIN` in `backend/.env` matches frontend URL
- Default: `http://localhost:5173`

### Issue: File Upload Fails

- Check `backend/uploads/` directory exists
- Ensure write permissions
- Verify file size < 5 MB
- Check file type (PDF, PNG, DOCX only)

## Production Deployment

### Backend

1. Set `NODE_ENV=production` in `.env`
2. Use strong `JWT_SECRET`
3. Configure proper `CORS_ORIGIN`
4. Use process manager (PM2):
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name clientdocs-api
   ```

### Frontend

```bash
cd frontend
npm run build
# Serve the `dist/` folder with a web server (nginx, Apache, etc.)
```

## Next Steps

1. ✅ Setup complete
2. ⏭️ Implement full CRUD for Clients page
3. ⏭️ Implement document upload and management
4. ⏭️ Add document sharing functionality
5. ⏭️ Create Postman collection
6. ⏭️ Record screen walkthrough

## Support

For issues or questions:
1. Check documentation in `/docs` folder
2. Review error logs in console
3. Verify all environment variables are set correctly
