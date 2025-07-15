import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import WhatsappButton from "@/components/WhatsappButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Zerih Tech",
  icons: {
    icon: "/url.png", // use string path, not import
  },
  description: "A modern mern application",
  generator: "v0.dev",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children} <Toaster richColors position="top-right" />{" "}
            <WhatsappButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
