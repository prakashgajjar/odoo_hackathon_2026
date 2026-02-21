# FleetFlow System Architecture & Implementation Summary

## 🎯 Project Overview

**FleetFlow** is a comprehensive fleet and logistics management system designed to replace inefficient manual logbooks with a centralized, rule-based digital hub. The system optimizes the lifecycle of a delivery fleet, monitors driver safety, and tracks financial performance.

## 📊 Database Schema

### User Model
```
- _id: ObjectId
- email: String (unique)
- password: String (hashed with bcrypt)
- name: String
- phone: String
- role: enum ['manager', 'dispatcher', 'safety_officer', 'financial_analyst']
- department: enum ['fleet', 'operations', 'safety', 'finance']
- isActive: Boolean
- lastLogin: Date
- createdAt, updatedAt: Timestamps
```

**Methods**:
- `matchPassword(password)` - Compare passwords securely

### Vehicle Model
```
- _id: ObjectId
- name: String
- licensePlate: String (unique, uppercase)
- model: String
- type: enum ['truck', 'van', 'bike', 'car']
- maxCapacity: Number (kg)
- odometer: Number (km)
- status: enum ['available', 'on_trip', 'in_shop', 'retired']
- acquisitionCost: Number
- acquisitionDate: Date
- region: String
- lastMaintenanceDate: Date
- nextMaintenanceDate: Date
- fuelType: enum ['diesel', 'petrol', 'electric', 'hybrid']
- averageFuelConsumption: Number (km/L)
- isOutOfService: Boolean
- createdAt, updatedAt: Timestamps
```

**Statuses**:
- `available`: Ready for dispatch
- `on_trip`: Currently on a delivery
- `in_shop`: Under maintenance
- `retired`: Permanently out of service

### Driver Model
```
- _id: ObjectId
- name: String
- email: String (unique)
- phone: String
- licenseNumber: String (unique)
- licenseCategory: enum ['A', 'B', 'C', 'D', 'E']
- licenseExpiryDate: Date
- dateOfBirth: Date
- status: enum ['on_duty', 'off_duty', 'suspended']
- safetyScore: Number (0-100)
- tripsCompleted: Number
- totalKmDriven: Number
- vehicleAssignments: Array of {vehicleId, assignedDate, unassignedDate, isPrimary}
- incidents: Number
- isActive: Boolean
- joinDate: Date
- createdAt, updatedAt: Timestamps
```

**Methods**:
- `isLicenseValid()` - Check if license is not expired

### Trip Model
```
- _id: ObjectId
- tripNumber: String (auto-generated, unique)
- vehicleId: ObjectId (ref: Vehicle)
- driverId: ObjectId (ref: Driver)
- origin: String
- destination: String
- cargoWeight: Number (kg)
- cargoDescription: String
- status: enum ['draft', 'dispatched', 'in_progress', 'completed', 'cancelled']
- startOdometer: Number
- endOdometer: Number
- distance: Number (calculated)
- scheduledDate: Date
- startTime: Date
- endTime: Date
- notes: String
- revenue: Number
- complianceCheck: {
    driverLicenseValid: Boolean,
    vehicleCapacityValid: Boolean,
    vehicleInService: Boolean
  }
- createdAt, updatedAt: Timestamps
```

**Pre-save Hooks**:
- Auto-generate tripNumber: `TRIP-YYYYMMDD-{count}`
- Auto-calculate distance: `endOdometer - startOdometer`

### MaintenanceLog Model
```
- _id: ObjectId
- vehicleId: ObjectId (ref: Vehicle)
- serviceType: enum ['oil_change', 'tire_rotation', 'brake_service', 'filter_replacement', 'inspection', 'repair', 'other']
- description: String
- cost: Number
- serviceDate: Date
- odometerAtService: Number
- completionDate: Date
- status: enum ['scheduled', 'in_progress', 'completed', 'cancelled']
- servicedBy: String
- notes: String
- parts: Array of {name, cost, quantity}
- laborCost: Number
- createdAt, updatedAt: Timestamps
```

**Post-save Hook**:
- If status is 'scheduled' or 'in_progress': Set vehicle status to 'in_shop'
- If status is 'completed': Check for other ongoing maintenance; if none, set vehicle to 'available'

### FuelExpense Model
```
- _id: ObjectId
- vehicleId: ObjectId (ref: Vehicle)
- tripId: ObjectId (ref: Trip, optional)
- liters: Number
- cost: Number
- fuelDate: Date
- odometerReading: Number
- fuelType: enum ['diesel', 'petrol', 'electric', 'hybrid']
- supplier: String
- location: String
- notes: String
- createdAt, updatedAt: Timestamps
```

**Methods**:
- `calculateEfficiency(previousOdometer)` - Return km/L

### ServiceLog Model
```
- _id: ObjectId
- vehicleId: ObjectId (ref: Vehicle)
- name: String
- startDate: Date
- endDate: Date
- status: enum ['active', 'completed', 'cancelled']
- reason: enum ['maintenance', 'repair', 'inspection', 'recall', 'other']
- description: String
- estimatedCost: Number
- actualCost: Number
- priority: enum ['low', 'medium', 'high', 'critical']
- assignedTo: ObjectId (ref: User)
- createdAt, updatedAt: Timestamps
```

