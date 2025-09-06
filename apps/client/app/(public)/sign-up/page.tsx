"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthApi } from "../../lib/auth.api";
import { checkError, setAuthCookie, accessValidation } from "../../utils/helpers";
import { useAppDispatch } from "../../store/hooks";
import { setPersistedAuthData } from "../../store/actions";
import { SignupFormData } from "@/app/types";
import SignupForm from "./components/SignupForm";

const SignupPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (form: SignupFormData) => {
    setFormError(null);

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
      if (!valid && redirectTo) {
        router.push(redirectTo);
        return;
      }

      router.push("/tasks");
    } catch (err) {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "48px auto",
        padding: 24,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Create your account</h1>
      <p style={{ marginBottom: 16 }}>
        Start your free plan. No credit card required.
      </p>

      {formError && (
        <div style={{ marginBottom: 12, color: "#b91c1c" }}>{formError}</div>
      )}
      <SignupForm onSubmit={handleSubmit} submitting={submitting} />
      <div style={{ marginTop: 12, fontSize: 14 }}>
        Already have an account? <Link href="/">Sign in</Link>
      </div>
    </div>
  );
};

export default SignupPage;
