import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "rounded-full font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl focus:ring-blue-500",
    secondary:
      "bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:shadow-xl border border-slate-200 dark:border-slate-700 focus:ring-slate-400",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 focus:ring-blue-500",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
