"use client";

import React, { useState, useMemo, FormEvent } from "react";
import { SignInPayloadType } from "@/app/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    <form onSubmit={handleSubmit} noValidate>
       <div style={{ marginBottom: 12 }}>
        <label htmlFor="email" style={{ display: "block", marginBottom: 6 }}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange("email")}
          placeholder="you@example.com"
          required
          style={{
            width: "100%",
            padding: 10,
            border: `1px solid ${
              validation.errors.email ? "#f87171" : "#d1d5db"
            }`,
            borderRadius: 6,
          }}
        />
        {validation.errors.email && (
          <div
            style={{
              marginTop: 6,
              color: "#b91c1c",
              fontSize: 12,
            }}
          >
            {validation.errors.email}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="password" style={{ display: "block", marginBottom: 6 }}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange("password")}
          placeholder="••••••••"
          required
          style={{
            width: "100%",
            padding: 10,
            border: `1px solid ${
              validation.errors.password ? "#f87171" : "#d1d5db"
            }`,
            borderRadius: 6,
          }}
        />
        {validation.errors.password && (
          <div
            style={{
              marginTop: 6,
              color: "#b91c1c",
              fontSize: 12,
            }}
          >
            {validation.errors.password}
          </div>
        )}
      </div>

      
      {localError && (
        <div style={{ marginBottom: 12, color: "#b91c1c" }}>{localError}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          width: "100%",
          padding: 12,
          background: submitting ? "#9ca3af" : "#111827",
          color: "white",
          borderRadius: 6,
          cursor: submitting ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
};

export default SigninForm;
