import { parseHTML } from "linkedom";
import createDOMPurify, { type WindowLike } from "dompurify";

function createLinkedomDOMPurify() {
  const { window } = parseHTML("<!doctype html><html><body></body></html>");
  return createDOMPurify(window);
}

/**
 * Серверный DOMPurify без jsdom.
 *
 * isomorphic-dompurify тянул jsdom, а тот — css-tree, который на runtime
 * читает data/patch.json через createRequire (nft не трассирует этот файл
 * в лямбду Vercel → 500 на /builder и связанных страницах). linkedom —
 * лёгкая DOM-реализация без чтения файлов из node_modules, поэтому чисто
 * бандлится. Ядро санитизации — тот же dompurify, конфиг sanitize не меняется.
 *
 * В браузере используем нативный window (linkedom исключён из клиентских
 * бандлов через webpack resolve.alias — там он не нужен и раздувал бы бандл).
 */
const DOMPurify =
  typeof window !== "undefined"
    ? createDOMPurify(window)
    : createLinkedomDOMPurify();

export default DOMPurify;