import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, AudioLines, Check, CheckCircle2,
  ChevronRight, CircleHelp, CloudOff, Command, FileStack, FolderClock, Images,
  Info, Keyboard, LockKeyhole, Menu, Plus, ScanLine, ShieldCheck, Trash2, X,
} from 'lucide-react';
import Redactor from './components/Redactor';
import { AudioTool, ImageTool, PdfTool, SessionHistory } from './components/ToolViews';
import { uid } from './lib/local-tools';
import type { HistoryEntry, NoticeType, ToolId, UploadBatch } from './types';

const tools = [
  { id: 'redactor' as const, label: 'Smart Redactor', icon: ScanLine, description: 'Скройте личное. Оставьте нужное.' },
  { id: 'images' as const, label: 'Изображения', icon: Images, description: 'Меньше размер. То же впечатление.' },
  { id: 'audio' as const, label: 'Аудиоредактор', icon: AudioLines, description: 'Только нужный фрагмент. Ничего лишнего.' },
  { id: 'pdf' as const, label: 'PDF-инструменты', icon: FileStack, description: 'Объединяйте и разделяйте. Без посредников.' },
];

type Modal = 'privacy' | 'guide' | 'shortcuts' | 'clear-history' | null;

function BrandMark({ small = false }: { small?: boolean }) {
  return <span className={`brand-mark ${small ? 'small' : ''}`} aria-hidden="true">
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path d="M5 11V5H11M13 19H19V13M5 19H11M19 5H13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14L14 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  </span>;
}

