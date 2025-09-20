# Coding Standards

## Core Standards

### Languages & Runtimes
- **TypeScript 5.3.x** for frontend development with strict mode enabled
- **Node.js 20.x LTS** for backend development with strict mode enabled
- **JavaScript ES2022+** features allowed with TypeScript compatibility

### Style & Linting
- **ESLint** with Angular and Node.js configurations
- **Prettier** for consistent code formatting across all files
- **Strict TypeScript** configuration with comprehensive type checking

### Test Organization
- **File Convention**: `.spec.ts` suffix co-located with source files for unit tests
- **Integration Tests**: `tests/integration/` directory for API endpoint testing
- **E2E Tests**: `e2e/` directory for end-to-end user journey testing

## Critical Rules

### Authentication Requirements
- **All API endpoints** except public routes MUST use JWT authentication middleware
- **Protected routes** must validate JWT tokens and handle authentication errors properly
- **User context** must be available in controllers through middleware injection

### Input Validation
- **All API inputs** MUST be validated using Joi schemas before processing business logic
- **Validation occurs** at API boundary in middleware before reaching controllers
- **Client-side validation** is for UX only - server-side validation is authoritative

### Error Response Format
- **All API errors** MUST use standardized error response format with code, message, and timestamp
- **Error codes** follow structured format (E001-E999) for programmatic handling
- **User-facing errors** provide clear, actionable messages without exposing internal details

### Database Access
- **Never use direct MongoDB queries** in controllers - always use service layer with Mongoose models
- **Controllers** orchestrate business logic but delegate data access to services
- **Service layer** abstracts database operations and business rules

### Password Security
- **Never log, store, or transmit passwords** in plain text
- **Always use bcrypt hashing** with appropriate salt rounds (minimum 12)
- **Password validation** must enforce complexity requirements

### Environment Variables
- **Never hardcode configuration values** - use environment variables with validation on startup
- **Environment validation** must occur at application startup with clear error messages
- **Secrets** must never appear in source code, logs, or error messages

## File Naming Conventions

### Backend (Node.js/Express)
```
- Controllers: `userController.js`, `productController.js`
- Services: `authService.js`, `emailService.js`
- Models: `User.js`, `Product.js` (PascalCase for Mongoose models)
- Middleware: `auth.js`, `validation.js`, `errorHandler.js`
- Routes: `auth.js`, `products.js`, `orders.js`
- Tests: `userController.spec.js`, `authService.spec.js`
```

### Frontend (Angular/TypeScript)
```
- Components: `user-profile.component.ts`, `product-list.component.ts`
- Services: `auth.service.ts`, `product.service.ts`
- Guards: `auth.guard.ts`, `admin.guard.ts`
- Interceptors: `jwt.interceptor.ts`, `error.interceptor.ts`
- Models: `user.interface.ts`, `product.interface.ts`
- Tests: `user-profile.component.spec.ts`, `auth.service.spec.ts`
```

## Code Structure Standards

### Backend Service Layer Pattern
```javascript
// Service layer handles business logic
class UserService {
  async createUser(userData) {
    // 1. Validate input
    // 2. Hash password
    // 3. Save to database
    // 4. Return sanitized user data
  }
}

// Controller handles HTTP concerns
class UserController {
  async register(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  }
}
```

### Frontend Component Pattern
```typescript
// Component focuses on presentation
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent {
  user$ = this.store.select(selectCurrentUser);

  constructor(
    private store: Store,
    private userService: UserService
  ) {}

  updateProfile(userData: UpdateUserRequest): void {
    this.store.dispatch(updateUser({ userData }));
  }
}
```

## Testing Standards

### Unit Testing Requirements
- **Coverage Goals**: Minimum 80% code coverage for backend services, 70% for frontend components
- **Test Structure**: Follow AAA pattern (Arrange, Act, Assert) for clear test organization
- **Mocking**: Mock all external dependencies including database calls and API requests
- **Edge Cases**: Cover both positive and negative test scenarios with appropriate assertions

### Test File Organization
```
backend/
├── src/
│   ├── services/
│   │   ├── userService.js
│   │   └── userService.spec.js
│   └── controllers/
│       ├── userController.js
│       └── userController.spec.js
└── tests/
    └── integration/
        └── userRoutes.spec.js

frontend/
└── src/app/
    ├── components/
    │   ├── user-profile/
    │   │   ├── user-profile.component.ts
    │   │   └── user-profile.component.spec.ts
    └── services/
        ├── user.service.ts
        └── user.service.spec.ts
```

## Security Standards

### Input Sanitization
```javascript
// Joi validation schema example
const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  firstName: Joi.string().trim().max(50).required(),
  lastName: Joi.string().trim().max(50).required()
});
```

### Error Handling
```javascript
// Standardized error response format
class ApiError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
  }
}

// Error handler middleware
function errorHandler(error, req, res, next) {
  const response = {
    error: {
      code: error.errorCode || 'E500',
      message: error.message,
      timestamp: error.timestamp || new Date().toISOString()
    }
  };
  res.status(error.statusCode || 500).json(response);
}
```

## Performance Standards

### Database Queries
- **Use indexes** for frequently queried fields
- **Implement pagination** for large result sets
- **Use projection** to limit returned fields
- **Avoid N+1 queries** with proper population strategies

### Frontend Performance
- **Lazy loading** for feature modules
- **OnPush change detection** for performance-critical components
- **TrackBy functions** for ngFor loops with dynamic data
- **Unsubscribe** from observables to prevent memory leaks

## Documentation Standards

### Code Comments
- **JSDoc comments** for all public methods and classes
- **Inline comments** for complex business logic
- **README files** for each major module or feature
- **API documentation** using OpenAPI/Swagger specifications

### Git Commit Standards
```
feat: add user authentication system
fix: resolve cart total calculation bug
docs: update API documentation for orders
test: add integration tests for payment flow
refactor: extract email service from user controller
```

## Import/Export Conventions

### Backend (CommonJS/ES Modules)
```javascript
// Named exports preferred
module.exports = {
  UserService,
  validateUser,
  hashPassword
};

// Import with destructuring
const { UserService, validateUser } = require('./userService');
```

### Frontend (ES Modules)
```typescript
// Named exports for services and utilities
export { AuthService, TokenService };

// Default exports for components
export default UserProfileComponent;

// Import conventions
import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
```