import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'cursor-not-allowed opacity-60' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
