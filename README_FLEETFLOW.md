# FleetFlow - Modular Fleet & Logistics Management System

A comprehensive digital hub for fleet management, driver safety monitoring, and financial tracking.

## 🚀 Features

### Core Functionality
- **Login & Authentication**: Role-based access control (Manager, Dispatcher, Safety Officer, Financial Analyst)
- **Command Center Dashboard**: Real-time KPIs for fleet oversight
- **Vehicle Registry**: CRUD operations for asset management
- **Trip Dispatcher**: Workflow management with compliance checks
- **Driver Profiles**: Safety scores and license compliance tracking
- **Maintenance Logs**: Preventative and reactive health tracking
- **Fuel Expense Tracking**: Financial tracking per asset
- **Analytics & Reports**: Data-driven decision making with ROI calculations

### Key Business Rules
- **Cargo Weight Validation**: Prevents trips exceeding vehicle capacity
- **Driver License Compliance**: Blocks assignment if license is expired
- **Vehicle Status Management**: Automatic status updates based on trips and maintenance
- **Cost Calculation**: Automated operational cost (Fuel + Maintenance) per Vehicle ID
- **Safety Monitoring**: Driver incident tracking and safety score management

## 📋 User Roles

1. **Manager**: Full system access including vehicle management and analytics
2. **Dispatcher**: Create and manage trips, assigning drivers and vehicles
3. **Safety Officer**: Monitor driver compliance and maintenance schedules
4. **Financial Analyst**: Access to expense reports and ROI analytics

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + HTTP-Only Cookies
- **UI Components**: React, Framer Motion, React Hot Toast

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB instance (local or cloud)

### Setup Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create `.env.local` file with:
   ```
   DATABASE_URL=mongodb://localhost:27017/fleetflow
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Core Pages & Workflows

### Page 1: Login & Authentication
- Email/Password fields
- Forgot Password option
- Role-Based Access Control (RBAC)

### Page 2: Command Center (Main Dashboard)
**KPIs**:
- Active Fleet: Count of vehicles currently "On Trip"
- Maintenance Alerts: Number of vehicles "In Shop"
- Utilization Rate: % of fleet assigned vs. idle
- Pending Cargo: Shipments waiting for assignment

**Features**:
- Filters by Vehicle Type, Status, Region
- Real-time status updates

### Page 3: Vehicle Registry
- CRUD operations for physical assets
- Track: Name/Model, License Plate, Max Capacity, Odometer
- Manual toggle for "Out of Service"

### Page 4: Trip Dispatcher & Management
**Lifecycle**: Draft → Dispatched → Completed → Cancelled

**Validation Rules**:
- Prevent trip creation if CargoWeight > MaxCapacity
- Only available vehicles and on-duty drivers
- Check driver license validity before assignment

**Features**:
- Available vehicle selection
- Available driver assignment
- Real-time capacity validation

### Page 5: Maintenance & Service Logs
- Preventative and reactive health tracking
- Auto-link: Adding vehicle to "Service Log" sets status to "In Shop"
- Hides vehicle from Dispatcher's selection pool

### Page 6: Completed Trip & Fuel Logging
- Record Liters, Cost, and Date per vehicle
- Automated "Total Operational Cost" calculation
- Fuel efficiency tracking (km/L)

### Page 7: Driver Performance & Safety Profiles
- License expiry tracking (blocks assignment if expired)
- Performance: Trip completion rates
- Safety Scores (0-100)
- Status: On Duty, Off Duty, or Suspended

### Page 8: Operational Analytics & Financial Reports
**Metrics**:
- Fuel Efficiency: km/L
- Vehicle ROI: (Revenue - (Maintenance + Fuel)) / Acquisition Cost
- CSV/PDF exports for monthly reports

## 📊 Example Workflow

1. **Vehicle Intake**: Add "Van-05" (500kg capacity) → Status: Available
2. **Compliance**: Add Driver "Alex" → System verifies license validity
3. **Dispatching**: Assign "Alex" to "Van-05" for 450kg load
   - ✅ Check: 450 < 500 (Pass)
   - Status Update: Vehicle & Driver → On Trip
4. **Completion**: Driver marks trip "Done," enters final Odometer
   - Status Update: Vehicle & Driver → Available
5. **Maintenance**: Manager logs "Oil Change"
   - Auto: Status → In Shop
   - Vehicle hidden from Dispatcher
6. **Analytics**: System updates "Cost-per-km" based on fuel logs

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth with 7-day expiry
- **Role-Based Access Control**: Endpoint protection by user role
- **HTTP-Only Cookies**: Protection against XSS attacks
- **Password Hashing**: Bcrypt encryption for all passwords
- **Compliance Rules**: Business logic enforcement at API level

## 📈 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Vehicles
- `GET /api/vehicles` - List all vehicles (with filters)
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/:id` - Get vehicle details
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Drivers
- `GET /api/drivers` - List all drivers
- `POST /api/drivers` - Add driver
- `GET /api/drivers/:id` - Get driver details
- `PUT /api/drivers/:id` - Update driver status

### Trips
- `GET /api/trips` - List all trips (with status filter)
- `POST /api/trips` - Create trip (with validation)
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip status

### Maintenance
- `GET /api/maintenance` - List maintenance logs
- `POST /api/maintenance` - Log maintenance (auto-sets status)

### Fuel Expenses
- `GET /api/fuel-expenses` - List fuel expenses
- `POST /api/fuel-expenses` - Record fuel expense

## 🎨 UI Components

- **StatusBadge**: Displays status with color coding
- **DataTable**: Reusable table component with sorting
- **KPICard**: Dashboard metric cards
- **FormModal**: Reusable form modal for CRUD operations
- **ProtectedLayout**: Layout with auth guard and navigation
- **Navbar**: Role-based navigation menu

## 📝 Demo Credentials

**Manager Account**:
- Email: `manager@fleetflow.com`
- Password: `password123`

**Dispatcher Account**:
- Email: `dispatcher@fleetflow.com`
- Password: `password123`

## 🚀 Production Deployment

1. Update environment variables with production values
2. Set `NODE_ENV=production`
3. Use production MongoDB connection string
4. Set secure JWT_SECRET
5. Enable HTTPS in Next.js config
6. Configure CORS if needed

## 📞 Support

For issues or feature requests, please contact the development team.

## 📄 License

Proprietary - FleetFlow Inc.
