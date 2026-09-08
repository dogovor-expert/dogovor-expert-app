import { request } from "node:http";

const HOST = "testca2012.cryptopro.ru";

const URIs = [
  {
    name: "TSP (Служба штампов времени)",
    host: HOST,
    path: "/tsp/tsp.srf",
    method: "POST",
    timeoutMs: 5000,
  },
  {
    name: "OCSP (Служба проверки статуса)",
    host: HOST,
    path: "/ocsp/ocsp.srf",
    method: "POST",
    timeoutMs: 5000,
  },
  {
    name: "CRL (Список отозванных сертификатов)",
    host: HOST,
    path: "/ui/CaCerts.aspx",
    method: "GET",
    timeoutMs: 8000,
  },
];

function probe({ host, path, method, timeoutMs }) {
  return new Promise((resolve) => {
    let requestObj;
    const timer = setTimeout(() => {
      requestObj.destroy();
      resolve({ status: "timeout", code: null, ms: timeoutMs });
    }, timeoutMs);
    const started = Date.now();
    requestObj = request(
      { host, path, method, headers: { "User-Agent": "ukep-live-test/1.0" } },
      (res) => {
        clearTimeout(timer);
        let size = 0;
        res.on("data", (chunk) => (size += chunk.length));
        res.on("end", () =>
          resolve({
            status: res.statusCode >= 200 && res.statusCode < 300 ? "ok" : "http-error",
            code: res.statusCode,
            bytes: size,
            ms: Date.now() - started,
          }),
        );
        res.on("error", () => resolve({ status: "network-error", code: null, bytes: 0, ms: Date.now() - started }));
      },
    );
    requestObj.on("error", () => {
      clearTimeout(timer);
      resolve({ status: "network-error", code: null, bytes: 0, ms: Date.now() - started });
    });
    requestObj.write(Buffer.alloc(0));
    requestObj.end();
  });
}

const results = [];
for (const spec of URIs) {
  const r = await probe(spec);
  results.push({ service: spec.name, url: `http://${spec.host}${spec.path}`, ...r });
}

console.table(results, ["service", "url", "status", "code", "bytes", "ms"]);

const ok = results.filter((r) => r.status === "ok").length;
console.log(`\nДоступно: ${ok}/${results.length}`);
if (ok < results.length) {
  console.log("Часть сервисов тестового контура КриптоПро недоступна — это не ошибка теста.");
  process.exitCode = 1;
}