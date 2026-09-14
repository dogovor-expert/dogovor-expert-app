// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";

let SmartCaptcha: typeof import("@/components/auth/SmartCaptcha").default;

const renderMock = vi.fn<
  (container: HTMLElement, options: { callback: (t: string) => void }) => string
>(() => "widget-1");
const resetMock = vi.fn();
const subscribeMock = vi.fn(
  (_widgetId: string, _event: string, _cb: (arg?: unknown) => void): (() => void) => unsubMock
);
const unsubMock = vi.fn();

beforeEach(async () => {
  vi.useRealTimers();
  renderMock.mockClear();
  resetMock.mockClear();
  subscribeMock.mockClear();
  unsubMock.mockClear();
  subscribeMock.mockImplementation(() => unsubMock);
  process.env.NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY = "ysc1_TEST_TEST_TEST";
  vi.resetModules();
  SmartCaptcha = (await import("@/components/auth/SmartCaptcha")).default;
  (globalThis as { document: Document }).document
    .querySelectorAll("script[data-smartcaptcha]")
    .forEach((s) => s.remove());
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete (window as { smartCaptcha?: unknown }).smartCaptcha;
});

function stubSmartCaptcha() {
  (window as unknown as { smartCaptcha: Record<string, unknown> }).smartCaptcha = {
    render: renderMock,
    reset: resetMock,
    subscribe: subscribeMock,
  };
}

function fireScriptLoad() {
  const script = document.querySelector<HTMLScriptElement>("script[data-smartcaptcha]");
  expect(script).toBeTruthy();
  act(() => script!.dispatchEvent(new Event("load")));
}

describe("SmartCaptcha — регрессия «виджет пересоздавался при вводе»", () => {
  it("рендерит виджет ровно один раз, даже если onToken — новая стрелка при каждом рендере", () => {
    const { rerender } = render(<SmartCaptcha onToken={(t) => void t} />);
    stubSmartCaptcha();
    fireScriptLoad();
    expect(renderMock).toHaveBeenCalledTimes(1);

    // Ключевая регрессия: родитель перерендеривается с НОВОЙ стрелкой onToken
    // (как в login/page.tsx) — виджет НЕ должен пересоздаваться.
    rerender(<SmartCaptcha onToken={(t) => void t} />);
    rerender(<SmartCaptcha onToken={(t) => void t} />);
    expect(renderMock).toHaveBeenCalledTimes(1);
  });

  it("callback из виджета попадает в актуальный onToken после перерендера родителя", () => {
    const seen: (string | null)[] = [];
    const { rerender } = render(<SmartCaptcha onToken={(t) => seen.push(t)} />);
    stubSmartCaptcha();
    fireScriptLoad();
    rerender(<SmartCaptcha onToken={(t) => seen.push(`v2:${t}`)} />);
    const opts = renderMock.mock.calls[0][1];
    act(() => opts.callback("TOKEN"));
    expect(seen).toContain("v2:TOKEN");
  });

  it("подписывается на token-expired и сбрасывает виджет", () => {
    const seen: (string | null)[] = [];
    render(<SmartCaptcha onToken={(t) => seen.push(t)} />);
    stubSmartCaptcha();
    fireScriptLoad();
    expect(subscribeMock).toHaveBeenCalledWith("widget-1", "token-expired", expect.any(Function));
    const expiredCb = subscribeMock.mock.calls[0][2] as () => void;
    act(() => expiredCb());
    expect(seen).toContain(null);
    expect(resetMock).toHaveBeenCalledWith("widget-1");
  });

  it("при недоступности API показывает fallback с кнопкой повтора, а не пустоту", async () => {
    // window.smartCaptcha НЕ определён даже после load-события → error-панель
    render(<SmartCaptcha onToken={() => undefined} />);
    const script = document.querySelector<HTMLScriptElement>("script[data-smartcaptcha]");
    act(() => script!.dispatchEvent(new Event("load")));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText(/Повторить загрузку капчи/)).toBeTruthy();
  });

  it("таймаут загрузки скрипта (блокировщик) → fallback-панель", async () => {
    vi.useFakeTimers();
    render(<SmartCaptcha onToken={() => undefined} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    expect(screen.queryByText(/Повторить загрузку капчи/)).toBeTruthy();
    vi.useRealTimers();
  });

  it("на unmount отписывается от событий виджета", () => {
    const { unmount } = render(<SmartCaptcha onToken={() => undefined} />);
    stubSmartCaptcha();
    fireScriptLoad();
    unmount();
    expect(unsubMock).toHaveBeenCalled();
  });
});
