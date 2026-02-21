// Seed script for FleetFlow app
// Run this file with: node src/utils/seed.js

import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fleetflow';

async function seed() {
  await mongoose.connect(MONGODB_URI);

  // Clear existing data
  await Vehicle.deleteMany({});
  await Driver.deleteMany({});
  await Trip.deleteMany({});

  // Create vehicles
  const vehicles = await Vehicle.insertMany([
    {
      name: 'Truck Alpha',
      licensePlate: 'ABC123',
      model: 'Volvo FH',
      type: 'truck',
      maxCapacity: 20000,
      odometer: 120000,
      status: 'available',
      region: 'north',
      fuelType: 'diesel',
      averageFuelConsumption: 3.5,
    },
    {
      name: 'Van Beta',
      licensePlate: 'XYZ789',
      model: 'Ford Transit',
      type: 'van',
      maxCapacity: 3000,
      odometer: 45000,
      status: 'on_trip',
      region: 'south',
      fuelType: 'petrol',
      averageFuelConsumption: 7.2,
    },
    {
      name: 'Car Gamma',
      licensePlate: 'LMN456',
      model: 'Toyota Prius',
      type: 'car',
      maxCapacity: 500,
      odometer: 22000,
      status: 'in_shop',
      region: 'main',
      fuelType: 'hybrid',
      averageFuelConsumption: 4.1,
    },
  ]);

  // Create drivers
  const drivers = await Driver.insertMany([
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      licenseNumber: 'D1234567',
      licenseCategory: 'B',
      licenseExpiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      dateOfBirth: new Date('1985-06-15'),
      status: 'on_duty',
      safetyScore: 95,
      tripsCompleted: 12,
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1987654321',
      licenseNumber: 'D7654321',
      licenseCategory: 'C',
      licenseExpiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      dateOfBirth: new Date('1990-09-22'),
      status: 'off_duty',
      safetyScore: 88,
      tripsCompleted: 8,
    },
    {
      name: 'Alex Driver',
      email: 'alex.driver@example.com',
      phone: '+1122334455',
      licenseNumber: 'D1112223',
      licenseCategory: 'B',
      licenseExpiryDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // expired
      dateOfBirth: new Date('1978-03-10'),
      status: 'suspended',
      safetyScore: 60,
      tripsCompleted: 3,
    },
  ]);

  // Create trips
  await Trip.create({
    vehicleId: vehicles[0]._id,
    driverId: drivers[0]._id,
    origin: 'Warehouse A',
    destination: 'Retailer X',
    cargoWeight: 15000,
    cargoDescription: 'Electronics',
    status: 'completed',
    startOdometer: 120000,
    endOdometer: 120250,
    scheduledDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 3600000),
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 7200000),
    revenue: 1200,
    complianceCheck: { driverLicenseValid: true, vehicleCapacityValid: true, vehicleInService: true },
  });
  await Trip.create({
    vehicleId: vehicles[1]._id,
    driverId: drivers[1]._id,
    origin: 'Depot B',
    destination: 'Client Y',
    cargoWeight: 2000,
    cargoDescription: 'Furniture',
    status: 'dispatched',
    startOdometer: 45000,
    endOdometer: null,
    scheduledDate: new Date(),
    startTime: null,
    endTime: null,
    revenue: 500,
    complianceCheck: { driverLicenseValid: true, vehicleCapacityValid: true, vehicleInService: true },
  });

  console.log('Database seeded successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
