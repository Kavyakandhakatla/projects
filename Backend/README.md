# Backend Project

This project is a Node.js application using Express.js to handle user authentication via Google login. It connects to a PostgreSQL database hosted on AWS and follows a model-controller-routes architecture.

## Project Structure

```
Backend
├── src
│   ├── controllers
│   │   └── authController.js
│   ├── models
│   │   └── userModel.js
│   ├── routes
│   │   └── authRoutes.js
│   ├── db
│   │   └── index.js
│   └── index.js
├── package.json
└── README.md
```

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install Dependencies**
   Make sure you have Node.js and npm installed. Then run:
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory and add your PostgreSQL connection details:
   ```
   DB_HOST=your_db_host
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   ```

4. **Start the Application**
   To start the server, run:
   ```bash
   npm start
   ```

## Usage

The application exposes an API endpoint for Google login:

- **POST** `/api/auth/google`: This endpoint handles Google login requests. It expects a JSON payload containing the user's Google ID, email, name, and picture.

## Dependencies

- `express`: Web framework for Node.js
- `pg`: PostgreSQL client for Node.js
- `dotenv`: Module to load environment variables
- `jsonwebtoken`: For handling JWT tokens
- `bcrypt`: For password hashing (if needed in future implementations)

## License

This project is licensed under the MIT License. See the LICENSE file for more details.