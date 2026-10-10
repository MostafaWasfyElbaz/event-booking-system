# Event Booking System API

A RESTful event-booking backend built with **Node.js, Express, TypeScript, MongoDB, and Mongoose**. It supports role-based access, event discovery, booking creation and cancellation, capacity tracking, and event cancellation while preserving booking history.


## Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Run the Project](#run-the-project)
- [Seed Data](#seed-data)
- [Authentication and Roles](#authentication-and-roles)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Business Rules](#business-rules)
- [Postman Collection](#postman-collection)
- [Design Decisions](#design-decisions)
- [Future Improvements](#future-improvements)
- [Troubleshooting](#troubleshooting)

## Features

- User registration and login with password hashing.
- JWT access-token authentication and role-based authorization.
- Refresh token issued as an HTTP-only cookie during login.
- Event creation, editing, listing, retrieval, and cancellation.
- Event search by title and category, date filtering, sorting, and pagination.
- Online and in-person event locations.
- Booking creation with quantity validation and total-price calculation.
- Atomic seat reservation using MongoDB updates to protect event capacity.
- Booking cancellation with a 24-hour cutoff before the event starts.
- Event cancellation that also cancels associated bookings.
- Historical records are retained by cancelling instead of hard-deleting events/bookings.
- Request validation using Zod.
- Helmet, CORS, JSON parsing, cookie parsing, and centralized error handling.
- Seed script with sample users and events.
- Postman collection and environment files for manual API testing.

## Technology Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **HTTP framework:** Express 5
- **Database:** MongoDB
- **ODM:** Mongoose
- **Validation:** Zod
- **Authentication:** JSON Web Tokens (`jsonwebtoken`)
- **Password hashing:** `bcrypt`
- **Security middleware:** Helmet, CORS
- **Cookies:** `cookie-parser`
- **Other tools:** `dotenv`, `nanoid`, `nodemailer`, `tsx`

## Architecture

The source code is organized by feature and shared infrastructure:

```text
src/
├── app.controller.ts           # Express application setup and middleware
├── index.ts                    # Application bootstrap
├── routesV1.ts                 # Versioned route mounting
├── common/
│   ├── enums/                  # Roles, statuses, locations, token types
│   ├── interfaces/             # Shared model/repository/service contracts
├── DB/
│   ├── connection.ts           # MongoDB connection
│   ├── models/                 # User, Event, Booking Mongoose schemas
│   ├── repos/                  # Generic and feature-specific repositories
│   └── seed.ts                 # Sample data seeding
├── middlewares/
│   ├── auth.middleware.ts      # JWT verification and role checks
│   └── validation.middleware.ts
├── modules/
│   ├── auth/                   # Registration, login, current-user endpoint
│   ├── events/                 # Event endpoints and business logic
│   └── booking/                # Booking endpoints and business logic
└── utils/                      # Errors, hashing, JWT, response helpers
```

The project uses a repository pattern to centralize database operations and feature services to coordinate application behavior.

## Prerequisites

Install the following before running the project:

1. **Node.js** (use a current LTS release compatible with the dependencies).
2. **npm**.
3. **MongoDB** running locally or a MongoDB Atlas database.
4. **MongoDB Replica Set support** for transaction-based workflows.

### Important: MongoDB transactions

The booking creation and cancellation workflows and event cancellation use MongoDB transactions. Transactions require a **replica set** or a sharded MongoDB cluster; a standalone MongoDB server will produce an error similar to:

```text
Transaction numbers are only allowed on a replica set member or mongos
```

For local development, configure MongoDB as a single-node replica set and initialize it with `rs.initiate()` in `mongosh`. Configure the connection string with `replicaSet=rs0` (or the name you selected). For example:

```text
mongodb://127.0.0.1:27017/event_booking?replicaSet=rs0
```

If you use MongoDB Atlas, use the connection string supplied by Atlas.

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/MostafaWasfyElbaz/event-booking-system.git
cd event-booking-system
```

If you already have the project files, open a terminal in the project root.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

The application loads its environment from `config/.env`, not from a root-level `.env` file. Create the file:

```bash
# macOS / Linux
mkdir -p config
cp config/.env.example config/.env
```

On Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force config
Copy-Item config/.env.example config/.env
```

Then fill in the variables listed in [Environment Variables](#environment-variables).

### 4. Build and Start

**Build the project:**

```bash
npm run build
```

**Start the production server:**

```bash
npm start
```

The server listens on the port configured by `SERVER_PORT` and mounts the API under `/api/v1`.

#### Development Mode

For development, use two terminal windows.

**Terminal 1 — Watch TypeScript files and rebuild automatically:**

```bash
npm run build:dev
```

This runs `tsc --watch`, which recompiles the TypeScript source files whenever changes are detected.

**Terminal 2 — Run the development server:**

```bash
npm run start:dev
```

The `start:dev` script watches the compiled `dist/index.js` file and restarts the server when the compiled output changes.

Keep both commands running while developing. The TypeScript compiler will rebuild the project, and the development server will restart when the generated JavaScript changes.

## Environment Variables

Create `config/.env` and configure these values:

| Variable | Required | Description | Example |
|---|---|---|---|
| `SERVER_PORT` | Yes | Port used by the Express server | `3000` |
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb://127.0.0.1:27017/event_booking?replicaSet=rs0` |
| `FRONTEND_URL` | Yes for configured CORS | Allowed frontend origin | `http://localhost:5173` |
| `ACCESS_SIGNITURE` | Yes | Secret used to sign and verify access tokens (spelling matches the current code) | Generate a long random secret |
| `REFRESH_SIGNITURE` | Yes | Secret used to sign and verify refresh tokens (spelling matches the current code) | Generate a separate long random secret |
| `ACCESS_TOKEN_EXPIRATION` | Yes | Access-token lifetime accepted by `jsonwebtoken` | `15m` |
| `REFRESH_TOKEN_EXPIRATION` | Yes | Refresh-token lifetime accepted by `jsonwebtoken` | `7d` |
| `SALT_ROUNDS` | Yes | bcrypt work factor used for password hashing | `12` |

**Security notes**
- Use different, strong random values for access and refresh signing secrets.
- Do not use the example values above as production secrets.
- The current code uses the variable names `ACCESS_SIGNITURE` and `REFRESH_SIGNITURE`. Keep that spelling unless you update the code as well.

## Run the Project

### Available npm scripts

| Command | Purpose |
|---|---|
| `npm install` | Install dependencies |
| `npm run build` | Compile TypeScript from `src/` into `dist/` |
| `npm start` | Run the compiled application |
| `npm run dev` | Watch and run the compiled application |
| `npm run seed` | Clear existing collections and insert sample data |

### Seed sample data

```bash
npm run seed
```

**Warning:** The seed script deletes all existing documents from the `Booking`, `Event`, and `User` collections before inserting sample data. Use it only against a disposable development/test database. Do not run it against production or any database containing data you need to keep.

The seed script prints the test users and a shared password when it completes. Current seed credentials use:

```text
Password123!
```

Sample accounts include:
- `admin@example.com` — Admin
- `organizer1@example.com` — Organizer
- `organizer2@example.com` — Organizer
- `organizer3@example.com` — Organizer
- `user1@example.com` — User
- `user2@example.com` — User
- `user3@example.com` — User

These are development-only credentials. Do not deploy seeded accounts or the shared password to production.

## Authentication and Roles

### Authentication

1. Register using `POST /api/v1/auth/register`.
2. Log in using `POST /api/v1/auth/login`.
3. The login response contains an `accessToken`; the server also sets a `refreshToken` HTTP-only cookie.
4. For protected routes, send the access token in the `Authorization` header:

```http
Authorization: Bearer <accessToken>
```

The current API issues a refresh-token cookie during login, but does **not** currently expose a refresh-token renewal or logout endpoint. Token rotation/revocation is listed under [Future Improvements](#future-improvements).

### Roles

| Role | Permissions |
|---|---|
| `user` | Browse published events, create bookings, view own bookings, cancel own bookings |
| `organizer` | Create events, update/cancel owned events, view bookings for owned events, and browse published events |
| `admin` | Administrative event operations and access to event listings/details |

New registrations receive the `user` role by default. The public registration payload does not accept a role field. Organizer/admin accounts for local testing can be created by the seed script or assigned securely through an administrative process.

## API Reference

All endpoints use the `/api/v1` base path. JSON request bodies must use `Content-Type: application/json` where applicable. Protected routes require a valid access token unless otherwise noted.

### Authentication

#### Register

`POST /api/v1/auth/register`

Public endpoint.

Example request:

```json
{
  "name": "Mostafa Wasfy",
  "email": "mostafa@example.com",
  "password": "Password123!",
  "rePassword": "Password123!",
  "phone": "01012345678"
}
```

Validation includes name length/characters, valid email, a password with uppercase and lowercase letters, a number and a special character, matching passwords, and an Egyptian mobile number.

#### Login

`POST /api/v1/auth/login`

Public endpoint.

```json
{
  "email": "user1@example.com",
  "password": "Password123!"
}
```

Returns an access token and sets the refresh-token cookie.

#### Get current user

`GET /api/v1/auth/me`

Requires an access token.

### Events

#### Create an event

`POST /api/v1/events`

Roles: `organizer`, `admin`.

```json
{
  "title": "Node.js Backend Workshop",
  "description": "A practical workshop covering Node.js API development.",
  "category": "Technology",
  "locationType": "online",
  "location": "https://example.com/meeting",
  "startDate": "2027-01-20T10:00:00.000Z",
  "endDate": "2027-01-20T14:00:00.000Z",
  "capacity": 100,
  "price": 25
}
```

Allowed `locationType` values are `online` and `offline`. `startDate` and `endDate` must be ISO date-time strings, both in the future, and `endDate` must be later than `startDate`. Capacity must be a positive integer and price cannot be negative. Newly created events are published by the current implementation.

#### List and search events

`GET /api/v1/events`

Requires an access token.

Supported query parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | Integer | `1` | Page number, minimum 1 |
| `limit` | Integer | `10` | Page size, from 1 to 100 |
| `title` | String | — | Case-insensitive title search |
| `category` | String | — | Case-insensitive category search |
| `startDate` | ISO date-time | — | Lower bound for event `startDate` |
| `endDate` | ISO date-time | — | Upper bound for event `startDate` |
| `sortBy` | `startDate`, `price` | `startDate` | Sort field |
| `sortOrder` | `asc`, `desc` | `asc` | Sort direction |
| `NODE_ENV` | Recommended | Runtime environment; controls the refresh cookie's `secure` flag | `development` |

Example:

```http
GET /api/v1/events?page=1&limit=10&category=Technology&sortBy=startDate&sortOrder=asc
```

The response includes the events, total matching count, current page, page size, and total pages. Event list results also calculate `availableSeats` as `capacity - bookedSeats`.

Visibility depends on role: regular users see published events; organizers can see their own events as well as published events; admins can list all events.

#### Get an event

`GET /api/v1/events/:id`

Requires an access token and a valid MongoDB ObjectId.

- Admins can access any event.
- Organizers can access their own events and published events.
- Regular users can access published events.

#### Get bookings for an event

`GET /api/v1/events/:id/bookings`

Roles: `organizer`, `admin`.

Returns bookings associated with the event. Organizers are restricted to events they own.

#### Update an event

`PATCH /api/v1/events/:id`

Roles: `organizer`, `admin`.

Send one or more supported fields:

```json
{
  "price": 30,
  "capacity": 120,
  "location": "New event location"
}
```

Capacity cannot be lower than `bookedSeats`. Organizers can update only their own events.

#### Cancel an event

`DELETE /api/v1/events/:id`

Roles: `organizer`, `admin`.

Despite the HTTP `DELETE` method, the current implementation cancels the event rather than permanently deleting it. Associated bookings are also cancelled, preserving records for auditing. The operation uses a MongoDB transaction.

### Bookings

#### Create a booking

`POST /api/v1/bookings/:id`

Role: `user`.

For this endpoint, `:id` is the **event ID**.

```json
{
  "quantity": 2
}
```

Quantity must be an integer from 1 to 5. The server calculates `totalPrice` using the event price and quantity. A user cannot create another non-cancelled booking for the same event. The event must be published, in the future, and have enough remaining capacity.

#### Get my bookings

`GET /api/v1/bookings/me`

Role: `user`.

Returns bookings belonging to the authenticated user.

#### Cancel a booking

`PATCH /api/v1/bookings/:id/cancel`

Role: `user`.

Here, `:id` is the **booking ID**, not the event ID. Users can cancel only their own bookings. Cancellation is allowed until 24 hours before the event starts. Cancelling a booking releases its reserved seats.

### Common response shape

Successful responses use this general format:

```json
{
  "status": 200,
  "message": "Events fetched successfully",
  "data": {}
}
```

The `data` value depends on the endpoint and may be omitted when the operation has no response payload. Errors are returned with a message and status code; the current error middleware also includes a stack trace, so production deployments should disable stack traces in client-facing error responses.

## Data Models

### User

- `name`
- `email` (unique)
- `password` (hashed)
- `phone`
- `role`: `user`, `organizer`, or `admin`
- `changedCredentialsAt` (optional)
- Mongoose timestamps: `createdAt`, `updatedAt`

### Event

- `title`
- `description`
- `category`
- `locationType`: `online` or `offline`
- `location`: meeting URL or physical address
- `startDate`
- `endDate`
- `capacity`
- `bookedSeats`
- `price`
- `organizerId` (reference to User)
- `status`: `published`, `cancelled`, or `finished`
- Mongoose timestamps: `createdAt`, `updatedAt`

### Booking

- `userId` (reference to User)
- `eventId` (reference to Event)
- `quantity` (1–5)
- `totalPrice`
- `status`: `pending`, `confirmed`, or `cancelled`
- Mongoose timestamps: `createdAt`, `updatedAt`

The `availableSeats` value returned by event listings is calculated at query time; it is not a stored Event field.

## Business Rules

- A booking can reserve between 1 and 5 seats.
- Booking totals are calculated on the server using the current event price.
- Booking creation checks event status, start time, and remaining capacity.
- Seat reservation updates `bookedSeats` atomically to reduce the risk of overselling.
- A user can have only one non-cancelled booking for a given event.
- A user can cancel their own booking up to 24 hours before the event start time.
- Cancelling a booking releases the seats reserved by that booking.
- Cancelling an event cancels its associated bookings.
- Events and bookings are retained as cancelled records instead of being hard-deleted, supporting auditability.
- Event capacity cannot be reduced below the currently booked seat count.
- Authorization checks restrict event modification and booking visibility according to role and ownership.

## Postman Collection

The repository includes:

- `Event_Booking_System.postman_collection.json`
- `Event_Booking_System.postman_environment.json`

Import both files into Postman, select the imported environment, set the API base URL (for example, `http://localhost:3000/api/v1`), and authenticate to obtain an access token before calling protected endpoints. For the exact request payloads and route definitions, use this README and the collection together.

## Design Decisions

These decisions were made to support event lifecycle management, booking correctness, and traceability.

1. **Added `FINISHED` to `EventStatus`:** Represents events that have ended and enables future lifecycle automation.
2. **Moved booking cancellation under the bookings resource:** Booking cancellation uses `PATCH /api/v1/bookings/:id/cancel` rather than an event-scoped booking route because the operation targets a specific booking and belongs to the booking service.
3. **Added `bookedSeats`:** Tracks reserved seats and supports capacity validation and atomic seat updates. `availableSeats` is calculated as `capacity - bookedSeats`.
4. **Avoided hard deletion of events and bookings:** Cancellation preserves historical records for auditing and traceability.
5. **Added `locationType`:** Distinguishes online events from offline/physical events; `location` stores the meeting URL or physical address.
6. **Added `endDate`:** Validates the event's time range and provides the basis for future automatic transition to `finished`.
7. **Separated resource ownership checks from authentication middleware:** Authentication middleware verifies the user's identity and can enforce role-based access restrictions. Resource-specific ownership checks, such as verifying that an organizer owns an event or that a booking belongs to the authenticated user, are handled in the relevant service layer. This separation keeps authentication middleware focused on authentication and general authorization, while feature services enforce resource-specific business rules.

## Future Improvements

The following items are **planned improvements, not claims about currently implemented functionality**.

### Reliability and booking consistency

- **Idempotency keys:** Add idempotency support to booking creation, booking cancellation, and event cancellation so retried requests do not repeat the same operation.
- **Automated event completion:** Add a cron job that finds events whose `endDate` has passed and changes their status to `finished`.
- **Pending booking expiration:** Add a cron job that cancels pending bookings when their events have started, in accordance with the booking lifecycle rules.
- **Database status history:** Store every event and booking status transition with timestamps and relevant metadata for a more complete audit trail.

### Authentication and security

- **Complete refresh-token lifecycle:** Implement refresh-token renewal, rotation, validation, and revocation. The current login flow issues a refresh-token cookie, but no refresh endpoint is currently exposed.
- **Redis token revocation:** Use Redis with TTLs to track revoked access and refresh tokens after logout, avoiding repeated primary-database lookups for revocation checks.

### Database performance

- **Evaluate compound indexes:** Benchmark candidate compound indexes against real filter/sort patterns and query execution statistics, balancing search speed against index storage and write overhead.
- **Minimize database queries:** Review service and repository workflows to remove redundant queries and unnecessary network round trips.

### Testing and maintainability

- **Unit tests:** Add tests for service and repository behavior, including authorization, capacity limits, duplicate bookings, cancellation deadlines, seat restoration, and event lifecycle transitions.

### Event-driven OTP

- **Event-driven OTP workflow:** Build OTP generation and delivery around events so authentication workflows remain decoupled and easier to extend.

## Troubleshooting

### `Transaction numbers are only allowed on a replica set member or mongos`

MongoDB is running as a standalone server. Enable a replica set, initialize it with `rs.initiate()`, and include the replica set name in `MONGODB_URI`.

### `MONGODB_URI is not set`

Check that `config/.env` exists and includes `MONGODB_URI`. The project loads environment variables from `config/.env`.

### Protected endpoints return `401`

- Log in and copy the `accessToken` from the response.
- Send `Authorization: Bearer <accessToken>`.
- Check that `ACCESS_SIGNITURE` matches the secret used to sign the token.
- Check that the token has not expired.

### CORS errors

Set `FRONTEND_URL` to the exact frontend origin, including the scheme and port, such as `http://localhost:5173`.

### Seed data removed my existing documents

The seed script clears the User, Event, and Booking collections before seeding. Restore from backup if available, and only run the seed script against a disposable development database in the future.

## License

The package currently declares the `ISC` license. If you distribute this project, retain the applicable license notice and ensure the repository includes a license file if required.
