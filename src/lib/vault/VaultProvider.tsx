"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  initVault,
  lockVault,
  isUnlocked,
  requiresPassphrase,
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

interface VaultContextValue {
  unlocked: boolean;
  needsPassphrase: boolean;
  hasPassphrase: boolean;
  autoLockMs: number;
  unlock: (passphrase: string) => Promise<void>;
  lock: () => void;
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
      setUnlocked(false);
      setNeedsPassphrase(true);
    }
    window.addEventListener("vault:locked", onLocked);
    return () => window.removeEventListener("vault:locked", onLocked);
  }, [refresh]);

  const unlock = async (passphrase: string) => {
    await unlockWithPassphrase(passphrase);
    await refresh();
  };

  const lock = () => {
    lockVault();
    setUnlocked(false);
    setNeedsPassphrase(true);
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
    </VaultContext.Provider>
  );
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault должен использоваться внутри VaultProvider");
  return ctx;
}