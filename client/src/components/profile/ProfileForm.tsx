"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "@/lib/api/client";
import toast from "react-hot-toast";
import { useState } from "react";
import Image from "next/image";

interface ProfileFormProps {
  profile: {
    username: string;
    email: string;
    avatarUrl?: string;
  };
  setProfile: (profile: {
    username: string;
    email: string;
    avatarUrl?: string;
  }) => void;
}

const validationSchema = Yup.object({
  username: Yup.string().required("Required"),
  avatar: Yup.mixed()
    .nullable()
    .test("fileSize", "File too large", (value) => {
      if (!value) return true;
      return (value as File).size <= 1024 * 1024 * 2; // 2MB
    })
    .test("fileType", "Unsupported file type", (value) => {
      if (!value) return true;
      return ["image/jpeg", "image/png", "image/gif"].includes(
        (value as File).type
      );
    }),
});

export function ProfileForm({ profile, setProfile }: ProfileFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile.avatarUrl || null
  );

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: File | null) => void
  ) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      setFieldValue("avatar", file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <Formik
      initialValues={{
        username: profile.username,
        email: profile.email,
        avatar: null as File | null,
      }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const formData = new FormData();
          formData.append("username", values.username);
          if (values.avatar) {
            formData.append("avatar", values.avatar);
          }

          const response = await api.put("/users/profile", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setProfile(response.data);
          toast.success("Profile updated successfully");
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update profile";
          toast.error(errorMessage);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              <Image
                src={previewUrl || "/assets/images/default-avatar.png"}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
              <span>Change Avatar</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setFieldValue)}
              />
            </label>
            <ErrorMessage
              name="avatar"
              component="div"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <Field
              name="email"
              type="email"
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
              value={profile.email}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <Field
              name="username"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your username"
            />
            <ErrorMessage
              name="username"
              component="div"
              className="mt-1 text-sm text-red-600 dark:text-red-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
