'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
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
      setFormData({ email: '', password: '' });

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
    <div className="min-h-screen w-full bg-gradient-to-br from-zinc-900 via-zinc-300 to-zinc-50 flex items-center justify-center px-4 py-12">
      {/* Background animation elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-zinc-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
      <div className="fixed -bottom-8 left-20 w-96 h-96 bg-zinc-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-lg"
      >
        {/* Card */}
        <motion.div variants={itemVariants} className="card bg-white shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 text-white p-8 text-center">
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

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="p-8 space-y-4 md:space-y-5">
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold text-zinc-900 text-center mb-8"
            >
              ✓ Welcome Back
            </motion.h2>

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

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary bg-zinc-800  disabled:opacity-50 mt-8 text-lg font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⏳
                  </motion.span>
                  Logging in...
                </span>
              ) : (
                '✓ Login'
              )}
            </motion.button>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-zinc-500 font-medium uppercase tracking-wide">
                  Don't have an account?
                </span>
              </div>
            </motion.div>

            {/* Sign Up Link */}
            <motion.div variants={itemVariants}>
              <Link href="/signup">
                <button
                  type="button"
                  className="w-full btn-secondary text-lg font-semibold"
                >
                  + Create Account
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
