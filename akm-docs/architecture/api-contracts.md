# AI Krushi Mitra — API Contracts

> **Version:** 1.0 | **Status:** Approved | **Owner:** Technical Architect  
> **Last Updated:** 2026-06-28

---

## 1. OpenAPI 3.0 Specification Summary

```yaml
openapi: 3.0.3
info:
  title: AI Krushi Mitra Backend API
  version: 1.0.0
paths:
  /api/chat:
    post:
      summary: Grounded RAG chat advisor
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [prompt]
              properties:
                prompt:
                  type: string
                user:
                  type: object
                  properties:
                    name: { type: string }
                    district: { type: string }
                    crop: { type: string }
                    language: { type: string }
      responses:
        200:
          content:
            application/json:
              schema:
                type: object
                properties:
                  text: { type: string }
                  citations:
                    type: array
                    items:
                      type: object
                      properties:
                        source: { type: string }
                        category: { type: string }

  /api/vision:
    post:
      summary: Multimodal disease leaf-scan diagnostic
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [prompt, imageBase64]
              properties:
                prompt: { type: string }
                imageBase64: { type: string }
                cropType: { type: string }
                user: { type: object }
      responses:
        200:
          content:
            application/json:
              schema:
                type: object
                properties:
                  text: { type: string }
                  data:
                    type: object
                    properties:
                      disease: { type: string }
                      disease_local: { type: string }
                      confidence: { type: number }
                      treatment: { type: object }

  /api/weather/advisory:
    post:
      summary: Weather forecast crop advisory
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [user, weatherForecast]
      responses:
        200:
          content:
            application/json:
              schema:
                type: object
                properties:
                  text: { type: string }

  /api/soil/advisory:
    post:
      summary: Soil test analysis prescription
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [npk, crop]
      responses:
        200:
          content:
            application/json:
              schema:
                type: object
                properties:
                  text: { type: string }
```
