# FleetFlow - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Clone & Install
```bash
# Navigate to project directory
cd d:\HACKATHON\ODOO\PROJECTS\project

# Install all dependencies
npm install
```

### Step 2: Configure Database
You have two options:

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition from mongodb.com
# or use MongoDB Atlas (cloud)

# In .env.local:
DATABASE_URL=mongodb://localhost:27017/fleetflow
```

**Option B: MongoDB Atlas (Cloud)**
```
1. Go to mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to .env.local:
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/fleetflow
```

### Step 3: Configure Environment
Edit `.env.local`:
```
DATABASE_URL=mongodb://localhost:27017/fleetflow
JWT_SECRET=your-super-secret-key-12345
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Open in Browser
Navigate to: **http://localhost:3000**

You'll be automatically redirected to login page.

## 🔑 Demo Login Credentials

Create first user or use these demo accounts:

```
Manager Account:
Email:    manager@fleetflow.com
Password: password123
Role:     Manager

Dispatcher Account:
Email:    dispatcher@fleetflow.com
Password: password123
Role:     Dispatcher

Safety Officer Account:
Email:    officer@fleetflow.com
Password: password123
Role:     Safety Officer

Financial Analyst Account:
Email:    analyst@fleetflow.com
Password: password123
Role:     Financial Analyst
```

**Note**: Create these accounts on the signup page first, then use them to login.

## 📝 Common Tasks

### Creating Sample Data

**Add a Vehicle**:
1. Login as Manager
2. Go to "Vehicles" menu
3. Click "+ Add Vehicle"
4. Fill form:
   - Name: "Van-05"
   - License Plate: "ABC123"
   - Model: "Ford Transit"
   - Type: "Van"
   - Max Capacity: 500
   - Fuel Type: Diesel
5. Click Submit

**Add a Driver**:
1. Go to "Drivers" menu
2. Click "+ Add Driver"
3. Fill form with driver details
4. License expiry date must be in future
5. Submit

**Create a Trip**:
1. Go to "Trips" menu
2. Click "+ Create Trip"
3. Select available vehicle and driver
4. Fill origin, destination, cargo weight
5. Cargo weight must be ≤ vehicle max capacity
6. Submit (creates as "draft")
7. Click "Dispatch" to start trip
8. Click "Complete" and enter final odometer

### Checking Analytics
1. Login as Financial Analyst
2. Go to "Analytics" menu
3. View KPIs and vehicle ROI
4. Click "📥 Export to CSV" for reports

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solution:
- Check MongoDB is running (local) or connection string (Atlas)
- Verify DATABASE_URL in .env.local
- Restart dev server after fixing
```

### JWT Authentication Error
```
Error: Unauthorized

Solution:
- Check JWT_SECRET is set in .env.local
- Clear cookies in browser DevTools
- Login again
- Restart dev server
```

### Port Already in Use
```
Error: Port 3000 already in use

Solution:
- Kill process on port 3000: npx kill-port 3000
- Or use different port: npm run dev -- -p 3001
```

### Module Not Found
```
Error: Cannot find module '@/components/...'

Solution:
- Run: npm install
- Check jsconfig.json has paths configured correctly
- Restart dev server
```

## 📊 About Permissions

Each role has specific access:

**Manager**: 
- All pages (full access)
- Can create/edit/delete vehicles
- Can manage maintenance
- Can view analytics

**Dispatcher**:
- Dashboard, Trips, Drivers
- Can create trips
- Can manage trip status
- Cannot delete vehicles

**Safety Officer**:
- Dashboard, Drivers, Maintenance
- Can manage driver status
- Can log maintenance
- Read-only for analytics

**Financial Analyst**:
- Analytics, Expenses
- Can view all financial data
- Can export reports
- Cannot modify core data

## 🔄 Development Workflow

### Making Changes
1. Edit files in `/src`
2. Save file (auto-reload in browser)
3. Check console for errors
4. Test in UI

### Adding New Page
1. Create folder: `/src/app/new-page`
2. Create file: `page.js`
3. Wrap with `<ProtectedLayout requiredRoles={['role']}>`
4. Update Navbar.js with link
5. Create API endpoint if needed

### Adding DB Model
1. Create file: `/src/models/ModelName.js`
2. Define schema
3. Export as: `mongoose.models.ModelName || mongoose.model('ModelName', schema)`

### Creating API Endpoint
1. Create route: `/src/app/api/resource/route.js`
2. Export POST/GET/PUT/DELETE functions
3. Use `getUserFromCookie()` for auth
4. Return NextResponse.json()

## 📦 Build for Production

```bash
# Build optimized version
npm run build

# Test production build locally
npm start

# Deploy to Vercel, Netlify, or your hosting provider
# Don't forget to set environment variables in hosting platform
```

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Use MongoDB Atlas with strong password
- [ ] Enable HTTPS in production
- [ ] Set NODE_ENV=production
- [ ] Configure CORS if APIs are used from different domain
- [ ] Enable rate limiting (add middleware)
- [ ] Set up monitoring/logging
- [ ] Regular backups of MongoDB

## 📚 File Structure Quick Reference

```
package.json          ← Dependencies
.env.local            ← Environment variables
next.config.mjs       ← Next.js config

/src
  /app                ← Pages & API routes
    /api              ← REST API endpoints
    page.js           ← Home page (→ /login)
    layout.js         ← Root layout
  
  /components         ← React components
  /models             ← MongoDB schemas
  /lib                ← Utilities (auth, db)
  /utils              ← Helper functions
```

## 🎯 Next Steps

1. **Explore the UI**: Create vehicles, drivers, trips
2. **Check database**: Connect to MongoDB to see data
3. **Review code**: Read comments in `/src/models` and `/src/app/api`
4. **Modify**: Customize colors, add fields, change business logic
5. **Deploy**: Push to GitHub and deploy to Vercel

## 📞 Help & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **Mongoose Docs**: https://mongoosejs.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

## 🎉 You're Ready!

The FleetFlow system is now running. Start with:
1. Create a test vehicle
2. Add a test driver
3. Create and dispatch a test trip
4. Check analytics dashboard

Happy coding! 🚀
