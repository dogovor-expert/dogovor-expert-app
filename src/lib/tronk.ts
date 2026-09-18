const TRONK_BASE = "https://data.tronk.info";

const REPORT_POLL_MS = 4000;
const REPORT_MAX_WAIT_MS = 45_000;

export function getTronkToken(): string {
  return process.env.TRONK_API_KEY?.trim() || "";
}

type Json = Record<string, unknown>;

interface TronkService {
  IsComplete?: unknown;
  IsCancel?: unknown;
}

interface TronkTask {
  id?: unknown;
  ID?: unknown;
  Id?: unknown;
  Status?: unknown;
  StatusServices?: TronkService[];
}

type TronkResponse = Json & {
  __error?: boolean;
  __msg?: string;
  id?: unknown;
  ID?: unknown;
  Id?: unknown;
  Task?: TronkTask;
};

async function tronkGet(
  method: string,
  params: Record<string, string | number | null>
): Promise<TronkResponse> {
  const token = getTronkToken();
  if (!token) throw new Error("TRONK_API_KEY not configured");

  const url = new URL(`${TRONK_BASE}/${method}.ashx`);
  url.searchParams.set("key", token);
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined) url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`tronk ${method}: HTTP ${res.status}`);
  const json = (await res.json().catch(() => null)) as Json | null;
  if (!json) throw new Error(`tronk ${method}: empty response`);

  if (json.Error === true || json.error === true) {
    const rawMsg = json.ErrorMsg ?? json.error_msg;
    const msg = typeof rawMsg === "string" ? rawMsg : typeof rawMsg === "number" ? String(rawMsg) : "Нет доступа";
    return { __error: true, __msg: msg };
  }
  return json;
}

function extractTaskId(createResp: TronkResponse | null): string | null {
  if (!createResp) return null;
  const id =
    createResp.id ??
    createResp.ID ??
    createResp.Id ??
    createResp.Task?.id ??
    createResp.Task?.ID;
  if (id === null || id === undefined) return null;
  if (typeof id === "string") return id;
  if (typeof id === "number") return String(id);
  return null;
}

function servicesReady(task: TronkTask): boolean {
  const services = task.StatusServices ?? [];
  if (services.length === 0) return false;
  return services.every((s) => s?.IsComplete === true);
}

function servicesFailed(task: TronkTask): boolean {
  const services = task.StatusServices ?? [];
  return services.some((s) => s?.IsCancel === true);
}

async function fetchResultIfReady(
  id: string
): Promise<{ status: "ready" | "pending" | "failed"; report?: Json }> {
  const check = await tronkGet("reportjson", { mode: "check", id });
  if (check.__error) return { status: "failed" };
  const task: TronkTask = check.Task ?? {};
  if (task.Status === 1 || servicesReady(task)) {
    const result = await tronkGet("reportjson", { mode: "result", id });
    if (result.__error) return { status: "failed" };
    return { status: "ready", report: result };
  }
  if (servicesFailed(task)) return { status: "failed" };
  return { status: "pending" };
}

/** Блокирующий опрос готовности (для вебхука, ограничен по времени). */
async function waitForReport(id: string): Promise<{
  status: "ready" | "pending" | "failed";
  report?: Json;
}> {
  const deadline = Date.now() + REPORT_MAX_WAIT_MS;
  while (Date.now() < deadline) {
    const r = await fetchResultIfReady(id);
    if (r.status !== "pending") return r;
    await new Promise((res) => setTimeout(res, REPORT_POLL_MS));
  }
  return { status: "pending" };
}

export interface ReportBundle {
  vin: string;
  sources: Record<string, unknown>;
}

/**
 * Собирает полный отчёт по VIN через TRONK reportjson (генератор отчётов,
 * входит в тариф «Стандарт»: ГИБДД, ДТП, розыск, ограничения, залоги, VIN).
 *
 * Асинхронный метод: create → check → result. Если за окно REPORT_MAX_WAIT_MS
 * отчёт не сгенерирован, возвращается { tronk_task_id } — вебхук оставляет
 * запись в статусе pending, а финальную сборку доводит /api/autoteka/check.
 */
export async function collectReport(
  vin: string,
  premium = false
): Promise<ReportBundle> {
  const create = await tronkGet("reportjson", { mode: "create", vin });
  if (create.__error) {
    return { vin, sources: { error: true, error_msg: create.__msg ?? "Нет доступа" } };
  }
  const id = extractTaskId(create);
  if (!id) {
    return { vin, sources: { error: true, error_msg: "Не получен ID задачи отчёта" } };
  }

  const res = await waitForReport(id);
  if (res.status === "ready" && res.report) {
    const sources: Record<string, unknown> = { reportjson: res.report };
    if (premium) sources.premium = true;
    return { vin, sources };
  }
  if (res.status === "pending") {
    const sources: Record<string, unknown> = { tronk_task_id: id, pending: true };
    if (premium) sources.premium = true;
    return { vin, sources };
  }
  return { vin, sources: { error: true, error_msg: "Генерация отчёта не удалась" } };
}

/** Один шаг опроса для /api/autoteka/check (без долгого цикла). */
export async function peekReportTask(
  taskId: string
): Promise<{ status: "ready" | "pending" | "failed"; report?: Json }> {
  return fetchResultIfReady(taskId);
}
