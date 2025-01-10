"use client";
import { ErrorMessage, Field, Form, Formik } from "formik";
import Link from "next/link";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import * as Yup from "yup";

interface LoginFormProps {
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>;
}

interface LoginFormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Login
      </h2>
      <Formik<LoginFormValues>
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <Field
                type="email"
                name="email"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your email"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10 [-ms-reveal:none]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 z-10"
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
              <ErrorMessage
                name="password"
                component="div"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium"
              >
                Register here
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
}
