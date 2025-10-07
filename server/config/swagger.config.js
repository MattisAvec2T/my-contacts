import swaggerJsDoc from "swagger-jsdoc";
import { SERVER_URL } from "./env.config.js";

export const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "My Contacts API",
            version: "1.0.0",
            description: "API documentation for contact management system with JWT authentication",
        },
        servers: [
            {
                url: SERVER_URL,
                description: "Development server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter your JWT token"
                }
            },
            schemas: {
                SuccessResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true
                        },
                        message: {
                            type: "string"
                        },
                        data: {
                            type: "object"
                        }
                    }
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: false
                        },
                        error: {
                            type: "string"
                        },
                        details: {
                            type: "array",
                            items: {
                                type: "object"
                            }
                        }
                    }
                },
                Contact: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "507f1f77bcf86cd799439011"
                        },
                        firstName: {
                            type: "string",
                            example: "John"
                        },
                        lastName: {
                            type: "string",
                            example: "Doe"
                        },
                        phone: {
                            type: "string",
                            example: "+33612345678"
                        },
                        userEmail: {
                            type: "string",
                            example: "user@example.com"
                        }
                    }
                },
                User: {
                    type: "object",
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "user@example.com"
                        }
                    }
                }
            }
        }
    },
    apis: ["./routes/*.js"]
};

export const swaggerDocs = swaggerJsDoc(swaggerOptions);