"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  initVault,
  lockVault,
  isUnlocked,
  requiresPassphrase,
  ensureUnlockedSilently,
  unlockWithPassphrase,
  setPassphrase,
  changePassphrase,
  removePassphrase,
  hasPassphrase,
  exportVaultBackup,
  importVaultBackup,
  getAutoLockMs,
  setAutoLockMs,
  type VaultBackup,
} from "./keyManager";
import VaultUnlockDialog from "@/components/vault/VaultUnlockDialog";

interface VaultContextValue {
  unlocked: boolean;
  needsPassphrase: boolean;
  hasPassphrase: boolean;
  autoLockMs: number;
  unlock: (passphrase: string) => Promise<void>;
  lock: () => void;
  /**
   * Гарантирует, что хранилище расшифровано перед операцией.
   * Сначала пробует тихую разблокировку (deviceKey), затем —
   * показывает диалог ввода пароля. Возвращает false при отмене.
   */
  requireUnlock: () => Promise<boolean>;
  setPassphrase: (passphrase: string) => Promise<void>;
  changePassphrase: (oldP: string, newP: string) => Promise<void>;
  removePassphrase: () => Promise<void>;
  exportBackup: () => Promise<VaultBackup>;
  importBackup: (backup: VaultBackup, passphrase?: string) => Promise<void>;
  setAutoLock: (ms: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const VaultContext = createContext<VaultContextValue | null>(null);

const emptyContext: VaultContextValue = {
  unlocked: false,
  needsPassphrase: false,
  hasPassphrase: false,
  autoLockMs: 15 * 60 * 1000,
  unlock: async () => {},
  lock: () => {},
  requireUnlock: async () => false,
  setPassphrase: async () => {},
  changePassphrase: async () => {},
  removePassphrase: async () => {},
  exportBackup: async () => ({} as VaultBackup),
  importBackup: async () => {},
  setAutoLock: async () => {},
  refresh: async () => {},
};

export function VaultProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [needsPassphrase, setNeedsPassphrase] = useState(false);
  const [hasPassphraseState, setHasPassphraseState] = useState(false);
  const [autoLockMs, setAutoLockMsState] = useState(15 * 60 * 1000);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const refresh = useCallback(async () => {
    const [u, n, h, a] = await Promise.all([
      Promise.resolve(isUnlocked()),
      Promise.resolve(requiresPassphrase()),
      hasPassphrase(),
      getAutoLockMs(),
    ]);
    setUnlocked(u);
    setNeedsPassphrase(n);
    setHasPassphraseState(h);
    setAutoLockMsState(a);
  }, []);

  useEffect(() => {
    async function init() {
      await initVault();
      await refresh();
      setLoading(false);
    }
    init();

    function onLocked() {
      // Автолок очищает только сессию — на своём устройстве тихая
      // разблокировка возможна, поэтому needsPassphrase НЕ трогаем.
      setUnlocked(false);
    }
    window.addEventListener("vault:locked", onLocked);
    return () => window.removeEventListener("vault:locked", onLocked);
  }, [refresh]);

  const unlock = async (passphrase: string) => {
    await unlockWithPassphrase(passphrase);
    await refresh();
  };

  /**
   * Гарантирует расшифровку хранилища. Тихо разблокирует через deviceKey;
   * если это невозможно (новое устройство) — показывает диалог пароля.
   */
  const requireUnlock = useCallback(async (): Promise<boolean> => {
    const okSilent = await ensureUnlockedSilently();
    if (okSilent) {
      await refresh();
      return true;
    }
    // Нужен пароль — открываем диалог и ждём результат
    const ok = await new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setDialogOpen(true);
    });
    if (ok) await refresh();
    return ok;
  }, [refresh]);

  const lock = () => {
    lockVault();
    setUnlocked(false);
  };

  const handleDialogUnlocked = () => {
    setDialogOpen(false);
    resolverRef.current?.(true);
    resolverRef.current = null;
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
    resolverRef.current?.(false);
    resolverRef.current = null;
  };

  const doSetPassphrase = async (passphrase: string) => {
    await setPassphrase(passphrase);
    await refresh();
  };

  const doChangePassphrase = async (oldP: string, newP: string) => {
    await changePassphrase(oldP, newP);
    await refresh();
  };

  const doRemovePassphrase = async () => {
    await removePassphrase();
    await refresh();
  };

  const doExportBackup = async () => {
    if (!unlocked) throw new Error("Vault залочен");
    return exportVaultBackup();
  };

  const doImportBackup = async (backup: VaultBackup, passphrase?: string) => {
    await importVaultBackup(backup, passphrase);
    await refresh();
  };

  const doSetAutoLock = async (ms: number) => {
    await setAutoLockMs(ms);
    setAutoLockMsState(ms);
  };

  if (loading) {
    return (
      <VaultContext.Provider value={emptyContext}>
        {children}
      </VaultContext.Provider>
    );
  }

  const value: VaultContextValue = {
    unlocked,
    needsPassphrase,
    hasPassphrase: hasPassphraseState,
    autoLockMs,
    unlock,
    lock,
    requireUnlock,
    setPassphrase: doSetPassphrase,
    changePassphrase: doChangePassphrase,
    removePassphrase: doRemovePassphrase,
    exportBackup: doExportBackup,
    importBackup: doImportBackup,
    setAutoLock: doSetAutoLock,
    refresh,
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
      {!loading && (
        <VaultUnlockDialog
          open={dialogOpen}
          mandatory={needsPassphrase}
          onUnlocked={handleDialogUnlocked}
          onCancel={handleDialogCancel}
        />
      )}
    </VaultContext.Provider>
  );
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault должен использоваться внутри VaultProvider");
  return ctx;
}