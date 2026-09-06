import React from 'react';
import { OrderStatus } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Processing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Packed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Shipped':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Out for Delivery':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Returned':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-[11px]';
      case 'lg':
        return 'px-3.5 py-1.5 text-sm font-semibold';
      default:
        return 'px-2.5 py-1 text-xs font-medium';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${getStatusStyles()} ${getSizeStyles()} tracking-wide transition-all`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 fill-current opacity-75 bg-current" />
      {status}
    </span>
  );
};
