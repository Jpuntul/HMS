# HMS API Documentation

## Base URL

```
http://localhost:8000
```

## Authentication

HMS uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Authentication Endpoints

### Register

```http
POST /auth/register/
```

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "first_name": "string",
  "last_name": "string"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "token": "jwt_access_token",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  }
}
```

### Login

```http
POST /auth/login/
```

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "token": "jwt_access_token",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  }
}
```

### Logout

```http
POST /auth/logout/
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

### Check Authentication

```http
GET /auth/check/
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  }
}
```

### User Profile

```http
GET /auth/profile/
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "date_joined": "2024-01-01T00:00:00Z"
}
```

## Core Entities

### Persons API

#### List Persons

```http
GET /persons/
```

**Query Parameters:**

- `search`: Search by name or contact details
- `page`: Page number for pagination

**Response:**

```json
{
  "count": 447,
  "next": "http://localhost:8000/persons/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "string",
      "age": 30,
      "gender": "M",
      "contact": "string",
      "address": "string"
    }
  ]
}
```

#### Create Person (Authentication Required)

```http
POST /persons/
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "string",
  "age": 30,
  "gender": "M",
  "contact": "string",
  "address": "string"
}
```

#### Get Person Details

```http
GET /persons/{id}/
```

**Response:**

```json
{
  "id": 1,
  "name": "string",
  "age": 30,
  "gender": "M",
  "contact": "string",
  "address": "string"
}
```

#### Update Person (Authentication Required)

```http
PUT /persons/{id}/
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "string",
  "age": 30,
  "gender": "M",
  "contact": "string",
  "address": "string"
}
```

#### Delete Person (Authentication Required)

```http
DELETE /persons/{id}/
```

**Headers:**

```
Authorization: Bearer <token>
```

### Employees API

#### List Employees

```http
GET /employees/
```

**Query Parameters:**

- `search`: Search by name, position, or department
- `page`: Page number for pagination

**Response:**

```json
{
  "count": 303,
  "next": "http://localhost:8000/employees/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "person": {
        "id": 1,
        "name": "string",
        "age": 30,
        "gender": "M",
        "contact": "string",
        "address": "string"
      },
      "employee_id": "EMP001",
      "position": "string",
      "department": "string",
      "salary": "50000.00",
      "hire_date": "2024-01-01"
    }
  ]
}
```

#### Create Employee (Authentication Required)

```http
POST /employees/
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "person": 1,
  "employee_id": "EMP001",
  "position": "string",
  "department": "string",
  "salary": "50000.00",
  "hire_date": "2024-01-01"
}
```

#### Update Employee (Authentication Required)

```http
PUT /employees/{id}/
```

#### Delete Employee (Authentication Required)

```http
DELETE /employees/{id}/
```

### Facilities API

#### List Facilities

```http
GET /facilities/
```

**Query Parameters:**

- `search`: Search by name, type, or location
- `page`: Page number for pagination

**Response:**

```json
{
  "count": 11,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "string",
      "type": "string",
      "location": "string",
      "capacity": 100,
      "status": "Active"
    }
  ]
}
```

#### Create Facility (Authentication Required)

```http
POST /facilities/
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "string",
  "type": "string",
  "location": "string",
  "capacity": 100,
  "status": "Active"
}
```

#### Update Facility (Authentication Required)

```http
PUT /facilities/{id}/
```

#### Delete Facility (Authentication Required)

```http
DELETE /facilities/{id}/
```

## Analytics Endpoints

### Dashboard Statistics

```http
GET /analytics/dashboard/
```

**Response:**

```json
{
  "total_persons": 447,
  "total_employees": 303,
  "total_facilities": 11,
  "recent_additions": {
    "persons": 5,
    "employees": 3,
    "facilities": 1
  }
}
```

## Error Responses

### Authentication Errors

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Permission Errors

```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Validation Errors

```json
{
  "field_name": ["This field is required."]
}
```

### Not Found Errors

```json
{
  "detail": "Not found."
}
```

## Status Codes

- `200 OK`: Successful GET, PUT requests
- `201 Created`: Successful POST requests
- `204 No Content`: Successful DELETE requests
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Pagination

All list endpoints support pagination with the following format:

```json
{
    "count": 100,
    "next": "http://localhost:8000/endpoint/?page=3",
    "previous": "http://localhost:8000/endpoint/?page=1",
    "results": [...]
}
```

## Search

All list endpoints support search functionality through the `search` query parameter:

```
GET /persons/?search=john
GET /employees/?search=doctor
GET /facilities/?search=emergency
```
