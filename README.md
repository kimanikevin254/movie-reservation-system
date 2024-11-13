# NestJS Auth

A secure and scalable authentication system built using the NestJS framework. This application provides a robust foundation for user authentication, supporting features such as user registration, password management, and token-based authentication.

## Features

-   **Sign Up**: Allows new users to register with their email and password.
-   **Sign In**: Authenticates users and issues access and refresh tokens.
-   **Refresh Token**: Provides a mechanism to obtain new access tokens without requiring the user to log in again.
-   **Log Out**: Allows users to securely log out and invalidate their sessions.
-   **Change Password**: Enables users to update their passwords securely.
-   **Forget Password**: Allows users to initiate a password reset process.
-   **Reset Password**: Facilitates users in resetting their passwords using secure tokens.

## Technologies Used

-   **NestJS**: To build the API.
-   **TypeScript**: To add static types, enhancing the development experience and reducing runtime errors.
-   **Prisma**: To simplifify database interactions and migrations.
-   **Mailgun**: For sending transactional emails (e.g., password reset links).
-   **bcrypt**: To hash passwords securely, ensuring that user credentials are stored safely.
-   **JWT (JSON Web Tokens)**: For token-based authentication.
-   **dotenv**: To load environment variables from a `.env` file, helping manage configuration and secrets securely.
-   **SQLite**: For the database

## Getting Started

To get started, follow these steps:

### Prerequisites

-   Node.js

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/kimanikevin254/nest-auth.git
    ```

2. `cd` into the project folder.

3. Install dependencies:

    ```bash
    npm i
    ```

4. Run prisma migrations:

    ```bash
    npm run prisma:migrations
    ```

5. Run the server:

    ```bash
    npm run start:dev
    ```

6. Check out the API docs on `http://localhost:3000/api/swagger`
