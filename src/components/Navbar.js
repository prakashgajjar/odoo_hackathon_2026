'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export function Navbar({ user }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
      }
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const navLinks = {
    manager: [
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/vehicles', label: 'Vehicles', icon: '🚚' },
      { href: '/drivers', label: 'Drivers', icon: '👨‍✈️' },
      { href: '/maintenance', label: 'Maintenance', icon: '🔧' },
      { href: '/analytics', label: 'Analytics', icon: '📈' },
    ],
    dispatcher: [
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/trips', label: 'Trips', icon: '🗺️' },
      { href: '/drivers', label: 'Drivers', icon: '👨‍✈️' },
      { href: '/expenses', label: 'Expenses', icon: '⛽' },
    ],
    safety_officer: [
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/drivers', label: 'Drivers', icon: '👨‍✈️' },
      { href: '/maintenance', label: 'Maintenance', icon: '🔧' },
    ],
    financial_analyst: [
      { href: '/analytics', label: 'Analytics', icon: '📈' },
      { href: '/expenses', label: 'Expenses', icon: '⛽' },
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    ],
  };

  const links = navLinks[user?.role] || [];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200 shadow-subtle">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:bg-zinc-800 transition-colors duration-300">
                ⚡
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold text-zinc-900">FleetFlow</span>
                <span className="text-xs text-zinc-500">Logistics</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-zinc-700 font-medium hover:bg-zinc-100 transition-all duration-300 flex items-center gap-2 group"
              >
                <span className="group-hover:scale-110 transition-transform duration-300">
                  {link.icon}
                </span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="hidden md:flex items-center gap-3 pr-4 border-r border-zinc-200">
              <div className="w-10 h-10 bg-gradient-to-br from-zinc-200 to-zinc-300 rounded-full flex items-center justify-center font-semibold text-zinc-700">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-zinc-900">
                  {user?.name}
                </p>
                <p className="text-xs text-zinc-500 capitalize">
                  {user?.role?.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="btn-secondary text-sm"
            >
              Logout
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden pb-4 border-t border-zinc-100 space-y-2"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 rounded-lg text-zinc-700 font-medium hover:bg-zinc-100 transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
