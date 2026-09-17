/**
 * Минималистичный столбчатый график по дням — без внешних библиотек
 * (в проекте сознательно нет recharts/chart.js, см. package.json), чистый
 * SVG + Tailwind, в духе остальной админки. Подписи дат — через <title>
 * (нативный tooltip браузера), без JS-обработчиков наведения.
 */
interface Point {
  day: string; // YYYY-MM-DD
  count: number;
}

const fmtDay = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
};

export function DailyBarChart({
  data,
  height = 96,
  color = "#7c3aed",
}: {
  data: Point[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(1, ...data.map((p) => p.count));
  const width = Math.max(data.length * 10, 100);
  const barW = width / data.length;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        className="min-w-[280px]"
        role="img"
        aria-label="График событий по дням"
      >
        {data.map((p, i) => {
          const h = (p.count / max) * (height - 4);
          return (
            <rect
              key={p.day}
              x={i * barW + 1}
              y={height - h}
              width={Math.max(barW - 2, 1)}
              height={h}
              rx={1.5}
              fill={color}
              opacity={p.count === 0 ? 0.12 : 0.85}
            >
              <title>
                {fmtDay(p.day)}: {p.count}
              </title>
            </rect>
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-0.5">
        <span>{fmtDay(data[0]?.day ?? "")}</span>
        <span>{fmtDay(data[data.length - 1]?.day ?? "")}</span>
      </div>
    </div>
  );
}
