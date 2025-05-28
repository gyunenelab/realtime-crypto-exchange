const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '실시간 코인 거래소 API',
      version: '1.0.0',
      description: '사용자 인증, 지갑, 주문, 거래, 코인 정보 API 문서',
    },
    servers: [
      {
        url: 'http://localhost:3000',
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
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], //✅ API 명세 Swagger
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
