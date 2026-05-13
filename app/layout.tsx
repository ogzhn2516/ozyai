import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "figyfun Influencer CRM",
  description: "figyfun marka işbirlikleri için güvenli influencer data paneli.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <header className="sticky top-0 z-40 border-b border-white/50 bg-[#fbf6e9]/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/panel" className="group flex items-center gap-3 text-fig-ink">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-fig-ink font-display text-xl font-black text-fig-cream shadow-card transition group-hover:-rotate-3">
                f
              </span>
              <span>
                <span className="block font-display text-2xl font-black leading-none">figyfun</span>
                <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-fig-moss">Influencer CRM</span>
              </span>
            </Link>
            <nav className="hidden items-center gap-2 sm:flex">
              <Link href="/panel" className="btn-soft px-4 py-2">Panel</Link>
              <Link href="/influencers" className="btn-soft px-4 py-2">Influencerlar</Link>
              <Link href="/ugc" className="btn-soft px-4 py-2">UGC Formu</Link>
              <Link href="/login" className="btn-primary px-4 py-2">Giriş</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
