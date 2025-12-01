#!/bin/bash

curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "x-app-env: development" \
  -d '{
    "query": "mutation Login($input: LoginInput!) { login(input: $input) { token user { id email firstName lastName role } } }",
    "variables": {
      "input": {
        "email": "admin@maternarsm.com.br",
        "password": "admin123"
      }
    }
  }'