# PET Slot Booking System

A high-traffic exam slot booking system built with Spring Boot, React, PostgreSQL, and Redis.

## Features
- **Student Booking**: Atomic booking with strict one-slot-per-student rule.
- **Admin Dashboard**: Manage exam slots, department quotas, and view bookings.
- **Concurrency Safety**: Uses PostgreSQL `SELECT ... FOR UPDATE` row-level locking to prevent overbooking.
- **Security**: JWT Authentication + OTP (Redis) for students.

## Tech Stack
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Backend**: Spring Boot 3.2 (Java 21)
- **Database**: PostgreSQL (Neon)
- **Cache**: Redis (Upstash)

## Prerequisites
1. Java 21 SDK
2. Node.js 18+
3. PostgreSQL Database
4. Redis Instance

## Setup Instructions

### 1. Database Setup
The application is configured to automatically initialize the schema using `schema.sql` on startup.
Ensure you have a PostgreSQL database created.

### 2. Backend Setup
Navigate to `backend` folder.
Create a `.env` file or set environment variables:
```bash
export DB_URL=jdbc:postgresql://host:5432/dbname
export DB_USERNAME=user
export DB_PASSWORD=pass
export REDIS_HOST=localhost
export REDIS_PORT=6379
export REDIS_PASSWORD=
export JWT_SECRET=your_jwt_secret_key_needs_to_be_long_enough
```
Run the application:
```bash
./mvnw spring-boot:run
```

### 3. Frontend Setup
Navigate to `frontend` folder.
Install dependencies:
```bash
npm install
```
Run the dev server:
```bash
npm run dev
```

## Usage
- **Student Login**: Use Roll No + Email. OTP will be printed to Backend Console (for dev/sim).
- **Admin Login**: Use Email + Password (hash verification is simplified for prototype, ensure Admin record exists in DB).

## API Documentation
- **POST /api/auth/student/login**: Initiate Login
- **POST /api/admin/slots**: Create Slot
- **POST /api/student/book**: Book Slot

## Deployment
- **Backend**: Deploy JAR to Render/Railway. Set Env Vars.
- **Frontend**: Deploy to Vercel/Netlify.
- **Database**: Use Neon.tech.
- **Redis**: Use Upstash.
