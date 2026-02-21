'use client';

import { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { KPICard } from '@/components/KPICard';
import { DataTable } from '@/components/DataTable';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const [vehicles, setVehicles] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalFuelCost: 0,
    totalMaintenanceCost: 0,
    avgFuelEfficiency: 0,
    operationalCost: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all data
      const [vehiclesRes, expensesRes, tripsRes, maintenanceRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/fuel-expenses'),
        fetch('/api/trips'),
        fetch('/api/maintenance'),
      ]);

      const vehiclesData = await vehiclesRes.json();
      const expensesData = await expensesRes.json();
      const tripsData = await tripsRes.json();
      const maintenanceData = await maintenanceRes.json();

      setVehicles(vehiclesData.vehicles || []);
      setExpenses(expensesData.expenses || []);
      setTrips(tripsData.trips || []);
      setMaintenanceLogs(maintenanceData.logs || []);

      // Calculate analytics
      calculateAnalytics(
        vehiclesData.vehicles || [],
        expensesData.expenses || [],
        tripsData.trips || [],
        maintenanceData.logs || []
      );
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (veh, exp, trip, maint) => {
    // Total revenue
    const totalRevenue = trip.reduce((sum, t) => sum + (t.revenue || 0), 0);

    // Total fuel cost
    const totalFuelCost = exp.reduce((sum, e) => sum + (e.cost || 0), 0);

    // Total maintenance cost
    const totalMaintenanceCost = maint.reduce((sum, m) => sum + (m.cost || 0), 0);

    // Average fuel efficiency (km/L)
    const avgFuelEfficiency = exp.length > 0
      ? (trip.reduce((sum, t) => sum + (t.distance || 0), 0) / exp.reduce((sum, e) => sum + (e.liters || 0), 0)).toFixed(2)
      : 0;

    // Operational cost
    const operationalCost = totalFuelCost + totalMaintenanceCost;

    setAnalytics({
      totalRevenue,
      totalFuelCost,
      totalMaintenanceCost,
      avgFuelEfficiency,
      operationalCost,
    });
  };

  const calculateVehicleROI = (vehicle) => {
    const vehicleExpenses = expenses.filter((e) => e.vehicleId === vehicle._id);
    const vehicleTrips = trips.filter((t) => t.vehicleId === vehicle._id);
    const vehicleMaintenance = maintenanceLogs.filter((m) => m.vehicleId === vehicle._id);

    const totalRevenue = vehicleTrips.reduce((sum, t) => sum + (t.revenue || 0), 0);
    const totalFuelCost = vehicleExpenses.reduce((sum, e) => sum + (e.cost || 0), 0);
    const totalMaintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
    const acquisitionCost = vehicle.acquisitionCost || 0;

    if (acquisitionCost === 0) return 0;

    const roi = (
      ((totalRevenue - (totalFuelCost + totalMaintenanceCost)) / acquisitionCost) * 100
    ).toFixed(2);

    return roi;
  };

  const vehicleAnalyticsColumns = [
    { key: 'name', label: 'Vehicle' },
    { key: 'licensePlate', label: 'License Plate' },
    {
      key: 'trips',
      label: 'Trips',
      render: (_, row) => trips.filter((t) => t.vehicleId === row._id).length,
    },
    {
      key: 'revenue',
      label: 'Revenue',
      render: (_, row) =>
        trips
          .filter((t) => t.vehicleId === row._id)
          .reduce((sum, t) => sum + (t.revenue || 0), 0)
          .toFixed(2),
    },
    {
      key: 'fuelCost',
      label: 'Fuel Cost',
      render: (_, row) =>
        expenses
          .filter((e) => e.vehicleId === row._id)
          .reduce((sum, e) => sum + (e.cost || 0), 0)
          .toFixed(2),
    },
    {
      key: 'maintenanceCost',
      label: 'Maintenance',
      render: (_, row) =>
        maintenanceLogs
          .filter((m) => m.vehicleId === row._id)
          .reduce((sum, m) => sum + (m.cost || 0), 0)
          .toFixed(2),
    },
    {
      key: 'roi',
      label: 'ROI %',
      render: (_, row) => {
        const roi = calculateVehicleROI(row);
        const color = roi > 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold';
        return <span className={color}>{roi}%</span>;
      },
    },
  ];

  const exportToCSV = () => {
    const headers = ['Vehicle', 'License Plate', 'Trips', 'Revenue', 'Fuel Cost', 'Maintenance', 'ROI %'];
    const rows = vehicles.map((v) => [
      v.name,
      v.licensePlate,
      trips.filter((t) => t.vehicleId === v._id).length,
      trips
        .filter((t) => t.vehicleId === v._id)
        .reduce((sum, t) => sum + (t.revenue || 0), 0)
        .toFixed(2),
      expenses
        .filter((e) => e.vehicleId === v._id)
        .reduce((sum, e) => sum + (e.cost || 0), 0)
        .toFixed(2),
      maintenanceLogs
        .filter((m) => m.vehicleId === v._id)
        .reduce((sum, m) => sum + (m.cost || 0), 0)
        .toFixed(2),
      calculateVehicleROI(v),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleet-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Report exported as CSV');
  };

  if (loading) {
    return (
      <ProtectedLayout requiredRoles={['financial_analyst', 'manager']}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="relative w-16 h-16 mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-0 rounded-full border-4 border-zinc-200" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-zinc-900 border-r-zinc-900" />
            </motion.div>
            <p className="text-zinc-600 font-semibold">Loading analytics...</p>
          </motion.div>
        </div>
      </ProtectedLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const netOperationalCost = analytics.totalRevenue - analytics.operationalCost;

  return (
    <ProtectedLayout requiredRoles={['financial_analyst', 'manager']}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900">
              📊 Analytics & Reports
            </h1>
            <p className="text-zinc-500 mt-2">Financial performance & fleet insights</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToCSV}
            className="btn-primary self-start md:self-auto px-6 py-3 font-semibold"
          >
            📥 Export CSV
          </motion.button>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          <KPICard
            title="Total Revenue"
            value={`$${analytics.totalRevenue.toLocaleString('en', { maximumFractionDigits: 0 })}`}
            icon="💰"
            trend={12}
          />
          <KPICard
            title="Fuel Cost"
            value={`$${analytics.totalFuelCost.toLocaleString('en', { maximumFractionDigits: 0 })}`}
            icon="⛽"
            trend={-5}
          />
          <KPICard
            title="Maintenance"
            value={`$${analytics.totalMaintenanceCost.toLocaleString('en', { maximumFractionDigits: 0 })}`}
            icon="🔧"
            trend={-3}
          />
          <KPICard
            title="Fuel Efficiency"
            value={`${analytics.avgFuelEfficiency} km/L`}
            icon="📈"
            trend={8}
          />
          <KPICard
            title="Net Profit"
            value={`$${netOperationalCost.toLocaleString('en', { maximumFractionDigits: 0 })}`}
            icon="💹"
            trend={netOperationalCost > 0 ? 15 : -5}
          />
        </motion.div>

        {/* Vehicle Analytics Table */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            📈 Vehicle Performance & ROI
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
              {vehicles.length}
            </span>
          </h2>
          <DataTable columns={vehicleAnalyticsColumns} data={vehicles} />
        </motion.div>

        {/* Summary Section */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Fleet Summary */}
          <motion.div className="card p-6">
            <h3 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
              🚗 Fleet Summary
            </h3>
            <ul className="space-y-4">
              <li className="flex justify-between items-center">
                <span className="text-zinc-600 font-medium">Total Vehicles</span>
                <span className="text-2xl font-bold text-zinc-900">{vehicles.length}</span>
              </li>
              <li className="flex justify-between items-center border-t border-zinc-200 pt-4">
                <span className="text-zinc-600 font-medium">Total Trips</span>
                <span className="text-2xl font-bold text-zinc-900">{trips.length}</span>
              </li>
              <li className="flex justify-between items-center border-t border-zinc-200 pt-4">
                <span className="text-zinc-600 font-medium">Completed</span>
                <span className="text-2xl font-bold text-emerald-600">{trips.filter(t => t.status === 'completed').length}</span>
              </li>
              <li className="flex justify-between items-center border-t border-zinc-200 pt-4">
                <span className="text-zinc-600 font-medium">Avg Mileage</span>
                <span className="text-lg font-bold text-zinc-900">
                  {(vehicles.reduce((sum, v) => sum + (v.odometer || 0), 0) / Math.max(vehicles.length, 1)).toLocaleString('en', { maximumFractionDigits: 0 })} km
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Expense Breakdown */}
          <motion.div className="card p-6">
            <h3 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
              💸 Expense Breakdown
            </h3>
            <ul className="space-y-4">
              <li className="flex justify-between items-center">
                <span className="text-zinc-600 font-medium">Fuel Cost</span>
                <span className="text-xl font-bold text-zinc-900">${analytics.totalFuelCost.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
              </li>
              <li className="flex justify-between items-center border-t border-zinc-200 pt-4">
                <span className="text-zinc-600 font-medium">Maintenance</span>
                <span className="text-xl font-bold text-zinc-900">${analytics.totalMaintenanceCost.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
              </li>
              <li className="flex justify-between items-center border-t border-zinc-200 pt-4">
                <span className="text-zinc-600 font-medium">Total Operational</span>
                <span className="text-xl font-bold text-zinc-900">${analytics.operationalCost.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
              </li>
              <li className="flex justify-between items-center border-t border-zinc-200 pt-4">
                <span className="text-zinc-600 font-medium">Per Trip Cost</span>
                <span className="text-lg font-bold text-zinc-900">${(analytics.operationalCost / Math.max(trips.length, 1)).toLocaleString('en', { maximumFractionDigits: 2 })}</span>
              </li>
            </ul>
          </motion.div>

          {/* Key Metrics */}
          <motion.div className="card p-6">
            <h3 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
              📊 Key Metrics
            </h3>
            <ul className="space-y-4">
              <li className="flex justify-between items-center">
                <span className="text-zinc-600 font-medium">Total Fuel (L)</span>
                <span className="text-2xl font-bold text-zinc-900">{expenses.reduce((sum, e) => sum + (e.liters || 0), 0).toLocaleString('en', { maximumFractionDigits: 0 })}</span>
              </li>
              <li className="flex justify-between items-center border-t border-zinc-200 pt-4">
                <span className="text-zinc-600 font-medium">Cost per Liter</span>
                <span className="text-lg font-bold text-zinc-900">
                  ${(analytics.totalFuelCost / Math.max(expenses.reduce((sum, e) => sum + (e.liters || 0), 0), 1)).toLocaleString('en', { maximumFractionDigits: 2 })}
                </span>
              </li>
              <li className="flex justify-between items-center border-t border-zinc-200 pt-4">
                <span className="text-zinc-600 font-medium">Avg Efficiency</span>
                <span className="text-2xl font-bold text-zinc-900">{analytics.avgFuelEfficiency} km/L</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </motion.div>
    </ProtectedLayout>
  );
}
