'use client';

import { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { FormModal } from '@/components/FormModal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const driverFields = [
    { name: 'name', label: 'Driver Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'licenseNumber', label: 'License Number', type: 'text', required: true },
    {
      name: 'licenseCategory',
      label: 'License Category',
      type: 'select',
      required: true,
      options: [
        { value: 'A', label: 'A (Motorcycles)' },
        { value: 'B', label: 'B (Cars)' },
        { value: 'C', label: 'C (Trucks)' },
        { value: 'D', label: 'D (Buses)' },
        { value: 'E', label: 'E (Articulated)' },
      ],
    },
    { name: 'licenseExpiryDate', label: 'License Expiry', type: 'date', required: true },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
  ];

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/drivers');
      const data = await res.json();
      setDrivers(data.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = async (formData) => {
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success('Driver added successfully');
      setShowModal(false);
      fetchDrivers();
    } catch (error) {
      toast.error(error.message || 'Failed to add driver');
      throw error;
    }
  };

  const handleUpdateDriver = async (formData) => {
    try {
      const res = await fetch(`/api/drivers/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: formData.status }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success('Driver updated');
      setEditingId(null);
      setShowModal(false);
      fetchDrivers();
    } catch (error) {
      toast.error(error.message || 'Failed to update driver');
      throw error;
    }
  };

  const handleStatusChange = async (driverId, newStatus) => {
    try {
      const res = await fetch(`/api/drivers/${driverId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast.success('Driver status updated');
      fetchDrivers();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const isLicenseExpiring = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = (expiry - today) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isLicenseExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const driverColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'licenseNumber', label: 'License #' },
    { key: 'licenseCategory', label: 'Category' },
    {
      key: 'licenseExpiryDate',
      label: 'License Expiry',
      render: (date) => {
        const isExpired = isLicenseExpired(date);
        const isExpiring = isLicenseExpiring(date);
        const color = isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-emerald-600';
        return <span className={`font-semibold ${color}`}>{new Date(date).toLocaleDateString()}</span>;
      },
    },
    {
      key: 'safetyScore',
      label: 'Safety Score',
      render: (score) => (
        <span className={`font-semibold ${score >= 90 ? 'text-emerald-600' : score >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
          {score}/100
        </span>
      ),
    },
    { key: 'tripsCompleted', label: 'Trips Done' },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className="input-field w-32 text-sm"
        >
          <option value="on_duty">On Duty</option>
          <option value="off_duty">Off Duty</option>
          <option value="suspended">Suspended</option>
        </select>
      ),
    },
  ];

  if (loading) {
    return (
      <ProtectedLayout requiredRoles={['safety_officer', 'dispatcher', 'manager']}>
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
            <p className="text-zinc-600 font-semibold">Loading drivers...</p>
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
    <ProtectedLayout requiredRoles={['safety_officer', 'dispatcher', 'manager']}>
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
              👨‍✈️ Driver Profiles
            </h1>
            <p className="text-zinc-500 mt-2">Manage drivers & safety records</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingId(null);
              setShowModal(true);
            }}
            className="btn-primary self-start md:self-auto px-6 py-3 font-semibold"
          >
            + Add Driver
          </motion.button>
        </motion.div>

        {/* Alert for expiring licenses */}
        <motion.div
          variants={itemVariants}
          className="card border-l-4 border-l-amber-500 p-6 bg-gradient-to-r from-amber-50 to-transparent"
        >
          <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
            ⚠️ License Expiry Alerts
          </h3>
          <ul className="space-y-2">
            {drivers
              .filter((d) => isLicenseExpiring(d.licenseExpiryDate))
              .map((d) => (
                <motion.li
                  key={d._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-zinc-700 font-medium"
                >
                  <span className="font-bold text-zinc-900">{d.name}</span> - License expires{' '}
                  <span className="text-amber-600 font-bold">
                    {Math.ceil(
                      (new Date(d.licenseExpiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                    )}
                  </span>{' '}
                  days
                </motion.li>
              ))}
            {!drivers.some((d) => isLicenseExpiring(d.licenseExpiryDate)) && (
              <li className="text-emerald-600 font-semibold">✓ No expiring licenses found</li>
            )}
          </ul>
        </motion.div>

        {/* Drivers Table */}
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            📋 All Drivers
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">
              {drivers.length}
            </span>
          </h2>
          <DataTable columns={driverColumns} data={drivers} />
        </motion.div>

        {showModal && (
          <FormModal
            title="+ Add New Driver"
            fields={driverFields}
            onSubmit={handleAddDriver}
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
