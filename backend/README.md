# Online Voting Backend (Spring Boot)

Production-ready REST backend for the Online Voting System.

## Tech Stack

- Java 17
- Spring Boot 3
- Spring Data JPA + Hibernate
- Spring Security + JWT
- MySQL 8
- Maven

## Features

- Admin JWT authentication and role-protected admin APIs
- Election lifecycle: DRAFT -> OPEN -> CLOSED
- Candidate management with duplicate prevention per election
- Voter registration with unique roll number per election
- Anonymous voting (votes table stores no voter_id)
- One vote per voter using voter token + has_voted transactional check
- Live/admin results and public results after closure
- Auto-close scheduler for expired elections
- Global JSON error handling with HTTP status codes

## Project Structure

- src/main/java/com/onlinevoting/backend/entity
- src/main/java/com/onlinevoting/backend/repository
- src/main/java/com/onlinevoting/backend/service
- src/main/java/com/onlinevoting/backend/controller
- src/main/java/com/onlinevoting/backend/security
- src/main/java/com/onlinevoting/backend/config

## Database Setup

1. Create database in MySQL:

```sql
CREATE DATABASE online_voting;
```

2. Update credentials in src/main/resources/application.properties:

- spring.datasource.username
- spring.datasource.password
- jwt.secret

## Configuration

Default properties:

- server.port=8080
- spring.jpa.hibernate.ddl-auto=update
- spring.jackson.time-zone=UTC
- app.voting-link-base=http://localhost:3000/e
- app.election-autoclose-ms=10000
- app.seed-admin.username=admin
- app.seed-admin.password=admin123

## Run

```bash
mvn spring-boot:run
```

Backend base URL:

- http://localhost:8080

Swagger UI:

- http://localhost:8080/swagger-ui/index.html

## Authentication

### Default Seeded Admin

If no admin exists, backend seeds:

- username: admin
- password: admin123

Change with:

- app.seed-admin.username
- app.seed-admin.password

### Login

POST /api/auth/login

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response:

```json
{
  "token": "<jwt>",
  "role": "ADMIN",
  "username": "admin"
}
```

Use token for admin APIs:

- Authorization: Bearer <jwt>

## Voter Integrity

- Register voter to receive server-generated token
- Pass token in vote request header:
  - X-Voter-Token: <token>
- Voting transaction performs:
  - token + election validation
  - has_voted check
  - anonymous vote insert
  - has_voted=true update
  - election total_votes increment

## API Endpoints

### Auth

- POST /api/auth/login
- POST /api/auth/register

### Admin (JWT required)

- POST /api/admin/elections
- GET /api/admin/elections
- GET /api/admin/elections/{id}
- POST /api/admin/elections/{id}/candidates
- PUT /api/admin/elections/{id}/start
- PUT /api/admin/elections/{id}/close
- DELETE /api/admin/elections/{id}
- GET /api/admin/elections/{id}/results
- GET /api/admin/elections/{id}/voting-link

### Public/Voter

- GET /api/elections/by-code/{code}
- GET /api/elections/{id}/results
- POST /api/voters/register
- POST /api/votes

## HTTP Status Codes

- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error

## Example Workflow

1. Login as admin and get JWT
2. Create election
3. Add candidate(s)
4. Start election
5. Share voting link from /voting-link endpoint
6. Voter registers and gets token
7. Voter casts vote with X-Voter-Token
8. Close election manually or let scheduler auto-close
9. Fetch results
