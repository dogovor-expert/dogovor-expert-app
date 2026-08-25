"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useVault } from "@/lib/vault/VaultProvider";
import {
  Lock,
  Unlock,
  Key,
  Download,
  Upload,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info,
  Shield,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { saveAs } from "file-saver";

export default function VaultTab() {
  const {
    unlocked,
    needsPassphrase,
    hasPassphrase,
    autoLockMs,
    unlock,
    lock,
    setPassphrase,
    changePassphrase,
    removePassphrase,
    exportBackup,
    importBackup,
    setAutoLock,
    refresh,
  } = useVault();

  const [mode, setMode] = useState<"lock" | "passphrase" | "backup" | "auto-lock">("lock");
  const [passphrase, setPassphraseState] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [oldPassphrase, setOldPassphrase] = useState("");
  const [newPassphrase, setNewPassphrase] = useState("");
  const [confirmNewPassphrase, setConfirmNewPassphrase] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [autoLockMinutes, setAutoLockMinutes] = useState(Math.round(autoLockMs / 60000));

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleUnlock = async () => {
    clearMessages();
    if (!passphrase) return setError("Введите пароль");
    setBusy(true);
    try {
      await unlock(passphrase);
      setPassphraseState("");
      setSuccess("Хранилище разблокировано");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleLock = () => {
    lock();
    setSuccess("Хранилище заблокировано");
  };

  const handleSetPassphrase = async () => {
    clearMessages();
    if (!passphrase || passphrase.length < 8) {
      return setError("Пароль должен быть не короче 8 символов");
    }
    if (passphrase !== confirmPassphrase) return setError("Пароли не совпадают");
    setBusy(true);
    try {
      await setPassphrase(passphrase);
      setPassphraseState("");
      setConfirmPassphrase("");
      setSuccess("Пароль установлен. Теперь хранилище можно разблокировать на другом устройстве.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleChangePassphrase = async () => {
    clearMessages();
    if (!oldPassphrase) return setError("Введите текущий пароль");
    if (!newPassphrase || newPassphrase.length < 8) {
      return setError("Новый пароль должен быть не короче 8 символов");
    }
    if (newPassphrase !== confirmNewPassphrase) return setError("Пароли не совпадают");
    setBusy(true);
    try {
      await changePassphrase(oldPassphrase, newPassphrase);
      setOldPassphrase("");
      setNewPassphrase("");
      setConfirmNewPassphrase("");
      setSuccess("Пароль изменён");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleRemovePassphrase = async () => {
    clearMessages();
    if (!oldPassphrase) return setError("Введите текущий пароль для подтверждения");
    setBusy(true);
    try {
      // Сначала разблокируем, если нужно
      if (!unlocked) await unlock(oldPassphrase);
      await removePassphrase();
      setOldPassphrase("");
      setSuccess("Пароль удалён. Хранилище теперь доступно только на этом устройстве.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleExportBackup = async () => {
    clearMessages();
    if (!unlocked) return setError("Сначала разблокируйте хранилище");
    setBusy(true);
    try {
      const backup = await exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, `dogovor-vault-backup-${new Date().toISOString().slice(0, 10)}.json`);
      setSuccess("Бэкап скачан. Сохраните его в безопасном месте!");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleImportBackup = async () => {
    clearMessages();
    if (!importFile) return setError("Выберите файл бэкапа");
    const passphraseNeeded = !unlocked;
    const pw = passphraseNeeded ? passphrase : undefined;
    if (passphraseNeeded && !pw) return setError("Для импорта на новое устройство введите пароль");
    setBusy(true);
    try {
      const text = await importFile.text();
      const backup = JSON.parse(text);
      await importBackup(backup, pw);
      setImportFile(null);
      setPassphraseState("");
      setSuccess("Хранилище восстановлено из бэкапа");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleAutoLockChange = async () => {
    clearMessages();
    const ms = autoLockMinutes * 60 * 1000;
    try {
      await setAutoLock(ms);
      setSuccess(`Автоблокировка: ${autoLockMinutes === 0 ? "выключена" : autoLockMinutes + " мин"}`);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const inputType = showPassphrase ? "text" : "password";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Статус vault */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            unlocked ? "bg-emerald-50" : needsPassphrase ? "bg-amber-50" : "bg-brand-50"
          }`}>
            {unlocked ? (
              <Unlock className="w-4.5 h-4.5 text-emerald-600" />
            ) : needsPassphrase ? (
              <Lock className="w-4.5 h-4.5 text-amber-600" />
            ) : (
              <Lock className="w-4.5 h-4.5 text-brand-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {unlocked ? "Разблокировано" : needsPassphrase ? "Требуется пароль" : "Заблокировано (только это устройство)"}
            </h3>
            <p className="text-sm text-gray-600">
              {hasPassphrase
                ? "Переносимый пароль установлен — доступно на других устройствах"
                : "Пароль не задан — данные доступны только в этом браузере"}
            </p>
          </div>
        </div>

        {needsPassphrase && !unlocked && (
          <div className="space-y-3">
            <Input
              label="Пароль для разблокировки"
              id="vault-pass"
              type={inputType}
              value={passphrase}
              onChange={(e) => setPassphraseState(e.target.value)}
              placeholder="Введите пароль"
            />
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={showPassphrase}
                onChange={(e) => setShowPassphrase(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-400"
              />
              Показать пароль
            </label>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button
              onClick={handleUnlock}
              disabled={busy || !passphrase}
              className="w-full"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
              {busy ? "Разблокировка…" : "Разблокировать"}
            </Button>
          </div>
        )}

        {unlocked && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLock} className="flex-1">
              <Lock className="w-4 h-4 mr-2" />
              Заблокировать
            </Button>
          </div>
        )}
      </Card>

      {/* Управление паролем */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
            <Key className="w-4.5 h-4.5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Переносимый пароль</h3>
            <p className="text-sm text-gray-600">
              {hasPassphrase
                ? "Пароль установлен. Данные доступны на любом устройстве с этим паролем."
                : "Пароль не установлен. Данные привязаны только к этому браузеру."}
            </p>
          </div>
        </div>

        {!hasPassphrase ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Установите пароль, чтобы иметь доступ к документам на других устройствах
              и создавать переносимые бэкапы.
            </p>
            <Input
              label="Новый пароль (мин. 8 символов)"
              type={inputType}
              value={passphrase}
              onChange={(e) => setPassphraseState(e.target.value)}
              placeholder="Придумайте надёжный пароль"
            />
            <Input
              label="Повторите пароль"
              type={inputType}
              value={confirmPassphrase}
              onChange={(e) => setConfirmPassphrase(e.target.value)}
              placeholder="Подтвердите пароль"
            />
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={showPassphrase}
                onChange={(e) => setShowPassphrase(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-400"
              />
              Показать пароль
            </label>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button onClick={handleSetPassphrase} disabled={busy} className="w-full">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
              {busy ? "Установка…" : "Установить пароль"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Пароль установлен</span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <h4 className="font-medium text-gray-700">Изменить пароль</h4>
              <Input
                label="Текущий пароль"
                type={inputType}
                value={oldPassphrase}
                onChange={(e) => setOldPassphrase(e.target.value)}
                placeholder="Введите текущий пароль"
              />
              <Input
                label="Новый пароль (мин. 8 символов)"
                type={inputType}
                value={newPassphrase}
                onChange={(e) => setNewPassphrase(e.target.value)}
                placeholder="Новый пароль"
              />
              <Input
                label="Повторите новый пароль"
                type={inputType}
                value={confirmNewPassphrase}
                onChange={(e) => setConfirmNewPassphrase(e.target.value)}
                placeholder="Подтвердите новый пароль"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button onClick={handleChangePassphrase} disabled={busy} variant="outline">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                {busy ? "Изменение…" : "Сменить пароль"}
              </Button>
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <h4 className="font-medium text-gray-700">Удалить пароль</h4>
              <p className="text-sm text-gray-600">
                Хранилище станет доступным только на этом устройстве. Бэкапы без пароля
                нельзя будет восстановить на другом компьютере.
              </p>
              <Input
                label="Текущий пароль для подтверждения"
                type={inputType}
                value={oldPassphrase}
                onChange={(e) => setOldPassphrase(e.target.value)}
                placeholder="Введите пароль"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button
                onClick={handleRemovePassphrase}
                disabled={busy}
                variant="ghost"
                className="text-red-600 hover:bg-red-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                {busy ? "Удаление…" : "Удалить пароль"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Автоблокировка */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
            <Clock className="w-4.5 h-4.5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Автоблокировка</h3>
            <p className="text-sm text-gray-600">
              Автоматически блокировать хранилище после неактивности.
              При блокировке потребуется ввести пароль (если он задан).
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Время неактивности до блокировки
          </label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="0"
              max="1440"
              value={autoLockMinutes}
              onChange={(e) => setAutoLockMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-24"
            />
            <span className="text-sm text-gray-600">минут (0 = отключить)</span>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button onClick={handleAutoLockChange} disabled={busy} variant="outline">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4 mr-2" />}
            {busy ? "Сохранение…" : "Применить"}
          </Button>
          <p className="text-xs text-gray-500">
            Текущее значение: {autoLockMinutes === 0 ? "выключено" : autoLockMinutes + " мин"}
          </p>
        </div>
      </Card>

      {/* Бэкап и восстановление */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
            <Download className="w-4.5 h-4.5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Зашифрованный бэкап</h3>
            <p className="text-sm text-gray-600">
              Скачайте полный бэкап хранилища (документы + настройки облаков + ключи).
              Файл зашифрован AES-256-GCM. Без пароля (если задан) бэкап бесполезен.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleExportBackup} disabled={busy || !unlocked}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {busy ? "Скачивание…" : "Скачать бэкап (.json)"}
          </Button>
          <div className="flex items-center gap-3">
            <Input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              id="vault-import"
              className="sr-only"
            />
            <label
              htmlFor="vault-import"
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Восстановить из файла
            </label>
            <Button
              onClick={handleImportBackup}
              disabled={busy || !importFile}
              variant="outline"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {busy ? "Восстановление…" : "Применить"}
            </Button>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        {success && <p className="text-xs text-emerald-600 mt-2">{success}</p>}
      </Card>

      {/* Инфо */}
      <Card variant="elevated" padding="lg" className="bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-800 space-y-2">
            <p className="font-medium">Как это работает:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Данные шифруются <strong>AES-256-GCM</strong> прямо в браузере.</li>
              <li>Ключ шифрования никогда не покидает устройство (non-extractable <code>CryptoKey</code>).</li>
              <li>Опциональный пароль (PBKDF2 600k итераций) позволяет разблокировать хранилище на новом устройстве.</li>
              <li>Бэкап содержит всё: документы, токены облаков, настройки. Восстановление — один клик.</li>
              <li>Сервер Dogovor.expert <strong>не видит</strong> содержимое вашего хранилища.</li>
            </ul>
            <p className="font-medium mt-2">Рекомендации:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Установите надёжный пароль для переноса между устройствами.</li>
              <li>Регулярно скачивайте бэкап и храните его в безопасном месте (флешка, пароль-менеджер).</li>
              <li>Для максимальной приватности используйте Яндекс.Диск (серверы в РФ).</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}