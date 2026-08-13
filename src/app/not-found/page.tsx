"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Home, ArrowLeft, Search, Frown, Smile, RefreshCw, FileQuestion, Compass, AlertTriangle } from "lucide-react";

const jokes = [
  "Кажется, эта страница ушла в отпуск без уведомления.",
  "404 — это не ошибка, а возможность создать что-то новое!",
  "Эта страница как хорошая парковка — её очень трудно найти.",
  "Мы обыскали всё, но эту страницу не нашли. Даже под диваном.",
];

const suggestions = [
  { icon: Home, label: "На главную", href: "/" },
  { icon: FileQuestion, label: "Популярные документы", href: "/documents" },
  { icon: Compass, label: "Каталог шаблонов", href: "/templates" },
  { icon: Search, label: "Поиск", href: "/templates" },
];

export default function NotFoundPage() {
  const router = useRouter();
  const [joke, setJoke] = useState(jokes[0]);
  const [count, setCount] = useState(404);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    setJoke(jokes[Math.floor(Math.random() * jokes.length)]);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQ.trim();
    router.push(q ? `/templates?q=${encodeURIComponent(q)}` : "/templates");
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 30%, #fde68a 70%, #fffbeb 100%)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="relative mb-10">
          <div className="text-[10rem] sm:text-[14rem] font-extrabold leading-none select-none"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706, #f59e0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
            }}
          >
            404
          </div>
          <div className="absolute -top-4 -right-4 sm:top-0 sm:-right-8 animate-bounce">
            <Frown className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-yellow-200 shadow-elevated p-8 sm:p-10 w-full max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Упс! Страница не найдена
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {joke}
          </p>

          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setJoke(jokes[Math.floor(Math.random() * jokes.length)])}
              className="flex items-center gap-1.5 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-xl text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Другая шутка
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {suggestions.map((s, i) => {
              const Icon = s.icon;
              return (
                <a
                  key={i}
                  href={s.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-yellow-50 border border-yellow-100 hover:bg-yellow-100 hover:border-yellow-300 transition-all group"
                >
                  <Icon className="w-6 h-6 text-yellow-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-yellow-800">{s.label}</span>
                </a>
              );
            })}
          </div>

          <div className="space-y-3">
            <Button variant="primary" size="lg" className="w-full !bg-gradient-to-r from-yellow-500 to-yellow-600 !border-0">
              <Home className="w-4 h-4" />
              Вернуться на главную
            </Button>
            <Button variant="outline" size="lg" className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50">
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-8 flex items-center gap-2 text-sm text-yellow-700">
          <Search className="w-4 h-4" />
          <span>Или попробуйте поискать:</span>
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Что ищете?"
            className="px-4 py-2 bg-white/60 border border-yellow-200 rounded-xl text-sm text-gray-700 placeholder:text-yellow-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 w-40"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded-xl transition-colors"
          >
            Найти
          </button>
        </form>
      </div>
    </div>
  );
}
