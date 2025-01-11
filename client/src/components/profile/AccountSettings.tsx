"use client";

export function AccountSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Delete Account
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <button
          type="button"
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
