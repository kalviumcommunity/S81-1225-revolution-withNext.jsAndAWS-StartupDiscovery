"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { signupSchema, SignupFormData } from "@/schemas/signupSchema";
import FormInput from "@/components/FormInput";

export default function SignupPage() {
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setSubmitError("");
      setSuccessMessage("");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Form Submitted:", data);

      setSuccessMessage(
        `Welcome, ${data.name}! Your account has been created.`
      );
      reset();
    } catch (error) {
      setSubmitError("Failed to create account. Please try again.");
      console.error("Submission error:", error);
    }
  };

  return (
    <main className="p-6 flex flex-col items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          Create Account
        </h1>
        <p className="text-gray-600 mb-6">
          Join us today with form validation and real-time error messages
        </p>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">✅ {successMessage}</p>
          </div>
        )}

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">❌ {submitError}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm"
          noValidate
        >
          <FormInput
            label="Full Name"
            name="name"
            type="text"
            register={register("name")}
            error={errors.name}
            placeholder="e.g., Alice Johnson"
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            register={register("email")}
            error={errors.email}
            placeholder="e.g., alice@example.com"
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            register={register("password")}
            error={errors.password}
            placeholder="Min 6 chars, 1 uppercase, 1 number"
          />

          <div className="mt-8 mb-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By signing up, you agree to our Terms of Service
          </p>
        </form>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-bold text-gray-900 mb-2">📋 Validation Rules:</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Name: 3-50 characters</li>
            <li>• Email: Valid format required</li>
            <li>• Password: Min 6 chars, 1 uppercase, 1 number</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-2">💡 Try These:</h3>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Leave fields empty → see required errors</li>
            <li>Enter &quot;ab&quot; name → too short error</li>
            <li>Enter &quot;invalid&quot; email → email error</li>
            <li>Enter &quot;password123&quot; → missing uppercase error</li>
            <li>Fill all correctly → successful submission</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
