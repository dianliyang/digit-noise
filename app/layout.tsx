import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";

export const metadata: Metadata = {
  title: "Dianli Yang",
  description: "Minimalist portfolio and writing",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-white text-black font-sans selection:bg-black selection:text-white min-h-screen"
        suppressHydrationWarning
      >
        <div className="mx-auto w-full max-w-3xl px-6 py-12 md:py-24">
          <Nav />
          <main>{children}</main>
          <footer className="mt-32 border-t border-black/10 pt-8 text-sm">
            <p>© {new Date().getFullYear()} Dianli Yang.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
