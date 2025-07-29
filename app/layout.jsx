import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Swift Investment App",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  description: "A modern investment platform for managing packages, earnings, and referrals",
  generator: "v0.dev",
  manifest: "/manifest.json",
  themeColor: "#16a34a",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Xwift Investment App",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children} <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
