import "~/styles/globals.css";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Get It Done",
  description:
    "Break down your goals into actionable steps and track progress every day.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} min-h-screen text-white`}>
      <body className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-fuchsia-500/30 via-indigo-500/25 to-emerald-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 top-40 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-500/20 via-sky-500/20 to-fuchsia-500/20 blur-3xl" />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
