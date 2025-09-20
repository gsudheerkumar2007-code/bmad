# High Level Architecture

### Technical Summary
The system employs a monolithic backend architecture using Express.js with MongoDB for data persistence, providing RESTful APIs consumed by an Angular single-page application. The architecture prioritizes development velocity and maintainability while ensuring clear separation between presentation, business logic, and data layers. Key architectural decisions include JWT-based stateless authentication, reactive state management with NgRx, and document-based data modeling optimized for e-commerce workflows supporting the complete user journey from product discovery through order fulfillment.

### High Level Overview
Based on the PRD's technical assumptions, the architecture follows a **Monolithic Backend** approach with Express.js serving RESTful endpoints to an Angular frontend. The **Monorepo** structure enables shared utilities and coordinated development between frontend and backend components. The primary user interaction flows through Angular components that communicate with Express.js controllers, which orchestrate business logic through service layers before persisting data in MongoDB. Key architectural decisions include using JWT tokens for stateless authentication, NgRx for predictable state management, and Mongoose ODM for data modeling with built-in validation and query optimization.

### High Level Project Diagram
```mermaid
graph TD
    A[User Browser] --> B[Angular SPA]
    B --> C[Express.js API Server]
    C --> D[MongoDB Database]
    
    B --> E[NgRx Store]
    E --> B
    
    C --> F[JWT Auth Middleware]
    C --> G[Validation Middleware]
    C --> H[Error Handler Middleware]
    
    C --> I[Product Service]
    C --> J[User Service]
    C --> K[Cart Service]
    C --> L[Order Service]
    
    I --> D
    J --> D
    K --> D
    L --> D
    
    C --> M[File Upload Service]
    M --> N[Static File Storage]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    Architectural and Design Patterns

Monolithic Backend with Layered Architecture: Express.js application organized into controllers, services, and data access layers - Rationale: Simplifies deployment and debugging while maintaining clean separation of concerns essential for e-commerce business logic
Single Page Application (SPA) Pattern: Angular frontend with client-side routing and state management - Rationale: Provides responsive user experience critical for e-commerce interactions and real-time cart updates
Repository Pattern: Abstract data access through service layer with Mongoose models - Rationale: Enables testing, data access abstraction, and future database migration flexibility
JWT Stateless Authentication: Token-based authentication without server-side session storage - Rationale: Supports scalability and works seamlessly with SPA architecture while maintaining security
Reactive State Management: NgRx for predictable state updates and side effect management - Rationale: Complex e-commerce state (products, cart, user session) requires predictable state management patterns

Tech Stack
Cloud Infrastructure

Provider: Cloud-agnostic with AWS preference for production deployment
Key Services: EC2/App Service for API hosting, MongoDB Atlas for database, S3/Blob storage for static assets
Deployment Regions: Primary US-East region with CDN for global asset distribution

Technology Stack Table
CategoryTechnologyVersionPurposeRationaleFrontend LanguageTypeScript5.3.xPrimary frontend development languageStrong typing essential for large Angular applications and API integrationFrontend FrameworkAngular17.xFrontend SPA frameworkRobust ecosystem, excellent CLI tooling, enterprise-ready for complex e-commerce featuresUI Component LibraryAngular Material17.xUI component systemConsistent Material Design components with built-in accessibility complianceState ManagementNgRx17.xReactive state managementComplex e-commerce state (cart, user, products) requires predictable state managementBackend LanguageNode.js20.x LTSJavaScript runtimeUnified language across stack, excellent ecosystem for web APIsBackend FrameworkExpress.js4.18.xWeb application frameworkMinimal, flexible framework perfect for REST APIs with extensive middleware ecosystemDatabaseMongoDB7.xDocument databaseFlexible schema ideal for product catalogs, easy JSON integration with Node.jsODMMongoose8.xObject Document MapperSchema validation, middleware, and query building for MongoDB operationsAuthenticationJWT + bcryptLatestToken auth and password hashingStateless authentication suitable for SPA, bcrypt for secure password storageValidationJoi17.xRequest validation librarySchema-based validation for API endpoints and data integrityFile UploadMulter1.4.xFile handling middlewareProduct image uploads with validation and storage optimizationLoggingWinston3.xApplication loggingStructured logging for debugging and monitoring with multiple transport optionsTesting - FrontendJest + Testing LibraryLatestComponent and unit testingAngular's recommended testing setup with modern testing practicesTesting - BackendJest + SupertestLatestAPI and integration testingConsistent testing framework across stack, supertest for HTTP endpoint testingE2E TestingCypressLatestEnd-to-end testingComprehensive user journey testing for e-commerce workflowsBuild ToolAngular CLI17.xFrontend build and developmentOptimized Angular development experience with built-in bundling and optimizationPackage ManagernpmLatestDependency managementStandard Node.js package manager with workspace support for monorepoEnvironment ConfigdotenvLatestEnvironment variable managementSimple configuration management for different deployment environmentsCORScorsLatestCross-origin resource sharingEnable secure frontend-backend communication during development and production
Data Models
Product
Purpose: Represents sellable items in the e-commerce catalog with comprehensive product information
Key Attributes:

name: String - Product display name with search indexing
description: String - Detailed product information for customer decision-making
price: Number - Product price in base currency with decimal precision
category: String - Product categorization for filtering and organization
images: Array[String] - Product image URLs for visual presentation
inventory: Number - Available stock quantity for order fulfillment
isActive: Boolean - Product availability status for catalog management

Relationships:

Referenced by CartItem documents for shopping cart functionality
Referenced by OrderItem documents for order history and fulfillment
Indexed by category and text fields for efficient search and filtering

User
Purpose: Represents registered users with authentication credentials and profile information
Key Attributes:

email: String - Unique identifier and login credential with validation
password: String - Securely hashed password using bcrypt
firstName: String - User's first name for personalization
lastName: String - User's last name for personalization and shipping
isAdmin: Boolean - Administrative privileges for catalog management

Relationships:

One-to-one relationship with Cart document for persistent shopping state
One-to-many relationship with Order documents for purchase history
JWT tokens reference user ID for authentication and authorization

Cart
Purpose: Represents user's shopping cart with persistent item storage and pricing
Key Attributes:

userId: ObjectId - Reference to cart owner for user association
items: Array[CartItem] - Shopping cart contents with product references
totalAmount: Number - Calculated total value for checkout processing

Relationships:

Belongs to one User document for ownership and persistence
Contains references to multiple Product documents through CartItem subdocuments
Converted to Order document during checkout process with data preservation

Order
Purpose: Represents completed purchases with historical data preservation and order tracking
Key Attributes:

userId: ObjectId - Reference to purchasing user for order history
orderNumber: String - Unique order identifier for tracking and customer service
items: Array[OrderItem] - Snapshot of purchased products with pricing at time of purchase
totalAmount: Number - Final order total including taxes and shipping
status: String - Order processing status for fulfillment workflow
shippingAddress: Object - Delivery address information

Relationships:

Belongs to one User document for order history and customer service
Contains immutable snapshot of Product information at time of purchase
Status transitions follow defined workflow for order fulfillment

Components
Express.js API Server
Responsibility: Handles HTTP requests, authentication, business logic orchestration, and data persistence operations
Key Interfaces:

RESTful HTTP endpoints for products, authentication, cart, and order management
JWT authentication middleware for protected route security
Request validation middleware using Joi schemas
MongoDB integration through Mongoose ODM with connection management

Dependencies: MongoDB database, file storage system, email service integration
Technology Stack: Express.js, Mongoose, JWT, bcrypt, Joi validation, Winston logging
Angular Frontend Application
Responsibility: Provides responsive user interface, manages client-side routing, handles application state, and communicates with backend API
Key Interfaces:

HTTP services for RESTful API communication with error handling
Angular components for UI rendering with Material Design
NgRx store for centralized state management and side effect handling
Angular Router for client-side navigation and route protection

Dependencies: Backend API, Angular Material component library, NgRx store
Technology Stack: Angular, TypeScript, NgRx, Angular Material, RxJS, Angular CLI
MongoDB Database
Responsibility: Persists application data with document-based storage optimized for e-commerce workflows
Key Interfaces:

Mongoose schemas and models for data validation and query building
Database indexes for performance optimization on search and filter operations
Aggregation pipelines for complex data analysis and reporting

Dependencies: MongoDB server instance with appropriate configuration
Technology Stack: MongoDB, Mongoose ODM with schema validation
Authentication Service
Responsibility: Manages user authentication, JWT token lifecycle, and authorization middleware
Key Interfaces:

User registration and login endpoints with comprehensive validation
JWT token generation, validation, and refresh functionality
Password hashing and verification using bcrypt
Authorization middleware for route protection

Dependencies: User data model, JWT library, bcrypt for password security
Technology Stack: jsonwebtoken, bcrypt, Express middleware patterns

Component Diagrams
graph TB
    subgraph "Frontend - Angular"
        A[Angular Components] --> B[NgRx Store]
        A --> C[HTTP Services]
        C --> D[HTTP Interceptors]
        B --> E[Effects & Reducers]
    end
    
    subgraph "Backend - Express.js"
        F[Express Router] --> G[Auth Middleware]
        F --> H[Validation Middleware]
        G --> I[Controller Layer]
        H --> I
        I --> J[Service Layer]
        J --> K[Mongoose Models]
    end
    
    subgraph "Database"
        L[MongoDB Collections]
        K --> L
    end
    
    D --> F
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style I fill:#bbf,stroke:#333,stroke-width:2px
    style J fill:#bfb,stroke:#333,stroke-width:2px
    style L fill:#fbf,stroke:#333,stroke-width:2px
Core Workflows
sequenceDiagram
    participant U as User Browser
    participant A as Angular App
    participant S as NgRx Store
    participant API as Express API
    participant DB as MongoDB
    
    Note over U,DB: User Authentication Flow
    U->>A: Login Request
    A->>API: POST /auth/login
    API->>DB: Verify User Credentials
    DB-->>API: User Data
    API-->>A: JWT Token + User Info
    A->>S: Store Auth State
    S-->>A: Updated State
    A-->>U: Login Success
    
    Note over U,DB: Add to Cart Flow
    U->>A: Add Product to Cart
    A->>S: Dispatch Add to Cart
    S->>API: POST /cart (with JWT)
    API->>DB: Update User Cart
    DB-->>API: Updated Cart
    API-->>S: Cart Response
    S->>A: Update Cart State
    A-->>U: Cart Updated UI
    
    Note over U,DB: Checkout Flow
    U->>A: Initiate Checkout
    A->>API: POST /orders (with JWT)
    API->>DB: Create Order & Clear Cart
    DB-->>API: Order Confirmation
    API-->>A: Order Response
    A->>S: Update Order State
    A-->>U: Order Confirmation Page
    REST API Spec
    openapi: 3.0.0
info:
  title: E-Commerce Shopping Cart API
  version: 1.0.0
  description: RESTful API for e-commerce platform with product catalog, cart management, and order processing
servers:
  - url: http://localhost:3000/api
    description: Development server
  - url: https://api.ecommerce-platform.com
    description: Production server

security:
  - bearerAuth: []

paths:
  /auth/register:
    post:
      tags: [Authentication]
      summary: Register new user account
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, firstName, lastName]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                firstName:
                  type: string
                lastName:
                  type: string
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'

  /auth/login:
    post:
      tags: [Authentication]
      summary: Authenticate user and return JWT token
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'

  /products:
    get:
      tags: [Products]
      summary: Get paginated product list with filtering
      security: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: category
          in: query
          schema:
            type: string
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Product list retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  products:
                    type: array
                    items:
                      $ref: '#/components/schemas/Product'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

  /products/{id}:
    get:
      tags: [Products]
      summary: Get single product by ID
      security: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Product details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'

  /cart:
    get:
      tags: [Cart]
      summary: Get current user's cart
      responses:
        '200':
          description: User's cart
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Cart'

    post:
      tags: [Cart]
      summary: Add item to cart
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [productId, quantity]
              properties:
                productId:
                  type: string
                quantity:
                  type: integer
                  minimum: 1
      responses:
        '200':
          description: Item added to cart
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Cart'

  /orders:
    get:
      tags: [Orders]
      summary: Get user's order history
      responses:
        '200':
          description: Order history
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Order'

    post:
      tags: [Orders]
      summary: Create order from cart
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [shippingAddress]
              properties:
                shippingAddress:
                  $ref: '#/components/schemas/Address'
      responses:
        '201':
          description: Order created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        _id:
          type: string
        email:
          type: string
        firstName:
          type: string
        lastName:
          type: string
        isAdmin:
          type: boolean

    Product:
      type: object
      properties:
        _id:
          type: string
        name:
          type: string
        description:
          type: string
        price:
          type: number
        category:
          type: string
        images:
          type: array
          items:
            type: string
        inventory:
          type: integer
        isActive:
          type: boolean

    Cart:
      type: object
      properties:
        _id:
          type: string
        userId:
          type: string
        items:
          type: array
          items:
            type: object
            properties:
              product:
                type: string
              quantity:
                type: integer
              priceAtTime:
                type: number
        totalAmount:
          type: number

    Order:
      type: object
      properties:
        _id:
          type: string
        userId:
          type: string
        orderNumber:
          type: string
        items:
          type: array
          items:
            type: object
            properties:
              product:
                type: string
              name:
                type: string
              price:
                type: number
              quantity:
                type: integer
        totalAmount:
          type: number
        status:
          type: string
          enum: [pending, processing, shipped, delivered, cancelled]
        shippingAddress:
          $ref: '#/components/schemas/Address'

    Address:
      type: object
      properties:
        street:
          type: string
        city:
          type: string
        state:
          type: string
        zipCode:
          type: string
        country:
          type: string

    Pagination:
      type: object
      properties:
        currentPage:
          type: integer
        totalPages:
          type: integer
        totalItems:
          type: integer
        itemsPerPage:
          type: integer
Database Schema
// MongoDB Collections with Mongoose Schema Definitions

// Users Collection
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Products Collection
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: 'Price must be non-negative'
    }
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image must be a valid URL'
    }
  }],
  inventory: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Text index for search functionality
productSchema.index({ name: 'text', description: 'text' });

// Carts Collection
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtTime: {
    type: Number,
    required: true,
    min: 0
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Orders Collection
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: 'US' }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  shippingAddress: {
    type: addressSchema,
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
Source Tree
ecommerce-platform/
├── .github/                    # CI/CD workflows and GitHub configuration
│   └── workflows/
│       ├── ci.yml              # Continuous integration pipeline
│       └── deploy.yml          # Deployment automation
├── apps/                       # Application packages in monorepo
│   ├── backend/                # Express.js API server
│   │   ├── src/
│   │   │   ├── controllers/    # HTTP request handlers
│   │   │   │   ├── authController.js
│   │   │   │   ├── productController.js
│   │   │   │   ├── cartController.js
│   │   │   │   └── orderController.js
│   │   │   ├── services/       # Business logic layer
│   │   │   │   ├── authService.js
│   │   │   │   ├── productService.js
│   │   │   │   ├── cartService.js
│   │   │   │   └── orderService.js
│   │   │   ├── models/         # Mongoose schema definitions
│   │   │   │   ├── User.js
│   │   │   │   ├── Product.js
│   │   │   │   ├── Cart.js
│   │   │   │   └── Order.js
│   │   │   ├── middleware/     # Express middleware functions
│   │   │   │   ├── auth.js     # JWT authentication
│   │   │   │   ├── validation.js # Request validation
│   │   │   │   ├── errorHandler.js
│   │   │   │   └── cors.js
│   │   │   ├── routes/         # Route definitions
│   │   │   │   ├── auth.js
│   │   │   │   ├── products.js
│   │   │   │   ├── cart.js
│   │   │   │   └── orders.js
│   │   │   ├── config/         # Configuration files
│   │   │   │   ├── database.js
│   │   │   │   ├── jwt.js
│   │   │   │   └── upload.js
│   │   │   ├── utils/          # Utility functions
│   │   │   │   ├── logger.js
│   │   │   │   ├── validation.js
│   │   │   │   └── helpers.js
│   │   │   └── app.js          # Express application setup
│   │   ├── tests/              # Backend test suites
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   └── integration/
│   │   ├── uploads/            # File upload directory
│   │   └── package.json
│   └── frontend/               # Angular application
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/       # Singleton services and guards
│       │   │   │   ├── services/
│       │   │   │   ├── guards/
│       │   │   │   └── interceptors/
│       │   │   ├── shared/     # Reusable components
│       │   │   │   ├── components/
│       │   │   │   ├── pipes/
│       │   │   │   └── directives/
│       │   │   ├── features/   # Feature modules
│       │   │   │   ├── auth/
│       │   │   │   ├── products/
│       │   │   │   ├── cart/
│       │   │   │   └── orders/
│       │   │   ├── layout/     # Layout components
│       │   │   │   ├── header/
│       │   │   │   ├── footer/
│       │   │   │   └── sidebar/
│       │   │   ├── store/      # NgRx state management
│       │   │   │   ├── auth/
│       │   │   │   ├── products/
│       │   │   │   ├── cart/
│       │   │   │   └── orders/
│       │   │   └── app.module.ts
│       │   ├── assets/         # Static assets
│       │   └── environments/   # Environment configurations
│       ├── angular.json
│       └── package.json
├── packages/                   # Shared packages
│   ├── shared-types/          # TypeScript interfaces
│   │   ├── src/
│   │   │   ├── user.types.ts
│   │   │   ├── product.types.ts
│   │   │   ├── cart.types.ts
│   │   │   └── order.types.ts
│   │   └── package.json
│   └── shared-utils/          # Shared utility functions
│       ├── src/
│       │   ├── validation.ts
│       │   ├── constants.ts
│       │   └── helpers.ts
│       └── package.json
├── docs/                      # Project documentation
│   ├── prd.md
│   ├── architecture.md
│   └── api.md
├── .env.example               # Environment variables template
├── .gitignore
├── docker-compose.yml         # Local development setup
├── package.json               # Root package.json with npm workspaces
└── README.md
Infrastructure and Deployment
Infrastructure as Code

Tool: Docker Compose for local development, cloud-specific IaC for production
Location: docker-compose.yml in project root, cloud configs in infrastructure/ directory
Approach: Container-based deployment with separate services for frontend, backend, and database

Deployment Strategy

Strategy: Blue-Green deployment for zero-downtime updates
CI/CD Platform: GitHub Actions with automated testing and deployment pipeline
Pipeline Configuration: .github/workflows/ directory with separate CI and deployment workflows

Environments

Development: Local Docker environment with hot reloading and development database
Staging: Cloud-hosted environment mirroring production for testing and validation
Production: Scaled cloud deployment with load balancing, monitoring, and backup systems

Environment Promotion Flow
Development (Local)
    ↓ (Feature branch merge)
Staging (Cloud)
    ↓ (Manual approval)
Production (Cloud)
Rollback Strategy

Primary Method: Blue-Green deployment allows instant rollback to previous version
Trigger Conditions: Failed health checks, error rate thresholds, manual intervention
Recovery Time Objective: Less than 5 minutes for complete rollback execution

Error Handling Strategy
General Approach

Error Model: Centralized error handling with consistent response format across all API endpoints
Exception Hierarchy: Custom error classes extending base Error with specific error types for domain logic
Error Propagation: Errors bubble up through service layer to controllers where they're transformed to HTTP responses

Logging Standards

Library: Winston 3.x with multiple transport options for different environments
Format: JSON structured logging with timestamp, level, message, and context metadata
Levels: ERROR, WARN, INFO, DEBUG with environment-specific level filtering
Required Context:

Correlation ID: UUID v4 format for tracking request flows
Service Context: Service name, version, and environment information
User Context: User ID for authenticated requests (excluding sensitive data)
Error Handling Patterns
External API Errors

Retry Policy: Exponential backoff with maximum 3 retry attempts for transient failures
- **Circuit Breaker:** Open circuit after 5 consecutive failures with 30-second recovery window
- **Timeout Configuration:** 5-second timeout for external API calls with graceful degradation
- **Error Translation:** Map external API errors to internal error codes for consistent client handling

#### Business Logic Errors
- **Custom Exceptions:** ValidationError, NotFoundError, UnauthorizedError, ConflictError for domain-specific failures
- **User-Facing Errors:** Clear, actionable error messages without exposing internal system details
- **Error Codes:** Structured error codes (E001-E999) for programmatic error handling by frontend

#### Data Consistency
- **Transaction Strategy:** MongoDB transactions for multi-document operations with automatic rollback on failure
- **Compensation Logic:** Compensating actions for failed operations with audit trail logging
- **Idempotency:** Idempotent API endpoints using request IDs to prevent duplicate operations

## Coding Standards

### Core Standards
- **Languages & Runtimes:** TypeScript 5.3.x for frontend, Node.js 20.x LTS for backend with strict mode enabled
- **Style & Linting:** ESLint with Angular and Node.js configurations, Prettier for code formatting
- **Test Organization:** Tests co-located with source files using `.spec.ts` extension for unit tests, `e2e/` directory for integration tests

### Critical Rules
- **Authentication Required:** All API endpoints except public routes must use JWT authentication middleware
- **Input Validation:** All API inputs must be validated using Joi schemas before processing business logic
- **Error Response Format:** All API errors must use standardized error response format with code, message, and timestamp
- **Database Queries:** Never use direct MongoDB queries in controllers - always use service layer with Mongoose models
- **Password Security:** Never log, store, or transmit passwords in plain text - always use bcrypt hashing
- **Environment Variables:** Never hardcode configuration values - use environment variables with validation on startup

## Test Strategy and Standards

### Testing Philosophy
- **Approach:** Test-driven development (TDD) for critical business logic, test-after for UI components
- **Coverage Goals:** Minimum 80% code coverage for backend services, 70% for frontend components
- **Test Pyramid:** 60% unit tests, 30% integration tests, 10% end-to-end tests for optimal feedback speed

### Test Types and Organization

#### Unit Tests
- **Framework:** Jest 29.x with TypeScript support and custom matchers
- **File Convention:** `.spec.ts` suffix co-located with source files
- **Location:** Same directory as source files for easy maintenance
- **Mocking Library:** Jest built-in mocking with custom mocks for external dependencies
- **Coverage Requirement:** 80% line coverage for services and controllers

**AI Agent Requirements:**
- Generate tests for all public methods with positive and negative test cases
- Cover edge cases and error conditions with appropriate assertions
- Follow AAA pattern (Arrange, Act, Assert) for clear test structure
- Mock all external dependencies including database calls and API requests

#### Integration Tests
- **Scope:** API endpoint testing with real database connections and middleware execution
- **Location:** `tests/integration/` directory with test database configuration
- **Test Infrastructure:**
  - **Database:** MongoDB Memory Server for isolated test database instances
  - **HTTP Client:** Supertest for HTTP endpoint testing with full middleware stack
  - **Authentication:** JWT token generation utilities for protected endpoint testing

#### End-to-End Tests
- **Framework:** Cypress 13.x for full user journey testing
- **Scope:** Critical user paths including registration, login, product browsing, cart operations, and checkout
- **Environment:** Dedicated test environment with seeded data and external service mocks
- **Test Data:** Factory pattern for generating consistent test data with cleanup between tests

### Test Data Management
- **Strategy:** Factory functions for creating test data with realistic but predictable values
- **Fixtures:** JSON fixture files for complex test scenarios stored in `tests/fixtures/`
- **Factories:** Programmatic test data generation with faker.js for realistic data
- **Cleanup:** Automated test database cleanup between test suites with transaction rollback

### Continuous Testing
- **CI Integration:** Jest unit tests, integration tests, and Cypress E2E tests in GitHub Actions pipeline
- **Performance Tests:** Basic load testing with artillery.js for API endpoints under expected load
- **Security Tests:** Automated security scanning with npm audit and OWASP dependency check

## Security

### Input Validation
- **Validation Library:** Joi 17.x for comprehensive schema-based validation
- **Validation Location:** API boundary validation in middleware before reaching controllers
- **Required Rules:**
  - All external inputs MUST be validated against defined schemas
  - Validation at API boundary before processing with immediate rejection of invalid requests
  - Whitelist approach preferred over blacklist for allowed input patterns

### Authentication & Authorization
- **Auth Method:** JWT-based stateless authentication with RS256 signing algorithm
- **Session Management:** Stateless JWT tokens with configurable expiration and refresh token rotation
- **Required Patterns:**
  - All protected routes must use authentication middleware with proper error handling
  - JWT tokens must include minimal user information (ID, email, admin flag) without sensitive data

### Secrets Management
- **Development:** Environment variables in `.env` files with `.env.example` template
- **Production:** Cloud-based secret management service (AWS Secrets Manager, Azure Key Vault)
- **Code Requirements:**
  - NEVER hardcode secrets, API keys, or passwords in source code
  - Access secrets via configuration service only with proper error handling
  - No secrets in logs, error messages, or client-side code

### API Security
- **Rate Limiting:** Express-rate-limit middleware with 100 requests per 15-minute window per IP
- **CORS Policy:** Strict CORS configuration allowing only authorized origins with credential support
- **Security Headers:** Helmet.js middleware for security headers including CSP, HSTS, and X-Frame-Options
- **HTTPS Enforcement:** Redirect HTTP to HTTPS in production with secure cookie settings

### Data Protection
- **Encryption at Rest:** Database-level encryption for sensitive fields using MongoDB encryption
- **Encryption in Transit:** TLS 1.3 for all client-server and service-to-service communication
- **PII Handling:** Minimal PII collection with explicit consent and secure storage practices
- **Logging Restrictions:** Never log passwords, JWT tokens, credit card numbers, or other sensitive data

### Dependency Security
- **Scanning Tool:** npm audit with automated security vulnerability scanning in CI/CD pipeline
- **Update Policy:** Monthly security updates with immediate patching for critical vulnerabilities
- **Approval Process:** Security review required for new dependencies with known vulnerabilities

### Security Testing
- **SAST Tool:** ESLint security rules and SonarQube for static code analysis
- **DAST Tool:** OWASP ZAP for dynamic security testing of running applications
- **Penetration Testing:** Quarterly security assessments for production systems

## Checklist Results Report

Architecture document completed with comprehensive coverage of all technical aspects. The document provides detailed specifications for the Angular, Node.js, and MongoDB technology stack with clear architectural patterns, component definitions, and implementation guidelines. All sections follow the template structure with appropriate technical depth suitable for AI-driven development.

## Next Steps

### Frontend Architecture Development
Since this project includes significant UI components, the next step is to create a detailed Frontend Architecture Document. This should reference this architecture document for core technology decisions and expand on Angular-specific patterns, component organization, and state management strategies.

**Frontend Architect Prompt:**
Please create a comprehensive frontend architecture document using the front-end-architecture template. Reference the technology stack decisions in this architecture document (Angular 17.x, TypeScript 5.3.x, NgRx, Angular Material) and the UI/UX requirements from the PRD. Focus on component organization, state management patterns, and integration strategies with the Express.js backend API defined in this document.