## 🔐 Authentication & Authorization

### JWT Strategy
- **Token Generation**: `generateToken(userId, role)` - Creates 7-day expiring JWT
- **Token Verification**: `verifyToken(token)` - Validates JWT signature and expiry
- **Storage**: HTTP-Only cookies for XSS protection
- **Secret**: Environment variable `JWT_SECRET`

### Role-Based Access Control (RBAC)
```
Manager:
  - All dashboard/analytics access
  - Vehicle management (CRUD)
  - View all reports
  - Manage maintenance logs

Dispatcher:
  - Create and manage trips
  - View available vehicles and drivers
  - Trip status updates

Safety Officer:
  - Driver management
  - Maintenance monitoring
  - License compliance tracking
  - Safety scoring

Financial Analyst:
  - Analytics dashboard
  - Expense reports
  - ROI calculations
  - CSV/PDF exports
```

## 🔌 API Routes Structure

### Authentication Endpoints
```
POST   /api/auth/login       - Login user (email, password)
POST   /api/auth/signup      - Register new user (email, password, name, role)
POST   /api/auth/logout      - Logout user
GET    /api/auth/me          - Get current user profile
```

### Vehicle Endpoints
```
GET    /api/vehicles         - List vehicles (filters: status, type, region)
POST   /api/vehicles         - Create vehicle (manager only)
GET    /api/vehicles/:id     - Get vehicle details
PUT    /api/vehicles/:id     - Update vehicle (manager only)
DELETE /api/vehicles/:id     - Delete vehicle (manager only)
```

### Driver Endpoints
```
GET    /api/drivers          - List drivers (filter: status)
POST   /api/drivers          - Add driver (manager/dispatcher)
GET    /api/drivers/:id      - Get driver details
PUT    /api/drivers/:id      - Update driver (manager/dispatcher)
```

### Trip Endpoints
```
GET    /api/trips            - List trips (filter: status)
POST   /api/trips            - Create trip with validation (dispatcher only)
  - Validates: cargo weight ≤ maxCapacity
  - Validates: driver license expiry
  - Validates: vehicle is available
GET    /api/trips/:id        - Get trip details
PUT    /api/trips/:id        - Update trip status (manager/dispatcher)
  - Draft → Dispatched: Sets vehicle/driver status to "on_trip"
  - Dispatched → Completed: Sets vehicle/driver status to "available"
```

### Maintenance Endpoints
```
GET    /api/maintenance      - List maintenance logs (filter: vehicleId)
POST   /api/maintenance      - Log maintenance (manager/safety_officer)
```

### Fuel Expense Endpoints
```
GET    /api/fuel-expenses    - List fuel expenses (filter: vehicleId, tripId)
POST   /api/fuel-expenses    - Record fuel expense (dispatcher/manager/financial_analyst)
```

## 🎨 Frontend Pages & Components

### Pages
1. **Login** (`/login`) - Authentication & user registration
2. **Dashboard** (`/dashboard`) - Command Center with KPIs
3. **Vehicles** (`/vehicles`) - Vehicle Registry with CRUD
4. **Trips** (`/trips`) - Trip Dispatcher with workflow
5. **Drivers** (`/drivers`) - Driver Profiles & compliance
6. **Maintenance** (`/maintenance`) - Service logs & health tracking
7. **Expenses** (`/expenses`) - Fuel & expense logging
8. **Analytics** (`/analytics`) - Financial reports & ROI

### Reusable Components
- **StatusBadge** - Color-coded status display
- **DataTable** - Sortable data table with actions
- **KPICard** - Dashboard metric cards
- **FormModal** - Generic form modal for CRUD
- **ProtectedLayout** - Auth guard + navigation
- **Navbar** - Role-based navigation menu

## 💼 Business Logic & Workflows

### Trip Creation Workflow
```
1. Dispatcher initiates trip creation
2. System validates:
   ✓ Vehicle exists and status == 'available'
   ✓ Cargo weight ≤ vehicle.maxCapacity
   ✓ Driver exists and status == 'on_duty'
   ✓ Driver license is valid (expiry > today)
   ✓ Driver license category matches vehicle requirements
3. Trip created with status = 'draft'
4. Compliance check recorded in trip.complianceCheck
```

### Trip Dispatch Flow
```
1. Dispatcher views draft trip
2. Clicks "Dispatch" button
3. System updates:
   - Trip status: draft → dispatched
   - Vehicle status: available → on_trip
   - Driver status: off_duty → on_duty
4. Trip begins with startOdometer recorded
```

### Trip Completion Flow
```
1. Driver enters final odometer reading
2. System calculates:
   - distance = endOdometer - startOdometer
   - Updates vehicle.odometer
3. Trip status: dispatched → completed
4. Vehicle status: on_trip → available
5. Driver status: on_duty → off_duty
6. Fuel efficiency metrics updated
```

