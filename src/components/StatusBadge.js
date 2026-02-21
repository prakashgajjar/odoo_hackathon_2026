'use client';
import { Check, Hourglass, Wrench, X, Dot } from 'lucide-react';

const statusColors = {
  available: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  on_trip: 'bg-blue-50 text-blue-700 border border-blue-200',
  in_shop: 'bg-amber-50 text-amber-700 border border-amber-200',
  retired: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
  on_duty: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  off_duty: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
  suspended: 'bg-red-50 text-red-700 border border-red-200',
  draft: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  dispatched: 'bg-blue-50 text-blue-700 border border-blue-200',
  in_progress: 'bg-purple-50 text-purple-700 border border-purple-200',
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
};

export function StatusBadge({ status, label }) {
  const displayText = label || status?.replace(/_/g, ' ').toUpperCase();
  const colorClass = statusColors[status] || 'bg-zinc-100 text-zinc-700 border border-zinc-200';

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${colorClass} transition-all duration-300`}>
      <span className="mr-2">
        {status === 'available' || status === 'on_duty' ? <Check className="w-4 h-4 text-emerald-600" /> :
         status === 'on_trip' || status === 'dispatched' || status === 'in_progress' ? <Hourglass className="w-4 h-4 text-amber-500" /> :
         status === 'in_shop' ? <Wrench className="w-4 h-4 text-red-600" /> :
         status === 'completed' ? <Check className="w-4 h-4 text-emerald-600" /> :
         status === 'suspended' || status === 'cancelled' ? <X className="w-4 h-4 text-zinc-700" /> : <Dot className="w-4 h-4 text-zinc-400" />}
      </span>
      {displayText}
    </span>
  );
}
