import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pro-Guide | AI-Powered Career Platform",
  description: "Find your dream job with AI-powered skill matching and personalized career guidance.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      afterSignInUrl="/register"
      afterSignUpUrl="/register"
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-white`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
