const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management & Organization API',
      version: '1.0.0',
      description: 'API documentation for Multi-tenant Task Management Backend Application',
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User signup and login endpoints',
      },
      {
        name: 'Organizations',
        description: 'Organization management and member controls',
      },
    ],
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;