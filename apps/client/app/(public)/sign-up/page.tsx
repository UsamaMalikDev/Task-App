"use client";
import React, { useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthApi } from "../../lib/auth.api";
import { checkError, setAuthCookie, accessValidation } from "../../utils/helpers";
import { useAppDispatch } from "../../store/hooks";
import { setPersistedAuthData } from "../../store/actions";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignupPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
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

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validation = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) errors.name = "Name is required";

    if (!form.email) errors.email = "Email is required";
    else if (!emailRegex.test(form.email)) errors.email = "Enter a valid email";

    if (!form.company.trim()) errors.company = "Company is required";

    if (!form.phone.trim()) errors.phone = "Phone is required";

    if (!form.password) errors.password = "Password is required";
    else if (form.password.length < 8)
      errors.password = "Password must be at least 8 characters";

    if (!form.confirmPassword) errors.confirmPassword = "Confirm your password";
    else if (form.confirmPassword !== form.password)
      errors.confirmPassword = "Passwords do not match";

    if (!form.agreedToTerms) errors.agreedToTerms = "You must agree to the terms";

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [form]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    if (!validation.isValid) {
      setFormError("Please fix the highlighted errors");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        userInfo: {
          name: form.name,
          email: form.email,
          company: form.company,
          phone: form.phone,
          password: form.password,
          confirmPassword: form.confirmPassword,
          source: form.source,
          reason: form.reason || undefined,
          agreedToTerms: form.agreedToTerms,
        },
        selectedPlan: form.selectedPlan,
      };

      const authData = await AuthApi.signUp(payload);
      const error = checkError([authData]);
      if (error) {
        setFormError(typeof error === "string" ? error : "Sign up failed");
        return;
      }

      setAuthCookie(authData);
      dispatch(setPersistedAuthData(authData));

      const { redirectTo, valid } = accessValidation(authData);
      if (!valid && redirectTo) return router.push(redirectTo);

      router.push("/tasks");
    } catch (err) {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (hasError: boolean) => ({
    width: "100%",
    padding: 10,
    border: `1px solid ${hasError ? "#f87171" : "#d1d5db"}`,
    borderRadius: 6,
  } as React.CSSProperties);

  return (
    <div style={{ maxWidth: 560, margin: "48px auto", padding: 24, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <h1 style={{ marginBottom: 8 }}>Create your account</h1>
      <p style={{ marginBottom: 16 }}>Start your free plan. No credit card required.</p>
      {formError ? (
        <div style={{ marginBottom: 12, color: "#b91c1c" }}>{formError}</div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label htmlFor="name" style={{ display: "block", marginBottom: 6 }}>Name</label>
            <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle(!!validation.errors.name)} placeholder="Your name" />
            {validation.errors.name ? <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>{validation.errors.name}</div> : null}
          </div>
          <div>
            <label htmlFor="email" style={{ display: "block", marginBottom: 6 }}>Email</label>
            <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle(!!validation.errors.email)} placeholder="you@example.com" />
            {validation.errors.email ? <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>{validation.errors.email}</div> : null}
          </div>
          <div>
            <label htmlFor="company" style={{ display: "block", marginBottom: 6 }}>Company</label>
            <input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} style={inputStyle(!!validation.errors.company)} placeholder="Company Inc." />
            {validation.errors.company ? <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>{validation.errors.company}</div> : null}
          </div>
          <div>
            <label htmlFor="phone" style={{ display: "block", marginBottom: 6 }}>Phone</label>
            <input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle(!!validation.errors.phone)} placeholder="(555) 000-0000" />
            {validation.errors.phone ? <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>{validation.errors.phone}</div> : null}
          </div>
          <div>
            <label htmlFor="password" style={{ display: "block", marginBottom: 6 }}>Password</label>
            <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle(!!validation.errors.password)} placeholder="••••••••" />
            {validation.errors.password ? <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>{validation.errors.password}</div> : null}
          </div>
          <div>
            <label htmlFor="confirmPassword" style={{ display: "block", marginBottom: 6 }}>Confirm Password</label>
            <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} style={inputStyle(!!validation.errors.confirmPassword)} placeholder="••••••••" />
            {validation.errors.confirmPassword ? <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>{validation.errors.confirmPassword}</div> : null}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label htmlFor="reason" style={{ display: "block", marginBottom: 6 }}>What are you planning to do?</label>
          <textarea id="reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }} rows={3} />
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <input id="agreedToTerms" type="checkbox" checked={form.agreedToTerms} onChange={(e) => setForm({ ...form, agreedToTerms: e.target.checked })} />
          <label htmlFor="agreedToTerms">I agree to the Terms and Privacy Policy</label>
        </div>
        {validation.errors.agreedToTerms ? <div style={{ marginTop: 6, color: "#b91c1c", fontSize: 12 }}>{validation.errors.agreedToTerms}</div> : null}

        <button
          type="submit"
          disabled={submitting}
          style={{ marginTop: 16, width: "100%", padding: 12, background: submitting ? "#9ca3af" : "#111827", color: "white", borderRadius: 6, cursor: submitting ? "not-allowed" : "pointer" }}
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div style={{ marginTop: 12, fontSize: 14 }}>
        Already have an account? <Link href="/">Sign in</Link>
      </div>
    </div>
  );
};

export default SignupPage; 