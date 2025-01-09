"use client";
export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-8 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              GameTrade
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Secure game trading platform
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/about"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Contact
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>Email: support@gametrade.com</li>
              <li>Discord: GameTrade</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} GameTrade. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
