# FleetFlow - Fleet & Logistics Management System

**FleetFlow** is a modern, professional fleet and logistics management application built with Next.js. It provides comprehensive tools for managing vehicles, drivers, trips, maintenance, expenses, and analytics in a centralized dashboard.

![Next.js](https://img.shields.io/badge/Next.js-13+-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-13AA52?style=flat-square&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3+-06B6D4?style=flat-square&logo=tailwindcss)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Roles & Permissions](#user-roles--permissions)
- [Key Features](#key-features)
- [Database Models](#database-models)
- [API Routes](#api-routes)
- [Contributing](#contributing)
- [Future Enhancements](#future-enhancements)

## ✨ Features

### Core Fleet Management
- **Vehicle Registry** - Track all fleet vehicles with detailed specs and status
- **Driver Management** - Manage driver profiles, licenses, and on/off-duty status
- **Trip Dispatcher** - Create, dispatch, and track trips with full status workflow
- **Maintenance Tracking** - Schedule, track, and complete vehicle maintenance
- **Fuel Expense Management** - Log and monitor fuel costs per vehicle
- **Safety Analytics** - Real-time analytics with ROI calculations and charts

### Advanced Features
- **Role-Based Access Control (RBAC)** - 5 user roles with granular permissions
- **Professional Dashboard** - Real-time KPI cards and fleet overview
- **Status Management** - Intelligent status transitions for trips and maintenance
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Professional UI** - Clean, modern interface with Lucide React icons
- **Real-time Data** - Instant updates across all pages
- **Data Export** - Export analytics reports to CSV format

## 🛠️ Tech Stack

### Frontend
- **Next.js 13+** - React framework with App Router
- **React 18** - UI library
- **TailwindCSS 3** - Utility-first CSS framework
- **Framer Motion** - Animation and interaction library
- **Lucide React** - Professional icon library
- **Chart.js & react-chartjs-2** - Data visualization
- **React Hot Toast** - Toast notifications

### Backend
- **Next.js API Routes** - Serverless backend functions
- **MongoDB** - NoSQL database
- **Mongoose 7+** - ODM (Object Data Modeling)
- **JWT** - Authentication token management
- **Node.js** - Runtime environment

### Tools & Libraries
- **ESLint** - Code quality
- **PostCSS** - CSS processing
- **Framer Motion** - Animations

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- MongoDB database (local or Atlas)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/fleetflow
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. **Start MongoDB** (if using local database)
   ```bash
   mongod
   ```

5. **Seed the database** (optional - for test data)
   ```bash
   node src/utils/seed.js
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Getting Started

### Login Credentials (After Seeding)

**Test Account:**
- Email: manager@fleetflow.com
- Password: password123

### First Steps
1. Log in with credentials
2. Navigate to Dashboard to view KPIs
3. Add a vehicle in Vehicle Registry
4. Add a driver in Driver Profiles
5. Create a trip in Trip Dispatcher
6. Track maintenance in Maintenance & Service
7. View analytics in Analytics page

## 📁 Project Structure

```
project/
├── src/
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   ├── drivers/         # Driver management
│   │   │   ├── vehicles/        # Vehicle management
│   │   │   ├── trips/           # Trip management
│   │   │   ├── maintenance/     # Maintenance logs
│   │   │   └── fuel-expenses/   # Fuel expense tracking
│   │   ├── dashboard/           # Main dashboard
│   │   ├── analytics/           # Analytics & reports
│   │   ├── vehicles/            # Vehicle registry UI
│   │   ├── drivers/             # Driver management UI
│   │   ├── trips/               # Trip dispatcher UI
│   │   ├── maintenance/         # Maintenance UI
│   │   ├── expenses/            # Expense tracking UI
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── Navbar.js            # Navigation bar
│   │   ├── ProtectedLayout.js   # Role-based layout wrapper
│   │   ├── DataTable.js         # Reusable data table
│   │   ├── FormModal.js         # Modal for forms
│   │   ├── KPICard.js           # KPI display card
│   │   ├── StatusBadge.js       # Status indicator
│   │   ├── AnalyticsGraphs.js   # Chart components
│   │   └── Loader.js            # Loading spinner
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Vehicle.js           # Vehicle schema
│   │   ├── Driver.js            # Driver schema
│   │   ├── Trip.js              # Trip schema
│   │   ├── MaintenanceLog.js    # Maintenance schema
│   │   ├── Expense.js           # Expense schema
│   │   └── Counter.js           # Auto-increment counter
│   ├── lib/
│   │   ├── db.js                # Database connection
│   │   └── clientAuth.js        # Auth utilities
│   ├── utils/
│   │   ├── seed.js              # Database seeding
│   │   └── status.js            # Status utilities
│   └── actions/
│       └── auth/                # Auth server actions
├── public/                       # Static assets
├── package.json                  # Dependencies
├── next.config.mjs              # Next.js configuration
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.mjs           # PostCSS configuration
└── README.md                     # This file
```

## 👥 User Roles & Permissions

### 1. **Manager**
- Full access to all modules
- Can create, edit, and delete vehicles
- Can create and dispatch trips
- Can manage drivers and maintenance
- Can access analytics and reports
- Can update trip and maintenance status

### 2. **Dispatcher**
- Can create and dispatch trips
- Can update trip status
- Can view vehicles and drivers
- Can log fuel expenses
- Can view analytics
- **Cannot**: Delete vehicles or manage maintenance directly

### 3. **Driver**
- Can view assigned vehicles
- Can toggle own on/off-duty status
- Can view upcoming trips
- **Cannot**: Create trips or manage fleet

### 4. **Safety Officer**
- Can view all vehicles and driver details
- Can create maintenance logs
- Can update maintenance status
- Can view safety records
- **Cannot**: Create trips or manage expenses

### 5. **Financial Analyst**
- Can view analytics and reports
- Can access expense tracking
- Can view ROI calculations
- Can export data to CSV
- **Cannot**: Create trips or manage vehicles

## 🎯 Key Features

### Dashboard
- Real-time KPI cards (Total Vehicles, Trips, Revenue, Maintenance)
- Fleet overview with status breakdown
- Quick access to all modules
- Professional icon-based navigation

### Vehicle Registry
- Add/edit/delete vehicles
- Track specifications (capacity, fuel type, region)
- Monitor vehicle status (available, in_service, in_shop, inactive)
- View acquisition costs and odometer readings

### Driver Management
- Create driver profiles with license information
- Track license expiry with alerts
- Monitor on/off-duty status
- Safety score tracking
- Trip completion counter

### Trip Dispatcher
- **Status Workflow**: Draft → Dispatched → In Progress → Completed
- Create trips with vehicle, driver, and cargo details
- Auto-validation (cargo weight, driver status, license validity)
- Start, complete, or cancel trips
- Automatic odometer tracking
- Compliance checking

### Maintenance & Service
- **Status Workflow**: Scheduled → In Progress → Completed/Cancelled
- Track service types (oil change, tire rotation, brake service, etc.)
- Schedule and manage maintenance
- Update vehicle status during maintenance
- Cost tracking per service

### Fuel Expense Management
- Log fuel expenses per vehicle
- Track fuel type and consumption
- Calculate fuel efficiency
- Monitor fuel costs over time

### Analytics & Reporting
- Real-time charts (bar, pie, line charts)
- ROI calculation per vehicle
- Revenue and expense tracking
- Fuel efficiency metrics
- CSV export functionality

## 📊 Database Models

### User
```
- email (unique)
- password (hashed)
- name
- role (manager, dispatcher, driver, safety_officer, financial_analyst)
- phone
- address
- createdAt, updatedAt
```

### Vehicle
```
- name
- licensePlate (unique)
- type (truck, van, car, bike)
- model
- maxCapacity
- odometer
- fuelType (diesel, petrol, electric, hybrid)
- status (available, in_service, in_shop, inactive)
- acquisitionCost
- region
- timestamps
```

### Driver
```
- name
- email (unique)
- phone
- licenseNumber (unique)
- licenseCategory
- licenseExpiryDate
- dateOfBirth
- status (on_duty, off_duty, suspended)
- safetyScore
- tripsCompleted
- timestamps
```

### Trip
```
- tripNumber (auto-generated: TRIP-YYYYMMDD-0001)
- vehicleId (ref: Vehicle)
- driverId (ref: Driver)
- origin, destination
- cargoWeight, cargoDescription
- status (draft, dispatched, in_progress, completed, cancelled)
- scheduledDate, startTime, endTime
- startOdometer, endOdometer, distance
- revenue
- complianceCheck (validation flags)
- timestamps
```

### MaintenanceLog
```
- vehicleId (ref: Vehicle)
- serviceType (oil_change, tire_rotation, brake_service, etc.)
- description
- cost
- serviceDate, completionDate
- odometerAtService
- status (scheduled, in_progress, completed, cancelled)
- servicedBy
- notes
- parts (array with name, cost, quantity)
- laborCost
- timestamps
```

### Expense
```
- vehicleId (ref: Vehicle)
- tripId (ref: Trip) - optional
- amount
- expenseType (fuel, maintenance, toll, etc.)
- fuelType, liters - for fuel expenses
- description
- date
- timestamps
```

## 🔌 API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/[id]` - Get single vehicle
- `PUT /api/vehicles/[id]` - Update vehicle
- `DELETE /api/vehicles/[id]` - Delete vehicle

### Drivers
- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Create driver
- `GET /api/drivers/[id]` - Get single driver
- `PUT /api/drivers/[id]` - Update driver status

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create trip
- `GET /api/trips/[id]` - Get single trip
- `PUT /api/trips/[id]` - Update trip status (dispatch, start, complete, cancel)

### Maintenance
- `GET /api/maintenance` - Get all maintenance logs
- `POST /api/maintenance` - Create maintenance log
- `GET /api/maintenance/[id]` - Get single log
- `PUT /api/maintenance/[id]` - Update maintenance status

### Expenses
- `GET /api/fuel-expenses` - Get fuel expenses
- `POST /api/fuel-expenses` - Log fuel expense

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Runs on [http://localhost:3000](http://localhost:3000) with hot reload

### Production Build
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🔮 Future Enhancements

- [ ] Real-time GPS tracking for vehicles
- [ ] Mobile app (React Native)
- [ ] SMS/Email notifications
- [ ] Advanced reporting with filters
- [ ] Route optimization
- [ ] Fuel price predictions
- [ ] Insurance integration
- [ ] Multi-language support
- [ ] Payment gateway integration
- [ ] Two-factor authentication
- [ ] Vehicle telematics integration
- [ ] Automated compliance alerts

## 📄 License

This project is proprietary software. All rights reserved.

## 💬 Support

For issues, questions, or suggestions, please contact the development team.

---

**Built with ❤️ for efficient fleet management**
**Last Updated: February 21, 2026**
