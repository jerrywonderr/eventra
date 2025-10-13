/**
 * Validation Schemas for Forms
 * Using Yup for schema validation
 */

import * as yup from "yup";

// Password requirements
const passwordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

// Password validation schema with strong requirements
export const passwordSchema = yup
  .string()
  .required("Password is required")
  .min(
    passwordRequirements.minLength,
    `Password must be at least ${passwordRequirements.minLength} characters`
  )
  .matches(/[a-z]/, "Password must contain at least one lowercase letter")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  .matches(/[0-9]/, "Password must contain at least one number")
  .matches(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character (!@#$%^&*...)"
  );

// Email validation schema
export const emailSchema = yup
  .string()
  .required("Email is required")
  .email("Please enter a valid email address")
  .lowercase()
  .trim();

// Login form validation schema
export const loginSchema = yup.object().shape({
  email: emailSchema,
  password: yup.string().required("Password is required"),
});

// Signup form validation schema
export const signupSchema = yup.object().shape({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  fullName: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),
});

// Forgot password form validation schema
export const forgotPasswordSchema = yup.object().shape({
  email: emailSchema,
});

// Reset password form validation schema
export const resetPasswordSchema = yup.object().shape({
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

// TypeScript types inferred from schemas
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type SignupFormData = yup.InferType<typeof signupSchema>;
export type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

// Helper function to get password strength
export function getPasswordStrength(password: string): {
  strength: "weak" | "medium" | "strong" | "very-strong";
  score: number;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return { strength: "weak", score: 0, feedback: ["Password is required"] };
  }

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Add lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Add uppercase letters");

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push("Add numbers");

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push("Add special characters");

  // Determine strength
  let strength: "weak" | "medium" | "strong" | "very-strong";
  if (score <= 3) {
    strength = "weak";
  } else if (score <= 5) {
    strength = "medium";
  } else if (score <= 6) {
    strength = "strong";
  } else {
    strength = "very-strong";
  }

  return { strength, score, feedback };
}
