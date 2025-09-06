"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch } from "../store/hooks";
import { AuthApi } from "../lib/auth.api";
import { checkError, setAuthCookie, accessValidation } from "../utils/helpers";
import { setPersistedAuthData } from "../store/actions";
import { SignInPayloadType } from "../types";
import SigninForm from "./components/SigninForm";

const SigninPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (form: SignInPayloadType) => {
    setFormError(null);

    try {
      setSubmitting(true);
      const authData = await AuthApi.signIn(form);

      const error = checkError([authData]);
      if (error) {
        setFormError(typeof error === "string" ? error : "Sign in failed");
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
        maxWidth: 420,
        margin: "48px auto",
        padding: 24,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
      }}
    >
      <h1 style={{ marginBottom: 16 }}>Sign in</h1>

      {formError && (
        <div style={{ marginBottom: 12, color: "#b91c1c" }}>{formError}</div>
      )}

      <SigninForm onSubmit={handleSubmit} submitting={submitting} />

      <div style={{ marginTop: 12, fontSize: 14 }}>
        Don’t have an account? <Link href="/sign-up">Sign up</Link>
      </div>
    </div>
  );
};

export default SigninPage;
