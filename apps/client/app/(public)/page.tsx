"use client";
import React, { useState, FormEvent, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch } from "../store/hooks";
import { AuthApi } from "../lib/auth.api";
import { checkError, setAuthCookie, accessValidation } from "../utils/helpers";
import { setPersistedAuthData } from '../store/actions';
import { SignInPayloadType } from "../types";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SigninPage = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [form, setForm] = useState<SignInPayloadType>({
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validation = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!form.email) errors.email = "Email is required";
    else if (!emailRegex.test(form.email)) errors.email = "Enter a valid email";

    if (!form.password) errors.password = "Password is required";
    else if (form.password.length < 8)
      errors.password = "Password must be at least 8 characters";

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [form]);

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setFormError(null);
    if (!validation.isValid) {
      setFormError("Please fix the highlighted errors");
      return;
    }

    try {
      setSubmitting(true);
      const authData = await AuthApi.signIn(form);
      console.log("🚀 ~ handleSubmit ~ authData:", authData)
      console.log("🚀 ~ handleSubmit ~ authData:", authData)
      const error = checkError([authData]);
      console.log("🚀 ~ handleSubmit ~ error:", error)
      if (error) {
        setFormError(typeof error === "string" ? error : "Sign in failed");
        return;
      }

      setAuthCookie(authData);
      dispatch(setPersistedAuthData(authData));

      const { redirectTo, valid } = accessValidation(authData);
      if (!valid && redirectTo) return router.push(redirectTo);

      // Default success path if no redirect provided
      router.push("/tasks");
    } catch (error) {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "48px auto", padding: 24, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <h1 style={{ marginBottom: 16 }}>Sign in</h1>
      {formError ? (
        <div style={{ marginBottom: 12, color: "#b91c1c" }}>{formError}</div>
      ) : null}
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: 6 }}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            required
            style={{ width: "100%", padding: 10, border: `1px solid ${validation.errors.email ? "#f87171" : "#d1d5db"}`, borderRadius: 6 }}
          />
          {validation.errors.email ? (
            <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>{validation.errors.email}</div>
          ) : null}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: 6 }}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
            style={{ width: "100%", padding: 10, border: `1px solid ${validation.errors.password ? "#f87171" : "#d1d5db"}`, borderRadius: 6 }}
          />
          {validation.errors.password ? (
            <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>{validation.errors.password}</div>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{ width: "100%", padding: 12, background: submitting ? "#9ca3af" : "#111827", color: "white", borderRadius: 6, cursor: submitting ? "not-allowed" : "pointer" }}
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div style={{ marginTop: 12, fontSize: 14 }}>
        Don’t have an account? <Link href="/sign-up">Sign up</Link>
      </div>
    </div>
  );
};

export default SigninPage;
