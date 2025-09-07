// SigninForm.tsx
"use client";

import React, { useState, useMemo, FormEvent } from "react";
import { SignInPayloadType } from "@/app/types";
import { EMAIL_REGEX } from "@/app/utils/helpers";

interface SigninFormProps {
  onSubmit: (form: SignInPayloadType) => Promise<void>;
  submitting: boolean;
}

const SigninForm: React.FC<SigninFormProps> = ({ onSubmit, submitting }) => {
  const [form, setForm] = useState<SignInPayloadType>({
    email: "",
    password: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validation = useMemo(() => {
    const errors: Partial<Record<keyof SignInPayloadType, string>> = {};

    if (!form.email) errors.email = "Email is required";
    else if (!EMAIL_REGEX.test(form.email)) errors.email = "Enter a valid email";
    
    if (!form.password) errors.password = "Password is required";
    else if (form.password.length < 8) errors.password = "Password must be at least 8 characters";

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [form]);

  const handleChange =
    (field: keyof SignInPayloadType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setLocalError(null); // Clear local error when user starts typing
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (!validation.isValid) {
      setLocalError("Please fix the highlighted errors");
      return;
    }

    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <label 
          htmlFor="email" 
          className="block text-sm font-semibold text-gray-700"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            placeholder="Enter your email"
            required
            className={`block w-full pl-10 pr-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              validation.errors.email
                ? "border-red-300 focus:ring-red-500 bg-red-50"
                : focusedField === "email"
                ? "border-blue-300 focus:ring-blue-500 bg-blue-50"
                : "border-gray-300 focus:ring-blue-500 bg-white hover:border-gray-400"
            }`}
          />
        </div>
        {validation.errors.email && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{validation.errors.email}</span>
          </div>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label 
          htmlFor="password" 
          className="block text-sm font-semibold text-gray-700"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange("password")}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            placeholder="Enter your password"
            required
            className={`block w-full pl-10 pr-12 py-3 text-sm border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              validation.errors.password
                ? "border-red-300 focus:ring-red-500 bg-red-50"
                : focusedField === "password"
                ? "border-blue-300 focus:ring-blue-500 bg-blue-50"
                : "border-gray-300 focus:ring-blue-500 bg-white hover:border-gray-400"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {validation.errors.password && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{validation.errors.password}</span>
          </div>
        )}
      </div>
      {localError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 text-sm">{localError}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || !validation.isValid}
        className={`group relative w-full flex justify-center items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          submitting || !validation.isValid
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        }`}
      >
        {submitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing you in...
          </>
        ) : (
          <>
            <span>Sign In</span>
            <svg className="ml-2 -mr-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
        {!submitting && validation.isValid && (
          <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
      </button>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center space-x-2 text-gray-600">
          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span>Remember me</span>
        </label>
        <button type="button" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
          Forgot password?
        </button>
      </div>
    </form>
  );
};

export default SigninForm;