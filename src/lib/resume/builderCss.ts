/** Стили интерфейса конструктора резюме. Scoped под .rvb.
 *  Токены (цвета, радиусы, тени) — из фирменной палитры сайта
 *  (tailwind.config.ts / globals.css): brand-500 #2563eb и т.д. */
export const BUILDER_CSS = `
.rvb{
  --rvb-brand:#2563eb;--rvb-brand2:#1d4ed8;--rvb-brand50:#eff6ff;--rvb-brand100:#dbeafe;
  --rvb-purple:#7c3aed;--rvb-purple2:#6d28d9;
  --rvb-bd:#e5e7eb;--rvb-bd2:#d1d5db;--rvb-ink:#0f172a;--rvb-mf:#6b7280;--rvb-mf2:#64748b;
  --rvb-mut:#f9fafb;--rvb-em:#059669;--rvb-em50:#ecfdf5;--rvb-amb:#d97706;--rvb-amb50:#fffbeb;--rvb-red:#dc2626;
  --rvb-r:12px;--rvb-rl:16px;--rvb-rxl:24px;
  --rvb-soft:0 1px 3px rgba(0,0,0,.05),0 1px 2px rgba(0,0,0,.1);
  --rvb-elev:0 10px 25px rgba(0,0,0,.08),0 4px 10px rgba(0,0,0,.05);
  color:#111827;
}
.rvb *{box-sizing:border-box}
.rvb .a4{width:794px;min-height:1123px;background:#fff;box-shadow:0 25px 50px -12px rgba(15,23,42,.18),0 0 0 1px rgba(15,23,42,.04);border-radius:4px;overflow:hidden;position:relative}
.rvb-app{display:grid;grid-template-columns:420px 1fr;overflow:hidden}
.rvb-panel{background:#fff;border-right:1px solid var(--rvb-bd);display:flex;flex-direction:column;min-height:0;min-width:0}
.rvb-panel-head{padding:20px 22px 16px;border-bottom:1px solid #f3f4f6}
.rvb-panel-head h2{font-size:17px;font-weight:800;letter-spacing:-.01em;margin:0 0 4px}
.rvb-panel-head p{font-size:12.5px;color:var(--rvb-mf);margin:0}
.rvb-progress{margin-top:14px;height:6px;border-radius:99px;background:#f3f4f6;overflow:hidden}
.rvb-progress i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--rvb-brand),var(--rvb-purple));transition:width .4s ease}
.rvb-nav{flex:1;overflow-y:auto;padding:8px 0 90px}
.rvb-acc{border-bottom:1px solid #f3f4f6}
.rvb-acc-h{width:100%;background:none;border:0;display:flex;align-items:center;gap:12px;padding:14px 22px;text-align:left;cursor:pointer;font:inherit;color:inherit;transition:background .15s}
.rvb-acc-h:hover{background:var(--rvb-mut)}
.rvb-ic{width:32px;height:32px;border-radius:8px;background:var(--rvb-brand50);color:var(--rvb-brand2);display:grid;place-items:center;flex-shrink:0;transition:.15s}
.rvb-acc-h.on .rvb-ic{background:var(--rvb-brand2);color:#fff}
.rvb-acc-t{flex:1;min-width:0}
.rvb-acc-t b{display:block;font-size:14px;font-weight:650}
.rvb-acc-t small{display:block;font-size:11.5px;color:var(--rvb-mf);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rvb-st{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--rvb-bd2);flex-shrink:0;display:grid;place-items:center;font-size:11px;color:transparent;transition:.15s}
.rvb-st.done{background:var(--rvb-em);border-color:var(--rvb-em);color:#fff}
.rvb-st.part{background:var(--rvb-amb50);border-color:#fcd34d}
.rvb-chev{color:var(--rvb-mf2);transition:transform .2s;flex-shrink:0}
.rvb-acc-h.on .rvb-chev{transform:rotate(90deg);color:var(--rvb-brand2)}
.rvb-acc-b{display:none;padding:4px 22px 22px}
.rvb-acc-h.on+.rvb-acc-b{display:block}
.rvb-fld{margin-bottom:14px}
.rvb-fld label{display:block;font-size:12.5px;font-weight:650;color:#374151;margin-bottom:6px}
.rvb-fld .hint{font-weight:500;color:var(--rvb-mf2);font-size:11px}
.rvb-fld input,.rvb-fld select,.rvb-fld textarea{width:100%;padding:10px 13px;border:1.5px solid var(--rvb-bd);border-radius:var(--rvb-r);font-size:13.5px;font-family:inherit;background:#fff;transition:.15s;color:inherit}
.rvb-fld textarea{resize:vertical;min-height:84px;line-height:1.55}
.rvb-fld input:focus,.rvb-fld select:focus,.rvb-fld textarea:focus{outline:none;border-color:var(--rvb-brand);box-shadow:0 0 0 3px var(--rvb-brand100)}
.rvb-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.rvb-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.rvb-tip{margin-top:6px;font-size:11.5px;color:var(--rvb-mf);line-height:1.5}
.rvb-ba{display:grid;gap:6px;margin-top:8px;padding:11px 13px;border-radius:var(--rvb-r);background:var(--rvb-mut);border:1px solid #f3f4f6}
.rvb-ba-r{display:flex;gap:8px;font-size:11.5px;line-height:1.5}
.rvb-ba-r .b{flex-shrink:0;font-weight:800;width:14px}
.rvb-ba-r.bad .b{color:var(--rvb-red)}
.rvb-ba-r.good .b{color:var(--rvb-em)}
.rvb-ba-r span{color:#4b5563}
.rvb-photo-row{display:flex;align-items:center;gap:14px;margin-bottom:6px}
.rvb-photo-thumb{width:56px;height:56px;border-radius:var(--rvb-r);background:#f3f4f6;border:1.5px dashed var(--rvb-bd2);display:grid;place-items:center;color:var(--rvb-mf2);flex-shrink:0;overflow:hidden;background-size:cover;background-position:center}
.rvb-btn-chip{font-size:12px;font-weight:650;padding:7px 12px;border-radius:8px;border:1.5px solid var(--rvb-bd);background:#fff;color:#374151;cursor:pointer}
.rvb-btn-chip:hover{border-color:var(--rvb-brand);color:var(--rvb-brand2)}
.rvb-btn-chip.danger:hover{border-color:var(--rvb-red);color:var(--rvb-red)}
.rvb-photo-actions{display:flex;flex-wrap:wrap;gap:8px}
.rvb-switch{display:flex;align-items:center;gap:9px;margin-top:12px;font-size:12.5px;font-weight:600;color:#374151;cursor:pointer;user-select:none}
.rvb-switch input{position:absolute;opacity:0;width:0;height:0;pointer-events:none}
.rvb-switch-track{position:relative;width:38px;height:22px;border-radius:999px;background:#cbd5e1;transition:background .18s ease;flex-shrink:0}
.rvb-switch-dot{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.25);transition:transform .18s ease}
.rvb-switch input:checked + .rvb-switch-track{background:var(--rvb-brand)}
.rvb-switch input:checked + .rvb-switch-track .rvb-switch-dot{transform:translateX(16px)}
.rvb-switch input:focus-visible + .rvb-switch-track{outline:2px solid var(--rvb-brand);outline-offset:2px}
.rvb-rep{border:1.5px solid var(--rvb-bd);border-radius:var(--rvb-rl);padding:14px 14px 14px 10px;margin-bottom:12px;background:var(--rvb-mut);display:flex;gap:8px}
.rvb-rep-drag{width:20px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--rvb-bd2);cursor:grab}
.rvb-rep-body{flex:1;min-width:0}
.rvb-rep-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.rvb-rep-h b{font-size:12.5px;font-weight:700;color:#374151}
.rvb-del{font-size:11.5px;font-weight:600;color:var(--rvb-mf);padding:4px 9px;border-radius:8px;border:0;background:none;cursor:pointer}
.rvb-del:hover{background:#fef2f2;color:var(--rvb-red)}
.rvb-add{width:100%;padding:11px;border:1.5px dashed var(--rvb-bd2);border-radius:var(--rvb-rl);color:var(--rvb-brand2);font-weight:650;font-size:13px;background:none;cursor:pointer;transition:.15s;display:flex;align-items:center;justify-content:center;gap:7px}
.rvb-add:hover{border-color:var(--rvb-brand);background:var(--rvb-brand50)}
.rvb-chgrp{margin-bottom:14px}
.rvb-chgrp>label{display:block;font-size:11.5px;font-weight:650;color:#374151;margin-bottom:6px}
.rvb-chwrap{display:flex;flex-wrap:wrap;gap:6px;padding:9px;border:1.5px solid var(--rvb-bd);border-radius:var(--rvb-rl);min-height:48px;background:#fff}
.rvb-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:99px;background:var(--rvb-brand50);color:#1e40af;font-size:12px;font-weight:600}
.rvb-chip button{display:grid;place-items:center;width:15px;height:15px;border-radius:50%;background:rgba(37,99,235,.14);color:#1e40af;font-size:11px;border:0;cursor:pointer;line-height:1}
.rvb-chip button:hover{background:var(--rvb-brand2);color:#fff}
.rvb-chadd{flex:1;min-width:120px;border:none;outline:none;font-size:12.5px;font-family:inherit;background:none;padding:5px}
.rvb-stage{position:relative;background:var(--rvb-mut);display:flex;flex-direction:column;min-height:0;min-width:0;background-image:radial-gradient(rgba(15,23,42,.05) 1px,transparent 1px);background-size:22px 22px}
.rvb-stagebar{position:relative;z-index:20;height:56px;display:flex;align-items:center;gap:10px;padding:0 18px;background:rgba(255,255,255,.9);backdrop-filter:blur(10px);border-bottom:1px solid var(--rvb-bd);flex-shrink:0}
.rvb-stagebar .tn{font-size:13px;font-weight:650}
.rvb-stagebar .tn span{color:var(--rvb-mf);font-weight:500}
.rvb-scroll{position:relative;z-index:1;flex:1;min-width:0;overflow:auto;padding:36px 24px 60px;display:flex;justify-content:center;align-items:flex-start}
.rvb-scaler{position:relative;flex:none}
.rvb-tabs{display:none}
.rvb-zoom{margin-left:auto;display:flex;align-items:center;gap:2px}
.rvb-zoom button{width:30px;height:30px;border-radius:8px;border:0;background:none;display:grid;place-items:center;color:#374151;cursor:pointer}
.rvb-zoom button:hover{background:#f3f4f6}
.rvb-zoom .zv{min-width:44px;text-align:center;font-size:12.5px;font-weight:600;color:var(--rvb-mf)}
.rvb-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border-radius:var(--rvb-r);font-weight:650;font-size:13.5px;border:0;cursor:pointer;transition:.15s;white-space:nowrap;font-family:inherit}
.rvb-btn-o{background:#fff;border:1.5px solid var(--rvb-bd);color:#374151}
.rvb-btn-o:hover{border-color:var(--rvb-brand);color:var(--rvb-brand2)}
.rvb-btn-p{background:var(--rvb-brand);color:#fff;box-shadow:0 4px 12px -3px rgba(37,99,235,.45)}
.rvb-btn-p:hover{background:var(--rvb-brand2)}
.rvb-ico{width:36px;height:36px;padding:0;justify-content:center;border-radius:var(--rvb-r);background:#fff;border:1.5px solid var(--rvb-bd);color:#374151;display:grid;place-items:center}
.rvb-ico:hover{border-color:var(--rvb-brand);color:var(--rvb-brand2)}

/* Поповер качества */
.rvb-qwrap{position:relative}
.rvb-qbtn{display:flex;align-items:center;gap:9px;padding:5px 13px 5px 5px;border-radius:99px;border:1.5px solid var(--rvb-bd);background:#fff;cursor:pointer;font:inherit}
.rvb-qbtn:hover{border-color:#60a5fa}
.rvb-ring{position:relative;width:30px;height:30px;flex-shrink:0}
.rvb-ring svg{transform:rotate(-90deg)}
.rvb-ring .qn{position:absolute;inset:0;display:grid;place-items:center;font-size:9.5px;font-weight:800}
.rvb-qpop{position:absolute;top:48px;right:0;width:300px;background:#fff;border:1px solid var(--rvb-bd);border-radius:var(--rvb-rl);box-shadow:var(--rvb-elev);padding:18px;z-index:60;display:none}
.rvb-qpop.on{display:block}
.rvb-qpop h4{font-size:14px;font-weight:750;margin:0 0 4px}
.rvb-qsub{font-size:12px;color:var(--rvb-mf);margin-bottom:12px}
.rvb-qcheck{display:flex;align-items:center;gap:9px;padding:7px 0;font-size:12.5px;border-bottom:1px solid #f3f4f6}
.rvb-qcheck:last-child{border:0}
.rvb-qcheck .qi{width:17px;height:17px;border-radius:50%;border:1.5px solid var(--rvb-bd2);flex-shrink:0;display:grid;place-items:center;font-size:10px;color:transparent}
.rvb-qcheck.ok .qi{background:var(--rvb-em);border-color:var(--rvb-em);color:#fff}
.rvb-qcheck span{color:var(--rvb-mf)}
.rvb-qcheck.ok span{color:var(--rvb-mf2);text-decoration:line-through}

/* Drawer шаблонов */
.rvb-ov{position:fixed;inset:0;background:rgba(15,23,42,.45);backdrop-filter:blur(3px);z-index:80;opacity:0;pointer-events:none;transition:opacity .2s}
.rvb-ov.on{opacity:1;pointer-events:auto}
.rvb-drawer{position:fixed;top:0;right:0;bottom:0;width:min(560px,94vw);background:#fff;z-index:90;transform:translateX(102%);transition:transform .28s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;box-shadow:-20px 0 60px -20px rgba(15,23,42,.35)}
.rvb-drawer.on{transform:none}
.rvb-drawer-h{padding:20px 22px 16px;border-bottom:1px solid var(--rvb-bd);display:flex;align-items:flex-start;justify-content:space-between}
.rvb-drawer-h h3{font-size:17px;font-weight:750;letter-spacing:-.01em;margin:0}
.rvb-drawer-h p{font-size:12.5px;color:var(--rvb-mf);margin:3px 0 0}
.rvb-fchips{padding:12px 22px;border-bottom:1px solid var(--rvb-bd);display:flex;gap:6px;flex-wrap:wrap}
.rvb-fchip{padding:6px 12px;border-radius:99px;border:1.5px solid var(--rvb-bd);background:#fff;font-size:12px;font-weight:600;color:var(--rvb-mf);cursor:pointer}
.rvb-fchip.on{background:var(--rvb-brand);border-color:var(--rvb-brand);color:#fff}
.rvb-dgrid{flex:1;overflow-y:auto;padding:18px 22px 30px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
.rvb-tcard{border:1.5px solid var(--rvb-bd);border-radius:14px;overflow:hidden;text-align:left;transition:.15s;background:#fff;position:relative;cursor:pointer}
.rvb-tcard:hover{transform:translateY(-3px);box-shadow:var(--rvb-elev);border-color:var(--rvb-brand)}
.rvb-tcard.on{border-color:var(--rvb-brand);box-shadow:0 0 0 2px var(--rvb-brand)}
.rvb-tcard-th{height:186px;background:var(--rvb-mut);overflow:hidden;position:relative}
.rvb-mini{position:absolute;top:0;left:0;transform-origin:top left}
.rvb-tcard-m{padding:11px 13px;border-top:1px solid var(--rvb-bd);display:flex;align-items:center;justify-content:space-between;gap:8px}
.rvb-tcard-m b{font-size:13px;font-weight:700}
.rvb-tcard-m small{display:block;font-size:11px;color:var(--rvb-mf);margin-top:1px}
.rvb-badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:99px;white-space:nowrap}
.rvb-badge.safe{background:var(--rvb-em50);color:#047857}
.rvb-badge.cre{background:var(--rvb-amb50);color:#b45309}

/* Undo-toast */
.rvb-undo{position:fixed;left:50%;bottom:26px;transform:translate(-50%,20px);opacity:0;pointer-events:none;transition:.22s;background:var(--rvb-ink);color:#fff;padding:12px 10px 12px 16px;border-radius:var(--rvb-rl);box-shadow:var(--rvb-elev);display:flex;align-items:center;gap:14px;font-size:13px;z-index:200}
.rvb-undo.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}
.rvb-undo button{background:rgba(255,255,255,.12);color:#fff;border:0;padding:7px 13px;border-radius:8px;font-weight:650;font-size:12.5px;cursor:pointer;white-space:nowrap}
.rvb-undo button:hover{background:rgba(255,255,255,.22)}

@media (max-width:1080px){
  .rvb-app{grid-template-columns:1fr;height:auto}
  .rvb-panel{display:none;padding-bottom:132px}
  .rvb-panel.mobile-on{display:flex}
  .rvb-stage{display:none}
  .rvb-stage.mobile-on{display:flex}
  .rvb-tabs{display:flex;position:fixed;bottom:calc(56px + env(safe-area-inset-bottom,0px));left:0;right:0;z-index:50;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);border-top:1px solid var(--rvb-bd);padding:8px;gap:8px}
  .rvb-tabs button{flex:1;padding:11px;border-radius:11px;border:0;font-weight:650;font-size:13.5px;color:var(--rvb-mf);display:flex;align-items:center;justify-content:center;gap:7px;background:none;cursor:pointer}
  .rvb-tabs button.on{background:var(--rvb-brand);color:#fff}
  .rvb-scroll{padding:20px 10px 200px}
  .rvb-zoom{display:none}
}
@media (max-width:640px){
  .rvb-dgrid{grid-template-columns:1fr}
  .rvb-qpop{position:fixed;left:12px;right:12px;width:auto;top:calc(env(safe-area-inset-top,0px) + 68px)}
}

/* Палитра акцентов оформления (студия РЕЗЮМЕ 3) */
.rvb-accent-box{margin-top:14px;padding:12px 14px;border:1px solid var(--rvb-bd);border-radius:14px;background:var(--rvb-soft)}
.rvb-accent-h{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:var(--rvb-mut);margin-bottom:10px}
.rvb-accent-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.rvb-accent-dot{width:30px;height:30px;border-radius:50%;border:2px solid var(--rvb-elev);box-shadow:0 1px 3px rgba(15,23,42,.25);cursor:pointer;display:grid;place-items:center;color:#fff;font-size:13px;font-weight:800;transition:transform .15s}
.rvb-accent-dot:hover{transform:scale(1.12)}
.rvb-accent-dot.on{border-color:var(--rvb-ink);transform:scale(1.12)}
.rvb-accent-auto{margin-left:auto;font-size:11.5px;font-weight:700;color:var(--rvb-ink);background:var(--rvb-elev);border:1px solid var(--rvb-bd);border-radius:999px;padding:6px 12px;cursor:pointer}
.rvb-accent-auto.on{background:var(--rvb-brand);color:#fff;border-color:var(--rvb-brand)}
.rvb-tcard .rvb-tname{display:flex;align-items:center;gap:7px}
.rvb-tcard .rvb-dot{width:10px;height:10px;border-radius:50%;flex:none}
.rvb-tcard-cat{display:block;font-size:10.5px;font-weight:700;color:var(--rvb-mut);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px}
.rvb-tcard-badge{display:inline-block;margin-top:4px;font-size:10px;font-weight:800;font-style:normal;color:#92400e;background:#fef3c7;border-radius:6px;padding:2px 7px}
`;