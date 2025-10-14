"use client";

import { createClient } from "@/libs/supabase/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../Button";
import {
  FormInput,
  PasswordInput,
  SignupFormData,
  signupSchema,
} from "../forms";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName || "",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setSuccess(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during signup";
      setError(errorMessage);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-6 text-6xl">✉️</div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Check Your Email
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          We&apos;ve sent you a confirmation email. Please click the link in the
          email to verify your account.
        </p>
        <Button variant="outline" onClick={() => router.push("/auth/login")}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      <FormInput
        id="fullName"
        label="Full Name (Optional)"
        type="text"
        placeholder="John Doe"
        error={errors.fullName?.message}
        {...register("fullName")}
      />

      <FormInput
        id="email"
        label="Email"
        type="email"
        placeholder="your@email.com"
        required
        error={errors.email?.message}
        {...register("email")}
      />

      <PasswordInput
        id="password"
        label="Password"
        placeholder="••••••••"
        required
        showStrengthIndicator
        error={errors.password?.message}
        {...register("password")}
      />

      <PasswordInput
        id="confirmPassword"
        label="Confirm Password"
        placeholder="••••••••"
        required
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </div>
    </form>
  );
}
