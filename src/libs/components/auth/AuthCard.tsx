import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AuthCard({ children, title, description }: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-slate-600 dark:text-slate-300">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
