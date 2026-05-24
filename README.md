# CABBOOKING

# CAB Booking System

A modern, real-time cab booking application built with Next.js, Express, MongoDB, and Socket.IO. Features live driver tracking, OTP verification, and real-time ride status updates.

---

## 📱 Features

- **Real-time Ride Booking**: Customers can book rides with instant driver assignment
- **Live Driver Tracking**: GPS-based real-time location tracking with leaflet maps
- **OTP Verification**: Secure start and completion verification using one-time passwords
- **Dual Apps**: Separate Next.js applications for customers and drivers
- **WebSocket Communication**: Instant updates via Socket.IO on dedicated namespaces
- **JWT Authentication**: Secure token-based authentication for both customers and drivers
- **Ride History**: Track completed rides and ratings
- **Driver Management**: Online/offline status and fleet operations console

---

## 🏗️ Architecture

### Project Structure

```
CAB booking/
├── apps/
│   ├── customer-app/        # Customer UI (Next.js, port 4000)
│   └── driver-app/          # Driver UI (Next.js, port 3001)
├── backend/                 # Express API server (port 5000)
├── shared/                  # Shared types, constants, and utilities
└── package.json            # Root package for management
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 18, TypeScript, Tailwind CSS |
| **Backend** | Express.js, Node.js, TypeScript |
| **Database** | MongoDB |
| **Real-time** | Socket.IO |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Maps** | Leaflet, react-leaflet |
| **State** | Zustand |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install customer app dependencies
cd apps/customer-app && npm install && cd ../..

# Install driver app dependencies
cd apps/driver-app && npm install && cd ../..

# Install shared package dependencies
cd shared && npm install && cd ..
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/cab-booking
JWT_SECRET=your_jwt_secret_key
OTP_EXPIRY_MINUTES=10
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:4000,http://localhost:3001
```

**Customer App** (`apps/customer-app/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Driver App** (`apps/driver-app/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run All Services

**Option A: Individual Terminals**

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Customer App
cd apps/customer-app && npm run dev

# Terminal 3: Driver App
cd apps/driver-app && npm run dev
```

**Option B: Run All at Once**

```bash
# From the root directory
npm run dev:all
```

### 4. Access Applications

- **Customer UI**: http://localhost:4000
- **Driver UI**: http://localhost:3001
- **Backend API**: http://localhost:5000

---

## 📱 App Overview

### Customer App

Located in `apps/customer-app/`

**Key Features:**
- Book a ride from pickup to destination
- Real-time driver tracking on interactive map
- OTP verification with driver
- Ride completion and rating
- Ride history and past trips

**Key Pages:**
- `/` - Dashboard
- `/login` - Customer login
- `/register` - Customer registration
- `/ride/[id]` - Live ride tracking

**Key Components:**
- `BookingCard.tsx` - Ride booking interface
- `LiveTracking.tsx` - Real-time tracking
- `CaptainDetails.tsx` - Driver information
- `WaitingForDriver.tsx` - Arrival confirmation
- `FinishRide.tsx` - Ride completion & rating

---

### Driver App

Located in `apps/driver-app/`

**Key Features:**
- Accept ride requests
- Navigate to pickup location
- OTP verification before ride start
- Real-time navigation to destination
- Online/offline status
- Ride history and earnings

**Key Pages:**
- `/` - Home/Dashboard
- `/login` - Driver login
- `/register` - Driver registration
- `/dashboard` - Available rides
- `/active-ride/[id]` - Active ride management

**Key Components:**
- `RideRequestPopup.tsx` - Incoming ride alerts
- `DriverMap.tsx` - Navigation map
- `ActiveTripPanel.tsx` - Trip controls and OTP
- `OnlineToggle.tsx` - Availability toggle
- `DriverProfileCard.tsx` - Driver profile

---

### Backend API

Located in `backend/src/`

**Main Modules:**
- `auth/` - Authentication (customer & driver)
- `rides/` - Ride booking and management
- `customer/` - Customer profiles
- `driver/` - Driver profiles
- `tracking/` - GPS tracking and locations
- `notifications/` - Email notifications
- `sockets/` - WebSocket event handlers

**Key REST API Routes:**
```
POST   /api/auth/customer/register    - Customer signup
POST   /api/auth/customer/login       - Customer login
POST   /api/auth/driver/register      - Driver signup
POST   /api/auth/driver/login         - Driver login
POST   /api/rides/book                - Book a new ride
GET    /api/rides/:id                 - Get ride details
POST   /api/rides/:id/accept          - Accept ride (driver)
POST   /api/rides/:id/start           - Start ride (with OTP)
POST   /api/rides/:id/complete        - Complete ride (with OTP)
POST   /api/driver/online             - Set driver online
POST   /api/driver/offline            - Set driver offline
GET    /api/driver/profile            - Get driver profile
GET    /api/driver/history            - Get ride history
POST   /api/tracking/location         - Update location
```






## 🛠️ Development

### Build Commands

```bash
# Build all services
npm run build:all

# Build individual services
cd backend && npm run build
cd apps/customer-app && npm run build
cd apps/driver-app && npm run build
```

### Type Checking

```bash
# Type check all services
npm run typecheck:all

# Individual type checking
cd backend && npm run typecheck
cd apps/customer-app && npm run typecheck
cd apps/driver-app && npm run typecheck




## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000 (backend)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 4000 (customer)
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Kill process on port 3001 (driver)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### MongoDB Connection Issues

- Ensure MongoDB is running: `mongod`
- Check connection string in `backend/.env`
- For MongoDB Atlas, whitelist your IP

### Socket.IO Connection Errors

- Verify backend is running on port 5000
- Check CORS settings in backend
- Ensure tokens are valid

---



## 🚢 Deployment

### Build for Production

```bash
# Backend
cd backend
npm run build
npm start

# Customer App
cd apps/customer-app
npm run build
npm start -- -p 4000

# Driver App
cd apps/driver-app
npm run build
npm start -- -p 3001
```

