import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Синяя корпоративная
        brand: {
          50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd",
          400: "#60a5fa", 500: "#2563eb", 600: "#1d4ed8", 700: "#1e40af",
          800: "#1e3a8a", 900: "#172554",
        },
        // Фиолетовая современная
        purple: {
          50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 300: "#d8b4fe",
          400: "#c084fc", 500: "#7c3aed", 600: "#6d28d9", 700: "#5b21b6",
          800: "#4c1d95", 900: "#3b0764",
        },
        // Зеленая эко
        emerald: {
          50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7",
          400: "#34d399", 500: "#059669", 600: "#047857", 700: "#065f46",
          800: "#064e3b", 900: "#022c22",
        },
        // Оранжевая энергичная
        orange: {
          50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74",
          400: "#fb923c", 500: "#ea580c", 600: "#c2410c", 700: "#9a3412",
          800: "#7c2d12", 900: "#431407",
        },
        // Красная акцентная
        red: {
          50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 300: "#fca5a5",
          400: "#f87171", 500: "#dc2626", 600: "#b91c1c", 700: "#991b1b",
          800: "#7f1d1d", 900: "#450a0a",
        },
        // Бирюзовая tech
        teal: {
          50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4",
          400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e",
          800: "#115e59", 900: "#134e4a",
        },
        // Розовая creative
        pink: {
          50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8", 300: "#f9a8d4",
          400: "#f472b6", 500: "#ec4899", 600: "#db2777", 700: "#be185d",
          800: "#9d174d", 900: "#831843",
        },
        // Индиго data
        indigo: {
          50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc",
          400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca",
          800: "#3730a3", 900: "#312e81",
        },
        // Желтая warning
        yellow: {
          50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d",
          400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309",
          800: "#92400e", 900: "#78350f",
        },
        // Темная тема
        dark: {
          50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1",
          400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155",
          800: "#1e293b", 900: "#0f172a",
        },
        // Золотой (для security)
        gold: {
          50: "#fefce8", 100: "#fef9c3", 200: "#fef08a", 300: "#fde047",
          400: "#facc15", 500: "#ca8a04", 600: "#a16207", 700: "#854d0e",
          800: "#713f12", 900: "#422006",
        },
        // Сепия (для reader)
        sepia: {
          50: "#fefce8", 100: "#fef3c7", 200: "#fde68a", 300: "#d6c9a0",
          400: "#c4b58a", 500: "#b8a87a", 600: "#a0906a", 700: "#8a7c5a",
          800: "#6b5f45", 900: "#4d432f",
        },
        // Голубой (для help)
        sky: {
          50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 300: "#7dd3fc",
          400: "#38bdf8", 500: "#0284c7", 600: "#0369a1", 700: "#075985",
          800: "#0c4a6e", 900: "#082f49",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "Fira Code", "monospace"],
        system: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideInRight: { "0%": { transform: "translateX(20px)", opacity: "0" }, "100%": { transform: "translateX(0)", opacity: "1" } },
        scaleIn: { "0%": { transform: "scale(0.95)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
        pulseSoft: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.7" } },
      },
    },
  },
  plugins: [],
};

export default config;
