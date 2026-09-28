/**
 * Компактные превью карточек каталога /resume (по эталону РЕЗЮМЕ 3).
 *
 * Проблема, которую решает: раньше в карточке рендерился ПОЛНЫЙ документ А4
 * (794px) с transform scale(0.28) — текст 12px превращался в ~3px, превью
 * выглядело кашей. Здесь каждый шаблон рисуется СРАЗУ в размере карточки
 * (~220px): крупное имя, 1 место работы, 5–6 чипов навыков. Никакого scale.
 *
 * Корень `.rc` — aspect-ratio A4 (1/1.414), низ обрезается overflow:hidden
 * (как в макете: h-64 + overflow-hidden). Все заголовки — div (аудит
 * 28.09.2026: в DOM страницы не должно быть десятков <h1> из превью).
 * Акцент задаётся инлайн-переменной --ac. Классы `rc-*` не пересекаются
 * с `smp-*` (документ) и `t-*` (legacy), PDF/DOC-конвейеры не затрагивают.
 */
export const RESUME_CARD_CSS = `
.rc{--ac:#4f46e5;position:relative;width:100%;aspect-ratio:1/1.414;overflow:hidden;background:#fff;font-family:'Inter',system-ui,-apple-system,sans-serif;font-size:9px;line-height:1.5;color:#334155;text-align:left}
.rc *{box-sizing:border-box}
.rc div,.rc p,.rc ul{margin:0}
.rc ul{list-style:none;padding:0}
.rc svg{width:9px;height:9px;flex:none}
.rc img{display:block}
.rc-name{font-size:16px;font-weight:800;letter-spacing:-.01em;line-height:1.2;color:#0f172a;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rc-role{font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--ac);margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rc-sec{display:flex;align-items:center;gap:4px;font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#0f172a;border-bottom:1px solid #e8edf3;padding-bottom:3px;margin-bottom:5px}
.rc-sec svg{color:var(--ac)}
.rc-chips{display:flex;flex-wrap:wrap;gap:3px}
.rc-chip{background:#f1f5f9;color:#334155;font-size:7.5px;font-weight:600;border-radius:4px;padding:1px 5px;line-height:1.6;white-space:nowrap}
.rc-xp-t{font-size:9.5px;font-weight:700;color:#0f172a;line-height:1.3}
.rc-xp-d{font-size:7.5px;font-weight:600;color:#94a3b8;white-space:nowrap}
.rc-xp-c{font-size:8.5px;font-weight:600;color:var(--ac);margin:1px 0 3px}
.rc-xp-b li{position:relative;padding-left:9px;font-size:8px;color:#475569;margin-top:2px;line-height:1.45}
.rc-xp-b li::before{content:'';position:absolute;left:1px;top:5px;width:3px;height:3px;border-radius:50%;background:#94a3b8}
.rc-ed b{display:block;font-size:8.5px;font-weight:700;color:#1e293b;line-height:1.3}
.rc-ed span{display:block;font-size:7.5px;color:#64748b}
.rc-ed i{font-style:normal;font-size:7px;color:#94a3b8}
.rc-lg{display:flex;justify-content:space-between;gap:6px;font-size:8px;margin-top:2px}
.rc-lg b{font-weight:600;color:#334155}
.rc-lg span{color:#94a3b8;font-size:7.5px}
.rc-cont{display:inline-flex;align-items:center;gap:3px;min-width:0;max-width:100%}
.rc-cols>div,.rc-body>div{min-width:0}
.rc-cont>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rc-sec-block{margin-top:9px}
.rc-sec-block:first-child{margin-top:0}

/* ===== EXEC: цветной баннер + фото с галочкой + таймлайн ===== */
.rc-exec{display:flex;flex-direction:column}
.rc-exec .rc-hd{background:var(--ac);color:#fff;padding:11px 12px;display:flex;gap:9px;align-items:center}
.rc-exec .rc-ph{position:relative;flex:none}
.rc-exec .rc-ph img{width:38px;height:38px;border-radius:9px;object-fit:cover;box-shadow:0 0 0 2px rgba(255,255,255,.3)}
.rc-exec .rc-ph .chk{position:absolute;right:-3px;bottom:-3px;width:13px;height:13px;border-radius:50%;background:#10b981;color:#fff;display:grid;place-items:center;font-size:8px;box-shadow:0 0 0 1.5px rgba(255,255,255,.7)}
.rc-exec .rc-name{color:#fff;font-size:16px}
.rc-exec .rc-role{color:rgba(255,255,255,.82)}
.rc-exec .rc-pills{display:flex;flex-direction:column;align-items:flex-start;gap:2px;margin-top:5px;font-size:7.5px;color:rgba(255,255,255,.94)}
.rc-exec .rc-pills .rc-cont{max-width:100%}
.rc-exec .rc-pills svg{color:rgba(255,255,255,.8)}
.rc-exec .rc-body{display:grid;grid-template-columns:1fr 76px;gap:10px;padding:10px 12px;flex:1;align-content:start}
.rc-exec .rc-xp{position:relative;border-left:2px solid #e5e9f0;padding-left:8px;margin-top:5px}
.rc-exec .rc-xp::before{content:'';position:absolute;left:-4px;top:4px;width:6px;height:6px;border-radius:50%;background:var(--ac)}
.rc-exec .rc-rail{border-left:1px solid #eef2f7;padding-left:8px}

/* ===== SIDE: тёмная колонка + светлая часть ===== */
.rc-side{display:flex}
.rc-side .rc-bar{width:82px;flex:none;background:var(--ac);color:#fff;padding:11px 8px;display:flex;flex-direction:column}
.rc-side .rc-bar img{width:38px;height:38px;border-radius:50%;object-fit:cover;margin:0 auto 8px;box-shadow:0 0 0 2px rgba(255,255,255,.22)}
.rc-side .rc-lbl{font-size:7px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:rgba(255,255,255,.6);margin:8px 0 4px}
.rc-side .rc-bar .rc-cont{font-size:7px;color:rgba(255,255,255,.92);margin-top:3px}
.rc-side .rc-bar .rc-chip{background:rgba(255,255,255,.15);color:#fff}
.rc-side .rc-bar .rc-lg b{color:rgba(255,255,255,.92)}
.rc-side .rc-bar .rc-lg span{color:rgba(255,255,255,.6)}
.rc-side .rc-foot{border-top:1px solid rgba(255,255,255,.22);margin-top:auto;padding-top:5px;font-size:5.5px;color:rgba(255,255,255,.5)}
.rc-side .rc-page{flex:1;min-width:0;padding:12px 11px}
.rc-side .rc-page .rc-sec{border-bottom:0;color:#94a3b8;padding-bottom:0;margin:9px 0 4px}

/* ===== LEGAL (side-вариант): строгая колонка, serif-имя ===== */
.rc-legal{display:flex}
.rc-legal .rc-bar{width:82px;flex:none;background:var(--ac);color:#fff;padding:11px 8px;display:flex;flex-direction:column}
.rc-legal .rc-bar img{width:38px;height:38px;border-radius:6px;object-fit:cover;margin:0 auto 8px;box-shadow:0 0 0 2px rgba(255,255,255,.22)}
.rc-legal .rc-lbl{font-size:7px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:#c9d4ff;margin:8px 0 4px}
.rc-legal .rc-bar .rc-cont{font-size:7px;color:rgba(255,255,255,.92);margin-top:3px}
.rc-legal .rc-bar .rc-chip{background:transparent;border:1px solid rgba(255,255,255,.3);color:#fff}
.rc-legal .rc-page{flex:1;min-width:0;padding:12px 11px}
.rc-legal .rc-name{font-family:'Times New Roman',Georgia,serif}
.rc-legal .rc-page .rc-sec{border-bottom:0;color:#94a3b8;padding-bottom:0;margin:9px 0 4px}

/* ===== BASE: белая шапка + контактная полоса + две колонки ===== */
.rc-base{padding:12px 12px 0;display:flex;flex-direction:column}
.rc-base .rc-top h1,.rc-base .rc-top .rc-name{font-size:18px}
.rc-base .rc-cbar{display:flex;flex-wrap:wrap;gap:3px 9px;padding:6px 0;border-top:1px solid #eef2f7;border-bottom:1px solid #eef2f7;color:#64748b;font-size:7.5px;margin-top:7px}
.rc-base .rc-cbar svg{color:#94a3b8}
.rc-base .rc-cols{display:grid;grid-template-columns:1fr 74px;gap:10px;padding-top:8px;flex:1;align-content:start}
.rc-base .rc-rail{border-left:1px solid #eef2f7;padding-left:8px}
.rc-base .rc-topline{border-bottom:2px solid var(--ac);padding-bottom:7px}
.rc-base.rc-classic .rc-top{text-align:center}
.rc-base.rc-classic .rc-name{font-family:'Times New Roman',Georgia,serif;font-size:18px}
.rc-base.rc-classic .rc-topline{border-bottom-color:#cbd5e1}
.rc-base.rc-classic .rc-cbar{justify-content:center}
.rc-base.rc-tech .rc-chip{background:#eef2ff;color:#4338ca;font-family:ui-monospace,Menlo,monospace}
.rc-base.rc-tech .rc-xp{position:relative;border-left:2px solid #e5e9f0;padding-left:8px;margin-top:5px}
.rc-base.rc-tech .rc-xp::before{content:'';position:absolute;left:-4px;top:4px;width:6px;height:6px;border-radius:50%;background:var(--ac)}
.rc-base.rc-clean{padding:14px 14px 0}
.rc-base.rc-clean .rc-topline{border-bottom:1px solid #e2e8f0}
.rc-base.rc-clean .rc-sec{color:#0d9488;border-bottom:0;padding-bottom:0}
.rc-base.rc-creative .rc-strip{height:4px;background:var(--ac);border-radius:2px;margin-bottom:8px}
.rc-base.rc-creative .rc-name{border-left:4px solid var(--ac);padding-left:7px}
.rc-base.rc-data .rc-topline{border-bottom:0;border-left:4px solid var(--ac);padding-bottom:0;padding-left:8px}
.rc-base.rc-corporate .rc-band{background:var(--ac);color:#fff;margin:-12px -12px 0;padding:11px 12px}
.rc-base.rc-corporate .rc-name{color:#fff;font-family:'Times New Roman',Georgia,serif;font-size:17px}
.rc-base.rc-corporate .rc-role{color:rgba(255,255,255,.82)}
.rc-base.rc-corporate .rc-cbar{border:0;color:rgba(255,255,255,.85);margin-top:5px;padding:0}
.rc-base.rc-corporate .rc-cbar svg{color:rgba(255,255,255,.7)}
.rc-base.rc-junior .rc-edu-first{margin-top:9px}
.rc .rc-mini-ph{width:34px;height:34px;border-radius:8px;object-fit:cover;flex:none;box-shadow:0 0 0 1px #e2e8f0}
.rc-base .rc-toprow{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}

/* Миниатюры drawer студии: контент уже в размере карточки — JS-scale не нужен */
.rvb-mini .rc{width:100%}
`;
