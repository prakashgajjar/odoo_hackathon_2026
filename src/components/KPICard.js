'use client';

import { motion } from 'framer-motion';

export function KPICard({ title, value, icon, trend, color = 'zinc' }) {
  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      whileHover={{ y: -4 }}
      className="card group h-full"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-zinc-600 text-sm font-medium uppercase tracking-wide">
              {title}
            </p>
            <p className="text-xl md:text-2xl font-bold text-zinc-900 mt-2">
              {value}
            </p>
            {trend && (
              <p
                className={`text-sm font-semibold mt-2 ${
                  trend > 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
              </p>
            )}
          </div>
          {icon && (
            <div className="text-5xl opacity-70 group-hover:opacity-100 transition-opacity duration-300">
              {icon}
            </div>
          )}
        </div>

        <div className="h-1 bg-gradient-to-r from-zinc-200 to-transparent rounded-full mt-4"></div>
      </div>
    </motion.div>
  );
}
