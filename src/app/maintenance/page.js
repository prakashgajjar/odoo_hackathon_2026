'use client';

import { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { FormModal } from '@/components/FormModal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function MaintenancePage() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const maintenanceFields = [
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
      name: 'serviceType',
      label: 'Service Type',
      type: 'select',
      required: true,
      options: [
        { value: 'oil_change', label: 'Oil Change' },
        { value: 'tire_rotation', label: 'Tire Rotation' },
        { value: 'brake_service', label: 'Brake Service' },
        { value: 'filter_replacement', label: 'Filter Replacement' },
        { value: 'inspection', label: 'Inspection' },
        { value: 'repair', label: 'Repair' },
        { value: 'other', label: 'Other' },
      ],
    },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'cost', label: 'Cost', type: 'number', required: true },
    { name: 'serviceDate', label: 'Service Date', type: 'date', required: true },
    { name: 'odometerAtService', label: 'Odometer (km)', type: 'number', required: true },
    { name: 'servicedBy', label: 'Serviced By', type: 'text', required: false },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch maintenance logs
      const logsRes = await fetch('/api/maintenance');
      const logsData = await logsRes.json();
      setLogs(logsData.logs || []);

      // Fetch all vehicles
      const vehiclesRes = await fetch('/api/vehicles');
      const vehiclesData = await vehiclesRes.json();
      setVehicles(vehiclesData.vehicles || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaintenance = async (formData) => {
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success('Maintenance log created');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to add maintenance log');
      throw error;
    }
  };

  const maintenanceColumns = [
    {
      key: 'vehicleId',
      label: 'Vehicle',
      render: (_, row) => row.vehicleId?.name || 'N/A',
    },
    {
      key: 'serviceType',
      label: 'Service Type',
      render: (type) => type?.replace(/_/g, ' ').toUpperCase(),
    },
    { key: 'description', label: 'Description' },
    {
      key: 'serviceDate',
      label: 'Service Date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    { key: 'cost', label: 'Cost' },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
  ];

  if (loading) {
    return (
      <ProtectedLayout requiredRoles={['safety_officer', 'manager']}>
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
            <p className="text-zinc-600 font-semibold">Loading maintenance logs...</p>
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

  // Calculate total maintenance costs
  const totalMaintenanceCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0);

  return (
    <ProtectedLayout requiredRoles={['safety_officer', 'manager']}>
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
              🔧 Maintenance & Service
            </h1>
            <p className="text-zinc-500 mt-2">Track and manage service logs</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="btn-primary self-start md:self-auto px-6 py-3 font-semibold"
          >
            + Log Maintenance
          </motion.button>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            whileHover={{ translateY: -4 }}
            className="card p-6 shadow-md"
          >
            <p className="text-zinc-600 text-sm font-semibold uppercase tracking-wide">
              📋 Total Logs
            </p>
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-zinc-900 mt-3"
            >
              {logs.length}
            </motion.p>
          </motion.div>

          <motion.div
            whileHover={{ translateY: -4 }}
            className="card p-6 shadow-md"
          >
            <p className="text-zinc-600 text-sm font-semibold uppercase tracking-wide">
              💰 Total Cost
            </p>
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-zinc-900 mt-3"
            >
              ${totalMaintenanceCost.toLocaleString()}
            </motion.p>
          </motion.div>

          <motion.div
            whileHover={{ translateY: -4 }}
            className="card p-6 shadow-md"
          >
            <p className="text-zinc-600 text-sm font-semibold uppercase tracking-wide">
              ⏳ In Progress
            </p>
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold text-zinc-900 mt-3"
            >
              {logs.filter((l) => l.status === 'in_progress').length}
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Maintenance Table */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            📋 All Maintenance Records
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
              {logs.length}
            </span>
          </h2>
          <DataTable columns={maintenanceColumns} data={logs} />
        </motion.div>

        {showModal && (
          <FormModal
            title="🔧 Log Maintenance"
            fields={maintenanceFields}
            onSubmit={handleAddMaintenance}
            onClose={() => setShowModal(false)}
          />
        )}
      </motion.div>
    </ProtectedLayout>
  );
}
