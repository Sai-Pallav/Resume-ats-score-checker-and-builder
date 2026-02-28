import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'Resume Builder & ATS Analysis API',
        description: 'Auto-generated OpenAPI Documentation',
        version: '1.0.0',
    },
    host: 'localhost:8000',
    basePath: '/',
    schemes: ['http', 'https'],
    securityDefinitions: {
        UserIdAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-User-ID',
            description: 'External User ID from the Identity Provider',
        },
    },
    security: [{ UserIdAuth: [] }],
};

const outputFile = '../swagger-output.json';
const routes = ['./app.ts'];

swaggerAutogen()(outputFile, routes, doc).then(() => {
    console.log('Swagger documentation generated successfully.');
});
