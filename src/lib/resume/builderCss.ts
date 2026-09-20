/** Стили интерфейса конструктора резюме. Scoped под .rvb, чтобы не пересекаться со стилями сайта. */
export const BUILDER_CSS = `
.rvb{--rvb-brand:#4F46E5;--rvb-brand2:#4338CA;--rvb-brand50:#EEF2FF;--rvb-bd:#E2E8F0;--rvb-bd2:#CBD5E1;--rvb-ink:#18181B;--rvb-mf:#71717A;--rvb-mf2:#A1A1AA;--rvb-srf:#fff;--rvb-mut:#F4F4F5;--rvb-em:#059669;--rvb-em50:#ECFDF5;--rvb-amb:#D97706;--rvb-amb50:#FFFBEB;--rvb-red:#EF4444;color:var(--rvb-ink)}
.rvb *{box-sizing:border-box}
.rvb .a4{width:794px;min-height:1123px;background:#fff;box-shadow:0 20px 50px -12px rgba(15,23,42,.28),0 0 0 1px rgba(15,23,42,.05);border-radius:3px;overflow:hidden;position:relative}
.rvb-app{display:grid;grid-template-columns:432px 1fr;height:calc(100vh - 64px);overflow:hidden}
.rvb-panel{background:#fff;border-right:1px solid var(--rvb-bd);display:flex;flex-direction:column;min-height:0;min-width:0}
.rvb-nav{flex:1;overflow-y:auto;overscroll-behavior:contain}
.rvb-acc{border-bottom:1px solid var(--rvb-mut)}
.rvb-acc-h{width:100%;display:flex;align-items:center;gap:11px;padding:15px 18px;text-align:left;transition:background .15s}
.rvb-acc-h:hover{background:#FAFAFB}
.rvb-ic{width:30px;height:30px;border-radius:9px;background:var(--rvb-brand50);color:var(--rvb-brand);display:grid;place-items:center;flex-shrink:0;transition:.15s}
.rvb-acc-h.on .rvb-ic{background:var(--rvb-brand);color:#fff}
.rvb-acc-t{flex:1;min-width:0}
.rvb-acc-t b{display:block;font-size:14px;font-weight:650}
.rvb-acc-t small{display:block;font-size:11.5px;color:var(--rvb-mf);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rvb-st{width:19px;height:19px;border-radius:50%;border:1.5px solid var(--rvb-bd2);flex-shrink:0;display:grid;place-items:center;transition:.15s;font-size:11px;color:transparent}
.rvb-st.done{background:var(--rvb-em);border-color:var(--rvb-em);color:#fff}
.rvb-st.part{background:var(--rvb-amb50);border-color:#FCD34D}
.rvb-chev{color:var(--rvb-mf2);transition:transform .2s;flex-shrink:0}
.rvb-acc-h.on .rvb-chev{transform:rotate(90deg);color:var(--rvb-brand)}
.rvb-acc-b{display:none;padding:2px 18px 20px}
.rvb-acc-h.on+.rvb-acc-b{display:block}
.rvb-fld{margin-bottom:13px}
.rvb-fld label{display:block;font-size:12px;font-weight:650;color:#27272A;margin-bottom:6px}
.rvb-fld .hint{font-weight:500;color:var(--rvb-mf2);font-size:11px}
.rvb-fld input,.rvb-fld select,.rvb-fld textarea{width:100%;padding:10px 12px;border:1px solid var(--rvb-bd);border-radius:9px;font-size:13.5px;background:#fff;transition:.15s;color:inherit}
.rvb-fld textarea{resize:vertical;min-height:78px;line-height:1.55}
.rvb-fld input:focus,.rvb-fld select:focus,.rvb-fld textarea:focus{outline:none;border-color:#818CF8;box-shadow:0 0 0 3px rgba(129,140,248,.16)}
.rvb-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.rvb-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.rvb-tip{margin-top:5px;font-size:11.5px;color:var(--rvb-mf);line-height:1.45}
.rvb-ba{display:grid;gap:5px;margin-top:7px;padding:9px 11px;border-radius:9px;background:#FAFAFB;border:1px solid var(--rvb-mut)}
.rvb-ba-r{display:flex;gap:7px;font-size:11.5px;line-height:1.45}
.rvb-ba-r .b{flex-shrink:0;font-weight:700}
.rvb-ba-r.bad .b{color:var(--rvb-red)}
.rvb-ba-r.good .b{color:var(--rvb-em)}
.rvb-ba-r span{color:var(--rvb-mf)}
.rvb-rep{border:1px solid var(--rvb-bd);border-radius:12px;padding:13px;margin-bottom:11px;background:#FCFCFD}
.rvb-rep-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}
.rvb-rep-h b{font-size:12.5px;font-weight:700;color:#27272A}
.rvb-del{font-size:11.5px;color:var(--rvb-mf);padding:3px 8px;border-radius:7px}
.rvb-del:hover{background:#FEF2F2;color:var(--rvb-red)}
.rvb-add{width:100%;padding:10px;border:1.5px dashed var(--rvb-bd2);border-radius:11px;color:var(--rvb-brand);font-weight:600;font-size:13px;transition:.15s}
.rvb-add:hover{border-color:#818CF8;background:var(--rvb-brand50)}
.rvb-chgrp{margin-bottom:12px}
.rvb-chgrp>label{display:block;font-size:11.5px;font-weight:650;color:#27272A;margin-bottom:5px}
.rvb-chwrap{display:flex;flex-wrap:wrap;gap:6px;padding:8px;border:1px solid var(--rvb-bd);border-radius:11px;min-height:46px;background:#fff}
.rvb-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;background:var(--rvb-brand50);color:var(--rvb-brand2);font-size:12px;font-weight:550}
.rvb-chip button{display:grid;place-items:center;width:14px;height:14px;border-radius:50%;background:rgba(79,70,229,.16);color:var(--rvb-brand2);font-size:11px;line-height:1}
.rvb-chip button:hover{background:var(--rvb-brand);color:#fff}
.rvb-chadd{flex:1;min-width:110px;border:none;outline:none;font-size:12.5px;background:none;padding:4px}
.rvb-stage{position:relative;background:#EDF0F5;display:flex;flex-direction:column;min-height:0;min-width:0;background-image:radial-gradient(rgba(15,23,42,.055) 1px,transparent 1px);background-size:22px 22px}
.rvb-stagebar{position:relative;z-index:20;height:52px;display:flex;align-items:center;gap:12px;padding:0 16px;background:rgba(255,255,255,.86);backdrop-filter:blur(10px);border-bottom:1px solid var(--rvb-bd);flex-shrink:0}
.rvb-stagebar .tn{font-size:13px;font-weight:650}
.rvb-stagebar .tn span{color:var(--rvb-mf);font-weight:500}
.rvb-zoom{margin-left:auto;display:flex;align-items:center;gap:2px}
.rvb-zoom button{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;color:#27272A}
.rvb-zoom button:hover{background:var(--rvb-mut)}
.rvb-zoom .zv{min-width:46px;text-align:center;font-size:12.5px;font-weight:600;color:var(--rvb-mf)}
.rvb-scroll{position:relative;z-index:1;flex:1;min-width:0;overflow:auto;padding:34px 24px 60px;display:flex;justify-content:center;align-items:flex-start}
.rvb-scaler{position:relative;flex:none}
.rvb-tabs{display:none}
.rvb-ov{position:fixed;inset:0;background:rgba(15,23,42,.45);backdrop-filter:blur(3px);z-index:80;opacity:0;pointer-events:none;transition:opacity .2s}
.rvb-ov.on{opacity:1;pointer-events:auto}
.rvb-drawer{position:fixed;top:0;right:0;bottom:0;width:min(560px,94vw);background:#fff;z-index:90;transform:translateX(102%);transition:transform .28s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;box-shadow:-20px 0 60px -20px rgba(15,23,42,.35)}
.rvb-drawer.on{transform:none}
.rvb-drawer-h{padding:20px 22px 16px;border-bottom:1px solid var(--rvb-bd);display:flex;align-items:flex-start;justify-content:space-between}
.rvb-drawer-h h3{font-size:17px;font-weight:750;letter-spacing:-.01em}
.rvb-drawer-h p{font-size:12.5px;color:var(--rvb-mf);margin-top:3px}
.rvb-fchips{padding:12px 22px;border-bottom:1px solid var(--rvb-bd);display:flex;gap:6px;flex-wrap:wrap}
.rvb-fchip{padding:6px 12px;border-radius:999px;border:1px solid var(--rvb-bd);background:#fff;font-size:12px;font-weight:600;color:var(--rvb-mf)}
.rvb-fchip.on{background:var(--rvb-brand);border-color:var(--rvb-brand);color:#fff}
.rvb-dgrid{flex:1;overflow-y:auto;padding:18px 22px 30px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
.rvb-tcard{border:1px solid var(--rvb-bd);border-radius:14px;overflow:hidden;text-align:left;transition:.15s;background:#fff;position:relative;cursor:pointer}
.rvb-tcard:hover{transform:translateY(-3px);box-shadow:0 10px 25px rgba(0,0,0,.08);border-color:#818CF8}
.rvb-tcard.on{border-color:var(--rvb-brand);box-shadow:0 0 0 2px var(--rvb-brand)}
.rvb-tcard-th{height:186px;background:#EDF0F5;overflow:hidden;position:relative}
.rvb-mini{position:absolute;top:0;left:0;transform-origin:top left}
.rvb-tcard-m{padding:11px 13px;border-top:1px solid var(--rvb-bd);display:flex;align-items:center;justify-content:space-between;gap:8px}
.rvb-tcard-m b{font-size:13px;font-weight:700}
.rvb-tcard-m small{display:block;font-size:11px;color:var(--rvb-mf);margin-top:1px}
.rvb-badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px;white-space:nowrap}
.rvb-badge.safe{background:var(--rvb-em50);color:#047857}
.rvb-badge.cre{background:var(--rvb-amb50);color:#B45309}
.rvb-qwrap{position:relative}
.rvb-qbtn{display:flex;align-items:center;gap:9px;padding:6px 12px 6px 6px;border-radius:999px;border:1px solid var(--rvb-bd);background:#fff;transition:.15s}
.rvb-qbtn:hover{border-color:#818CF8}
.rvb-ring{position:relative;width:30px;height:30px;flex-shrink:0}
.rvb-ring svg{transform:rotate(-90deg)}
.rvb-ring .qn{position:absolute;inset:0;display:grid;place-items:center;font-size:9.5px;font-weight:800}
.rvb-qpop{position:absolute;top:44px;right:0;width:308px;background:#fff;border:1px solid var(--rvb-bd);border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,.08);padding:18px;z-index:75;display:none}
.rvb-qpop.on{display:block}
.rvb-qpop h4{font-size:14px;font-weight:750;margin-bottom:4px}
.rvb-qsub{font-size:12px;color:var(--rvb-mf);margin-bottom:12px}
.rvb-qcheck{display:flex;align-items:center;gap:9px;padding:7px 0;font-size:12.5px;border-bottom:1px solid var(--rvb-mut)}
.rvb-qcheck:last-child{border:none}
.rvb-qcheck .qi{width:18px;height:18px;border-radius:50%;border:1.5px solid var(--rvb-bd2);display:grid;place-items:center;flex-shrink:0;font-size:10px;color:transparent}
.rvb-qcheck.ok .qi{background:var(--rvb-em);border-color:var(--rvb-em);color:#fff}
.rvb-qcheck span{color:var(--rvb-mf)}
.rvb-qcheck.ok span{color:#27272A;text-decoration:line-through;text-decoration-color:var(--rvb-bd2)}
.rvb-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border-radius:10px;font-weight:600;font-size:13.5px;transition:.15s;white-space:nowrap}
.rvb-btn-p{background:var(--rvb-brand);color:#fff;box-shadow:0 5px 14px -4px rgba(79,70,229,.55)}
.rvb-btn-p:hover{background:var(--rvb-brand2)}
.rvb-btn-o{background:#fff;border:1px solid var(--rvb-bd);color:#27272A}
.rvb-btn-o:hover{border-color:#818CF8;color:var(--rvb-brand)}
.rvb-ico{width:36px;height:36px;padding:0;justify-content:center;border-radius:10px;background:#fff;border:1px solid var(--rvb-bd);color:#27272A;display:grid;place-items:center}
.rvb-ico:hover{border-color:#818CF8;color:var(--rvb-brand)}
@media (max-width:1080px){
  .rvb-app{grid-template-columns:1fr}
  .rvb-panel{display:none;padding-bottom:132px}
  .rvb-panel.mobile-on{display:flex}
  .rvb-stage{display:none}
  .rvb-stage.mobile-on{display:flex}
  .rvb-tabs{display:flex;position:fixed;bottom:calc(56px + env(safe-area-inset-bottom,0px));left:0;right:0;z-index:50;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);border-top:1px solid var(--rvb-bd);padding:8px;gap:8px}
  .rvb-tabs button{flex:1;padding:11px;border-radius:11px;font-weight:650;font-size:13.5px;color:var(--rvb-mf);display:flex;align-items:center;justify-content:center;gap:7px}
  .rvb-tabs button.on{background:var(--rvb-brand);color:#fff}
  .rvb-scroll{padding:20px 10px 200px}
}
@media (max-width:640px){
  .rvb-dgrid{grid-template-columns:1fr}
  .rvb-app{height:auto}
  .rvb-qpop{position:fixed;left:12px;right:12px;width:auto;top:calc(env(safe-area-inset-top,0px) + 68px)}
}
`;
