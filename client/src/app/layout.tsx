import "@/styles/globals.css";
import { Providers } from "./providers";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "GameTrade",
  description: "Game trading platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ErrorBoundary>
            <ClientLayout>{children}</ClientLayout>
          </ErrorBoundary>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
