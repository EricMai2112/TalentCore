import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import { AuthProvider } from "@/src/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalentCore - Kiến tạo tương lai",
  description: "Cơ hội nghề nghiệp và hệ sinh thái giải pháp công nghệ tại TalentCore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600/30">
        <AuthProvider>
          <Header />
          <main className="flex flex-col flex-1">
            <ToastContainer />
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

