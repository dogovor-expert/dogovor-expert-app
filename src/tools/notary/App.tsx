import { useCallback, useEffect, useMemo, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Dashboard } from "./components/Dashboard";
import { WatchlistView } from "./components/WatchlistView";
import { DiffView } from "./components/DiffView";
import { Timeline } from "./components/Timeline";
import { SnapshotView } from "./components/SnapshotView";
import { AlertsView } from "./components/AlertsView";
import { CaptureView } from "./components/CaptureView";
import { HowItWorksView } from "./components/HowItWorksView";
import { Toast } from "./components/Toast";
import { alerts, watchedPages } from "./lib/data";
import type { ViewId, WatchedPage } from "./lib/types";
import { shortenHash } from "./lib/format";

interface DiffSelection {
  pageId: string;
  beforeId: string;
  afterId: string;
}

interface SnapshotSelection {
  pageId: string;
  snapshotId: string;
}

const defaultDiffSelection = (page: WatchedPage): DiffSelection => ({
  pageId: page.id,
  beforeId: page.snapshots[1]?.id ?? page.snapshots[0].id,
  afterId: page.snapshots[0].id,
});

const defaultSnapshotSelection = (page: WatchedPage): SnapshotSelection => ({
  pageId: page.id,
  snapshotId: page.snapshots[0].id,
});

