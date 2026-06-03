package docs

import "github.com/swaggo/swag"

const docTemplate = `{
  "swagger": "2.0",
  "info": {
    "description": "The unified API platform for developers and businesses in Yemen.",
    "title": "Yemen API Gateway",
    "termsOfService": "https://yemengateway.dev/terms",
    "contact": {"name": "Yemen API Support", "url": "https://yemengateway.dev/support", "email": "support@yemengateway.dev"},
    "license": {"name": "MIT", "url": "https://opensource.org/licenses/MIT"},
    "version": "1.0.0"
  },
  "host": "api.yemengateway.dev",
  "basePath": "/",
  "schemes": ["https", "http"],
  "paths": {
    "/health": {"get": {"summary": "Health check", "responses": {"200": {"description": "OK"}}}},
    "/api/v1/auth/register": {"post": {"summary": "Register user", "responses": {"200": {"description": "OK"}}}},
    "/api/v1/auth/login": {"post": {"summary": "Login", "responses": {"200": {"description": "OK"}}}},
    "/api/v1/invoices": {"post": {"summary": "Create invoice", "responses": {"200": {"description": "OK"}}}, "get": {"summary": "List invoices", "responses": {"200": {"description": "OK"}}}},
    "/api/v1/receipts": {"post": {"summary": "Create receipt voucher", "responses": {"200": {"description": "OK"}}}},
    "/api/v1/payment-vouchers": {"post": {"summary": "Create payment voucher", "responses": {"200": {"description": "OK"}}}},
    "/api/v1/payment-submissions": {"post": {"summary": "Submit manual payment proof", "responses": {"200": {"description": "OK"}}}}
  },
  "securityDefinitions": {
    "BearerAuth": {"type": "apiKey", "name": "Authorization", "in": "header"},
    "APIKeyAuth": {"type": "apiKey", "name": "X-API-Key", "in": "header"}
  }
}`

var SwaggerInfo = &swag.Spec{
	Version:          "1.0.0",
	Host:             "api.yemengateway.dev",
	BasePath:         "/",
	Schemes:          []string{"https", "http"},
	Title:            "Yemen API Gateway",
	Description:      "The unified API platform for developers and businesses in Yemen.",
	InfoInstanceName: "swagger",
	SwaggerTemplate:  docTemplate,
}

func init() {
	swag.Register(SwaggerInfo.InstanceName(), SwaggerInfo)
}
