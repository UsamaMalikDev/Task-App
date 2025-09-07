// SignupForm.tsx
"use client";

import React, { useMemo, useState, FormEvent } from "react";
import { SignupFormData } from "@/app/types";
import { ORGANIZATIONS } from "@/app/utils/constants";
import { EMAIL_REGEX, PHONE_REGEX } from "@/app/utils/helpers";

interface SignupFormProps {
  onSubmit: (form: SignupFormData) => Promise<void>;
  submitting: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit, submitting }) => {
  const [form, setForm] = useState<SignupFormData>({
    name: "",
    email: "",
    organizationId: "",
    phone: "",
    password: "",
    confirmPassword: "",
    source: "website",
    reason: "",
    agreedToTerms: false,
    selectedPlan: "free",
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validation = useMemo(() => {
    const errors: Partial<Record<keyof SignupFormData, string>> = {};

    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email) errors.email = "Email is required";
    else if (!EMAIL_REGEX.test(form.email)) errors.email = "Enter a valid email";
    if (!form.organizationId.trim()) errors.organizationId = "Organization is required";
    if (!form.phone.trim()) errors.phone = "Phone is required";
    else if (!PHONE_REGEX.test(form.phone)) errors.phone = "Please enter a valid US phone number (e.g., +1234567890)";
    if (!form.password) errors.password = "Password is required";
    else if (form.password.length < 8) errors.password = "Password must be at least 8 characters";
    if (!form.confirmPassword) errors.confirmPassword = "Confirm your password";
    else if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match";
    if (!form.agreedToTerms) errors.agreedToTerms = "You must agree to the terms";

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [form]);

  const handleChange =
    (field: keyof SignupFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm((prev: any) => ({ ...prev, [field]: value }));
      setLocalError(null);
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

  const getInputClasses = (hasError: boolean, fieldName: string) => {
    return `block w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      hasError
        ? "border-red-300 focus:ring-red-500 bg-red-50"
        : focusedField === fieldName
        ? "border-blue-300 focus:ring-blue-500 bg-blue-50"
        : "border-gray-300 focus:ring-blue-500 bg-white hover:border-gray-400"
    }`;
  };

  const renderError = (error: string | undefined) => {
    if (!error) return null;
    return (
      <div className="flex items-center space-x-2 text-red-600 text-sm mt-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{error}</span>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Grid Layout for Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="name"
              value={form.name}
              onChange={handleChange("name")}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your full name"
              className={`pl-10 ${getInputClasses(!!validation.errors.name, "name")}`}
            />
          </div>
          {renderError(validation.errors.name)}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="you@company.com"
              className={`pl-10 ${getInputClasses(!!validation.errors.email, "email")}`}
            />
          </div>
          {renderError(validation.errors.email)}
        </div>

        {/* Organization Field */}
        <div className="space-y-2">
          <label htmlFor="company" className="block text-sm font-semibold text-gray-700">
            Organization <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <select
              id="organizationId"
              value={form.organizationId}
              onChange={handleChange("organizationId")}
              onFocus={() => setFocusedField("organizationId")}
              onBlur={() => setFocusedField(null)}
              className={`pl-10 ${getInputClasses(!!validation.errors.organizationId, "organizationId")}`}
            >
              <option value="">Select an organization</option>
              <option value={ORGANIZATIONS.ORG_A.id}>{ORGANIZATIONS.ORG_A.displayName}</option>
              <option value={ORGANIZATIONS.ORG_B.id}>{ORGANIZATIONS.ORG_B.displayName}</option>
            </select>
          </div>
          {renderError(validation.errors.organizationId)}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <input
              id="phone"
              value={form.phone}
              onChange={handleChange("phone")}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
              placeholder="+1234567890"
              className={`pl-10 ${getInputClasses(!!validation.errors.phone, "phone")}`}
            />
          </div>
          {renderError(validation.errors.phone)}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange("password")}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              placeholder="Min. 8 characters"
              className={`pl-10 pr-12 ${getInputClasses(!!validation.errors.password, "password")}`}
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
          {renderError(validation.errors.password)}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.414-4.414a2 2 0 112.828 2.828L10.5 16.5l-2.5-.5.5-2.5 8.5-8.5z" />
              </svg>
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField(null)}
              placeholder="Confirm your password"
              className={`pl-10 pr-12 ${getInputClasses(!!validation.errors.confirmPassword, "confirmPassword")}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {showConfirmPassword ? (
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
          {renderError(validation.errors.confirmPassword)}
        </div>
      </div>

      {/* Reason Field - Full Width */}
      <div className="space-y-2">
        <label htmlFor="reason" className="block text-sm font-semibold text-gray-700">
          What are you planning to use this for? <span className="text-gray-500">(Optional)</span>
        </label>
        <textarea
          id="reason"
          value={form.reason}
          onChange={handleChange("reason")}
          onFocus={() => setFocusedField("reason")}
          onBlur={() => setFocusedField(null)}
          rows={3}
          placeholder="Tell us about your project or team needs..."
          className={`resize-none ${getInputClasses(false, "reason")}`}
        />
      </div>

      {/* Terms Agreement */}
      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <input
            id="agreedToTerms"
            type="checkbox"
            checked={form.agreedToTerms}
            onChange={handleChange("agreedToTerms")}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
          />
          <label htmlFor="agreedToTerms" className="text-sm text-gray-700 leading-relaxed">
            I agree to the{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium underline">
              Privacy Policy
            </a>
            <span className="text-red-500 ml-1">*</span>
          </label>
        </div>
        {renderError(validation.errors.agreedToTerms)}
      </div>

      {/* Local Error */}
      {localError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 text-sm font-medium">{localError}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
  type="submit"
  disabled={submitting || !validation.isValid}
  className={`group relative w-full flex justify-center items-center px-6 py-4 text-sm font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
    submitting || !validation.isValid
      ? "bg-gray-400 text-white cursor-not-allowed"
      : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
  }`}
>
  {submitting ? (
    <>
      <svg
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0c-5.523 0-10 
             4.477-10 10h2zm2 5.291A7.962 
             7.962 0 014 12H2c0 3.042 1.135 
             5.824 3 7.938l1-2.647z"
        />
      </svg>
      Creating account...
    </>
  ) : (
    "Create account"
  )}
</button>

    </form>
  );
};

export default SignupForm;
