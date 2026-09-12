// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";

let TurnstileCaptcha: typeof import("@/components/auth/TurnstileCaptcha").default;

const renderMock = vi.fn<
  (container: HTMLElement, options: { callback: (t: string) => void }) => string
>(() => "widget-1");
const removeMock = vi.fn();

beforeEach(async () => {
  vi.useRealTimers();
  renderMock.mockClear();
  removeMock.mockClear();
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "0xTEST_TEST_TEST";
  vi.resetModules();
  TurnstileCaptcha = (await import("@/components/auth/TurnstileCaptcha")).default;
  (globalThis as { document: Document }).document
    .querySelectorAll("script[data-turnstile]")
    .forEach((s) => s.remove());
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete (window as { turnstile?: unknown }).turnstile;
});

function stubTurnstile() {
  (window as unknown as { turnstile: Record<string, unknown> }).turnstile = {
    render: renderMock,
    reset: vi.fn(),
    remove: removeMock,
  };
}

function fireScriptLoad() {
  const script = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
  expect(script).toBeTruthy();
  act(() => script!.dispatchEvent(new Event("load")));
}

describe("TurnstileCaptcha — регрессия «виджет пересоздавался при вводе»", () => {
  it("рендерит виджет ровно один раз, даже если onToken — новая стрелка при каждом рендере", () => {
    const { rerender } = render(<TurnstileCaptcha onToken={(t) => void t} />);
    stubTurnstile();
    fireScriptLoad();
    expect(renderMock).toHaveBeenCalledTimes(1);

    // Ключевая регрессия: родитель перерендеривается с НОВОЙ стрелкой onToken
    // (как в login/page.tsx) — виджет НЕ должен пересоздаваться.
    rerender(<TurnstileCaptcha onToken={(t) => void t} />);
    rerender(<TurnstileCaptcha onToken={(t) => void t} />);
    expect(renderMock).toHaveBeenCalledTimes(1);
  });

  it("callback из виджета попадает в актуальный onToken после перерендера родителя", () => {
    const seen: (string | null)[] = [];
    const { rerender } = render(<TurnstileCaptcha onToken={(t) => seen.push(t)} />);
    stubTurnstile();
    fireScriptLoad();
    rerender(<TurnstileCaptcha onToken={(t) => seen.push(`v2:${t}`)} />);
    const opts = renderMock.mock.calls[0][1];
    act(() => opts.callback("TOKEN"));
    expect(seen).toContain("v2:TOKEN");
  });

  it("при недоступности API показывает fallback с кнопкой повтора, а не пустоту", async () => {
    // window.turnstile НЕ определён даже после load-события → error-панель
    render(<TurnstileCaptcha onToken={() => undefined} />);
    const script = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
    act(() => script!.dispatchEvent(new Event("load")));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText(/Повторить загрузку капчи/)).toBeTruthy();
  });

  it("таймаут загрузки скрипта (блокировщик Opera) → fallback-панель", async () => {
    vi.useFakeTimers();
    render(<TurnstileCaptcha onToken={() => undefined} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    expect(screen.queryByText(/Повторить загрузку капчи/)).toBeTruthy();
    vi.useRealTimers();
  });

  it("на unmount виджет удаляется через turnstile.remove", () => {
    const { unmount } = render(<TurnstileCaptcha onToken={() => undefined} />);
    stubTurnstile();
    fireScriptLoad();
    unmount();
    expect(removeMock).toHaveBeenCalledWith("widget-1");
  });
});
