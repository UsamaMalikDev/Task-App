"use client";
import React, { useState } from "react";
import { useNavigation } from "../../hooks/useNavigation";
import Link from "next/link";
import { AuthApi } from "../../lib/auth.api";
import { checkError} from "../../utils/helpers";
import { SignupFormData } from "@/app/types";
import SignupForm from "./components/SignupForm";

const SignupPage: React.FC = () => {
  const navigate = useNavigation();
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
          organizationId: form.organizationId,
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
      navigate("/?message=Account created successfully! Please sign in.");
    } catch (err) {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/30 to-pink-600/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
            <p className="text-blue-100 text-lg">Join thousands of teams managing tasks efficiently</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center justify-center space-x-2 text-white/90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Free to start</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-white/90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm">Secure & private</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-white/90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm">Setup in minutes</span>
              </div>
            </div>
          </div>
          <div className="px-8 py-8">
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

            <SignupForm onSubmit={handleSubmit} submitting={submitting} />

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/"
                  className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Trusted by teams at leading companies
          </p>
          <div className="flex justify-center items-center space-x-8 opacity-60 text-2xl">
            <span>🚀</span>
            <span>💻</span>
            <span>🌎</span>
            <span>⚡</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;