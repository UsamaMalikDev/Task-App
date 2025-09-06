"use client";

import React, { useMemo, useState, FormEvent } from "react";
import { SignupFormData } from "@/app/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SignupFormProps {
  onSubmit: (form: SignupFormData) => Promise<void>;
  submitting: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit, submitting }) => {
  const [form, setForm] = useState<SignupFormData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    password: "",
    confirmPassword: "",
    source: "website",
    reason: "",
    agreedToTerms: false,
    selectedPlan: "free",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const validation = useMemo(() => {
    const errors: Partial<Record<keyof SignupFormData, string>> = {};

    if (!form.name.trim()) errors.name = "Name is required";

    if (!form.email) errors.email = "Email is required";
    else if (!EMAIL_REGEX.test(form.email)) errors.email = "Enter a valid email";

    if (!form.company.trim()) errors.company = "Company is required";
    if (!form.phone.trim()) errors.phone = "Phone is required";

    if (!form.password) errors.password = "Password is required";
    else if (form.password.length < 8)
      errors.password = "Password must be at least 8 characters";

    if (!form.confirmPassword)
      errors.confirmPassword = "Confirm your password";
    else if (form.confirmPassword !== form.password)
      errors.confirmPassword = "Passwords do not match";

    if (!form.agreedToTerms)
      errors.agreedToTerms = "You must agree to the terms";

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [form]);

  const handleChange =
    (field: keyof SignupFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((prev:any) => ({ ...prev, [field]: value }));
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

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: 10,
    border: `1px solid ${hasError ? "#f87171" : "#d1d5db"}`,
    borderRadius: 6,
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <div>
          <label htmlFor="name" style={{ display: "block", marginBottom: 6 }}>
            Name
          </label>
          <input
            id="name"
            value={form.name}
            onChange={handleChange("name")}
            style={inputStyle(!!validation.errors.name)}
            placeholder="Your name"
          />
          {validation.errors.name && (
            <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>
              {validation.errors.name}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="email" style={{ display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            style={inputStyle(!!validation.errors.email)}
            placeholder="you@example.com"
          />
          {validation.errors.email && (
            <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>
              {validation.errors.email}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="company" style={{ display: "block", marginBottom: 6 }}>
            Company
          </label>
          <input
            id="company"
            value={form.company}
            onChange={handleChange("company")}
            style={inputStyle(!!validation.errors.company)}
            placeholder="Company Inc."
          />
          {validation.errors.company && (
            <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>
              {validation.errors.company}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="phone" style={{ display: "block", marginBottom: 6 }}>
            Phone
          </label>
          <input
            id="phone"
            value={form.phone}
            onChange={handleChange("phone")}
            style={inputStyle(!!validation.errors.phone)}
            placeholder="(555) 000-0000"
          />
          {validation.errors.phone && (
            <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>
              {validation.errors.phone}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: 6 }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            style={inputStyle(!!validation.errors.password)}
            placeholder="••••••••"
          />
          {validation.errors.password && (
            <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>
              {validation.errors.password}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            style={{ display: "block", marginBottom: 6 }}
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            style={inputStyle(!!validation.errors.confirmPassword)}
            placeholder="••••••••"
          />
          {validation.errors.confirmPassword && (
            <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>
              {validation.errors.confirmPassword}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label htmlFor="reason" style={{ display: "block", marginBottom: 6 }}>
          What are you planning to do?
        </label>
        <textarea
          id="reason"
          value={form.reason}
          onChange={handleChange("reason")}
          style={{
            width: "100%",
            padding: 10,
            border: "1px solid #d1d5db",
            borderRadius: 6,
          }}
          rows={3}
        />
      </div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <input
          id="agreedToTerms"
          type="checkbox"
          checked={form.agreedToTerms}
          onChange={handleChange("agreedToTerms")}
        />
        <label htmlFor="agreedToTerms">
          I agree to the Terms and Privacy Policy
        </label>
      </div>
      {validation.errors.agreedToTerms && (
        <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>
          {validation.errors.agreedToTerms}
        </div>
      )}

      {localError && (
        <div style={{ marginTop: 12, color: "#b91c1c" }}>{localError}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          marginTop: 16,
          width: "100%",
          padding: 12,
          background: submitting ? "#9ca3af" : "#111827",
          color: "white",
          borderRadius: 6,
          cursor: submitting ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
};

export default SignupForm;
