/**
 * Authentication Form Validation Schemas
 */

import * as yup from "yup";

// Password requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*(),.?":{}|<>]/,
};

// Reusable password schema with secure requirements
export const passwordSchema = yup
  .string()
  .required("Password is required")
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  )
  .matches(
    PASSWORD_REGEX.uppercase,
    "Password must contain at least one uppercase letter"
  )
  .matches(
    PASSWORD_REGEX.lowercase,
    "Password must contain at least one lowercase letter"
  )
  .matches(PASSWORD_REGEX.number, "Password must contain at least one number")
  .matches(
    PASSWORD_REGEX.special,
    "Password must contain at least one special character (!@#$%^&*...)"
  );

// Email schema
export const emailSchema = yup
  .string()
  .required("Email is required")
  .email("Please enter a valid email address")
  .lowercase()
  .trim();

// Login form schema
export const loginSchema = yup.object().shape({
  email: emailSchema,
  password: yup.string().required("Password is required"),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;

// Signup form schema
export const signupSchema = yup.object().shape({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  fullName: yup.string().trim().optional(),
});

export type SignupFormData = yup.InferType<typeof signupSchema>;

// Forgot password schema
export const forgotPasswordSchema = yup.object().shape({
  email: emailSchema,
});

export type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

// Reset password schema
export const resetPasswordSchema = yup.object().shape({
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;
