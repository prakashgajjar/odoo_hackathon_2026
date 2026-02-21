'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'driver',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Error occurred');
        return;
      }

      toast.success(data.message);
      setFormData({ name: '', email: '', password: '', role: 'driver' });

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-white to-zinc-50 flex items-center justify-center px-4 py-12">
      {/* Background animation elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-zinc-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-lg"
      >
        {/* Card */}
        <motion.div variants={itemVariants} className="card bg-white shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white p-8 text-center">
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
              className="text-4xl font-bold tracking-tight text-zinc-100"
            >
              FleetFlow
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-zinc-300 text-sm mt-2 font-medium"
            >
              Fleet & Logistics Management
            </motion.p>
          </div>

          {/* Form Container with scrollable content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-4 md:space-y-5 max-h-[calc(95vh-200px)] overflow-y-auto">
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold text-zinc-900 text-center mb-8"
            >
              + Create Account
            </motion.h2>

            {/* Name Field */}
            <motion.div variants={itemVariants}>
              <label className="label font-bold text-zinc-800">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field bg-zinc-50 border-2 border-zinc-300 text-zinc-900 font-medium"
                placeholder="John Doe"
              />
            </motion.div>

            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label className="label font-bold text-zinc-800">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field bg-zinc-50 border-2 border-zinc-300 text-zinc-900 font-medium"
                placeholder="you@example.com"
              />
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label className="label font-bold text-zinc-800">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field bg-zinc-50 border-2 border-zinc-300 text-zinc-900 font-medium"
                placeholder="••••••••"
              />
            </motion.div>

            {/* Role Field */}
            <motion.div variants={itemVariants} className="space-y-3">
              <label className="label mb-2 font-bold text-zinc-800">Select Your Role</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'driver', label: '🚗 Driver', desc: 'Drive vehicles' },
                  { value: 'dispatcher', label: '📞 Dispatcher', desc: 'Dispatch trips' },
                  { value: 'manager', label: '👔 Manager', desc: 'Manage fleet' },
                  { value: 'safety_officer', label: '🛡️ Safety', desc: 'Monitor safety' },
                ].map((role) => (
                  <motion.button
                    key={role.value}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData({ ...formData, role: role.value })}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-center font-semibold ${
                      formData.role === role.value
                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                        : 'border-zinc-300 bg-zinc-50 text-zinc-900 hover:border-zinc-500'
                    }`}
                  >
                    <div className="text-base font-bold">{role.label}</div>
                    <div className="text-xs opacity-80">{role.desc}</div>
                  </motion.button>
                ))}
              </div>
              {/* Financial Analyst - Full width */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData({ ...formData, role: 'financial_analyst' })}
                className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-center font-semibold ${
                  formData.role === 'financial_analyst'
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                    : 'border-zinc-300 bg-zinc-50 text-zinc-900 hover:border-zinc-500'
                }`}
              >
                <div className="text-base font-bold">💰 Financial Analyst</div>
                <div className="text-xs opacity-80">Track expenses & ROI</div>
              </motion.button>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 mt-8 text-lg font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⏳
                  </motion.span>
                  Creating account...
                </span>
              ) : (
                '+ Create Account'
              )}
            </motion.button>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-zinc-500 font-medium uppercase tracking-wide">
                  Already have an account?
                </span>
              </div>
            </motion.div>

            {/* Login Link */}
            <motion.div variants={itemVariants}>
              <Link href="/login">
                <button
                  type="button"
                  className="w-full btn-secondary text-lg font-semibold"
                >
                  ✓ Login
                </button>
              </Link>
            </motion.div>
          </form>
        </motion.div>

        {/* Bottom text */}
        <motion.p
          variants={itemVariants}
          className="text-center text-zinc-500 text-sm mt-6"
        >
          © 2024 FleetFlow. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
