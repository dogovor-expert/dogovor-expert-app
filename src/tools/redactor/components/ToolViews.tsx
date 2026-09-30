import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import {
  ArrowDown, ArrowRight, ArrowUp, AudioLines, Check, ChevronDown, Clock3,
  Download, FileStack, FileText, FolderClock, Image, Info, Link2, LoaderCircle,
  LockKeyhole, Pause, Play, Plus, RotateCw, Scissors, ShieldCheck, SlidersHorizontal,
  Upload, Volume2, X,
} from 'lucide-react';
import { canvasBlob, downloadBlob, encodeWav, formatBytes, loadImage, parsePageRange, uid } from '../lib/local-tools';
import type { HistoryEntry, ToolId, ToolProps } from '../types';

function ToolTab({ children, technology }: { children: React.ReactNode; technology: string }) {
  return <div className="workspace-tabs"><div className="tab-buttons"><span className="active static-tab">{children}</span></div><span className="technology-label"><span />{technology} / LOCAL</span></div>;
}

function UploadZone({ kind, onOpen, onFiles, disabled = false }: { kind: 'image' | 'audio' | 'pdf'; onOpen: () => void; onFiles: (files: File[]) => void; disabled?: boolean }) {
  const [over, setOver] = useState(false);
  const Icon = kind === 'image' ? Image : kind === 'audio' ? AudioLines : FileStack;
  return <div className={`upload-dropzone ${over ? 'over' : ''}`} onDragOver={(event) => { event.preventDefault(); if (!disabled) setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(event) => { event.preventDefault(); setOver(false); if (!disabled) onFiles(Array.from(event.dataTransfer.files)); }}>
    <div className="upload-art" aria-hidden="true"><div /><div /><span><Icon size={45} strokeWidth={1.1} /></span><span className="upload-art-plus"><Plus size={18} /></span></div>
    <h2>{kind === 'image' ? 'Большие изображения. Маленькие файлы.' : kind === 'audio' ? 'Хороший звук. Только нужная часть.' : 'Один документ. Никакой головной боли.'}</h2>
    <p>Перетащите {kind === 'image' ? 'изображение' : kind === 'audio' ? 'аудиофайл' : 'PDF-файлы'} сюда<br />или выберите {kind === 'pdf' ? 'их' : 'его'} на устройстве.</p>
    <button className="button primary" onClick={onOpen} disabled={disabled}><Upload size={16} />Выбрать {kind === 'pdf' ? 'файлы' : 'файл'}</button>
    <span className="upload-supported">{kind === 'image' ? 'PNG, JPEG, WebP, GIF, AVIF, BMP' : kind === 'audio' ? 'MP3, WAV, OGG, M4A и другие форматы браузера' : 'PDF · Без искусственных лимитов размера'}</span>
    <span className="upload-local"><LockKeyhole size={12} />Никаких загрузок на сервер</span>
  </div>;
}

interface ImageSource { file: File; url: string; image: HTMLImageElement; width: number; height: number }

export function ImageTool({ batch, onOpen, notify, onExport }: ToolProps) {
  const [source, setSource] = useState<ImageSource | null>(null);
  const [format, setFormat] = useState('image/webp');
  const [quality, setQuality] = useState(85);
  const [width, setWidth] = useState(1600);
  const [height, setHeight] = useState(1200);
  const [locked, setLocked] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [comparison, setComparison] = useState<'result' | 'original'>('result');
  const sourceUrl = useRef('');
  const lastBatch = useRef('');
  const loadRequest = useRef(0);

  const openImage = useCallback(async (file: File) => {
    if (!file) return;
    const request = ++loadRequest.current;
    setLoading(true);
    const url = URL.createObjectURL(file);
    try {
      const image = await loadImage(url);
      if (request !== loadRequest.current) { URL.revokeObjectURL(url); return; }
      if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current);
      sourceUrl.current = url;
      setSource({ file, url, image, width: image.naturalWidth, height: image.naturalHeight });
      setWidth(image.naturalWidth); setHeight(image.naturalHeight); setRotation(0); setOutput(null);
      notify('Изображение открыто. Настройте размер и формат.', 'info');
    } catch (error) { URL.revokeObjectURL(url); if (request === loadRequest.current) notify(error instanceof Error ? error.message : 'Не удалось открыть изображение.', 'error'); }
    finally { if (request === loadRequest.current) setLoading(false); }
  }, [notify]);

  useEffect(() => {
    if (!batch || lastBatch.current === batch.id) return;
    lastBatch.current = batch.id;
    void openImage(batch.files[0]);
  }, [batch, openImage]);

  useEffect(() => () => { if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current); }, []);

  useEffect(() => {
    if (!source) return;
    let canceled = false;
    setBusy(true);
    setOutput(null);
    const timer = setTimeout(async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(width)); canvas.height = Math.max(1, Math.round(height));
        const context = canvas.getContext('2d')!;
        if (format === 'image/jpeg') { context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height); }
        context.imageSmoothingQuality = 'high';
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(rotation * Math.PI / 180);
        const sideways = rotation % 180 !== 0;
        const imageWidth = sideways ? canvas.height : canvas.width;
        const imageHeight = sideways ? canvas.width : canvas.height;
        context.drawImage(source.image, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
        const blob = await canvasBlob(canvas, format, quality / 100);
        if (!canceled) setOutput(blob);
      } catch (error) { if (!canceled) notify(error instanceof Error ? error.message : 'Не удалось обработать изображение.', 'error'); }
      finally { if (!canceled) setBusy(false); }
    }, 250);
    return () => { canceled = true; clearTimeout(timer); };
  }, [source, width, height, quality, format, rotation, notify]);

  useEffect(() => {
    if (!output) { setPreviewUrl(''); return; }
    const url = URL.createObjectURL(output);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [output]);

  const aspect = source ? (rotation % 180 !== 0 ? source.height / source.width : source.width / source.height) : 4 / 3;
  const updateWidth = (value: number) => { const next = Math.max(1, Math.round(value || 1)); setWidth(next); if (locked) setHeight(Math.max(1, Math.round(next / aspect))); };
  const updateHeight = (value: number) => { const next = Math.max(1, Math.round(value || 1)); setHeight(next); if (locked) setWidth(Math.max(1, Math.round(next * aspect))); };
  const saveImage = () => {
    if (!output || !source || busy) return;
    const extension = output.type === 'image/jpeg' ? 'jpg' : output.type === 'image/webp' ? 'webp' : 'png';
    const name = `${source.file.name.replace(/\.[^.]+$/, '')}_optimized.${extension}`;
    downloadBlob(output, name); onExport(name, output.size, 'images');
  };
  const saving = output && source ? Math.round((1 - output.size / source.file.size) * 100) : 0;

  return <section className="tool-view"><ToolTab technology="CANVAS">Оптимизация и конвертация</ToolTab><div className="secondary-workspace">
    <div className="secondary-preview">
      {source ? <><div className="document-filebar"><span className="file-icon"><Image size={20} /></span><div className="file-name"><strong>{source.file.name}</strong><span>{source.width} × {source.height} px · {formatBytes(source.file.size)}</span></div><button className="replace-file" onClick={onOpen}><Upload size={14} />Заменить</button></div><div className="image-comparison-tabs"><button className={comparison === 'original' ? 'active' : ''} onClick={() => setComparison('original')}>Оригинал</button><button className={comparison === 'result' ? 'active' : ''} onClick={() => setComparison('result')}>Результат{busy && <LoaderCircle size={12} className="spin" />}</button></div><div className="image-preview-surface"><img src={comparison === 'original' || !previewUrl ? source.url : previewUrl} alt={comparison === 'original' ? 'Исходное изображение' : 'Обработанное изображение'} /></div><div className="image-output-summary"><span>{comparison === 'original' ? `${source.width} × ${source.height}` : `${width} × ${height}`} px</span><span>{output ? formatBytes(output.size) : 'Обработка...'}{saving > 0 && <strong> -{saving}%</strong>}</span></div></> : <UploadZone kind="image" onOpen={onOpen} onFiles={(files) => void openImage(files[0])} disabled={loading} />}
      {loading && <div className="workspace-overlay"><LoaderCircle className="spin" size={26} /><h3>Открываем изображение...</h3></div>}
    </div>
    <aside className="utility-settings"><div className="settings-header"><SlidersHorizontal size={16} /><h2>Параметры изображения</h2></div><div className="utility-settings-body"><h3>Формат</h3><div className="select-wrap"><select value={format} onChange={(event) => setFormat(event.target.value)} aria-label="Формат изображения"><option value="image/webp">WebP - компактный</option><option value="image/jpeg">JPEG - универсальный</option><option value="image/png">PNG - без потерь</option></select><ChevronDown size={14} /></div><div className="range-label"><label htmlFor="image-quality">Качество</label><span>{format === 'image/png' ? 'Без потерь' : `${quality}%`}</span></div><input id="image-quality" type="range" min="10" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} disabled={format === 'image/png'} /><p className="field-hint">{format === 'image/png' ? 'PNG сохраняет все пиксели, качество не меняется.' : '85% - хороший баланс качества и размера.'}</p><div className="settings-separator" /><div className="setting-section-title"><h3>Размер</h3><button className={`icon-button ${locked ? 'green' : ''}`} onClick={() => setLocked(!locked)} aria-pressed={locked} title="Сохранять пропорции"><Link2 size={15} /></button></div><div className="dimension-inputs"><label>Ширина<input type="number" min="1" value={width} onChange={(event) => updateWidth(Number(event.target.value))} disabled={!source} /></label><span>×</span><label>Высота<input type="number" min="1" value={height} onChange={(event) => updateHeight(Number(event.target.value))} disabled={!source} /></label></div><div className="scale-options">{[100, 75, 50, 25].map((percent) => <button key={percent} disabled={!source} onClick={() => { if (source) updateWidth(Math.round((rotation % 180 !== 0 ? source.height : source.width) * percent / 100)); }}>{percent}%</button>)}</div><button className="button secondary full-width rotate-button" disabled={!source} onClick={() => { setRotation((value) => (value + 90) % 360); setWidth(height); setHeight(width); }}><RotateCw size={14} />Повернуть на 90°</button><div className="settings-separator" /><div className="utility-note"><ShieldCheck size={17} /><p>Новая копия без исходных EXIF-данных и геолокации. Оригинал не меняется.</p></div></div><div className="export-section"><div className="export-summary"><span>{output ? `Результат: ${formatBytes(output.size)}` : 'Готово к локальной обработке'}</span></div><button className="button primary full-width" disabled={!output || busy || loading} onClick={saveImage}>{busy ? <LoaderCircle size={16} className="spin" /> : <Download size={16} />}Скачать изображение</button><p>Без водяных знаков и ограничений</p></div></aside>
  </div></section>;
}

function timeLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${rest.toFixed(1).padStart(4, '0')}`;
}

export function AudioTool({ batch, onOpen, notify, onExport, active }: ToolProps) {
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(1);
  const [gain, setGain] = useState(100);
  const [mono, setMono] = useState(false);
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const playback = useRef<{ context: AudioContext; source: AudioBufferSourceNode } | null>(null);
  const lastBatch = useRef('');
  const loadRequest = useRef(0);

  const stop = useCallback(() => {
    if (playback.current) {
      const { source, context } = playback.current;
      source.onended = null;
      try { source.stop(); } catch { /* The source may have already finished. */ }
      void context.close();
      playback.current = null;
    }
    setPlaying(false);
  }, []);

  const openAudio = useCallback(async (nextFile: File) => {
    if (!nextFile) return;
    const request = ++loadRequest.current;
    stop(); setBusy(true);
    let context: AudioContext | null = null;
    try {
      context = new AudioContext();
      const decoded = await context.decodeAudioData(await nextFile.arrayBuffer());
      if (request !== loadRequest.current) return;
      setBuffer(decoded); setFile(nextFile); setStart(0); setEnd(decoded.duration);
      notify('Аудио декодировано на устройстве. Выберите нужный фрагмент.', 'info');
    } catch { if (request === loadRequest.current) notify('Браузер не смог прочитать этот формат. Попробуйте MP3, WAV, OGG или M4A.', 'error'); }
    finally { if (context) void context.close(); if (request === loadRequest.current) setBusy(false); }
  }, [notify, stop]);

  useEffect(() => {
    if (!batch || lastBatch.current === batch.id) return;
    lastBatch.current = batch.id;
    void openAudio(batch.files[0]);
  }, [batch, openAudio]);
  useEffect(() => { if (!active) stop(); }, [active, stop]);
  useEffect(() => () => { if (playback.current) { try { playback.current.source.stop(); } catch { /* Already stopped. */ } void playback.current.context.close(); } }, []);

  const waveform = useMemo(() => {
    if (!buffer) return [];
    const data = buffer.getChannelData(0);
    const step = Math.max(1, Math.floor(data.length / 180));
    return Array.from({ length: 180 }, (_, index) => {
      let sum = 0; let count = 0;
      const sampleStep = Math.max(1, Math.floor(step / 150));
      for (let position = index * step; position < Math.min(data.length, (index + 1) * step); position += sampleStep) { sum += data[position] ** 2; count++; }
      return Math.max(3, Math.min(180, Math.sqrt(sum / Math.max(1, count)) * 330));
    });
  }, [buffer]);

  const play = async () => {
    if (playing) { stop(); return; }
    if (!buffer) return;
    try {
      const context = new AudioContext();
      await context.resume();
      const source = context.createBufferSource();
      const volume = context.createGain();
      source.buffer = buffer; volume.gain.value = gain / 100;
      if (mono) { volume.channelCount = 1; volume.channelCountMode = 'explicit'; }
      source.connect(volume); volume.connect(context.destination);
      playback.current = { context, source };
      source.onended = () => { setPlaying(false); playback.current = null; void context.close(); };
      source.start(0, start, end - start); setPlaying(true);
    } catch { notify('Воспроизведение недоступно в этом браузере.', 'error'); }
  };

  const saveAudio = async () => {
    if (!buffer || !file) return;
    stop(); setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 30));
    try {
      const blob = encodeWav(buffer, start, end, gain / 100, mono);
      const name = `${file.name.replace(/\.[^.]+$/, '')}_edited.wav`;
      downloadBlob(blob, name); onExport(name, blob.size, 'audio');
    } catch { notify('Недостаточно памяти для экспорта. Попробуйте более короткий фрагмент.', 'error'); }
    finally { setBusy(false); }
  };

  const updateStart = (value: number) => { stop(); setStart(Math.max(0, Math.min(end - 0.01, value || 0))); };
  const updateEnd = (value: number) => { stop(); setEnd(Math.max(start + 0.01, Math.min(buffer?.duration ?? 1, value || 0))); };

  return <section className="tool-view"><ToolTab technology="WEB AUDIO">Обрезка и обработка аудио</ToolTab><div className="secondary-workspace">
    <div className="secondary-preview audio-preview">
      {buffer && file ? <><div className="document-filebar"><span className="file-icon"><AudioLines size={20} /></span><div className="file-name"><strong>{file.name}</strong><span>{timeLabel(buffer.duration)} · {(buffer.sampleRate / 1000).toFixed(1)} кГц · {buffer.numberOfChannels} кан. · {formatBytes(file.size)}</span></div><button className="replace-file" onClick={onOpen}><Upload size={14} />Заменить</button></div><div className="waveform-content"><div className="waveform-heading"><span>ВАШ ЗВУК. ВАША ТЕРРИТОРИЯ.</span><span>{timeLabel(end - start)} выбрано</span></div><div className="waveform-frame"><svg viewBox="0 0 1000 210" preserveAspectRatio="none" aria-label="Звуковая волна"><line x1="0" x2="1000" y1="105" y2="105" stroke="#d9dfd5" />{waveform.map((value, index) => <rect key={index} x={index * 1000 / 180} y={105 - value / 2} width="3.1" height={value} rx="1.5" fill={index / 180 >= start / buffer.duration && index / 180 <= end / buffer.duration ? '#628367' : '#d1d8cc'} />)}</svg><div className="trim-marker start" style={{ left: `${start / buffer.duration * 100}%` }}><span /></div><div className="trim-marker end" style={{ left: `${end / buffer.duration * 100}%` }}><span /></div></div><div className="waveform-times"><span>00:00.0</span><span>{timeLabel(buffer.duration / 2)}</span><span>{timeLabel(buffer.duration)}</span></div><div className="audio-transport"><button className={`play-button ${playing ? 'playing' : ''}`} onClick={() => void play()} aria-label={playing ? 'Остановить' : 'Воспроизвести выделение'}>{playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button><div><strong>{playing ? 'Слушаем фрагмент' : 'Послушать выделение'}</strong><span>{timeLabel(start)} - {timeLabel(end)}</span></div><button className="text-button" onClick={() => { stop(); setStart(0); setEnd(buffer.duration); }}>Выбрать все</button></div><div className="audio-instructions"><Scissors size={16} /><p>Задайте начало и конец в настройках справа. При экспорте останется только выбранный фрагмент.</p></div></div></> : <UploadZone kind="audio" onOpen={onOpen} onFiles={(files) => void openAudio(files[0])} disabled={busy} />}
      {busy && <div className="workspace-overlay"><LoaderCircle className="spin" size={26} /><h3>{buffer ? 'Готовим WAV...' : 'Читаем аудио локально...'}</h3></div>}
    </div>
    <aside className="utility-settings"><div className="settings-header"><SlidersHorizontal size={16} /><h2>Параметры аудио</h2></div><div className="utility-settings-body"><h3>Нужный фрагмент</h3><label className="field-label" htmlFor="audio-start">Начало, секунды</label><input className="text-input" id="audio-start" type="number" min="0" max={end - 0.01} step="0.1" value={Number(start.toFixed(2))} onChange={(event) => updateStart(Number(event.target.value))} disabled={!buffer} /><input type="range" min="0" max={buffer?.duration ?? 1} step="0.01" value={start} onChange={(event) => updateStart(Number(event.target.value))} disabled={!buffer} aria-label="Начало фрагмента" /><label className="field-label" htmlFor="audio-end">Конец, секунды</label><input className="text-input" id="audio-end" type="number" min={start + 0.01} max={buffer?.duration ?? 1} step="0.1" value={Number(end.toFixed(2))} onChange={(event) => updateEnd(Number(event.target.value))} disabled={!buffer} /><input type="range" min="0" max={buffer?.duration ?? 1} step="0.01" value={end} onChange={(event) => updateEnd(Number(event.target.value))} disabled={!buffer} aria-label="Конец фрагмента" /><div className="settings-separator" /><div className="range-label"><label htmlFor="audio-gain"><Volume2 size={14} />Громкость</label><span>{gain}%</span></div><input id="audio-gain" type="range" min="0" max="200" value={gain} onChange={(event) => { stop(); setGain(Number(event.target.value)); }} /><p className="field-hint">{gain > 100 ? 'При усилении возможен клиппинг.' : 'Оригинальная громкость при 100%.'}</p><label className="metadata-checkbox"><input type="checkbox" checked={mono} onChange={(event) => setMono(event.target.checked)} /><span className="custom-checkbox">{mono && <Check size={10} />}</span><span>Объединить каналы в моно</span></label><div className="utility-note"><Info size={16} /><p>Экспорт в PCM WAV, 16 бит. Без сжатия и исходных тегов.</p></div></div><div className="export-section"><div className="export-summary"><span><Clock3 size={13} />{buffer ? timeLabel(end - start) : 'Выберите аудиофайл'}</span><span className="mono-text">WAV</span></div><button className="button primary full-width" disabled={!buffer || busy} onClick={() => void saveAudio()}><Download size={16} />Скачать фрагмент</button><p>Ваш звук остается вашим</p></div></aside>
  </div></section>;
}

interface PdfSource { id: string; file: File; bytes: ArrayBuffer; pages: number }

export function PdfTool({ batch, onOpen, notify, onExport }: ToolProps) {
  const [files, setFiles] = useState<PdfSource[]>([]);
  const [operation, setOperation] = useState<'merge' | 'extract'>('merge');
  const [range, setRange] = useState('1');
  const [sourceId, setSourceId] = useState('');
  const [cleanMetadata, setCleanMetadata] = useState(true);
  const [busy, setBusy] = useState(false);
  const lastBatch = useRef('');

  const addFiles = useCallback(async (incoming: File[]) => {
    if (!incoming.length) return;
    setBusy(true);
    const next: PdfSource[] = [];
    try {
      for (const file of incoming) {
        try {
          if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) throw new Error('Выберите документ PDF.');
          const bytes = await file.arrayBuffer();
          const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
          next.push({ id: uid(), file, bytes, pages: pdf.getPageCount() });
        } catch { notify(`Не удалось открыть ${file.name}. Проверьте формат и защиту паролем.`, 'error'); }
      }
      if (next.length) { setFiles((previous) => [...previous, ...next]); setSourceId((previous) => previous || next[0].id); setRange('1'); }
    } finally { setBusy(false); }
  }, [notify]);

  useEffect(() => {
    if (!batch || lastBatch.current === batch.id) return;
    lastBatch.current = batch.id;
    void addFiles(batch.files);
  }, [batch, addFiles]);

  const reorder = (index: number, direction: number) => {
    const next = [...files]; const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setFiles(next);
  };
  const selected = files.find((file) => file.id === sourceId) ?? files[0];
  const totalPages = files.reduce((total, file) => total + file.pages, 0);

  const savePdf = async () => {
    if (!files.length || busy) return;
    setBusy(true);
    try {
      const output = await PDFDocument.create();
      const sources = operation === 'merge' ? files : [selected];
      for (const source of sources) {
        const original = await PDFDocument.load(source.bytes, { updateMetadata: false });
        const indices = operation === 'extract' ? parsePageRange(range, source.pages) : original.getPageIndices();
        const pages = await output.copyPages(original, indices);
        pages.forEach((page) => output.addPage(page));
        if (!cleanMetadata && source === sources[0]) {
          output.setTitle(original.getTitle() ?? ''); output.setAuthor(original.getAuthor() ?? ''); output.setSubject(original.getSubject() ?? '');
        }
      }
      output.setProducer('offgrid - local processing'); output.setCreator('offgrid');
      if (cleanMetadata) { output.setTitle(''); output.setAuthor(''); output.setSubject(''); output.setKeywords([]); }
      const bytes = await output.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
      const name = operation === 'merge' ? 'offgrid_merged.pdf' : `${selected.file.name.replace(/\.pdf$/i, '')}_pages.pdf`;
      downloadBlob(blob, name); onExport(name, blob.size, 'pdf');
    } catch (error) { notify(error instanceof Error ? error.message : 'Не удалось обработать PDF.', 'error'); }
    finally { setBusy(false); }
  };

  return <section className="tool-view"><ToolTab technology="PDF-LIB">Сборка документов</ToolTab><div className="secondary-workspace"><div className="secondary-preview pdf-preview">
    {files.length ? <><div className="document-filebar"><span className="file-icon"><FileStack size={20} /></span><div className="file-name"><strong>{files.length} {files.length === 1 ? 'документ' : 'документов'}</strong><span>{totalPages} стр. · {formatBytes(files.reduce((total, file) => total + file.file.size, 0))}</span></div><button className="replace-file" onClick={() => { setFiles([]); setSourceId(''); }} disabled={busy}><X size={14} />Очистить</button></div><div className="pdf-list-heading"><h3>{operation === 'merge' ? 'Порядок документов' : 'Исходные документы'}</h3><span>{operation === 'merge' ? 'Страницы объединятся в этом порядке' : 'Выберите документ в настройках'}</span></div><div className="pdf-file-list">{files.map((source, index) => <div className="pdf-file-row" key={source.id}><span className="pdf-order">{String(index + 1).padStart(2, '0')}</span><div className="pdf-page-symbol"><FileText size={24} strokeWidth={1.3} /><span>PDF</span></div><div className="pdf-file-details"><strong>{source.file.name}</strong><span>{source.pages} стр. · {formatBytes(source.file.size)}</span></div><div className="pdf-order-buttons"><button className="icon-button" disabled={index === 0 || busy} onClick={() => reorder(index, -1)} aria-label={`Переместить ${source.file.name} выше`}><ArrowUp size={15} /></button><button className="icon-button" disabled={index === files.length - 1 || busy} onClick={() => reorder(index, 1)} aria-label={`Переместить ${source.file.name} ниже`}><ArrowDown size={15} /></button><button className="icon-button" disabled={busy} onClick={() => setFiles((current) => current.filter((item) => item.id !== source.id))} aria-label={`Удалить ${source.file.name}`}><X size={15} /></button></div></div>)}</div><button className="add-pdf-button" onClick={onOpen} disabled={busy}><Plus size={17} />Добавить еще PDF</button><div className="pdf-list-footnote"><LockKeyhole size={13} />Документы не сохраняются вне этой вкладки.</div></> : <UploadZone kind="pdf" onOpen={onOpen} onFiles={(incoming) => void addFiles(incoming)} disabled={busy} />}
    {busy && <div className="workspace-overlay"><LoaderCircle className="spin" size={26} /><h3>Работаем с PDF локально...</h3></div>}
  </div><aside className="utility-settings"><div className="settings-header"><SlidersHorizontal size={16} /><h2>Параметры документа</h2></div><div className="utility-settings-body"><h3>Что сделать</h3><div className="operation-options"><button className={operation === 'merge' ? 'active' : ''} onClick={() => setOperation('merge')}><FileStack size={19} /><div><strong>Объединить PDF</strong><span>Все документы в один файл</span></div>{operation === 'merge' && <Check size={14} />}</button><button className={operation === 'extract' ? 'active' : ''} onClick={() => setOperation('extract')}><Scissors size={19} /><div><strong>Извлечь страницы</strong><span>Только то, что нужно</span></div>{operation === 'extract' && <Check size={14} />}</button></div>{operation === 'extract' && <><label className="field-label" htmlFor="pdf-source">Исходный документ</label><div className="select-wrap"><select id="pdf-source" value={selected?.id ?? ''} onChange={(event) => { setSourceId(event.target.value); setRange('1'); }} disabled={!files.length}>{files.length ? files.map((source) => <option value={source.id} key={source.id}>{source.file.name}</option>) : <option>Выберите PDF</option>}</select><ChevronDown size={14} /></div><label className="field-label" htmlFor="pdf-range">Номера страниц</label><input id="pdf-range" className="text-input" value={range} onChange={(event) => setRange(event.target.value)} placeholder="1-3, 5, 7-9" disabled={!files.length} /><p className="field-hint">Например: 1-3, 5, 7-9.{selected ? ` Всего ${selected.pages} стр.` : ''}</p></>}<div className="settings-separator" /><label className="metadata-checkbox"><input type="checkbox" checked={cleanMetadata} onChange={(event) => setCleanMetadata(event.target.checked)} /><span className="custom-checkbox">{cleanMetadata && <Check size={10} />}</span><span>Очистить метаданные</span></label><div className="utility-note"><ShieldCheck size={17} /><p>Текст и качество страниц сохраняются. Оригинальные файлы не изменяются.</p></div></div><div className="export-section"><div className="export-summary"><span>{operation === 'merge' ? `${totalPages} страниц в одном файле` : 'Выбранные страницы в новом PDF'}</span><span className="mono-text">PDF</span></div><button className="button primary full-width" onClick={() => void savePdf()} disabled={busy || (operation === 'merge' ? files.length < 2 : !files.length)}><Download size={16} />{operation === 'merge' ? 'Объединить и скачать' : 'Извлечь и скачать'}</button><p>{operation === 'merge' && files.length < 2 ? 'Добавьте минимум два документа' : 'Никаких водяных знаков'}</p></div></aside></div></section>;
}

const toolNames: Record<ToolId, string> = { redactor: 'Smart Redactor', images: 'Изображения', audio: 'Аудиоредактор', pdf: 'PDF-инструменты', history: 'История' };

export function SessionHistory({ entries, onChooseTool }: { entries: HistoryEntry[]; onChooseTool: (tool: ToolId) => void }) {
  return <section className="tool-view"><ToolTab technology="MEMORY ONLY">Последние операции</ToolTab><div className="history-view">
    {entries.length ? <><div className="history-table-heading"><span>Файл</span><span>Инструмент</span><span>Размер</span><span>Время</span></div>{entries.map((entry) => <motion.div className="history-row" key={entry.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}><div><span className="file-icon"><FileText size={19} /></span><span><strong>{entry.name}</strong><small><Check size={10} />Сохранен на устройстве</small></span></div><button onClick={() => onChooseTool(entry.tool)}>{toolNames[entry.tool]}</button><span>{formatBytes(entry.size)}</span><span>{entry.time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span></motion.div>)}<p className="history-privacy"><LockKeyhole size={13} />Здесь только записи операций, не копии файлов. После обновления страницы история исчезнет.</p></> : <div className="history-empty"><FolderClock size={45} strokeWidth={1.2} /><h2>Чистый лист.</h2><p>Скачайте результат в любом инструменте,<br />и операция появится здесь.</p><button className="button secondary" onClick={() => onChooseTool('redactor')}>Открыть Smart Redactor<ArrowRight size={16} /></button><span><ShieldCheck size={13} />Никакого постоянного хранения</span></div>}
  </div></section>;
}