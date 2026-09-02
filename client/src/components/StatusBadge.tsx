import React from 'react';
import { ApprovalStatus, ChairStatus, BookingStatus } from '../types';

interface StatusBadgeProps {
  status: ApprovalStatus | ChairStatus | BookingStatus | string;
  type?: 'approval' | 'chair' | 'booking';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size];

  let config = {
    label: status.replace(/_/g, ' '),
    bg: 'bg-slate-800/80',
    text: 'text-slate-300',
    border: 'border-slate-700',
    dot: 'bg-slate-400',
  };

  switch (normalized) {
    // Approval & General Positive
    case 'approved':
    case 'available':
    case 'completed':
      config = {
        label: normalized === 'available' ? 'Available' : normalized === 'approved' ? 'Approved' : 'Completed',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
      break;

    // Pending & Action Required
    case 'pending':
    case 'booked':
    case 'confirmed':
      config = {
        label: normalized === 'pending' ? 'Pending Approval' : normalized === 'booked' ? 'Booked' : 'Confirmed',
        bg: 'bg-amber-500/10',
        text: 'text-amber-300',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
      };
      break;

    // In Progress / Active
    case 'in_service':
    case 'occupied':
    case 'customer_arrived':
      config = {
        label: normalized === 'in_service' ? 'In Service' : normalized === 'customer_arrived' ? 'Customer Arrived' : 'Occupied',
        bg: 'bg-purple-500/15',
        text: 'text-purple-300',
        border: 'border-purple-500/40',
        dot: 'bg-purple-400 animate-pulse',
      };
      break;

    // Blocked & Negative
    case 'blocked':
    case 'rejected':
    case 'suspended':
    case 'cancelled':
      config = {
        label: normalized === 'blocked' ? 'Blocked' : normalized === 'rejected' ? 'Rejected' : normalized === 'suspended' ? 'Suspended' : 'Cancelled',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        dot: 'bg-rose-400',
      };
      break;

    // No-Show
    case 'no_show':
      config = {
        label: 'No-Show',
        bg: 'bg-red-950/40',
        text: 'text-red-300',
        border: 'border-red-600/50',
        dot: 'bg-red-500',
      };
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border capitalize tracking-wide ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
