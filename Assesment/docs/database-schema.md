# Database Schema Documentation

## Collections

### 1. Users

Stores user authentication and profile information.

**Fields:**
- `_id`: ObjectId (Primary Key)
- `name`: String (required, max 100 chars)
- `email`: String (required, unique, indexed, lowercase)
- `password`: String (required, hashed with bcrypt, min 6 chars)
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:**
- `email`: Unique index for fast lookups

### 2. Clients

Represents client entities created by users.

**Fields:**
- `_id`: ObjectId (Primary Key)
- `name`: String (required, max 200 chars)
- `email`: String (optional, lowercase)
- `phone`: String (optional)
- `company`: String (optional, max 200 chars)
- `address`: String (optional)
- `createdBy`: ObjectId (required, references Users, indexed)
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:**
- `createdBy`: Index for user queries
- `createdBy + createdAt`: Compound index for sorted user queries

**Relationships:**
- Belongs to: User (via `createdBy`)
- Has many: Documents (via `clientId`)

### 3. Documents

Represents uploaded documents/files with metadata.

**Fields:**
- `_id`: ObjectId (Primary Key)
- `title`: String (required, max 200 chars)
- `description`: String (optional, max 1000 chars)
- `category`: Enum ['Proposal', 'Invoice', 'Report', 'Contract'] (required, indexed)
- `file`: Object
  - `originalName`: String (required)
  - `fileName`: String (required, sanitized)
  - `filePath`: String (required, local path or Cloudinary URL)
  - `fileType`: Enum ['application/pdf', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] (required)
  - `fileSize`: Number (required, in bytes)
  - `cloudinaryId`: String (optional)
- `uploadDate`: Date (default: now, indexed)
- `accessLevel`: Enum ['private', 'shared', 'public'] (required, default: 'private', indexed)
- `clientId`: ObjectId (required, references Clients, indexed)
- `createdBy`: ObjectId (required, references Users, indexed)
- `sharedWith`: Array of ObjectId (references Users)
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:**
- `category`: For filtering by category
- `uploadDate`: For date-based filtering
- `accessLevel`: For filtering by access level
- `clientId`: For client-based queries
- `createdBy`: For owner queries
- `clientId + uploadDate`: Compound index for client documents sorted by date
- `createdBy + uploadDate`: Compound index for user documents sorted by date
- `accessLevel + sharedWith`: Compound index for shared document queries
- `accessLevel + uploadDate`: Compound index for public documents
- `title + description`: Text search index

**Relationships:**
- Belongs to: Client (via `clientId`)
- Belongs to: User (via `createdBy`, creator/owner)
- Many-to-Many: Users (via `sharedWith`, sharing relationship)

## ER Diagram (Text Representation)

```
Users
  |
  | (1:N)
  v
Clients
  |
  | (1:N)
  v
Documents

Users <-(M:N)-> Documents (via sharedWith)
```

## Access Control Logic

### Document Access Rules

1. **Private Documents** (`accessLevel: 'private'`)
   - Only accessible by creator (`createdBy`)

2. **Shared Documents** (`accessLevel: 'shared'`)
   - Accessible by creator
   - Accessible by users in `sharedWith` array

3. **Public Documents** (`accessLevel: 'public'`)
   - Accessible by all authenticated users

### Query Patterns

**Get user's own documents:**
```javascript
{ createdBy: userId }
```

**Get shared documents for user:**
```javascript
{
  $or: [
    { createdBy: userId, accessLevel: 'shared' },
    { accessLevel: 'shared', sharedWith: userId }
  ]
}
```

**Get public documents:**
```javascript
{ accessLevel: 'public' }
```

**Get all accessible documents for user:**
```javascript
{
  $or: [
    { createdBy: userId },
    { accessLevel: 'public' },
    { accessLevel: 'shared', sharedWith: userId }
  ]
}
```