export default function App() {
  const [tool, setTool] = useState<ToolId>('redactor');
  const [mobileNav, setMobileNav] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [uploads, setUploads] = useState<Partial<Record<ToolId, UploadBatch>>>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [notice, setNotice] = useState<{ id: string; text: string; type: NoticeType } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const modalTrigger = useRef<HTMLElement | null>(null);

  const notify = useCallback((text: string, type: NoticeType = 'success') => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice({ id: uid(), text, type });
    noticeTimer.current = setTimeout(() => setNotice(null), type === 'error' ? 7000 : 4500);
  }, []);

  const onExport = useCallback((name: string, size: number, exportedTool: ToolId) => {
    setHistory((entries) => [{ id: uid(), name, size, tool: exportedTool, time: new Date() }, ...entries]);
    notify('Готово. Файл сохранен только на вашем устройстве.');
  }, [notify]);

  const openFiles = useCallback(() => fileInput.current?.click(), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setModal(null); setMobileNav(false); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        if (tool !== 'history') openFiles();
      }
      if (event.key === '?' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) setModal('shortcuts');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tool, openFiles]);

  useEffect(() => {
    if (!modal) { modalTrigger.current?.focus(); return; }
    modalTrigger.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timeout = setTimeout(() => dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus(), 40);
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const elements = dialogRef.current?.querySelectorAll<HTMLElement>('button, a, input, [tabindex="0"]');
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', trapFocus);
    return () => { document.body.style.overflow = previousOverflow; clearTimeout(timeout); window.removeEventListener('keydown', trapFocus); };
  }, [modal]);

  useEffect(() => () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); }, []);

  const selectTool = (id: ToolId) => { setTool(id); setMobileNav(false); };
  const current = tools.find((item) => item.id === tool);
  const accept = tool === 'images' ? 'image/png,image/jpeg,image/webp,image/avif,image/gif,image/bmp'
    : tool === 'audio' ? 'audio/*' : tool === 'pdf' ? 'application/pdf,.pdf' : 'application/pdf,.pdf,image/*';

  return (
    <MotionConfig reducedMotion="user"><div className="app-shell">
      <AnimatePresence>{mobileNav && <motion.button className="nav-backdrop" aria-label="Закрыть меню" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileNav(false)} />}</AnimatePresence>
      <aside className={`sidebar ${mobileNav ? 'is-open' : ''}`}>
        <button className="brand" onClick={() => selectTool('redactor')} aria-label="offgrid: Smart Redactor">
          <span className="brand-row"><BrandMark /><span className="brand-word">offgrid<span>.</span></span></span>
          <span className="brand-tagline">ВАШИ ФАЙЛЫ. ВАШИ ПРАВИЛА.</span>
        </button>
        <div className="nav-section-label">ИНСТРУМЕНТЫ</div>
        <nav className="tool-nav" aria-label="Инструменты">
          {tools.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => selectTool(id)} className={`nav-item ${tool === id ? 'active' : ''}`} aria-current={tool === id ? 'page' : undefined}>
            {tool === id && <motion.span className="nav-active-bg" layoutId="active-tool" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <Icon size={19} strokeWidth={1.65} /><span>{label}</span>{tool === id && <span className="active-nav-dot" />}
          </button>)}
        </nav>
        <div className="nav-section-label second-label">ПРОСТРАНСТВО</div>
        <nav className="tool-nav" aria-label="Пространство">
          <button onClick={() => selectTool('history')} className={`nav-item ${tool === 'history' ? 'active' : ''}`} aria-current={tool === 'history' ? 'page' : undefined}>
            {tool === 'history' && <motion.span className="nav-active-bg" layoutId="active-tool" />}
            <FolderClock size={19} strokeWidth={1.65} /><span>История сессии</span><span className="nav-counter">{history.length}</span>
          </button>
          <button onClick={() => setModal('privacy')} className="nav-item"><ShieldCheck size={19} strokeWidth={1.65} /><span>О приватности</span><ArrowUpRight size={13} className="nav-external" /></button>
        </nav>
        <div className="sidebar-manifesto">
          <div className="manifesto-art" aria-hidden="true"><div className="art-orbit" /><div className="art-orbit second" /><CloudOff size={31} strokeWidth={1.15} /><span className="art-dot" /></div>
          <h2>Меньше облака.<br />Больше контроля.</h2>
          <p>Без аккаунтов. Без подписок.<br />Просто полезные инструменты.</p>
          <button onClick={() => setModal('privacy')}>Так и задумано <ArrowRight size={14} /></button>
        </div>
        <div className="sidebar-bottom"><span className="version">v.1.0.0</span><span className="local-first"><span /> LOCAL-FIRST</span></div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Открыть меню"><Menu size={20} /></button><span className="mobile-brand-name">offgrid.</span><span>Рабочее пространство</span><ChevronRight size={14} /><strong>{current?.label ?? 'История сессии'}</strong></div>
          <div className="topbar-actions"><button className="local-status" onClick={() => setModal('privacy')}><span className="status-dot" />Локальный режим<ShieldCheck size={14} /></button><span className="topbar-separator" /><button className="icon-button" onClick={() => setModal('shortcuts')} title="Горячие клавиши" aria-label="Горячие клавиши"><Keyboard size={18} /></button><button className="icon-button" onClick={() => setModal('guide')} title="Как это работает" aria-label="Как это работает"><CircleHelp size={19} /></button></div>
        </header>

        <main className="main-content">
          <motion.div className="page-heading" initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div><div className="page-eyebrow">ЛОКАЛЬНЫЕ ИНСТРУМЕНТЫ / {tool === 'history' ? 'СЕССИЯ' : tool === 'redactor' ? 'ДОКУМЕНТЫ' : tool === 'images' ? 'ГРАФИКА' : tool === 'audio' ? 'АУДИО' : 'PDF'}</div><h1>{current?.label ?? 'История сессии'}</h1><p>{current?.description ?? 'Ваши последние операции. Только в памяти этой вкладки.'}</p></div>
            {tool === 'history' ? <button className="button secondary heading-upload" disabled={!history.length} onClick={() => setModal('clear-history')}><Trash2 size={16} />Очистить историю</button> : <button className="button secondary heading-upload" onClick={openFiles}><Plus size={17} />Открыть {tool === 'pdf' ? 'файлы' : 'файл'}<span className="key-hint"><Command size={10} /> O</span></button>}
          </motion.div>
          <input type="file" ref={fileInput} className="hidden" accept={accept} multiple={tool === 'pdf'} onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length) setUploads((previous) => ({ ...previous, [tool]: { id: uid(), files } }));
            event.target.value = '';
          }} />

          <div hidden={tool !== 'redactor'}><Redactor batch={uploads.redactor} onOpen={openFiles} notify={notify} onExport={onExport} active={tool === 'redactor'} onGuide={() => setModal('guide')} /></div>
          <div hidden={tool !== 'images'}><ImageTool batch={uploads.images} onOpen={openFiles} notify={notify} onExport={onExport} /></div>
          <div hidden={tool !== 'audio'}><AudioTool batch={uploads.audio} onOpen={openFiles} notify={notify} onExport={onExport} active={tool === 'audio'} /></div>
          <div hidden={tool !== 'pdf'}><PdfTool batch={uploads.pdf} onOpen={openFiles} notify={notify} onExport={onExport} /></div>
          <div hidden={tool !== 'history'}><SessionHistory entries={history} onChooseTool={selectTool} /></div>

          <div className="workspace-assurance"><span><LockKeyhole size={13} />Файлы не покидают ваш браузер. Ни на секунду.</span><button onClick={() => setModal('privacy')}>Проверить принципы <ArrowUpRight size={12} /></button></div>
          <footer className="main-footer"><span>Ваш браузер - ваш сервер.</span><span>NO CLOUD. NO TRACKING. JUST TOOLS.</span></footer>
        </main>
      </div>

      <AnimatePresence>{notice && <motion.div key={notice.id} role={notice.type === 'error' ? 'alert' : 'status'} className={`toast ${notice.type}`} style={{ x: '-50%' }} initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}>
        {notice.type === 'success' ? <CheckCircle2 size={19} /> : <Info size={19} />}<span>{notice.text}</span><button onClick={() => setNotice(null)} aria-label="Закрыть уведомление"><X size={16} /></button>
      </motion.div>}</AnimatePresence>

      <AnimatePresence>{modal && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
        <motion.div ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
          <button className="icon-button modal-close" onClick={() => setModal(null)} aria-label="Закрыть окно"><X size={20} /></button>
          {modal === 'privacy' && <><div className="modal-emblem"><ShieldCheck size={27} /></div><div className="page-eyebrow">ПРИВАТНОСТЬ ПО УМОЛЧАНИЮ</div><h2 id="dialog-title">Мы не видим ваши файлы.<br />И не хотим.</h2><p className="modal-intro">offgrid обрабатывает данные на вашем устройстве. Без сервера для файлов, регистрации, аналитики и платных ограничений.</p><div className="principle"><Check size={17} /><div><strong>Ни одного байта на чужой сервер</strong><p>PDF.js, Canvas и Web Audio работают локально. Шрифты и PDF-движок включены в приложение, а не загружаются с CDN.</p></div></div><div className="principle"><Check size={17} /><div><strong>Ваши данные не сохраняются в приложении</strong><p>Файлы и история живут в памяти вкладки. После обновления страницы сессия исчезает.</p></div></div><div className="principle"><Check size={17} /><div><strong>После загрузки можно отключить интернет</strong><p>Открытая вкладка продолжит работать без сети. Размер файла ограничен только доступной памятью вашего устройства.</p></div></div><div className="modal-note"><Info size={16} /><span>Автопоиск не заменяет проверку. Перед отправкой документа убедитесь, что скрыли все чувствительные области.</span></div><button className="button primary full-width" onClick={() => setModal(null)}>Мои файлы. Мои правила.<ArrowRight size={16} /></button></>}
          {modal === 'guide' && <><div className="modal-emblem"><ScanLine size={26} /></div><div className="page-eyebrow">SMART REDACTOR</div><h2 id="dialog-title">Личное остается личным.</h2><p className="modal-intro">Три простых шага. Ноль загрузок на сервер.</p><div className="guide-step"><span>01</span><div><strong>Откройте PDF или изображение</strong><p>Текстовые PDF проверяются локальными шаблонами: имена, email, телефоны, адреса и реквизиты.</p></div></div><div className="guide-step"><span>02</span><div><strong>Проверьте и выделите остальное</strong><p>Кликните по найденной области, чтобы включить или исключить ее. Инструмент «Область» скроет подписи, лица, печати или любой фрагмент вручную. OCR для сканов не используется.</p></div></div><div className="guide-step"><span>03</span><div><strong>Скачайте безопасную копию</strong><p>PDF пересобирается из изображений с непрозрачной заливкой. Исходные текстовые слои, вложения и скрытое содержимое не переносятся. Остальной текст тоже становится изображением.</p></div></div><button className="button primary full-width" onClick={() => setModal(null)}>Попробовать<ArrowRight size={16} /></button></>}
          {modal === 'shortcuts' && <><div className="modal-emblem"><Keyboard size={26} /></div><h2 id="dialog-title">Меньше кликов.</h2><p className="modal-intro">Горячие клавиши для вашего рабочего процесса.</p><div className="shortcut-row"><span>Открыть файл</span><div><kbd>Ctrl / ⌘</kbd><kbd>O</kbd></div></div><div className="shortcut-row"><span>Отменить выделение в редакторе</span><div><kbd>Ctrl / ⌘</kbd><kbd>Z</kbd></div></div><div className="shortcut-row"><span>Предпросмотр скрытия</span><kbd>P</kbd></div><div className="shortcut-row"><span>Скачать безопасную копию</span><div><kbd>Ctrl / ⌘</kbd><kbd>Enter</kbd></div></div><div className="shortcut-row"><span>Открыть эту подсказку</span><kbd>?</kbd></div><div className="shortcut-row"><span>Закрыть окно / выйти из выделения</span><kbd>Esc</kbd></div><button className="button primary full-width" onClick={() => setModal(null)}>Все понятно<Check size={16} /></button></>}
          {modal === 'clear-history' && <><div className="modal-emblem"><FolderClock size={26} /></div><h2 id="dialog-title">Очистить историю?</h2><p className="modal-intro">Записи этой сессии будут удалены. Уже скачанные файлы останутся на устройстве.</p><div className="modal-button-row"><button className="button secondary" onClick={() => setModal(null)}>Отмена</button><button className="button primary" onClick={() => { setHistory([]); setModal(null); notify('История сессии очищена.'); }}><Trash2 size={16} />Очистить</button></div></>}
          <div className="modal-signoff"><BrandMark small /><span>offgrid. Всегда на вашей стороне.</span><ArrowDownToLine size={12} /></div>
        </motion.div>
      </motion.div>}</AnimatePresence>
    </div></MotionConfig>
  );
}
