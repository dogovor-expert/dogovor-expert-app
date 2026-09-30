/**
 * Эталонные макеты резюме (по образцу РЕЗЮМЕ 3): три раскладки —
 * exec (баннер с фото), side (боковая колонка), base (шапка + две колонки).
 * Класс `smp` лежит на корневом `.doc`, поэтому селекторы начинаются с `.smp`.
 * Акцент задаётся CSS-переменной --ac, один CSS обслуживает все шаблоны.
 */
export const SAMPLE_CSS = `
/* Базовый кегль и интерлиньяж — по ATS/печатным нормам:
   13.5px = 10.1pt (минимум 10pt у Butterick, верхняя граница 12pt),
   line-height 1.3 = 130% (диапазон 120–145%).
   Глифы стали крупнее на 8%, но высота строки 12.5x1.55=19.4px -> 13.5x1.3=17.6px,
   то есть вертикальный бюджет листа НЕ вырос — контент по-прежнему влезает в A4. */
.smp{font-family:'Inter',system-ui,-apple-system,sans-serif;font-size:13.5px;line-height:1.3;color:#334155;background:#fff;--ac:#4f46e5;min-height:1123px;position:relative}
.smp *{box-sizing:border-box}
.smp h1,.smp h2,.smp h3,.smp p,.smp ul{margin:0}
.smp ul{list-style:none;padding:0}
.smp.doc{padding:0}
.smp svg{display:block}
.smp .smp-sec{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:#0f172a;border-bottom:1px solid #e2e8f0;padding-bottom:5px;margin-bottom:9px}
.smp .smp-sec svg{width:15px;height:15px;color:var(--ac);flex:none}
.smp .smp-lbl{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:#64748b;margin-bottom:6px}
.smp .smp-h3{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:#0f172a;margin-bottom:9px}
.smp .smp-hd-t{flex:1;min-width:0}
.smp .smp-top-t{min-width:0;flex:1}
.smp .smp-dot{width:8px;height:8px;border-radius:50%;background:var(--ac);flex:none;display:inline-block}
.smp .smp-bullet{width:8px;height:8px;border-radius:50%;background:var(--ac);flex:none}
.smp .smp-chips{display:flex;flex-wrap:wrap;gap:6px}
.smp .smp-chip{background:#f1f5f9;color:#334155;font-size:10.5px;font-weight:600;border-radius:6px;padding:2px 8px;line-height:1.5}
.smp .smp-sum{color:#475569;line-height:1.7}
.smp .smp-xp-i{position:relative;border-left:2px solid #e5e9f0;padding-left:14px}
.smp .smp-xp-i+.smp-xp-i{margin-top:15px}
.smp .smp-xp-i>.smp-dot{position:absolute;left:-5px;top:6px}
.smp .smp-xp2 .smp-x2+.smp-x2{margin-top:15px}
.smp .smp-xp-top{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.smp .smp-xp-top b{font-size:12.5px;font-weight:700;color:#0f172a}
.smp .smp-xp-top i{font-style:normal;font-size:10.5px;font-weight:600;color:#64748b;white-space:nowrap}
.smp .smp-xp-c{font-size:11.5px;font-weight:600;color:var(--ac);margin:1px 0 4px}
.smp .smp-xp-b{margin-top:5px}
/* Достижения — основной текст резюме: 12.5px = 9.4pt. Поднимаем до 13px = 9.75pt,
   максимально близко к 10pt без риска вылезти за полосу набора A4. */
.smp .smp-xp-b li{position:relative;padding-left:13px;font-size:13px;color:#475569;margin-top:3px}
.smp .smp-xp-b li::before{content:'';position:absolute;left:2px;top:6px;width:3px;height:3px;border-radius:50%;background:#94a3b8}
.smp .smp-ed+.smp-ed{margin-top:8px}
.smp .smp-ed b{display:block;font-size:11.5px;font-weight:700;color:#1e293b}
.smp .smp-ed span{display:block;font-size:10.5px;color:#64748b}
.smp .smp-ed i{font-style:normal;font-size:10px;color:#64748b}
.smp .smp-lg-row{display:flex;justify-content:space-between;gap:8px;font-size:11px;margin-top:3px}
.smp .smp-lg-row b{font-weight:600;color:#334155}
.smp .smp-lg-row span{color:#64748b;font-size:10px}
.smp .smp-cont{display:inline-flex;align-items:center;gap:6px;font-size:11px;min-width:0}
.smp .smp-cont svg{width:13px;height:13px;flex:none;opacity:.78}
.smp .smp-cont>span{min-width:0;overflow-wrap:anywhere}
.smp-cont-list .smp-cont{display:flex;align-items:flex-start}
.smp-cont-list .smp-cont+.smp-cont{margin-top:6px}
.smp .smp-main,.smp .smp-rail,.smp .smp-page{min-width:0;overflow-wrap:anywhere}

/* ===== 1. EXEC: баннер с фото + две колонки ===== */
.smp-exec{display:flex;flex-direction:column}
.smp-exec .smp-hd{background:var(--ac);color:#fff;padding:26px 30px;display:flex;gap:18px;align-items:center}
.smp-serif .smp-hd h1{font-family:'Times New Roman',Georgia,serif}
.smp-exec .smp-ph{position:relative;flex:none}
.smp-exec .smp-ph img{width:78px;height:78px;border-radius:16px;object-fit:cover;box-shadow:0 0 0 3px rgba(255,255,255,.28)}
.smp-exec .smp-ph .chk{position:absolute;right:-5px;bottom:-5px;width:21px;height:21px;border-radius:50%;background:#10b981;color:#fff;display:grid;place-items:center;font-size:12px;box-shadow:0 0 0 2px rgba(255,255,255,.6)}
.smp-exec .smp-hd h1{font-size:23px;font-weight:800;letter-spacing:-.01em;line-height:1.1}
.smp-exec .smp-role{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.82);margin-top:4px}
.smp-exec .smp-pills{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:11px;font-size:11px;color:rgba(255,255,255,.94)}
.smp-exec .smp-pills .smp-cont{gap:5px}
.smp-exec .smp-pills svg{color:rgba(255,255,255,.8)}
.smp-exec .smp-body{display:grid;grid-template-columns:1fr 15rem;gap:26px;padding:24px 30px 30px;flex:1;align-content:start}
.smp-exec .smp-main>*+*{margin-top:20px}
.smp-exec .smp-xp{margin-top:2px}
.smp-exec .smp-rail{border-left:1px solid #eef2f7;padding-left:20px;display:flex;flex-direction:column;gap:20px}
.smp-exec .smp-chips{margin-top:9px}

/* ===== 2. SIDE: боковая колонка ===== */
.smp-side{display:flex}
.smp-side .smp-inner{display:grid;grid-template-columns:14.5rem 1fr;flex:1;min-height:1123px}
.smp-side .smp-bar{background:var(--ac);color:#fff;padding:26px 22px;display:flex;flex-direction:column;justify-content:space-between}
.smp-side.smp-light .smp-bar{background:#f1f5f9;color:#334155}
.smp-side .smp-bar-ph{text-align:center;margin-bottom:18px}
.smp-side .smp-bar-ph img{width:88px;height:88px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 4px rgba(255,255,255,.2);margin:0 auto}
.smp-side .smp-bar-lbl{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.11em;color:rgba(255,255,255,.6);margin-bottom:9px}
.smp-side.smp-light .smp-bar-lbl{color:#64748b}
.smp-side .smp-bar-sec+.smp-bar-sec{margin-top:20px}
.smp-side .smp-bar .smp-chip{background:rgba(255,255,255,.15);color:#fff}
.smp-side.smp-light .smp-chip{background:#fff;color:#334155;border:1px solid #e2e8f0}
.smp-side .smp-bar .smp-lg-row b{color:rgba(255,255,255,.92)}
.smp-side .smp-bar .smp-lg-row span{color:rgba(255,255,255,.6)}
.smp-side.smp-light .smp-lg-row b{color:#334155}
.smp-side.smp-light .smp-lg-row span{color:#64748b}
.smp-side .smp-bar-foot{border-top:1px solid rgba(255,255,255,.22);margin-top:20px;padding-top:10px;font-size:9px;color:rgba(255,255,255,.5)}
.smp-side.smp-light .smp-bar-foot{border-color:#e2e8f0;color:#64748b}
.smp-side .smp-page{padding:28px 30px 30px;min-width:0}
.smp-side .smp-page h1{font-size:26px;font-weight:800;letter-spacing:-.01em;color:#0f172a}
.smp-side.smp-serif .smp-page h1{font-family:'Times New Roman',Georgia,serif}
.smp-side .smp-role{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ac);margin-top:4px}
.smp-side .smp-page>section{margin-top:20px}
.smp-side .smp-page .smp-xp-b li::before{background:var(--ac)}

/* ===== 3. BASE: шапка + контактная полоса + две колонки ===== */
/* Специфичность 0-2-0, а не 0-1-0: правило .smp.doc{padding:0} (строка 17)
   иначе перебивает этот паддинг — 7 из 10 шаблонов рендерятся впритык к краю
   листа (замер 30.09.2026: computed padding 0px, .smp-top x=0). */
.smp.smp-base{padding:34px 40px 40px;display:flex;flex-direction:column}
.smp-base .smp-top{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;border-bottom:1px solid #cbd5e1;padding-bottom:18px}
.smp-base:not(.smp-serif) .smp-top{border-bottom-color:var(--ac)}
.smp-base .smp-top h1{font-size:27px;font-weight:800;letter-spacing:-.015em;color:#0f172a;line-height:1.1}
.smp-base.smp-serif .smp-top h1{font-family:'Times New Roman',Georgia,serif}
.smp-base .smp-role{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ac);margin-top:5px}
.smp-base .smp-lead{margin-top:10px;font-size:12px;line-height:1.65;color:#475569;max-width:34rem}
.smp-base .smp-top-ph img{width:84px;height:84px;border-radius:14px;object-fit:cover;box-shadow:0 0 0 1px #e2e8f0}
.smp-base .smp-cbar{display:flex;flex-wrap:wrap;gap:8px 22px;padding:12px 0;border-bottom:1px solid #eef2f7;color:#64748b}
.smp-base .smp-cbar .smp-cont svg{color:#94a3b8}
.smp-base .smp-cols{display:grid;grid-template-columns:1fr 14rem;gap:28px;padding-top:18px;flex:1;align-content:start}
.smp-base .smp-main>*+*{margin-top:18px}
.smp-base .smp-rail{border-left:1px solid #eef2f7;padding-left:22px;display:flex;flex-direction:column;gap:20px}
.smp-base.smp-tech .smp-chip{background:#eef2ff;color:#4338ca;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.smp-base.smp-tech .smp-sec{border-bottom-color:var(--ac)}

/* ===== Превью-режим (buildResumePreviewHtml) =====
   Заголовки документа в превью заменены на div.rvh1/.rvh2/.rvh3, чтобы
   каталог /resume не содержал десятки <h1> (аудит 28.09.2026). Правила ниже
   дублируют стили h1/h2/h3, чтобы вёрстка превью не изменилась. */
.smp h1,.smp .rvh1,.smp h2,.smp .rvh2,.smp h3,.smp .rvh3,.smp p,.smp ul{margin:0}
.smp-serif .smp-hd h1,.smp-serif .smp-hd .rvh1{font-family:'Times New Roman',Georgia,serif}
.smp-exec .smp-hd h1,.smp-exec .smp-hd .rvh1{font-size:23px;font-weight:800;letter-spacing:-.01em;line-height:1.1}
.smp-side .smp-page h1,.smp-side .smp-page .rvh1{font-size:26px;font-weight:800;letter-spacing:-.01em;color:#0f172a}
.smp-side.smp-serif .smp-page h1,.smp-side.smp-serif .smp-page .rvh1{font-family:'Times New Roman',Georgia,serif}
.smp-base .smp-top h1,.smp-base .smp-top .rvh1{font-size:27px;font-weight:800;letter-spacing:-.015em;color:#0f172a;line-height:1.1}
.smp-base.smp-serif .smp-top h1,.smp-base.smp-serif .smp-top .rvh1{font-family:'Times New Roman',Georgia,serif}

/* ===== Печать: стратегия по W3C CSS Paged Media 3 =====
   1) print-color-adjust:exact — без него UA печатает в режиме economy и ВЫПАДАЕТ
      все акцентные заливки (шапка, плашки, буллеты). Дизайн обязан читаться и без
      фона, но фон не должен исчезать там, где он несёт смысл.
   2) break-inside:avoid на блоках работ/образования — заголовок не остаётся
      висящим в конце страницы. page-break-after:avoid на заголовках секций.
   3) orphans/widows НЕ используем: поддержка в браузерах limited (MDN). */
.smp{-webkit-print-color-adjust:exact;print-color-adjust:exact}
.smp .smp-xp-i,.smp .smp-x2,.smp .smp-ed,.smp .smp-bar-sec{break-inside:avoid;page-break-inside:avoid}
.smp .smp-xp-b li{break-inside:avoid;page-break-inside:avoid}
.smp .smp-sec,.smp .smp-h3,.smp .smp-lbl,.smp .smp-bar-lbl{break-after:avoid;page-break-after:avoid}
.smp .smp-hd,.smp .smp-top{break-after:avoid;page-break-after:avoid}
@media print{
  .smp{background:#fff;box-shadow:none;min-height:auto}
  /* Печатаем реальный кегль: экранный preview масштабируется, а лист — нет. */
  .smp .smp-xp-b li{font-size:13px}
}
`;
