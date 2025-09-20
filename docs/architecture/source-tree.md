# Source Tree Structure

## Overview

The e-commerce platform follows a **monorepo structure** with clear separation between frontend, backend, shared packages, and documentation. This organization enables coordinated development between components while maintaining clean boundaries and shared utilities.

## Root Directory Structure

```
ecommerce-platform/
├── .github/                    # CI/CD workflows and GitHub configuration
│   └── workflows/
│       ├── ci.yml              # Continuous integration pipeline
│       └── deploy.yml          # Deployment automation
├── apps/                       # Application packages in monorepo
│   ├── backend/                # Express.js API server
│   └── frontend/               # Angular application
├── packages/                   # Shared packages
│   ├── shared-types/          # TypeScript interfaces
│   └── shared-utils/          # Shared utility functions
├── docs/                      # Project documentation
│   ├── prd.md
│   ├── architecture.md
│   └── api.md
├── .env.example               # Environment variables template
├── .gitignore
├── docker-compose.yml         # Local development setup
├── package.json               # Root package.json with npm workspaces
└── README.md
```

## Backend Structure (`apps/backend/`)

### Complete Backend Directory Tree
```
apps/backend/
├── src/
│   ├── controllers/           # HTTP request handlers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   └── orderController.js
│   ├── services/             # Business logic layer
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   └── orderService.js
│   ├── models/               # Mongoose schema definitions
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── middleware/           # Express middleware functions
│   │   ├── auth.js           # JWT authentication
│   │   ├── validation.js     # Request validation
│   │   ├── errorHandler.js
│   │   └── cors.js
│   ├── routes/               # Route definitions
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   └── orders.js
│   ├── config/               # Configuration files
│   │   ├── database.js
│   │   ├── jwt.js
│   │   └── upload.js
│   ├── utils/                # Utility functions
│   │   ├── logger.js
│   │   ├── validation.js
│   │   └── helpers.js
│   └── app.js                # Express application setup
├── tests/                    # Backend test suites
│   ├── controllers/
│   ├── services/
│   └── integration/
├── uploads/                  # File upload directory
└── package.json
```

### Backend File Responsibilities

#### Controllers (`src/controllers/`)
- **Purpose**: Handle HTTP requests and responses
- **Responsibilities**: Request parsing, response formatting, error handling
- **Dependencies**: Services for business logic, middleware for validation

#### Services (`src/services/`)
- **Purpose**: Implement business logic and data operations
- **Responsibilities**: Business rules, data validation, database interactions
- **Dependencies**: Models for data access, utilities for helper functions

#### Models (`src/models/`)
- **Purpose**: Define database schemas and data models
- **Responsibilities**: Data structure, validation rules, database relationships
- **Dependencies**: Mongoose ODM, validation libraries

#### Middleware (`src/middleware/`)
- **Purpose**: Process requests before reaching controllers
- **Responsibilities**: Authentication, validation, logging, error handling
- **Dependencies**: JWT libraries, validation schemas

#### Routes (`src/routes/`)
- **Purpose**: Define API endpoints and route handlers
- **Responsibilities**: URL routing, middleware composition, controller delegation
- **Dependencies**: Controllers, middleware, validation schemas

## Frontend Structure (`apps/frontend/`)

### Complete Frontend Directory Tree
```
apps/frontend/
├── src/
│   ├── app/
│   │   ├── core/             # Singleton services and guards
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   └── interceptors/
│   │   ├── shared/           # Reusable components
│   │   │   ├── components/
│   │   │   ├── pipes/
│   │   │   └── directives/
│   │   ├── features/         # Feature modules
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   └── orders/
│   │   ├── layout/           # Layout components
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   └── sidebar/
│   │   ├── store/            # NgRx state management
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   └── orders/
│   │   └── app.module.ts
│   ├── assets/               # Static assets
│   └── environments/         # Environment configurations
├── angular.json
└── package.json
```

### Frontend Module Organization

#### Core Module (`src/app/core/`)
- **Purpose**: Singleton services and application-wide functionality
- **Services**: Authentication, HTTP interceptors, global error handling
- **Guards**: Route protection, authentication guards
- **Interceptors**: JWT token injection, error handling

