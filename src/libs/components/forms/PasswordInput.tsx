/**
 * Password Input Component with Strength Indicator
 * Works with React Hook Form
 */

"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";
import { getPasswordStrength } from "./validation-schemas";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showStrengthIndicator?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label = "Password",
      error,
      helperText,
      showStrengthIndicator = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [passwordValue, setPasswordValue] = useState("");

    const passwordStrength = showStrengthIndicator
      ? getPasswordStrength(passwordValue)
      : null;

    const strengthColors = {
      weak: "bg-red-500",
      medium: "bg-yellow-500",
      strong: "bg-blue-500",
      "very-strong": "bg-green-500",
    };

    const strengthTextColors = {
      weak: "text-red-600 dark:text-red-400",
      medium: "text-yellow-600 dark:text-yellow-400",
      strong: "text-blue-600 dark:text-blue-400",
      "very-strong": "text-green-600 dark:text-green-400",
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id || props.name}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={`
              w-full px-4 py-2 pr-10 rounded-lg border
              ${
                error
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
              }
              bg-white dark:bg-slate-900
              text-slate-900 dark:text-white
              placeholder-slate-400 dark:placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              ${className}
            `}
            onChange={(e) => {
              setPasswordValue(e.target.value);
              props.onChange?.(e);
            }}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {showStrengthIndicator &&
          passwordValue &&
          !error &&
          passwordStrength && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      level <= Math.ceil((passwordStrength.score / 7) * 4)
                        ? strengthColors[passwordStrength.strength]
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-medium ${
                    strengthTextColors[passwordStrength.strength]
                  }`}
                >
                  {passwordStrength.strength === "weak" && "Weak password"}
                  {passwordStrength.strength === "medium" && "Medium password"}
                  {passwordStrength.strength === "strong" && "Strong password"}
                  {passwordStrength.strength === "very-strong" &&
                    "Very strong password"}
                </span>
                {passwordStrength.feedback.length > 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {passwordStrength.feedback[0]}
                  </span>
                )}
              </div>
            </div>
          )}

        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
