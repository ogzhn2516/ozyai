import {
  ArrowRight,
  AudioLines,
  BadgeCheck,
  Check,
  ImageIcon,
  Layers3,
  LockKeyhole,
  Play,
  Sparkles,
  Video,
  Wand2,
} from "lucide-react";
import Link from "next/link";

const modules = [
  {
    title: "Avatar Video",
    text: "Portreden konuşan demo avatar videosu üretim akışı.",
    icon: Video,
    href: "/create",
  },
  {
    title: "GPT Image",
    text: "Text-to-image ve image-to-image için görsel stüdyo.",
    icon: ImageIcon,
    href: "/image-generator",
  },
  {
    title: "ElevenLabs",
    text: "Seçilen sesle metinden audio üretim alanı.",
    icon: AudioLines,
    href: "/voice-generator",
  },
];

const proof = [
  "Mock fallback ile kredi koruması",
  "Admin servis anahtar yönetimi",
  "Kullanıcı kayıt ve panel girişi",
];

const pricingPlans = [
  {
    name: "Starter",
    price: "₺0",
    note: "Demo ve kurulum testi",
    description: "Mock API akışlarıyla paneli ve müşteri demosunu hazırlayın.",
    features: ["Mock avatar video", "Mock GPT Image sonucu", "Mock ElevenLabs audio", "Tek kullanıcı paneli"],
    cta: "Ücretsiz başla",
    highlight: false,
  },
  {
    name: "Studio",
    price: "₺499",
    note: "Aylık",
    description: "Gerçek API anahtarlarınızı bağlayıp üretime hazır stüdyo akışı kurun.",
    features: ["OpenAI image entegrasyonu", "ElevenLabs seslendirme", "Wiro video endpoint hazırlığı", "Admin API yönetimi"],
    cta: "Studio ile başla",
    highlight: true,
  },
  {
    name: "Agency",
    price: "Özel",
    note: "Ekip ve müşteri işleri",
    description: "Birden çok marka, müşteri veya üretim hattı için genişletilebilir yapı.",
    features: ["Çoklu servis yapılandırması", "Özel iş akışları", "Müşteri demo panelleri", "Öncelikli kurulum desteği"],
    cta: "Teklif iste",
    highlight: false,
  },
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      <section className="relative min-h-[calc(100vh-73px)] border-b border-slate-200 bg-[#f8fafc]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-wiro-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              AI avatar üretim merkezi
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-ink sm:text-5xl lg:text-6xl">
              Tek panelden avatar video, görsel ve ses üretimi
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Kullanıcı hesabı oluşturun, üretim paneline girin ve Wiro, GPT Image ve
              ElevenLabs akışlarını profesyonel bir stüdyo düzeninde yönetin.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-slate-700"
              >
                Kayıt ol ve panele gir
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm transition hover:bg-slate-50"
              >
                <LockKeyhole className="h-4 w-4" />
                Giriş yap
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {proof.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
              <div className="rounded-lg bg-slate-950 p-4 text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Studio timeline</p>
                    <p className="mt-1 text-lg font-bold">Wiro Avatar Session</p>
                  </div>
                  <span className="rounded-md bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-950">
                    Ready
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[0.8fr_1fr]">
                  <div className="aspect-[3/4] rounded-lg bg-[linear-gradient(160deg,#155eef,#14b8a6)] p-4">
                    <div className="flex h-full flex-col justify-between rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
                      <span className="w-fit rounded-md bg-white/20 px-2 py-1 text-xs font-bold">1080p</span>
                      <div className="grid place-items-center">
                        <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-4xl font-bold text-ink">
                          AI
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 rounded-full bg-white/70" />
                        <div className="h-2 w-2/3 rounded-full bg-white/35" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {modules.map((module, index) => {
                      const Icon = module.icon;

                      return (
                        <Link
                          key={module.title}
                          href={module.href}
                          className="rounded-lg border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.10]"
                        >
                          <div className="flex items-start gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-wiro-700">
                              <Icon className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="text-sm font-bold">
                                0{index + 1}. {module.title}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-300">{module.text}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-4 rounded-lg bg-white p-3 text-ink">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white">
                      <Play className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">Demo üretim hattı</p>
                      <p className="text-xs text-slate-500">Kayıt sonrası panelden başlatılır</p>
                    </div>
                  </div>
                  <Layers3 className="h-5 w-5 text-wiro-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.title}
                href={module.href}
                className="rounded-lg border border-slate-200 p-5 transition hover:-translate-y-1 hover:shadow-soft"
              >
                <Icon className="h-7 w-7 text-wiro-600" />
                <h2 className="mt-5 text-xl font-bold text-ink">{module.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{module.text}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#f8fafc]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm font-bold text-wiro-700 shadow-sm">
              <BadgeCheck className="h-4 w-4" />
              Esnek fiyatlandırma
            </div>
            <h2 className="text-3xl font-bold text-ink sm:text-4xl">
              Önce ücretsiz deneyin, sonra servis anahtarlarınızı bağlayın
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Paketler demo, bireysel stüdyo ve ajans kullanımına göre kurgulandı. API kullanım ücretleri ilgili servis sağlayıcılar tarafından ayrıca hesaplanır.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-lg border p-6 shadow-sm ${
                  plan.highlight
                    ? "border-wiro-500 bg-slate-950 text-white shadow-soft"
                    : "border-slate-200 bg-white text-ink"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className={plan.highlight ? "mt-2 text-sm text-slate-300" : "mt-2 text-sm text-slate-600"}>
                      {plan.description}
                    </p>
                  </div>
                  {plan.highlight ? (
                    <span className="rounded-md bg-emerald-300 px-3 py-1 text-xs font-bold text-slate-950">
                      Popüler
                    </span>
                  ) : null}
                </div>

                <div className="mt-7 flex items-end gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={plan.highlight ? "pb-1 text-sm font-semibold text-slate-300" : "pb-1 text-sm font-semibold text-slate-500"}>
                    {plan.note}
                  </span>
                </div>

                <ul className="mt-7 grid gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm font-semibold">
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md ${
                          plan.highlight ? "bg-white text-wiro-700" : "bg-blue-50 text-wiro-700"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className={plan.highlight ? "text-slate-100" : "text-slate-700"}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition ${
                    plan.highlight
                      ? "bg-white text-ink hover:bg-slate-100"
                      : "bg-ink text-white hover:bg-slate-700"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-300">
              <Wand2 className="h-4 w-4" />
              Hesap aç, üretime geç
            </div>
            <h2 className="text-3xl font-bold">Kullanıcı paneli hazır.</h2>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-slate-100"
          >
            Ücretsiz kayıt ol
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
