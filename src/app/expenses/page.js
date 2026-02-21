'use client';

import { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { DataTable } from '@/components/DataTable';
import { FormModal } from '@/components/FormModal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function FuelExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const expenseFields = [
    {
      name: 'vehicleId',
      label: 'Select Vehicle',
      type: 'select',
      required: true,
      options: vehicles.map((v) => ({
        value: v._id,
        label: `${v.name} (${v.licensePlate})`,
      })),
    },
    {
      name: 'tripId',
      label: 'Trip (Optional)',
      type: 'select',
      required: false,
      options: [
        { value: '', label: 'None' },
        ...trips.map((t) => ({
          value: t._id,
          label: t.tripNumber,
        })),
      ],
    },
    { name: 'liters', label: 'Liters', type: 'number', required: true },
    { name: 'cost', label: 'Cost', type: 'number', required: true },
    { name: 'fuelDate', label: 'Date', type: 'date', required: true },
    { name: 'odometerReading', label: 'Odometer (km)', type: 'number', required: true },
    {
      name: 'fuelType',
      label: 'Fuel Type',
      type: 'select',
      required: true,
      options: [
        { value: 'diesel', label: 'Diesel' },
        { value: 'petrol', label: 'Petrol' },
        { value: 'electric', label: 'Electric' },
        { value: 'hybrid', label: 'Hybrid' },
      ],
    },
    { name: 'supplier', label: 'Supplier', type: 'text', required: false },
    { name: 'location', label: 'Location', type: 'text', required: false },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch fuel expenses
      const expensesRes = await fetch('/api/fuel-expenses');
      const expensesData = await expensesRes.json();
      setExpenses(expensesData.expenses || []);

      // Fetch vehicles
      const vehiclesRes = await fetch('/api/vehicles');
      const vehiclesData = await vehiclesRes.json();
      setVehicles(vehiclesData.vehicles || []);

      // Fetch trips
      const tripsRes = await fetch('/api/trips');
      const tripsData = await tripsRes.json();
      setTrips(tripsData.trips || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load fuel expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (formData) => {
    try {
      const res = await fetch('/api/fuel-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success('Fuel expense recorded');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to add expense');
      throw error;
    }
  };

  const expenseColumns = [
    {
      key: 'vehicleId',
      label: 'Vehicle',
      render: (_, row) => row.vehicleId?.name || 'N/A',
    },
    {
      key: 'fuelDate',
      label: 'Date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    { key: 'liters', label: 'Liters' },
    { key: 'cost', label: 'Cost' },
    {
      key: 'costPerLiter',
      label: 'Cost/L',
      render: (_, row) => (row.cost / row.liters).toFixed(2),
    },
    { key: 'fuelType', label: 'Type' },
    { key: 'odometerReading', label: 'Odometer' },
  ];

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
            <p className="text-zinc-600 font-semibold">Loading fuel expenses...</p>
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

  const totalFuelCost = expenses.reduce((sum, exp) => sum + (exp.cost || 0), 0);
  const totalLiters = expenses.reduce((sum, exp) => sum + (exp.liters || 0), 0);
  const avgCostPerLiter = totalLiters > 0 ? (totalFuelCost / totalLiters).toFixed(2) : 0;

  return (
    <ProtectedLayout requiredRoles={['financial_analyst', 'manager']}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900">
              💰 Fuel & Expenses
            </h1>
            <p className="text-zinc-500 mt-2">Track operational fuel costs</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="btn-primary self-start md:self-auto px-6 py-3 font-semibold"
          >
            + Record Expense
          </motion.button>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <motion.div
            whileHover={{ translateY: -4 }}
            className="card p-6 shadow-md"
          >
            <p className="text-zinc-600 text-sm font-semibold uppercase tracking-wide">
              💸 Total Expense
            </p>
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-zinc-900 mt-3"
            >
              ${totalFuelCost.toLocaleString('en', { maximumFractionDigits: 2 })}
            </motion.p>
          </motion.div>

          <motion.div
            whileHover={{ translateY: -4 }}
            className="card p-6 shadow-md"
          >
            <p className="text-zinc-600 text-sm font-semibold uppercase tracking-wide">
              ⛽ Total Liters
            </p>
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-zinc-900 mt-3"
            >
              {totalLiters.toLocaleString()}L
            </motion.p>
          </motion.div>

          <motion.div
            whileHover={{ translateY: -4 }}
            className="card p-6 shadow-md"
          >
            <p className="text-zinc-600 text-sm font-semibold uppercase tracking-wide">
              📊 Avg/Liter
            </p>
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold text-zinc-900 mt-3"
            >
              ${avgCostPerLiter}
            </motion.p>
          </motion.div>

          <motion.div
            whileHover={{ translateY: -4 }}
            className="card p-6 shadow-md"
          >
            <p className="text-zinc-600 text-sm font-semibold uppercase tracking-wide">
              📋 Records
            </p>
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-4xl font-bold text-zinc-900 mt-3"
            >
              {expenses.length}
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Expenses Table */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            📋 All Fuel Expenses
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
              {expenses.length}
            </span>
          </h2>
          <DataTable columns={expenseColumns} data={expenses} />
        </motion.div>

        {showModal && (
          <FormModal
            title="💰 Record Fuel Expense"
            fields={expenseFields}
            onSubmit={handleAddExpense}
            onClose={() => setShowModal(false)}
          />
        )}
      </motion.div>
    </ProtectedLayout>
  );
}