#### Shared Module (`src/app/shared/`)
- **Purpose**: Reusable components and utilities
- **Components**: Common UI components, form controls
- **Pipes**: Data transformation utilities
- **Directives**: Custom DOM manipulation

#### Feature Modules (`src/app/features/`)
- **Purpose**: Feature-specific functionality
- **Structure**: Each feature has components, services, and routing
- **Examples**: Auth module, Products module, Cart module

#### Layout Module (`src/app/layout/`)
- **Purpose**: Application layout and navigation
- **Components**: Header, footer, sidebar, navigation
- **Responsibilities**: Consistent layout across application

#### Store Module (`src/app/store/`)
- **Purpose**: NgRx state management
- **Structure**: Actions, reducers, effects, selectors per feature
- **Organization**: Feature-based state management

## Shared Packages (`packages/`)

### Shared Types (`packages/shared-types/`)
```
packages/shared-types/
├── src/
│   ├── user.types.ts
│   ├── product.types.ts
│   ├── cart.types.ts
│   └── order.types.ts
└── package.json
```

### Shared Utils (`packages/shared-utils/`)
```
packages/shared-utils/
├── src/
│   ├── validation.ts
│   ├── constants.ts
│   └── helpers.ts
└── package.json
```

## Configuration Files

### Root Level Configuration
- **package.json**: Monorepo workspace configuration with npm workspaces
- **docker-compose.yml**: Local development environment setup
- **.env.example**: Environment variable template
- **.gitignore**: Version control exclusions

### Backend Configuration
- **package.json**: Backend dependencies and scripts
- **tsconfig.json**: TypeScript configuration for Node.js
- **jest.config.js**: Testing configuration

### Frontend Configuration
- **package.json**: Frontend dependencies and scripts
- **angular.json**: Angular CLI configuration
- **tsconfig.json**: TypeScript configuration for Angular

## Development Infrastructure

### CI/CD Configuration (`.github/workflows/`)
```
.github/workflows/
├── ci.yml                    # Continuous integration
└── deploy.yml                # Deployment automation
```

### Docker Configuration
- **docker-compose.yml**: Multi-service development environment
- **Dockerfile** (per app): Container definitions for backend/frontend

### Documentation (`docs/`)
```
docs/
├── prd.md                    # Product requirements
├── architecture.md           # Technical architecture
├── api.md                    # API documentation
└── deployment.md             # Deployment guide
```

## File Naming Conventions

### Backend Files
- **Controllers**: `camelCase` + `Controller.js` (e.g., `userController.js`)
- **Services**: `camelCase` + `Service.js` (e.g., `authService.js`)
- **Models**: `PascalCase.js` (e.g., `User.js`, `Product.js`)
- **Middleware**: `camelCase.js` (e.g., `auth.js`, `validation.js`)

### Frontend Files
- **Components**: `kebab-case.component.ts` (e.g., `user-profile.component.ts`)
- **Services**: `kebab-case.service.ts` (e.g., `auth.service.ts`)
- **Guards**: `kebab-case.guard.ts` (e.g., `auth.guard.ts`)
- **Interceptors**: `kebab-case.interceptor.ts` (e.g., `jwt.interceptor.ts`)

## Import/Export Patterns

### Backend Module Exports
```javascript
// Service exports
module.exports = {
  UserService,
  AuthService,
  ProductService
};

// Model exports
module.exports = User;
```

### Frontend Module Exports
```typescript
// Feature module exports
export { AuthModule } from './auth/auth.module';
export { ProductsModule } from './products/products.module';

// Service exports
export { AuthService } from './auth.service';
export { ProductService } from './product.service';
```

## Build Output Structure

### Production Build Directories
```
dist/
├── backend/                  # Compiled backend code
├── frontend/                 # Angular build output
└── shared/                   # Compiled shared packages
```

This source tree structure ensures clear separation of concerns, maintainable code organization, and efficient development workflows across the entire e-commerce platform.