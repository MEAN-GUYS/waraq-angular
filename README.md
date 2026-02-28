# Waraq Bookstore - Frontend

A full-stack e-commerce bookstore built with the MEAN stack (MongoDB, Express, Angular, Node.js).

This is the Angular frontend for the Waraq bookstore application.

## Features

### User Features
- **Browse Books**: Search, filter, and sort through the book catalog
- **Book Details**: View detailed information about books (in progress)
- **Shopping Cart**: Add/remove books, update quantities, view order summary
- **User Authentication**: Register, login, logout with JWT-based auth
- **Order History**: View past orders with shipping status tracking

### Admin Panel (PR #9)
- **Dashboard**: View revenue and order statistics
- **Books Management**: CRUD operations for books with cover upload
- **Authors Management**: CRUD operations for authors
- **Users Management**: View all users, delete users
- **Orders Management**: View all orders, update shipping/payment status
- **Categories Management**: (Coming soon)

### Security Features
- JWT-based authentication with token interceptors
- Role-based access control (Admin/User)
- Route guards for protected pages
- Secure API integration

## Tech Stack
- Angular 21.1.2
- TypeScript
- Tailwind CSS
- RxJS with Signals
- Angular Router with guards

## Prerequisites

- Node.js (v18+ recommended)
- Angular CLI (`npm install -g @angular/cli`)
- Backend API running (default: http://localhost:3000)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/MEAN-GUYS/waraq-angular.git
cd waraq-angular
```

2. Install dependencies:
```bash
npm install
```

3. Configure the backend API URL if needed (update `environment.ts`)

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
