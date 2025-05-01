# Kawaii Planner

A cute kawaii-themed productivity application with task management, notes, and calendar features, built on top of a secure authentication system using Node.js, Express, and PostgreSQL.

## Features

- Adorable kawaii UI design with animated pet character
- User registration and login functionality
- JWT-based authentication
- PostgreSQL database integration
- Password hashing with bcrypt
- Responsive design

## Tech Stack

- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon Tech)
- **Authentication**: JWT, bcrypt

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository or download the files

2. Install dependencies
   ```
   npm install
   ```

3. Start the server
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3001`

## API Endpoints

- **POST /api/register** - Register a new user
  - Request body: `{ "fullName": "string", "email": "string", "password": "string" }`
  - Response: User object with JWT token

- **POST /api/login** - Login an existing user
  - Request body: `{ "email": "string", "password": "string" }`
  - Response: User object with JWT token

- **GET /api/user** - Get user profile (protected route)
  - Headers: `Authorization: Bearer <token>`
  - Response: User object

## Security Features

- Password hashing using bcrypt
- JWT token authentication
- Protected routes
- Input validation

## Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## License

MIT