'use client';

import { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { FormModal } from '@/components/FormModal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Wrench, ClipboardList, DollarSign, Clock, Plus, Play, CheckCircle, X } from 'lucide-react';

export default function MaintenancePage() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

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

  const handleStatusChange = async (logId, newStatus) => {
    try {
      const res = await fetch(`/api/maintenance/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success(`Maintenance status changed to ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to update maintenance status');
    }
  };

  const handleCancelMaintenance = async () => {
    try {
      if (!selectedLog) return;

      const res = await fetch(`/api/maintenance/${selectedLog._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          notes: cancelReason || 'Maintenance cancelled',
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success('Maintenance cancelled');
      setShowCancelModal(false);
      setSelectedLog(null);
      setCancelReason('');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel maintenance');
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
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2 flex-wrap">
          {row.status === 'scheduled' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusChange(row._id, 'in_progress')}
                className="flex items-center gap-1 px-3 py-1 text-white bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-semibold"
              >
                <Play className="w-4 h-4" /> Start
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedLog(row);
                  setShowCancelModal(true);
                }}
                className="flex items-center gap-1 px-3 py-1 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold"
              >
                <X className="w-4 h-4" /> Cancel
              </motion.button>
            </>
          )}
          {row.status === 'in_progress' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusChange(row._id, 'completed')}
                className="flex items-center gap-1 px-3 py-1 text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold"
              >
                <CheckCircle className="w-4 h-4" /> Complete
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedLog(row);
                  setShowCancelModal(true);
                }}
                className="flex items-center gap-1 px-3 py-1 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold"
              >
                <X className="w-4 h-4" /> Cancel
              </motion.button>
            </>
          )}
          {row.status === 'completed' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-green-700 bg-green-100 rounded-lg text-sm font-semibold">
              <CheckCircle className="w-4 h-4" /> Done
            </span>
          )}
          {row.status === 'cancelled' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-red-700 bg-red-100 rounded-lg text-sm font-semibold">
              <X className="w-4 h-4" /> Cancelled
            </span>
          )}
        </div>
      ),
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
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 flex items-center gap-3">
              <Wrench className="w-10 h-10 text-blue-600" /> Maintenance & Service
            </h1>
            <p className="text-zinc-500 mt-2">Track and manage service logs</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="btn-primary self-start md:self-auto px-6 py-3 font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Log Maintenance
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
            <p className="text-zinc-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-600" /> Total Logs
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
            <p className="text-zinc-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Total Cost
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
            <p className="text-zinc-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" /> In Progress
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
            <ClipboardList className="w-6 h-6 text-blue-600" /> All Maintenance Records
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
              {logs.length}
            </span>
          </h2>
          <DataTable columns={maintenanceColumns} data={logs} />
        </motion.div>

        {showModal && (
          <FormModal
            title="Log Maintenance"
            fields={maintenanceFields}
            onSubmit={handleAddMaintenance}
            onClose={() => setShowModal(false)}
          />
        )}

        {/* Cancel Maintenance Modal */}
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            >
              <h2 className="text-2xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <X className="w-6 h-6 text-red-600" /> Cancel Maintenance
              </h2>
              <p className="text-zinc-600 mb-4">
                Service: <span className="font-semibold text-zinc-900">{selectedLog?.serviceType?.replace(/_/g, ' ').toUpperCase()}</span>
              </p>
              <p className="text-zinc-600 mb-4">
                Vehicle: <span className="font-semibold text-zinc-900">{selectedLog?.vehicleId?.name}</span>
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  className="w-full p-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedLog(null);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2 text-zinc-900 border border-zinc-300 rounded-lg hover:bg-zinc-100 font-semibold transition"
                >
                  Keep Service
                </button>
                <button
                  onClick={handleCancelMaintenance}
                  className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
                >
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </ProtectedLayout>
  );
}
