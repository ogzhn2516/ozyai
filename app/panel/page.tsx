import { ImageIcon, Mic2, Video, Wand2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../lib/user-store";

const tools = [
  {
    href: "/create",
    title: "Avatar video oluştur",
    text: "Portre, metin, ses ve çözünürlükle video akışını başlat.",
    icon: Video,
  },
  {
    href: "/image-generator",
    title: "Görsel üret",
    text: "Text-to-image veya image-to-image ile avatar görseli hazırla.",
    icon: ImageIcon,
  },
  {
    href: "/voice-generator",
    title: "Seslendir",
    text: "ElevenLabs sesleriyle metni audio çıktısına dönüştür.",
    icon: Mic2,
  },
];

export default async function UserPanelPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.55fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
              <Wand2 className="h-4 w-4" />
              Kullanıcı paneli
            </div>
            <h1 className="text-4xl font-bold text-ink">Hoş geldiniz, {user.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Avatar video, görsel üretimi ve seslendirme araçlarını tek çalışma alanından yönetin.
            </p>
          </div>
          <div className="rounded-lg bg-slate-950 p-5 text-white">
            <p className="text-xs font-bold uppercase text-slate-400">Hesap</p>
            <p className="mt-2 text-lg font-bold">{user.email}</p>
            <p className="mt-4 text-sm text-slate-300">
              Kayıt: {new Intl.DateTimeFormat("tr-TR").format(new Date(user.createdAt))}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;

          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
            >
              <Icon className="h-7 w-7 text-wiro-600" />
              <h2 className="mt-5 text-xl font-bold text-ink">{tool.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{tool.text}</p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
