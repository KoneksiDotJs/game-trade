"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface ForgotPasswordFormProps {
  onSubmit: (values: { email: string }) => Promise<void>;
}

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Required"),
});

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Forgot Password
      </h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Enter your email address to receive a password reset link.
      </p>
      <Formik
        initialValues={{ email: "" }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div>
              <Field
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
