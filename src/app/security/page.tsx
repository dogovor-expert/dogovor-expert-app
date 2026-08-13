"use client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useState, useEffect } from "react";
import { Shield, Key, Smartphone, Clock, Eye, EyeOff, Check, AlertTriangle, LogOut, Monitor, Globe } from "lucide-react";

interface Session {
  id: number;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

interface LoginEvent {
  id: number;
  action: string;
  location: string;
  device: string;
  time: string;
  success: boolean;
}

const sessions: Session[] = [
  { id: 1, device: "Windows 11", browser: "Chrome 125", location: "Москва, РФ", ip: "192.168.1.1", lastActive: "Сейчас", current: true },
  { id: 2, device: "iPhone 15 Pro", browser: "Safari", location: "Москва, РФ", ip: "192.168.1.2", lastActive: "2 часа назад", current: false },
  { id: 3, device: "macOS Sonoma", browser: "Firefox 127", location: "Санкт-Петербург, РФ", ip: "192.168.1.3", lastActive: "2 дня назад", current: false },
  { id: 4, device: "Android 14", browser: "Chrome Mobile", location: "Казань, РФ", ip: "192.168.1.4", lastActive: "5 дней назад", current: false },
];

const loginHistory: LoginEvent[] = [
  { id: 1, action: "Успешный вход", location: "Москва, РФ", device: "Chrome / Windows", time: "27.05.2026 14:30", success: true },
  { id: 2, action: "Успешный вход", location: "Москва, РФ", device: "Safari / iOS", time: "27.05.2026 10:15", success: true },
  { id: 3, action: "Неудачная попытка", location: "Санкт-Петербург, РФ", device: "Firefox / Linux", time: "26.05.2026 23:45", success: false },
  { id: 4, action: "Успешный вход", location: "Москва, РФ", device: "Chrome / Windows", time: "26.05.2026 09:00", success: true },
  { id: 5, action: "Смена пароля", location: "Москва, РФ", device: "Chrome / Windows", time: "25.05.2026 16:20", success: true },
  { id: 6, action: "Неудачная попытка", location: "Новосибирск, РФ", device: "Edge / Windows", time: "24.05.2026 08:10", success: false },
];

export default function SecurityPage() {
  const [twoFactor, setTwoFactor] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem("dogovor_2fa") === "true"; } catch { return false; }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    try { localStorage.setItem("dogovor_2fa", String(twoFactor)); } catch {}
  }, [twoFactor]);

  const handlePasswordChange = () => {
    if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) return;
    if (passwordForm.newPass !== passwordForm.confirm) return;
    setPasswordChanged(true);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setPasswordChanged(false), 3000);
  };

  const handleEndSession = (sessionId: number) => {
    showToast(`Сессия #${sessionId} завершена`);
  };

  const handleEndAllSessions = () => {
    showToast("Все сессии кроме текущей завершены");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
          <Shield className="w-6 h-6 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Безопасность</h1>
          <p className="text-gray-500 text-sm">Управление безопасностью вашего аккаунта</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card variant="default" padding="md">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-600" />
            Изменить пароль
          </h2>
          {passwordChanged && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-sm text-emerald-700">
              <Check className="w-4 h-4" />
              Пароль успешно изменён
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Текущий пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} value={passwordForm.current}
                  onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  placeholder="Введите текущий пароль"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Новый пароль</label>
              <input
                type={showPassword ? "text" : "password"} value={passwordForm.newPass}
                onChange={e => setPasswordForm(p => ({ ...p, newPass: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Минимум 8 символов"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Подтвердите пароль</label>
              <input
                type={showPassword ? "text" : "password"} value={passwordForm.confirm}
                onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                placeholder="Повторите новый пароль"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPassword ? "Скрыть" : "Показать"} пароли
              </button>
              <Button variant="primary" size="sm" onClick={handlePasswordChange}>Сохранить пароль</Button>
            </div>
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-600" />
              Двухфакторная аутентификация
            </h2>
            <button
              onClick={() => { const next = !twoFactor; setTwoFactor(next); showToast(next ? "2FA включена" : "2FA отключена"); }}
              className={`relative w-11 h-6 rounded-full transition-colors ${twoFactor ? "bg-brand-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${twoFactor ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {twoFactor ? "2FA включена. Используйте приложение-аутентификатор для входа." : "Включите двухфакторную аутентификацию для дополнительной защиты."}
          </p>
          {twoFactor && (
            <div className="space-y-2">
              {[
                { name: "TOTP (Google Authenticator, Authy)", done: true },
                { name: "SMS-коды", done: false },
                { name: "Ключи безопасности (YubiKey)", done: false },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-sm text-gray-700">{m.name}</span>
                  {m.done ? (
                    <Badge variant="green" size="sm" dot>Подключено</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => showToast(`Настройка: ${m.name}`)}>Настроить</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card variant="default" padding="md" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-brand-600" />
            Активные сессии
          </h2>
          <Button variant="ghost" size="sm" onClick={handleEndAllSessions}>
            <LogOut className="w-4 h-4" />
            Завершить все
          </Button>
        </div>
        <div className="space-y-3">
          {sessions.map(session => (
            <div key={session.id} className={`flex items-center justify-between p-4 rounded-xl border ${session.current ? "border-brand-200 bg-brand-50/50" : "border-gray-100 hover:bg-gray-50/50"} transition-colors`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${session.current ? "bg-brand-100" : "bg-gray-100"} flex items-center justify-center`}>
                  <Smartphone className={`w-4 h-4 ${session.current ? "text-brand-600" : "text-gray-500"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{session.device}</span>
                    {session.current && <Badge variant="blue" size="sm">Текущая</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {session.location} • {session.browser} • {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm" onClick={() => handleEndSession(session.id)}>
                  <LogOut className="w-4 h-4" />
                  Завершить
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card variant="default" padding="md">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-600" />
          История входов
        </h2>
        <Table variant="default">
          <TableHead>
            <TableRow>
              <TableHeader>Действие</TableHeader>
              <TableHeader>Местоположение</TableHeader>
              <TableHeader>Устройство</TableHeader>
              <TableHeader>Время</TableHeader>
              <TableHeader>Статус</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {loginHistory.map(event => (
              <TableRow key={event.id}>
                <TableCell className="font-medium text-gray-900">{event.action}</TableCell>
                <TableCell className="text-gray-600">{event.location}</TableCell>
                <TableCell className="text-gray-600">{event.device}</TableCell>
                <TableCell className="text-gray-500">{event.time}</TableCell>
                <TableCell>
                  <Badge variant={event.success ? "green" : "red"} size="sm" dot>
                    {event.success ? "Успех" : "Ошибка"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
