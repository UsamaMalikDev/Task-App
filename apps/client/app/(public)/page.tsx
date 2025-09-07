"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useNavigation } from "../hooks/useNavigation";
import Link from "next/link";
import { useAppDispatch } from "../store/hooks";
import { AuthApi } from "../lib/auth.api";
import { checkError } from "../utils/helpers";
import { setAuthUser } from "../store/slice/auth.slice";
import { SignInPayloadType } from "../types";
import SigninForm from "./components/SigninForm";

const SigninPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigation();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const successMessage = searchParams.get('message');

  const handleSubmit = async (form: SignInPayloadType) => {
    setFormError(null);

    try {
      setSubmitting(true);
      const response = await AuthApi.login(form);

      const error = checkError([response]);
      if (error) {
        setFormError(typeof error === "string" ? error : "Sign in failed");
        return;
      }
      dispatch(setAuthUser(response.user));
      localStorage.setItem('userId', response.user._id);
      navigate("/tasks");
    } catch (err) {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/30 to-pink-600/30 rounded-full blur-3xl"></div>
      </div>
      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-blue-100">Sign in to your Task Manager</p>
          </div>
          <div className="px-8 py-8">
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-700 text-sm font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{formError}</p>
                </div>
              </div>
            )}

            <SigninForm onSubmit={handleSubmit} submitting={submitting} />

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link 
                  href="/sign-up"
                  className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Secure sign-in powered by advanced encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;