### Maintenance workflow
```
1. Manager logs maintenance/service
2. System automatically:
   - Sets vehicle.status = 'in_shop'
   - Hides vehicle from dispatcher's available pool
3. Maintenance completed
4. System checks if other active maintenance exists
5. If none: Sets vehicle.status = 'available'
```

## 📊 Key Metrics & Calculations

### Dashboard KPIs
```
Active Fleet = COUNT(vehicles WHERE status == 'on_trip')
Maintenance Alerts = COUNT(vehicles WHERE status == 'in_shop')
Utilization Rate = (activeFleet + maintenanceAlerts) / totalVehicles * 100
Pending Cargo = COUNT(trips WHERE status == 'draft')
```

### Financial Metrics
```
Total Revenue = SUM(trip.revenue for all completed trips)
Total Fuel Cost = SUM(fuelExpense.cost)
Total Maintenance Cost = SUM(maintenanceLog.cost)
Operational Cost = Fuel Cost + Maintenance Cost
Net Profit = Revenue - Operational Cost
Cost per Trip = Operational Cost / Total Trips
```

### Vehicle ROI
```
Vehicle ROI = ((Revenue - (Fuel Cost + Maintenance Cost)) / Acquisition Cost) * 100
```

### Fuel Efficiency
```
Fuel Efficiency = Total Distance Driven / Total Liters Consumed (km/L)
Cost per Liter = Total Fuel Cost / Total Liters
```

## 🚀 Features Checklist

### ✅ Completed
- [x] User authentication with JWT
- [x] Role-based access control (4 roles)
- [x] Vehicle CRUD with status management
- [x] Driver management with license tracking
- [x] Trip creation with validation
- [x] Cargo weight capacity validation
- [x] Driver license compliance checks
- [x] Maintenance logging with auto-status
- [x] Fuel expense tracking
- [x] Dashboard with real-time KPIs
- [x] Analytics & financial reporting
- [x] CSV export functionality
- [x] Vehicle ROI calculations
- [x] Driver safety score tracking
- [x] License expiry alerts
- [x] Responsive UI with Tailwind CSS
- [x] Error handling & validation
- [x] Toast notifications
- [x] Protected routes with ProtectedLayout

### 🎯 Future Enhancements
- [ ] Real-time GPS tracking
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboards
- [ ] Automated alerts/notifications
- [ ] Integration with payment systems
- [ ] Barcode scanning for cargo
- [ ] Driver mobile app for trip updates
- [ ] Email reports scheduling
- [ ] Multi-language support
- [ ] Audit logging
- [ ] Version control for configuration changes

## 🌐 Deployment

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- Environment variables configured

### Steps
```bash
# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with production values

# Build
npm run build

# Start
npm start
```

### Environment Variables
```
DATABASE_URL        # MongoDB connection string
JWT_SECRET         # Secret for JWT signing
NODE_ENV           # 'production' or 'development'
NEXT_PUBLIC_API_URL # Frontend API endpoint
```

## 📁 Project Structure
```
/src
  /app
    /api                 # API routes
      /auth
      /vehicles
      /drivers
      /trips
      /maintenance
      /fuel-expenses
    /dashboard           # Main dashboard
    /vehicles            # Vehicle registry
    /trips               # Trip dispatcher
    /drivers             # Driver management
    /maintenance         # Maintenance logs
    /expenses            # Fuel expenses
    /analytics           # Analytics & reports
    /login               # Login page
    layout.js            # Root layout
    page.js              # Home page
  /components            # Reusable components
    Navbar.js
    StatusBadge.js
    DataTable.js
    KPICard.js
    FormModal.js
    ProtectedLayout.js
  /lib                   # Utilities & helpers
    db.js                # MongoDB connection
    auth.js              # JWT utilities
    middleware.js        # Auth middleware
    clientAuth.js        # Client-side auth
  /models                # Database models
    User.js
    Vehicle.js
    Driver.js
    Trip.js
    MaintenanceLog.js
    FuelExpense.js
    ServiceLog.js
  /utils                 # Helper functions
    helpers.js
    status.js
```

## 🔒 Security Best Practices Implemented

1. **Password Security**: Bcrypt hashing with salt rounds
2. **Token Security**: JWT with expiration + HTTP-Only cookies
3. **CSRF Protection**: HTTP-Only, Secure, SameSite flags
4. **RBAC**: Endpoint protection by user role
5. **Input Validation**: Schema validation on all models
6. **Secure Headers**: Missing but can be added with middleware
7. **Rate Limiting**: Can be added with express-rate-limit
8. **SQL Injection**: Not applicable (MongoDB with Mongoose)

## 🎓 Learning Resources

- Next.js: nextjs.org
- MongoDB: mongodb.com
- Mongoose: mongoosejs.com
- Tailwind CSS: tailwindcss.com
- JWT: jwt.io
- Bcrypt: npmjs.com/package/bcrypt

## 📞 Support & Maintenance

For production deployment, ensure:
- MongoDB backups are configured
- Environment secrets are secure
- Rate limiting is implemented
- Monitoring & logging are set up
- HTTPS is enforced
- CORS is properly configured

---

**FleetFlow v1.0** - Built with Next.js, MongoDB, and modern web technologies.
