import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, CreditCard,
  Download, Ellipsis, Eye, FileText, Info, LoaderCircle, LockKeyhole, Mail,
  MapPin, Maximize, Minus, MousePointer2, Phone, Plus, RotateCcw, ScanLine,
  ShieldCheck, SlidersHorizontal, Sparkles, SquareDashedMousePointer, Undo2,
  Upload, UserRound, X,
} from 'lucide-react';
import {
  createDemoDocument, downloadBlob, exportRedactedDocument, formatBytes,
  readLocalDocument, rescanDocument, uid,
  type Category, type LocalDocument, type Redaction,
} from '../lib/local-tools';
import type { ToolProps } from '../types';

const categories: { id: Category; label: string; icon: typeof UserRound }[] = [
  { id: 'names', label: 'Имена и фамилии', icon: UserRound },
  { id: 'emails', label: 'Email-адреса', icon: Mail },
  { id: 'phones', label: 'Телефоны', icon: Phone },
  { id: 'financial', label: 'Реквизиты', icon: CreditCard },
  { id: 'addresses', label: 'Адреса', icon: MapPin },
];

export default function Redactor({ batch, onOpen, notify, onExport, active, onGuide }: ToolProps & { onGuide: () => void }) {
  const [doc, setDoc] = useState<LocalDocument | null>(createDemoDocument);
  const [areas, setAreas] = useState<Redaction[]>(() => doc?.redactions ?? []);
  const [past, setPast] = useState<Redaction[][]>([]);
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [mode, setMode] = useState<'select' | 'area'>('select');
  const [preview, setPreview] = useState(false);
  const [color, setColor] = useState('#202420');
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [format, setFormat] = useState<'pdf' | 'png'>('pdf');
  const [busy, setBusy] = useState('');
  const [scanning, setScanning] = useState(false);
  const [menu, setMenu] = useState(false);
  const [demoHint, setDemoHint] = useState(true);
  const [tab, setTab] = useState<'editor' | 'info'>('editor');
  const [dragOver, setDragOver] = useState(false);
  const [draft, setDraft] = useState<Pick<Redaction, 'x' | 'y' | 'width' | 'height'> | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const lastBatch = useRef('');
  const loadRequest = useRef(0);
  const currentDocument = useRef(doc);
  const selectedCount = areas.filter((area) => area.selected).length;

  const changeAreas = useCallback((next: Redaction[]) => {
    setPast((snapshots) => [...snapshots.slice(-19), areas]);
    setAreas(next);
  }, [areas]);

  const undo = useCallback(() => {
    if (!past.length) return;
    setAreas(past[past.length - 1]);
    setPast((snapshots) => snapshots.slice(0, -1));
  }, [past]);

  const openDocument = useCallback(async (file: File) => {
    const request = ++loadRequest.current;
    setBusy('Открываем локально...');
    setScanning(false);
    setMenu(false);
    setTab('editor');
    try {
      const next = await readLocalDocument(file, (progress) => { if (request === loadRequest.current) setBusy(progress); });
      if (request !== loadRequest.current) return;
      currentDocument.current = next;
      setDoc(next);
      setAreas(next.redactions);
      setPast([]);
      setPage(0);
      setZoom(100);
      setFormat(next.kind === 'image' ? 'png' : 'pdf');
      setPreview(false);
      setDemoHint(false);
      setMode(next.redactions.length ? 'select' : 'area');
      notify(next.redactions.length ? `Найдено областей: ${next.redactions.length}. Проверьте их перед экспортом.` : 'Файл открыт. Выделите чувствительные области вручную.', 'info');
    } catch (error) {
      if (request !== loadRequest.current) return;
      const message = error instanceof Error ? error.message : '';
      notify(/password|encrypted/i.test(message) ? 'PDF защищен паролем. Сначала откройте незашифрованную копию.' : message || 'Не удалось открыть документ.', 'error');
    } finally { if (request === loadRequest.current) setBusy(''); }
  }, [notify]);

  useEffect(() => {
    if (!batch || lastBatch.current === batch.id) return;
    lastBatch.current = batch.id;
    void openDocument(batch.files[0]);
  }, [batch, openDocument]);

  const exportFile = useCallback(async () => {
    if (!doc || busy || scanning) return;
    setBusy('Создаем безопасную копию...');
    try {
      const blob = await exportRedactedDocument(doc, areas, color, format, removeMetadata);
      const name = `${doc.name.replace(/\.[^.]+$/, '')}_redacted.${format}`;
      downloadBlob(blob, name);
      onExport(name, blob.size, 'redactor');
    } catch (error) { notify(error instanceof Error ? error.message : 'Не удалось экспортировать файл.', 'error'); }
    finally { setBusy(''); }
  }, [doc, areas, color, format, removeMetadata, busy, scanning, notify, onExport]);

  useEffect(() => {
    if (!active) return;
    const keyHandler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || document.querySelector('[role="dialog"]')) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); undo(); }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); void exportFile(); }
      if (!event.ctrlKey && !event.metaKey && event.key.toLowerCase() === 'p') setPreview((value) => !value);
      if (event.key === 'Escape') { setMode('select'); setMenu(false); setDraft(null); dragStart.current = null; }
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [active, undo, exportFile]);

  /**
   * Повторный локальный поиск.
   *
   * ⚠️ Раньше здесь стояла имитация работы:
   *   await new Promise((r) => setTimeout(r, 950));
   *   changeAreas([...doc.redactions...]);
   * То есть сканирование фактически уже выполнялось при открытии файла,
   * а по кнопке происходила только пауза и повторное применение готового
   * результата. Пользователь видел «Проверяем локально...» и ничего не
   * происходило — это ложное обещание в интерфейсе.
   *
   * Теперь поиск выполняется заново по сохранённому тексту документа,
   * а результат действительно пересчитывается.
   */
  const analyze = async () => {
    if (!doc || scanning || busy) return;
    if (doc.kind === 'image' || (doc.kind === 'pdf' && !doc.redactions.length)) {
      setMode('area');
      notify('В этом файле нет распознанного текста. Выделите области вручную: OCR не используется.', 'info');
      return;
    }
    const request = loadRequest.current;
    setScanning(true);
    try {
      // Небольшая задержка нужна, чтобы состояние «проверяем» успело
      // отрисоваться: сам поиск синхронный и занимает единицы миллисекунд.
      await new Promise((resolve) => setTimeout(resolve, 120));
      if (request !== loadRequest.current || currentDocument.current !== doc) return;
      const found = await rescanDocument(doc);
      changeAreas([
        ...found.map((area) => ({ ...area, selected: true })),
        ...areas.filter((area) => area.category === 'manual'),
      ]);
      notify(
        found.length
          ? `Проверка завершена. Найдено областей: ${found.length}.`
          : 'Совпадений не найдено. Проверьте результат и выделите нужное вручную.',
        found.length ? 'success' : 'info',
      );
    } finally {
      setScanning(false);
    }
  };

  const pointerPosition = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)), y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)) };
  };

  const closeDocument = () => {
    loadRequest.current++;
    currentDocument.current = null;
    setDoc(null); setAreas([]); setPast([]); setMenu(false); setScanning(false); setBusy('');
  };

  const resetDemo = () => {
    const next = createDemoDocument();
    loadRequest.current++;
    currentDocument.current = next;
    setBusy(''); setScanning(false); setDoc(next); setAreas(next.redactions); setPast([]); setPage(0); setZoom(100); setPreview(false); setDemoHint(true); setFormat('pdf'); setMenu(false); setMode('select');
  };

  return <section className="tool-view" onDragOver={(event) => { event.preventDefault(); if (!busy) setDragOver(true); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOver(false); }} onDrop={(event) => { event.preventDefault(); setDragOver(false); if (!busy && event.dataTransfer.files[0]) void openDocument(event.dataTransfer.files[0]); }}>
    <div className="workspace-tabs"><div className="tab-buttons"><button className={tab === 'editor' ? 'active' : ''} onClick={() => setTab('editor')}>Редактор</button><button className={tab === 'info' ? 'active' : ''} onClick={() => setTab('info')}>О документе</button></div><button className="how-link" onClick={onGuide}>Как это работает<ArrowUpRight size={13} /></button></div>
    {tab === 'info' ? <div className="file-info-view"><FileText size={34} strokeWidth={1.3} /><h2>{doc?.name ?? 'Документ не открыт'}</h2><p>Данные этой сессии доступны только на вашем устройстве.</p>{doc && <dl><div><dt>Размер оригинала</dt><dd>{formatBytes(doc.size)}{doc.kind === 'demo' ? ' (демо-изображение)' : ''}</dd></div><div><dt>Количество страниц</dt><dd>{doc.pages.length}</dd></div><div><dt>Найдено областей</dt><dd>{areas.length}</dd></div><div><dt>Выбрано для скрытия</dt><dd>{selectedCount}</dd></div><div><dt>Способ обработки</dt><dd>PDF.js + Canvas, локально</dd></div><div><dt>Хранение</dt><dd>Оперативная память вкладки</dd></div><div><dt>Безопасный экспорт</dt><dd>Растровый PDF без исходных слоев</dd></div></dl>}<button className="button secondary" onClick={() => setTab('editor')}><ChevronLeft size={16} />Вернуться в редактор</button></div> :
    <motion.div className={`editor-workspace ${dragOver ? 'drag-over' : ''}`} ref={workspace} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}>
      <div className="document-editor">
        <div className="document-filebar">
          <span className="file-icon"><FileText size={20} strokeWidth={1.5} /></span>
          <div className="file-name"><strong>{doc?.name ?? 'Откройте ваш документ'}</strong><span>{doc ? `${doc.kind === 'image' ? 'Изображение' : 'PDF'} · ${doc.pages.length} ${doc.pages.length === 1 ? 'страница' : 'стр.'} · ${doc.kind === 'demo' ? 'Демо' : formatBytes(doc.size)}` : 'PDF, PNG, JPEG, WebP'}</span></div>
          <button className="replace-file" onClick={onOpen} disabled={!!busy}><Upload size={14} /><span>Заменить</span></button>
          <div className="file-menu-wrap">
            <button className="icon-button" onClick={() => setMenu(!menu)} aria-label="Действия с документом" aria-expanded={menu}><Ellipsis size={20} /></button>
            <AnimatePresence>{menu && <>
              <button className="menu-dismiss" tabIndex={-1} aria-label="Закрыть меню" onClick={() => setMenu(false)} />
              <motion.div className="file-menu" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <button onClick={() => { changeAreas([]); setMenu(false); }} disabled={!doc}><RotateCcw size={14} />Сбросить выделения</button>
                <button onClick={resetDemo}><Sparkles size={14} />Открыть демо</button>
                <button onClick={closeDocument}><X size={14} />Закрыть документ</button>
              </motion.div>
            </>}</AnimatePresence>
          </div>
        </div>
        <div className="editor-toolbar"><div className="editor-tools"><button className={mode === 'select' ? 'selected' : ''} onClick={() => setMode('select')} title="Кликните по области, чтобы включить или исключить ее"><MousePointer2 size={15} /><span>Выбор</span></button><button className={mode === 'area' ? 'selected' : ''} onClick={() => { setMode('area'); setPreview(false); }} title="Нарисуйте прямоугольник на документе"><SquareDashedMousePointer size={16} /><span>Область</span></button><span className="toolbar-divider" /><button className="undo-button" onClick={undo} disabled={!past.length} title="Отменить (Ctrl + Z)" aria-label="Отменить"><Undo2 size={16} /></button></div><button className={`preview-control ${preview ? 'on' : ''}`} onClick={() => setPreview(!preview)} disabled={!doc} aria-pressed={preview}><Eye size={15} /><span>Предпросмотр</span><span className="mini-switch"><span /></span></button></div>
        <div className={`document-viewport ${mode === 'area' ? 'drawing' : ''}`}>
          {doc ? <>
            {doc.kind === 'demo' && demoHint && <div className="demo-hint"><Sparkles size={12} /><span>Демо-документ. Попробуйте, все данные вымышлены.</span><button onClick={() => setDemoHint(false)} aria-label="Скрыть подсказку"><X size={12} /></button></div>}
            <div className="document-sheet" style={{ width: `${Math.round(368 * zoom / 100)}px`, maxWidth: zoom <= 100 ? '100%' : 'none' }}>
              <img className="paper-image" src={doc.pages[page].image} alt={`Страница ${page + 1} документа ${doc.name}`} draggable={false} />
              <div className="redaction-layer" onPointerDown={(event) => {
                if (mode !== 'area' || busy) return;
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                const position = pointerPosition(event);
                dragStart.current = position;
                setDraft({ ...position, width: 0, height: 0 });
              }} onPointerMove={(event) => {
                if (!dragStart.current) return;
                const position = pointerPosition(event);
                const start = dragStart.current;
                setDraft({ x: Math.min(start.x, position.x), y: Math.min(start.y, position.y), width: Math.abs(start.x - position.x), height: Math.abs(start.y - position.y) });
              }} onPointerUp={(event) => {
                if (!dragStart.current) return;
                const position = pointerPosition(event);
                const start = dragStart.current;
                const rectangle = { x: Math.min(start.x, position.x), y: Math.min(start.y, position.y), width: Math.abs(start.x - position.x), height: Math.abs(start.y - position.y) };
                if (rectangle.width > 0.006 && rectangle.height > 0.006) changeAreas([...areas, { ...rectangle, id: uid(), page, category: 'manual', label: 'Область вручную', selected: true }]);
                dragStart.current = null;
                setDraft(null);
              }} onPointerCancel={() => { dragStart.current = null; setDraft(null); }}>
                {areas.filter((area) => area.page === page).map((area) => <button key={area.id} className={`redaction-area ${area.selected ? 'enabled' : 'disabled'} ${preview && area.selected ? 'filled' : ''}`} style={{ left: `${area.x * 100}%`, top: `${area.y * 100}%`, width: `${area.width * 100}%`, height: `${area.height * 100}%`, ...(preview && area.selected ? { background: color, borderColor: color } : {}) }} title={`${area.label} - ${area.selected ? 'не скрывать' : 'скрыть'}`} aria-label={`${area.selected ? 'Исключить' : 'Скрыть'}: ${area.label}`} onClick={(event) => { event.stopPropagation(); if (mode === 'select') changeAreas(areas.map((item) => item.id === area.id ? { ...item, selected: !item.selected } : item)); }} />)}
                {draft && <span className="draft-area" style={{ left: `${draft.x * 100}%`, top: `${draft.y * 100}%`, width: `${draft.width * 100}%`, height: `${draft.height * 100}%` }} />}
              </div>
              <AnimatePresence>{scanning && <motion.div className="scan-line" initial={{ top: '0%', opacity: 0 }} animate={{ top: '100%', opacity: [0, 1, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.95, ease: 'linear' }} />}</AnimatePresence>
            </div>
          </> : <div className="empty-document"><div className="empty-file-art"><FileText size={46} strokeWidth={1} /><span><Plus size={17} /></span></div><h3>Личное - под вашим контролем.</h3><p>Перетащите PDF или изображение сюда.<br />Все останется в вашем браузере.</p><button className="button primary" onClick={onOpen}><Upload size={16} />Выбрать файл</button><button className="text-button" onClick={resetDemo}>Или попробовать демо <ArrowUpRight size={13} /></button></div>}
        </div>
        <div className="canvas-footer"><div className="page-navigation"><button className="icon-button" disabled={!doc || page === 0} onClick={() => setPage((value) => value - 1)} aria-label="Предыдущая страница"><ChevronLeft size={14} /></button><span>{doc ? page + 1 : 0}<span> / {doc?.pages.length ?? 0}</span></span><button className="icon-button" disabled={!doc || page >= doc.pages.length - 1} onClick={() => setPage((value) => value + 1)} aria-label="Следующая страница"><ChevronRight size={14} /></button></div><span className="canvas-local"><LockKeyhole size={11} />Локальный предпросмотр</span><div className="zoom-controls"><button onClick={() => setZoom((value) => Math.max(50, value - 10))} disabled={zoom === 50} aria-label="Уменьшить"><Minus size={12} /></button><button className="zoom-value" onClick={() => setZoom(100)} title="Сбросить масштаб">{zoom}%</button><button onClick={() => setZoom((value) => Math.min(180, value + 10))} disabled={zoom === 180} aria-label="Увеличить"><Plus size={12} /></button><span /><button onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else void workspace.current?.requestFullscreen().catch(() => notify('Полноэкранный режим недоступен в этом браузере.', 'info')); }} aria-label="Полноэкранный режим"><Maximize size={13} /></button></div></div>
      </div>

      <aside className="redactor-settings">
        <div className="settings-header"><SlidersHorizontal size={16} /><h2>Настройки скрытия</h2><span className="settings-dot" /></div>
        <div className="settings-body"><div className="setting-section-title"><h3>Что найти</h3><button className="icon-button" onClick={onGuide} title="О локальном автопоиске" aria-label="О локальном автопоиске"><Info size={14} /></button></div><p className="settings-description">Вы выбираете, что оставить личным.</p>
          <div className="category-list">{categories.map(({ id, label, icon: Icon }) => {
            const matches = areas.filter((area) => area.category === id);
            const enabled = matches.length > 0 && matches.every((area) => area.selected);
            return <button className="category-row" key={id} role="switch" aria-checked={enabled} disabled={!doc || !matches.length || !!busy} onClick={() => changeAreas(areas.map((area) => area.category === id ? { ...area, selected: !enabled } : area))}><Icon size={15} strokeWidth={1.6} /><span>{label}</span><span className="category-count">{matches.length}</span><span className={`toggle ${enabled ? 'on' : ''}`}><span /></span></button>;
          })}</div>
          <button className="button analyze-button full-width" onClick={() => void analyze()} disabled={!doc || !!busy || scanning}>{scanning ? <LoaderCircle size={15} className="spin" /> : <ScanLine size={16} />}{scanning ? 'Проверяем локально...' : 'Найти чувствительные данные'}</button>
          <div className="analysis-result"><CheckCircleIcon /><span>{doc ? `Найдено ${areas.length} ${areas.length === 1 ? 'область' : 'областей'}` : 'Откройте файл для проверки'}</span><span>LOCAL</span></div>
          <div className="settings-separator" />
          <div className="setting-section-title"><h3>Как скрыть</h3><span className="tiny-label">БЕЗ ВОССТАНОВЛЕНИЯ</span></div>
          <div className="fill-options"><button className={color === '#202420' ? 'active' : ''} onClick={() => setColor('#202420')} aria-pressed={color === '#202420'}><span className="fill-sample black"><span /><span /></span><span>Черная заливка</span>{color === '#202420' && <Check size={12} />}</button><button className={color === '#ffffff' ? 'active' : ''} onClick={() => setColor('#ffffff')} aria-pressed={color === '#ffffff'}><span className="fill-sample white"><span /><span /></span><span>Белая заливка</span>{color === '#ffffff' && <Check size={12} />}</button></div>
          <label className="metadata-checkbox"><input type="checkbox" checked={removeMetadata} onChange={(event) => setRemoveMetadata(event.target.checked)} /><span className="custom-checkbox">{removeMetadata && <Check size={10} />}</span><span>Очистить метаданные</span><LockKeyhole size={12} /></label>
          <p className="metadata-hint">Исходный текст и скрытые слои<br />не попадут в экспорт.</p>
          {areas.some((area) => area.category === 'manual') && <div className="manual-count"><span>Вручную: {areas.filter((area) => area.category === 'manual').length}</span><button onClick={() => changeAreas(areas.filter((area) => area.category !== 'manual'))}>Убрать</button></div>}
        </div>
        <div className="export-section"><div className="export-summary"><span><ShieldCheck size={14} />{selectedCount} {selectedCount === 1 ? 'область будет скрыта' : 'областей будут скрыты'}</span><div className="format-select"><select value={format} onChange={(event) => setFormat(event.target.value as 'pdf' | 'png')} aria-label="Формат экспорта"><option value="pdf">PDF</option>{(!doc || doc.pages.length === 1) && <option value="png">PNG</option>}</select><ChevronDown size={10} /></div></div><motion.button className="button primary export-button full-width" whileTap={{ scale: 0.98 }} onClick={() => void exportFile()} disabled={!doc || !!busy || scanning}>{busy ? <LoaderCircle size={16} className="spin" /> : <Download size={16} />}<span>{busy ? 'Обрабатываем...' : 'Скачать безопасную копию'}</span></motion.button><p>Оригинал останется нетронутым</p></div>
      </aside>
      <AnimatePresence>{(!!busy || dragOver) && <motion.div className={`workspace-overlay ${dragOver ? 'drop-overlay' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{dragOver ? <><Upload size={35} /><h3>Файл останется здесь.</h3><p>Отпустите, чтобы открыть локально.</p></> : <><LoaderCircle size={29} className="spin" /><h3>{busy}</h3><p>Только ресурсы вашего устройства.</p></>}</motion.div>}</AnimatePresence>
    </motion.div>}
  </section>;
}

function CheckCircleIcon() {
  return <span className="analysis-check"><Check size={9} strokeWidth={2.5} /></span>;
}