export default function App() {
  const [view, setView] = useState<ViewId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const initialPage = watchedPages[0];
  const [diffSelection, setDiffSelection] = useState<DiffSelection>(defaultDiffSelection(initialPage));
  const [snapshotSelection, setSnapshotSelection] = useState<SnapshotSelection>(defaultSnapshotSelection(initialPage));

  const notify = useCallback((message: string) => setToast(message), []);

  const openDiff = useCallback((pageId: string, beforeId?: string, afterId?: string) => {
    const page = watchedPages.find((item) => item.id === pageId) ?? watchedPages[0];
    setDiffSelection({
      pageId: page.id,
      beforeId: beforeId ?? page.snapshots[1]?.id ?? page.snapshots[0].id,
      afterId: afterId ?? page.snapshots[0].id,
    });
    setView("diff");
  }, []);

  const openSnapshot = useCallback((pageId: string, snapshotId?: string) => {
    const page = watchedPages.find((item) => item.id === pageId) ?? watchedPages[0];
    const chosen = page.snapshots.find((snap) => snap.id === snapshotId) ?? page.snapshots[0];
    setSnapshotSelection({ pageId: page.id, snapshotId: chosen.id });
    setView("snapshot");
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        setView("capture");
      }
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;
  const totalSnapshots = watchedPages.reduce((sum, page) => sum + page.snapshots.length, 0);

  const diffPage = useMemo(
    () => watchedPages.find((item) => item.id === diffSelection.pageId) ?? watchedPages[0],
    [diffSelection.pageId],
  );
  const diffBefore = useMemo(
    () => diffPage.snapshots.find((snap) => snap.id === diffSelection.beforeId) ?? diffPage.snapshots[1] ?? diffPage.snapshots[0],
    [diffPage, diffSelection.beforeId],
  );
  const diffAfter = useMemo(
    () => diffPage.snapshots.find((snap) => snap.id === diffSelection.afterId) ?? diffPage.snapshots[0],
    [diffPage, diffSelection.afterId],
  );

  const snapshotPage = useMemo(
    () => watchedPages.find((item) => item.id === snapshotSelection.pageId) ?? watchedPages[0],
    [snapshotSelection.pageId],
  );
  const activeSnapshot = useMemo(
    () => snapshotPage.snapshots.find((snap) => snap.id === snapshotSelection.snapshotId) ?? snapshotPage.snapshots[0],
    [snapshotPage, snapshotSelection.snapshotId],
  );

  const handleCopyHash = useCallback(
    (hash: string) => {
      const short = shortenHash(hash);
      const attempt = navigator.clipboard?.writeText?.(hash);
      if (attempt && typeof attempt.then === "function") {
        attempt
          .then(() => notify(`Отпечаток ${short} скопирован в буфер обмена`))
          .catch(() => notify(`Отпечаток: ${short}`));
      } else {
        notify(`Отпечаток: ${short}`);
      }
    },
    [notify],
  );

  return (
    <div className="min-h-screen bg-[color:var(--color-paper)] text-[color:var(--color-ink)]">
      <div className="mx-auto flex max-w-[1500px]">
        <Sidebar
          activeView={view}
          onSelect={(next) => {
            if (next === "diff") {
              setDiffSelection(defaultDiffSelection(diffPage));
            }
            if (next === "snapshot") {
              setSnapshotSelection(defaultSnapshotSelection(snapshotPage));
            }
            setView(next);
          }}
          alerts={alerts}
          totalSnapshots={totalSnapshots}
          totalPages={watchedPages.length}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar
            onOpenNav={() => setSidebarOpen(true)}
            onCapture={() => setView("capture")}
            onOpenAlerts={() => setView("alerts")}
            criticalCount={criticalCount}
          />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1200px] space-y-6">
              {view === "dashboard" && (
                <Dashboard
                  pages={watchedPages}
                  alerts={alerts}
                  onOpenDiff={(pageId) => openDiff(pageId)}
                  onOpenSnapshot={(pageId, snapshotId) => openSnapshot(pageId, snapshotId)}
                  onOpenAlerts={() => setView("alerts")}
                  onCapture={() => setView("capture")}
                  onOpenHow={() => setView("how")}
                />
              )}

              {view === "watchlist" && (
                <WatchlistView
                  pages={watchedPages}
                  onOpenPage={(pageId) => openSnapshot(pageId)}
                  onOpenDiff={(pageId) => openDiff(pageId)}
                />
              )}

              {view === "diff" && (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <DiffView
                    page={diffPage}
                    before={diffBefore}
                    after={diffAfter}
                    onSelectSnapshot={(snapshotId) => openSnapshot(diffPage.id, snapshotId)}
                    onOpenSnapshot={() => openSnapshot(diffPage.id, diffAfter.id)}
                  />
                  <Timeline
                    page={diffPage}
                    activeSnapshotId={diffAfter.id}
                    onSelect={(snapshotId) => {
                      const index = diffPage.snapshots.findIndex((snap) => snap.id === snapshotId);
                      const previous = diffPage.snapshots[index + 1] ?? diffPage.snapshots[index];
                      setDiffSelection({
                        pageId: diffPage.id,
                        beforeId: previous.id,
                        afterId: snapshotId,
                      });
                    }}
                    onCompare={(beforeId, afterId) => {
                      setDiffSelection({ pageId: diffPage.id, beforeId, afterId });
                    }}
                  />
                </div>
              )}

              {view === "snapshot" && (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <SnapshotView
                    page={snapshotPage}
                    snapshot={activeSnapshot}
                    onCopyHash={handleCopyHash}
                    onCompare={
                      snapshotPage.snapshots.length > 1
                        ? () => {
                            const index = snapshotPage.snapshots.findIndex((snap) => snap.id === activeSnapshot.id);
                            const previous = snapshotPage.snapshots[index + 1] ?? snapshotPage.snapshots[index];
                            openDiff(snapshotPage.id, previous.id, activeSnapshot.id);
                          }
                        : undefined
                    }
                  />
                  <Timeline
                    page={snapshotPage}
                    activeSnapshotId={activeSnapshot.id}
                    onSelect={(snapshotId) => openSnapshot(snapshotPage.id, snapshotId)}
                    onCompare={(beforeId, afterId) => openDiff(snapshotPage.id, beforeId, afterId)}
                  />
                </div>
              )}

              {view === "alerts" && (
                <AlertsView
                  alerts={alerts}
                  pages={watchedPages}
                  onOpenDiff={(pageId) => openDiff(pageId)}
                  onOpenSnapshot={(pageId, snapshotId) => openSnapshot(pageId, snapshotId)}
                />
              )}

              {view === "capture" && (
                <CaptureView
                  onDone={(hash) => notify(`Слепок сохранён. SHA ${shortenHash(hash)}`)}
                />
              )}

              {view === "how" && <HowItWorksView />}

              <footer className="mono flex flex-col items-start gap-2 border-t border-[color:var(--color-line-soft)] pt-4 text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--color-ink-mute)] sm:flex-row sm:items-center sm:justify-between">
                <span>Chronoleaf · The Living Time-Capsule of the Web</span>
                <span>Демо. Все компании и документы вымышлены.</span>
              </footer>
            </div>
          </main>
        </div>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
