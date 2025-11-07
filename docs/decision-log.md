# Decision Log

This document tracks important technical decisions, challenges, and trade-offs made during development.

## Technology Choices

### Backend Framework: Express.js
**Decision**: Use Express.js for the backend API
**Rationale**: 
- Mature and widely used
- Large ecosystem
- Good documentation
- Easy to implement middleware pattern

### Database: MongoDB
**Decision**: Use MongoDB for data storage
**Rationale**:
- Flexible schema for documents with varying metadata
- Good support for nested objects (file metadata)
- Easy to model relationships with references
- Fast queries with proper indexing

### Authentication: JWT
**Decision**: Use JSON Web Tokens for authentication
**Rationale**:
- Stateless authentication
- Scalable for distributed systems
- Industry standard
- Easy to implement expiry

### Validation: Zod
**Decision**: Use Zod for input validation
**Rationale**:
- TypeScript-first (good for future migration)
- Great error messages
- Schema composition
- Runtime type checking

### File Upload: Multer
**Decision**: Use Multer for handling file uploads
**Rationale**:
- Standard for Express.js
- Good middleware integration
- Supports file validation
- Easy to configure

### Frontend: React + Vite
**Decision**: Use React with Vite
**Rationale**:
- Fast development with Vite HMR
- Modern React features
- Good performance
- Easy to build and deploy

### State Management: Context API
**Decision**: Use React Context API instead of Redux
**Rationale**:
- Built-in to React
- Sufficient for this project size
- Less boilerplate
- Easier to understand

## Architecture Decisions

### File Storage: Local vs Cloudinary
**Decision**: Support both local storage and Cloudinary
**Rationale**:
- Local storage for development/testing
- Cloudinary for production scalability
- Easy to switch via environment variables

### Access Control: Database-level vs Application-level
**Decision**: Application-level access control
**Rationale**:
- More flexible
- Can implement complex sharing logic
- Easier to audit
- Better for multi-user scenarios

### Validation: Where to validate?
**Decision**: Validate at multiple layers
**Rationale**:
- Frontend: Better UX (immediate feedback)
- Backend: Security (prevent malicious requests)
- Database: Data integrity (MongoDB schema validation)

## Challenges & Solutions

### Challenge 1: File Upload Security
**Problem**: Preventing path traversal and malicious file uploads
**Solution**: 
- Sanitize filenames (remove special chars, prevent ..)
- Validate file type (MIME type check)
- Limit file size (5 MB max)
- Store in controlled directory

### Challenge 2: Sharing Documents
**Problem**: How to efficiently query shared documents
**Solution**:
- Use compound index on `accessLevel + sharedWith`
- Store user IDs in `sharedWith` array
- Use MongoDB `$in` operator for queries

### Challenge 3: File Deletion
**Problem**: When document is deleted, file should also be deleted
**Solution**:
- Delete file from filesystem in controller
- Use try-catch to handle errors gracefully
- Document path stored in database for reference

## Trade-offs

### Trade-off 1: Indexing Strategy
**Pros**: Fast queries
**Cons**: Slightly slower writes, more storage
**Decision**: Optimize for read-heavy workload (users query documents more than upload)

### Trade-off 2: File Storage Location
**Pros (Local)**: Simple, no external dependencies
**Cons (Local)**: Doesn't scale well, backup concerns
**Decision**: Support both, recommend Cloudinary for production

### Trade-off 3: Validation Schema Duplication
**Pros**: Frontend validation gives immediate feedback
**Cons**: Code duplication between frontend and backend
**Decision**: Accept duplication for better UX, backend validation is non-negotiable

## References

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Indexes](https://docs.mongodb.com/manual/indexes/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Zod Documentation](https://zod.dev/)
- [Multer Documentation](https://github.com/expressjs/multer)
- [React Context API](https://react.dev/reference/react/useContext)
