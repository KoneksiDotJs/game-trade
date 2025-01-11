"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "@/lib/api/client";
import toast from "react-hot-toast";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AxiosError } from "axios";

const validationSchema = Yup.object({
  currentPassword: Yup.string().required("Required"),
  newPassword: Yup.string()
    .min(8, "Must be at least 8 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Required"),
});

export function ChangePasswordForm() {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  return (
    <Formik
      initialValues={{
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await api.put("/users/change-password", {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          });
          toast.success("Password changed successfully");
        } catch (error: unknown) {
          const errorMessage = error instanceof AxiosError
            ? error.response?.data?.message || "Failed to change password"
            : "Failed to change password";
          toast.error(errorMessage);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <div className="relative">
              <Field
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    current: !prev.current,
                  }))
                }
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400"
              >
                {showPasswords.current ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>
            <ErrorMessage
              name="currentPassword"
              component="div"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <div className="relative">
              <Field
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400"
              >
                {showPasswords.new ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>
            <ErrorMessage
              name="newPassword"
              component="div"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Field
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400"
              >
                {showPasswords.confirm ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>
            <ErrorMessage
              name="confirmPassword"
              component="div"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Changing Password..." : "Change Password"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
