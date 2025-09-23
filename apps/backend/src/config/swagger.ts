import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'RESTful API for e-commerce platform with product and category management',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'description', 'price', 'category'],
          properties: {
            _id: {
              type: 'string',
              description: 'Product ID'
            },
            name: {
              type: 'string',
              maxLength: 255,
              description: 'Product name'
            },
            description: {
              type: 'string',
              maxLength: 2000,
              description: 'Product description'
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Product price in USD'
            },
            category: {
              type: 'string',
              description: 'Product category name'
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri'
              },
              description: 'Array of image URLs'
            },
            inventory: {
              type: 'number',
              minimum: 0,
              default: 0,
              description: 'Available inventory quantity'
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Whether the product is active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Category: {
          type: 'object',
          required: ['name'],
          properties: {
            _id: {
              type: 'string',
              description: 'Category ID'
            },
            name: {
              type: 'string',
              maxLength: 100,
              description: 'Category name'
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'Category description'
            },
            parent: {
              type: 'string',
              description: 'Parent category ID'
            },
            children: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of child category IDs'
            },
            isActive: {
              type: 'boolean',
              default: true,
              description: 'Whether the category is active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        CategoryTree: {
          allOf: [
            { $ref: '#/components/schemas/Category' },
            {
              type: 'object',
              properties: {
                children: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/CategoryTree'
                  }
                }
              }
            }
          ]
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'number',
              minimum: 1
            },
            totalPages: {
              type: 'number',
              minimum: 0
            },
            totalItems: {
              type: 'number',
              minimum: 0
            },
            itemsPerPage: {
              type: 'number',
              minimum: 1
            },
            hasNextPage: {
              type: 'boolean'
            },
            hasPrevPage: {
              type: 'boolean'
            },
            nextPage: {
              type: 'number',
              nullable: true
            },
            prevPage: {
              type: 'number',
              nullable: true
            }
          }
        },
        PaginatedProducts: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product'
              }
            },
            pagination: {
              $ref: '#/components/schemas/PaginationMeta'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Error code'
                },
                message: {
                  type: 'string',
                  description: 'Error message'
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'Detailed error information'
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time'
                }
              }
            }
          }
        }
      }
    }
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api/docs', swaggerUi.serve);
  app.get('/api/docs', swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'E-commerce API Documentation'
  }));

  // Serve OpenAPI JSON
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}

export { specs as swaggerSpecs };