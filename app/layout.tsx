import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wiro AI Avatar Video",
  description: "Mock API ile kredi harcamadan AI avatar video oluşturma arayüzü.",
};

const navItems = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/create", label: "Video Oluştur" },
  { href: "/image-generator", label: "Görsel Üret" },
  { href: "/voice-generator", label: "Seslendir" },
  { href: "/login", label: "Giriş" },
  { href: "/register", label: "Kayıt Ol" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3 font-bold text-ink">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
                W
              </span>
              <span>Wiro Avatar Studio</span>
            </Link>
            <nav className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-sm font-medium text-slate-600 shadow-sm sm:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
