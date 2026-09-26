/** CSS 10 шаблонов резюме (scoped под .a4). Палитра приведена к фирменной
 *  палитре сайта (brand-500 #2563eb / purple-600 #6d28d9 / gray-*), радиусы и
 *  тени — из globals.css. Executive и Academic намеренно сохраняют собственную
 *  типографику (золото/тёмный, серифы) как узнаваемые индустриальные коды. */
export const RESUME_CSS = `
.a4{font-family:'Inter',system-ui,sans-serif;font-size:13px;line-height:1.6;color:#374151;background:#fff;position:relative}
.a4 *{box-sizing:border-box}
.a4 .doc{padding:54px 56px}
.a4 .doc-name{font-weight:800;letter-spacing:-.02em;line-height:1.08;color:#0f172a}
.a4 .doc-role{font-weight:650;color:#1d4ed8}
.a4 .doc-ct{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:11.5px;color:#6b7280}
.a4 .cont{display:inline-flex;align-items:center;gap:6px}
.a4 .cont svg{width:12px;height:12px;flex-shrink:0;opacity:.65}
.a4 .doc-ph{object-fit:cover;background:#f3f4f6}
.a4 .sec{margin-bottom:20px}
.a4 .sec:last-child{margin-bottom:0}
.a4 .sec-t{font-weight:750;color:#0f172a;margin-bottom:10px}
.a4 .sum{color:#4b5563;line-height:1.7}
.a4 .xp-b{list-style:none;margin:5px 0 0;padding:0}
.a4 .xp-b li{position:relative;padding-left:15px;font-size:12.5px;line-height:1.55;margin-bottom:4px;color:#4b5563}
.a4 .xp-b li::before{content:'';position:absolute;left:1px;top:7px;width:5px;height:5px;border-radius:50%;background:#9ca3af}
.a4 .tag{display:inline-block;padding:4px 11px;border-radius:99px;font-size:11.5px;font-weight:600;background:#f3f4f6;color:#374151;border:1px solid #e5e7eb}
.a4 .sk{display:flex;flex-wrap:wrap;gap:6px}
.a4 .lg{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:12px;color:#374151}
.a4 .lg .lv{color:#6b7280}
.a4 .empty{color:#9ca3af;font-style:italic}
.a4 .hd{display:flex;align-items:center;gap:22px}
.a4 .hd-t{flex:1;min-width:0}

/* ============ 1. CLASSIC ============ */
.t-classic .doc-hd{text-align:center;padding-bottom:18px;border-bottom:2px solid #0f172a;margin-bottom:22px}
.t-classic .doc-name{font-family:'PT Serif',Georgia,serif;font-size:31px;margin-bottom:5px}
.t-classic .doc-role{font-size:13px;color:#4b5563;letter-spacing:.02em;margin-bottom:10px}
.t-classic .doc-ct{justify-content:center}
.t-classic .cont svg{display:none}
.t-classic .cont+.cont::before{content:'·';margin-right:16px;color:#9ca3af}
.t-classic .sec-t{font-size:11px;text-transform:uppercase;letter-spacing:.14em;padding-bottom:5px;border-bottom:1px solid #e5e7eb}
.t-classic .xp-i{display:grid;grid-template-columns:130px 1fr;gap:0 18px;margin-bottom:14px}
.t-classic .xp-d{font-size:11.5px;font-weight:650;color:#0f172a}
.t-classic .xp-t{font-size:13.5px;font-weight:700;color:#0f172a}
.t-classic .xp-c{font-size:12px;color:#4b5563;margin:1px 0 3px;font-style:italic}
.t-classic .ed-i{margin-bottom:10px}
.t-classic .ed-i b{font-size:13px;color:#0f172a}
.t-classic .ed-i .em{font-size:12px;color:#4b5563}
.t-classic .ed-i .em span{color:#6b7280}

/* ============ 2. MODERN ============ */
.t-modern .doc{padding:58px 60px}
.t-modern .doc-hd{border-left:4px solid #2563eb;padding-left:22px;margin-bottom:30px}
.t-modern .doc-name{font-size:34px;font-weight:850}
.t-modern .doc-role{font-size:14.5px;color:#1d4ed8;margin:5px 0 12px}
.t-modern .doc-ph{width:100px;height:100px;border-radius:18px;border:1px solid #e5e7eb;flex-shrink:0}
.t-modern .sec-t{font-size:13px;display:flex;align-items:center;gap:9px;letter-spacing:-.01em}
.t-modern .sec-t::before{content:'';width:18px;height:3px;border-radius:2px;background:#2563eb}
.t-modern .xp-i{margin-bottom:16px}
.t-modern .xp-top{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.t-modern .xp-t{font-size:14px;font-weight:700;color:#0f172a}
.t-modern .xp-d{font-size:11.5px;color:#9ca3af;font-weight:550;white-space:nowrap}
.t-modern .xp-c{font-size:12.5px;color:#1d4ed8;font-weight:600;margin-bottom:4px}
.t-modern .tag{background:#eff6ff;border-color:#dbeafe;color:#1d4ed8}
.t-modern .ed-top{display:flex;justify-content:space-between;gap:10px}
.t-modern .ed-i b{font-size:13px;color:#0f172a}
.t-modern .ed-i .ed-m{font-size:12px;color:#6b7280}

/* ============ 3. MINIMAL ============ */
.t-minimal .doc{padding:60px 62px}
.t-minimal .doc-name{font-size:36px;font-weight:300;letter-spacing:-.01em;color:#111827}
.t-minimal .doc-role{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.2em;color:#9ca3af;margin:8px 0 12px}
.t-minimal .doc-ct{font-size:11.5px;color:#9ca3af;gap:6px 14px}
.t-minimal .cont svg{display:none}
.t-minimal .doc-ph{width:84px;height:84px;border-radius:50%}
.t-minimal .sec{padding-top:14px;border-top:1px solid #e5e7eb;margin-bottom:17px}
.t-minimal .sec-t{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.2em;color:#9ca3af;margin-bottom:10px}
.t-minimal .sum{color:#6b7280}
.t-minimal .xp-i{margin-bottom:14px}
.t-minimal .xp-t{font-size:13.5px;font-weight:600;color:#111827}
.t-minimal .xp-d{font-size:11.5px;color:#9ca3af;margin:1px 0 3px}
.t-minimal .xp-c{font-size:12.5px;color:#6b7280}
.t-minimal .xp-b li{color:#6b7280}
.t-minimal .xp-b li::before{background:#d1d5db;width:9px;height:1px;border-radius:0;top:8px}
.t-minimal .sk{gap:0;display:block}
.t-minimal .tag{background:none;border:none;padding:0;font-size:12.5px;color:#4b5563;font-weight:500}
.t-minimal .tag::after{content:'·';margin:0 8px;color:#d1d5db}
.t-minimal .tag:last-child::after{content:''}
.t-minimal .ed-i{margin-bottom:10px}
.t-minimal .ed-i b{font-weight:600;color:#111827}
.t-minimal .ed-i .em{color:#6b7280;font-size:12px}

/* ============ 4. EXECUTIVE ============ */
.t-executive{display:flex;min-height:1123px}
.t-executive .ex-side{width:280px;flex-shrink:0;background:linear-gradient(180deg,#0b1220 0%,#141f38 55%,#0e1830 100%);color:#e2e8f0;padding:48px 30px 40px;position:relative}
.t-executive .ex-side::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#e7c55a,#c9a227)}
.t-executive .ex-side .doc-ph{width:108px;height:108px;border-radius:50%;margin-bottom:20px;border:3px solid rgba(201,162,39,.55)}
.t-executive .ex-side .doc-name{font-family:'Playfair Display',Georgia,serif;font-size:25px;color:#fff;line-height:1.2;margin-bottom:6px}
.t-executive .ex-side .doc-role{font-size:11px;color:#e7c55a;text-transform:uppercase;letter-spacing:.13em;font-weight:700;margin-bottom:26px}
.t-executive .ex-ct{display:flex;flex-direction:column;gap:11px;font-size:11.5px;color:#9fb0c7;margin-bottom:28px}
.t-executive .ex-ct .cont{gap:9px;align-items:flex-start}
.t-executive .ex-ct .cont svg{width:13px;height:13px;color:#c9a227;opacity:1;margin-top:2px}
.t-executive .ex-block{margin-bottom:24px}
.t-executive .ex-block-t{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:#e7c55a;margin-bottom:12px;padding-bottom:7px;border-bottom:1px solid rgba(201,162,39,.28)}
.t-executive .ex-block .sk{flex-direction:column;gap:7px}
.t-executive .ex-block .tag{background:rgba(159,176,199,.1);border:none;color:#c7d3e4;font-size:11px;padding:6px 12px;border-radius:8px}
.t-executive .ex-block .lg{flex-direction:column;gap:7px;color:#c7d3e4;font-size:11.5px}
.t-executive .ex-main{flex:1;padding:50px 46px 44px;background:#fff}
.t-executive .sec-t{font-family:'Playfair Display',Georgia,serif;font-size:17px;font-weight:600;color:#0b1220;padding-bottom:8px;border-bottom:1px solid #e5e7eb}
.t-executive .xp-i{margin-bottom:16px}
.t-executive .xp-t{font-size:14.5px;font-weight:700;color:#0b1220}
.t-executive .xp-c{font-size:12px;color:#8a6d1f;font-weight:600;margin:2px 0 4px}
.t-executive .xp-d{font-size:11px;color:#94a3b8}
.t-executive .ed-i b{font-size:13px;color:#0b1220}
.t-executive .ed-i .em{font-size:11.5px;color:#64748b}
.t-executive .xp-b li::before{background:#c9a227;border-radius:0}

/* ============ 5. GRADIENT ============ */
.t-gradient .gr-hd{background:linear-gradient(125deg,#2563eb 0%,#6d28d9 100%);color:#fff;padding:46px 58px 38px;position:relative;overflow:hidden}
.t-gradient .gr-hd::after{content:'';position:absolute;top:-70%;right:-10%;width:60%;height:240%;background:radial-gradient(ellipse,rgba(255,255,255,.16),transparent 62%)}
.t-gradient .gr-hd>*{position:relative;z-index:1}
.t-gradient .doc-name{color:#fff;font-size:34px;font-weight:850}
.t-gradient .doc-role{color:rgba(255,255,255,.92);font-size:14.5px;margin:5px 0 14px}
.t-gradient .doc-ct{color:rgba(255,255,255,.82)}
.t-gradient .doc-ct .cont svg{opacity:.85}
.t-gradient .doc-ph{width:100px;height:100px;border-radius:50%;border:3px solid rgba(255,255,255,.55);flex-shrink:0}
.t-gradient .gr-body{padding:36px 58px 48px}
.t-gradient .sec-t{font-size:13.5px;color:#6d28d9;display:flex;align-items:center;gap:9px}
.t-gradient .sec-t::after{content:'';flex:1;height:1px;background:#e9d5ff}
.t-gradient .xp-i{margin-bottom:16px}
.t-gradient .xp-top{display:flex;justify-content:space-between;gap:10px;align-items:baseline}
.t-gradient .xp-t{font-size:14px;font-weight:700;color:#0f172a}
.t-gradient .xp-d{font-size:11.5px;color:#7c3aed;font-weight:600;white-space:nowrap}
.t-gradient .xp-c{font-size:12.5px;color:#6b7280;margin-bottom:4px}
.t-gradient .tag{background:#eff6ff;border-color:#ddd6fe;color:#6d28d9}

/* ============ 6. COMPACT ============ */
.t-compact{display:flex;min-height:1123px}
.t-compact .cp-side{width:256px;flex-shrink:0;background:#f9fafb;border-right:1px solid #e5e7eb;padding:46px 26px 40px}
.t-compact .cp-side .doc-ph{width:112px;height:112px;border-radius:16px;margin-bottom:18px;border:1px solid #e5e7eb}
.t-compact .cp-side .doc-name{font-size:24px;font-weight:850;color:#0f172a;line-height:1.15}
.t-compact .cp-side .doc-role{color:#1d4ed8;font-size:12.5px;font-weight:650;margin:5px 0 20px}
.t-compact .cp-ct{display:flex;flex-direction:column;gap:9px;font-size:11.5px;color:#4b5563;margin-bottom:24px}
.t-compact .cp-ct .cont{gap:9px;align-items:flex-start}
.t-compact .cp-ct .cont svg{width:13px;height:13px;color:#2563eb;opacity:.85;margin-top:2px}
.t-compact .cp-block{margin-bottom:22px}
.t-compact .cp-block-t{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.13em;color:#9ca3af;margin-bottom:10px}
.t-compact .cp-block .sk{flex-direction:column;gap:6px;align-items:flex-start}
.t-compact .cp-block .tag{background:#fff;border-color:#e5e7eb;color:#374151}
.t-compact .cp-block .lg{flex-direction:column;gap:6px;font-size:11.5px}
.t-compact .cp-main{flex:1;padding:48px 42px 44px}
.t-compact .sec-t{font-size:13px;color:#0f172a;padding-bottom:6px;border-bottom:2px solid #2563eb}
.t-compact .xp-i{margin-bottom:15px}
.t-compact .xp-t{font-size:14px;font-weight:700;color:#0f172a}
.t-compact .xp-c{font-size:12.5px;color:#1d4ed8;font-weight:600;margin:1px 0 3px}
.t-compact .xp-d{font-size:11px;color:#9ca3af}
.t-compact .ed-i b{font-size:12.5px;color:#0f172a}
.t-compact .ed-i .em{font-size:11px;color:#6b7280}

/* ============ 7. FRESHER ============ */
.t-fresher .doc{padding:50px 54px}
.t-fresher .doc-hd{gap:20px;margin-bottom:22px}
.t-fresher .doc-name{font-size:30px;font-weight:850}
.t-fresher .doc-role{color:#6d28d9;font-size:13.5px;margin:4px 0 8px}
.t-fresher .doc-ph{width:92px;height:92px;border-radius:24px;border:3px solid #ddd6fe}
.t-fresher .hl{background:#f5f3ff;border:1px solid #ddd6fe;border-radius:16px;padding:16px 18px;margin-bottom:20px}
.t-fresher .hl-t{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#6d28d9;margin-bottom:6px}
.t-fresher .hl p{color:#4c1d95;font-size:12.5px;line-height:1.65}
.t-fresher .sec-t{font-size:13px;color:#6d28d9;display:flex;align-items:center;gap:9px}
.t-fresher .sec-t::before{content:'';width:16px;height:3px;border-radius:2px;background:#7c3aed}
.t-fresher .xp-i{border-left:2px solid #ddd6fe;padding:0 0 10px 15px;margin-bottom:12px}
.t-fresher .xp-t{font-size:14px;font-weight:700;color:#0f172a}
.t-fresher .xp-c{font-size:12.5px;color:#6d28d9;font-weight:600}
.t-fresher .xp-d{font-size:11.5px;color:#9ca3af;margin:2px 0 3px}
.t-fresher .tag{background:#f5f3ff;border-color:#ddd6fe;color:#6d28d9}
.t-fresher .ed-i b{font-size:13px;color:#0f172a}
.t-fresher .ed-i .em{font-size:12px;color:#6b7280}

/* ============ 8. TIMELINE ============ */
.t-timeline .doc{padding:52px 56px}
.t-timeline .doc-hd{margin-bottom:26px}
.t-timeline .doc-name{font-size:32px;position:relative;display:inline-block}
.t-timeline .doc-name::after{content:'';position:absolute;left:0;bottom:-7px;width:56px;height:4px;border-radius:2px;background:linear-gradient(90deg,#60a5fa,#2563eb)}
.t-timeline .doc-role{color:#2563eb;font-size:13.5px;margin:14px 0 12px}
.t-timeline .doc-ph{width:88px;height:88px;border-radius:50%;border:3px solid #dbeafe}
.t-timeline .sec-t{font-size:13.5px;color:#0f172a}
.t-timeline .tl{position:relative;margin-left:6px;padding-left:26px;border-left:2px solid #dbeafe}
.t-timeline .tl-i{position:relative;margin-bottom:18px}
.t-timeline .tl-i::before{content:'';position:absolute;left:-34px;top:3px;width:12px;height:12px;border-radius:50%;background:#fff;border:3px solid #2563eb;box-shadow:0 0 0 3px #eff6ff}
.t-timeline .tl-d{font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px}
.t-timeline .tl-t{font-size:14px;font-weight:700;color:#0f172a}
.t-timeline .tl-c{font-size:12px;color:#2563eb;font-weight:600;margin-bottom:3px}
.t-timeline .tag{background:#eff6ff;border-color:#dbeafe;color:#1d4ed8}
.t-timeline .ed-i b{font-size:13px;color:#0f172a}
.t-timeline .ed-i .em{font-size:11.5px;color:#6b7280}

/* ============ 9. TWO-COL RAIL ============ */
.t-twocol .tc-hd{background:#0f172a;color:#fff;padding:34px 46px 30px}
.t-twocol .doc-name{color:#fff;font-size:31px;font-weight:850}
.t-twocol .doc-role{color:#93c5fd;font-size:13.5px;margin:4px 0 14px}
.t-twocol .doc-ct{color:#cbd5e1}
.t-twocol .doc-ct .cont svg{color:#93c5fd;opacity:.9}
.t-twocol .doc-ph{width:84px;height:84px;border-radius:50%;border:2px solid #334155}
.t-twocol .tc-body{display:flex;gap:34px;padding:32px 46px 44px}
.t-twocol .tc-main{flex:1;min-width:0}
.t-twocol .tc-rail{width:218px;flex-shrink:0}
.t-twocol .sec-t{font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#0f172a;padding-bottom:5px;border-bottom:2px solid #0f172a}
.t-twocol .rail-card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px}
.t-twocol .rail-card .sec-t{font-size:10.5px;border-bottom-color:#d1d5db;margin-bottom:10px}
.t-twocol .rail-card .sk{flex-direction:column;align-items:flex-start;gap:6px}
.t-twocol .tag{background:#eff6ff;border-color:#dbeafe;color:#1e40af;font-size:11px}
.t-twocol .lg{flex-direction:column;gap:7px;font-size:11.5px}
.t-twocol .xp-i{margin-bottom:15px}
.t-twocol .xp-t{font-size:13.5px;font-weight:700;color:#0f172a}
.t-twocol .xp-c{font-size:12.5px;color:#1d4ed8;font-weight:600;margin:1px 0 3px}
.t-twocol .xp-d{font-size:11px;color:#94a3b8}
.t-twocol .ed-i{margin-bottom:11px}
.t-twocol .ed-i b{font-size:12.5px;color:#0f172a}
.t-twocol .ed-i .em{font-size:11px;color:#64748b}

/* ============ 10. ACADEMIC ============ */
.t-academic{font-family:'PT Serif',Georgia,serif}
.t-academic .doc{padding:56px 60px}
.t-academic .doc-hd{text-align:center;margin-bottom:26px}
.t-academic .doc-name{font-family:'PT Serif',Georgia,serif;font-size:33px;font-weight:700;margin-bottom:6px}
.t-academic .doc-role{font-size:13.5px;color:#374151;font-style:italic;margin-bottom:9px;font-weight:400}
.t-academic .doc-ct{justify-content:center;color:#4b5563;font-size:12px}
.t-academic .cont svg{display:none}
.t-academic .cont+.cont::before{content:'·';margin-right:16px;color:#9ca3af}
.t-academic .sec-t{font-size:12px;text-transform:uppercase;letter-spacing:.16em;color:#111827;padding-bottom:6px;border-bottom:3px double #9ca3af}
.t-academic .sum{color:#374151}
.t-academic .xp-i{margin-bottom:14px}
.t-academic .xp-t{font-size:13.5px;font-weight:700;color:#111827}
.t-academic .xp-c{font-size:12.5px;color:#4b5563;font-style:italic}
.t-academic .xp-d{font-size:12px;color:#6b7280}
.t-academic .xp-b li::before{background:#6b7280;border-radius:0;transform:rotate(45deg);width:5px;height:5px;top:6px}
.t-academic .ed-i{margin-bottom:11px}
.t-academic .ed-i b{font-size:13px;color:#111827}
.t-academic .ed-i .em{font-size:12px;color:#4b5563}
.t-academic .tag{background:none;border:1px solid #d1d5db;border-radius:4px;color:#374151}
`;