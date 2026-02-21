'use client';

import { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { FormModal } from '@/components/FormModal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function TripDispatcherPage() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const tripFields = [
    {
      name: 'vehicleId',
      label: 'Select Vehicle',
      type: 'select',
      required: true,
      options: vehicles.map((v) => ({
        value: v._id,
        label: `${v.name} (${v.licensePlate}) - ${v.maxCapacity}kg capacity`,
      })),
    },
    {
      name: 'driverId',
      label: 'Select Driver',
      type: 'select',
      required: true,
      options: drivers.map((d) => ({
        value: d._id,
        label: `${d.name} (License: ${d.licenseNumber})`,
      })),
    },
    { name: 'origin', label: 'Origin', type: 'text', required: true },
    { name: 'destination', label: 'Destination', type: 'text', required: true },
    { name: 'cargoWeight', label: 'Cargo Weight (kg)', type: 'number', required: true },
    { name: 'cargoDescription', label: 'Cargo Description', type: 'text', required: false },
    { name: 'scheduledDate', label: 'Scheduled Date', type: 'datetime-local', required: true },
    { name: 'revenue', label: 'Revenue', type: 'number', required: false },
  ];

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch trips
      const tripsRes = await fetch(
        `/api/trips${filterStatus ? `?status=${filterStatus}` : ''}`
      );
      const tripsData = await tripsRes.json();
      setTrips(tripsData.trips || []);

      // Fetch available vehicles
      const vehiclesRes = await fetch('/api/vehicles?status=available');
      const vehiclesData = await vehiclesRes.json();
      setVehicles(vehiclesData.vehicles || []);

      // Fetch available drivers
      const driversRes = await fetch('/api/drivers?status=on_duty');
      const driversData = await driversRes.json();
      setDrivers(driversData.drivers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (formData) => {
    try {
      // Find the selected vehicle to check capacity
      const vehicle = vehicles.find((v) => v._id === formData.vehicleId);
      if (vehicle && formData.cargoWeight > vehicle.maxCapacity) {
        throw new Error(
          `Cargo weight (${formData.cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxCapacity}kg)`
        );
      }

      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      toast.success('Trip created successfully');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to create trip');
      throw error;
    }
  };

  const handleDispatchTrip = async (id) => {
    try {
      const trip = trips.find((t) => t._id === id);
      if (!trip) return;

      const res = await fetch(`/api/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'dispatched',
          startOdometer: trip.vehicleId?.odometer || 0,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success('Trip dispatched');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to dispatch trip');
    }
  };

  const handleCompleteTrip = async (id) => {
    try {
      const endOdometer = prompt('Enter final odometer reading (km):');
      if (!endOdometer) return;

      const res = await fetch(`/api/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          endOdometer: parseInt(endOdometer),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success('Trip completed');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to complete trip');
    }
  };

  const tripColumns = [
    { key: 'tripNumber', label: 'Trip #' },
    {
      key: 'vehicleId',
      label: 'Vehicle',
      render: (_, row) => row.vehicleId?.name || 'N/A',
    },
    {
      key: 'driverId',
      label: 'Driver',
      render: (_, row) => row.driverId?.name || 'N/A',
    },
    { key: 'origin', label: 'Origin' },
    { key: 'destination', label: 'Destination' },
    { key: 'cargoWeight', label: 'Load (kg)' },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-3">
          {row.status === 'draft' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDispatchTrip(row._id)}
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
            >
              ✈️ Dispatch
            </motion.button>
          )}
          {row.status === 'dispatched' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCompleteTrip(row._id)}
              className="text-emerald-600 hover:text-emerald-800 font-semibold text-sm"
            >
              ✓ Complete
            </motion.button>
          )}
          {row.status === 'completed' && (
            <span className="text-emerald-600 font-semibold text-sm">✓ Done</span>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <ProtectedLayout requiredRoles={['dispatcher', 'manager']}>
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
            <p className="text-zinc-600 font-semibold">Loading trips...</p>
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

  return (
    <ProtectedLayout requiredRoles={['dispatcher', 'manager']}>
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
              ✈️ Trip Dispatcher
            </h1>
            <p className="text-zinc-500 mt-2">Manage & dispatch fleet trips</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="btn-primary self-start md:self-auto px-6 py-3 font-semibold"
          >
            + Create Trip
          </motion.button>
        </motion.div>

        {/* Status Filter */}
        <motion.div variants={itemVariants} className="card p-6">
          <label className="label">🔍 Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="">All Trips</option>
            <option value="draft">Draft</option>
            <option value="dispatched">Dispatched</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </motion.div>

        {/* Trips Table */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            📋 All Trips
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
              {trips.length}
            </span>
          </h2>
          <DataTable columns={tripColumns} data={trips} />
        </motion.div>

        {showModal && (
          <FormModal
            title="+ Create New Trip"
            fields={tripFields}
            onSubmit={handleCreateTrip}
            onClose={() => setShowModal(false)}
          />
        )}
      </motion.div>
    </ProtectedLayout>
  );
}
