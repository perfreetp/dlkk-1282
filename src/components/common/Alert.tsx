import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  className,
}) => {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    danger: AlertCircle,
  };

  const Icon = icons[variant];

  const variantStyles = {
    info: 'bg-primary-50 border-primary-200 text-primary-800',
    success: 'bg-success-50 border-success-200 text-success-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-danger-50 border-danger-200 text-danger-800',
  };

  const iconStyles = {
    info: 'text-primary-500',
    success: 'text-success-500',
    warning: 'text-yellow-500',
    danger: 'text-danger-500',
  };

  return (
    <div
      className={clsx(
        'border rounded-xl p-4 animate-slide-up',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={clsx('w-5 h-5 mt-0.5 flex-shrink-0', iconStyles[variant])} />
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
};
