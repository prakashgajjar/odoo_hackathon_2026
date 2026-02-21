'use client';

import { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { FormModal } from '@/components/FormModal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function VehicleRegistryPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const vehicleFields = [
    { name: 'name', label: 'Vehicle Name', type: 'text', required: true },
    { name: 'licensePlate', label: 'License Plate', type: 'text', required: true },
    { name: 'model', label: 'Model', type: 'text', required: true },
    {
      name: 'type',
      label: 'Vehicle Type',
      type: 'select',
      required: true,
      options: [
        { value: 'truck', label: 'Truck' },
        { value: 'van', label: 'Van' },
        { value: 'bike', label: 'Bike' },
        { value: 'car', label: 'Car' },
      ],
    },
    { name: 'maxCapacity', label: 'Max Capacity (kg)', type: 'number', required: true },
    { name: 'odometer', label: 'Odometer (km)', type: 'number', required: false },
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
    { name: 'acquisitionCost', label: 'Acquisition Cost', type: 'number', required: false },
    { name: 'region', label: 'Region', type: 'text', required: false },
  ];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (formData) => {
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      const data = await res.json();
      toast.success('Vehicle added successfully');
      setShowModal(false);
      fetchVehicles();
    } catch (error) {
      toast.error(error.message || 'Failed to add vehicle');
      throw error;
    }
  };

  const handleUpdateVehicle = async (formData) => {
    try {
      const res = await fetch(`/api/vehicles/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success('Vehicle updated successfully');
      setEditingId(null);
      setShowModal(false);
      fetchVehicles();
    } catch (error) {
      toast.error(error.message || 'Failed to update vehicle');
      throw error;
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      toast.error(error.message || 'Failed to delete vehicle');
    }
  };

  const handleEditClick = (vehicle) => {
    setEditingId(vehicle._id);
    setShowModal(true);
  };

  const vehicleColumns = [
    { key: 'name', label: 'Name' },
    { key: 'licensePlate', label: 'License Plate' },
    { key: 'model', label: 'Model' },
    { key: 'type', label: 'Type' },
    { key: 'maxCapacity', label: 'Capacity (kg)' },
    { key: 'odometer', label: 'Odometer (km)' },
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleEditClick(row)}
            className="text-zinc-600 hover:text-zinc-900 font-semibold text-sm transition-colors"
          >
            ✏️ Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDeleteVehicle(row._id)}
            className="text-red-600 hover:text-red-800 font-semibold text-sm transition-colors"
          >
            🗑️ Delete
          </motion.button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <ProtectedLayout requiredRoles={['manager']}>
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
            <p className="text-zinc-600 font-semibold">Loading vehicles...</p>
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
    <ProtectedLayout requiredRoles={['manager']}>
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
              🚗 Vehicle Registry
            </h1>
            <p className="text-zinc-500 mt-2">Manage your fleet inventory</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingId(null);
              setShowModal(true);
            }}
            className="btn-primary self-start md:self-auto px-6 py-3 font-semibold inline-flex items-center gap-2"
          >
            + Add Vehicle
          </motion.button>
        </motion.div>

        {/* Table Card */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            📋 All Vehicles
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
              {vehicles.length}
            </span>
          </h2>
          <DataTable columns={vehicleColumns} data={vehicles} />
        </motion.div>

        {showModal && (
          <FormModal
            title={editingId ? '✏️ Edit Vehicle' : '+ Add New Vehicle'}
            fields={vehicleFields}
            onSubmit={editingId ? handleUpdateVehicle : handleAddVehicle}
            onClose={() => {
              setShowModal(false);
              setEditingId(null);
            }}
          />
        )}
      </motion.div>
    </ProtectedLayout>
  );
}
