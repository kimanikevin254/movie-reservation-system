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

-   **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
-   **TypeScript**: A superset of JavaScript that adds static types, enhancing the development experience and reducing runtime errors.
-   **Prisma**: An ORM (Object Relational Mapping) tool that simplifies database interactions and migrations.
-   **Mailgun**: A powerful email delivery service used for sending transactional emails (e.g., password reset links).
-   **bcrypt**: A library to hash passwords securely, ensuring that user credentials are stored safely.
-   **JWT (JSON Web Tokens)**: A compact, URL-safe means of representing claims to be transferred between two parties, used for token-based authentication.
-   **dotenv**: A module for loading environment variables from a `.env` file, helping manage configuration and secrets securely.

## Getting Started

To get started, follow these steps:

### Prerequisites

-   Node.js

### Installation

1. Clone the repository:

    ```bash
    git clone <repository-url>
    ```
