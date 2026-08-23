import {
  AlertTriangle,
  Copy,
  Link2,
  Loader2,
  QrCode,
} from "lucide-react";

export interface MyApproval {
  id: string;
  token: string;
  template_id: string;
  mode: string;
  created_at: string;
  expires_at: string;
  changed: boolean;
  updated_at: string;
  opened_count: number;
}

interface ApprovalPanelProps {
  templateId: string;
  approvalMode: "fill" | "edit";
  onModeChange: (mode: "fill" | "edit") => void;
  approvalBusy: boolean;
  approvalMsg: string;
  myApprovals: MyApproval[];
  approvalQr: { token: string; svg: string } | null;
  onCreate: () => void;
  onRefresh: () => void;
  onApply: (a: MyApproval) => void;
  onCopyLink: (a: MyApproval) => void;
  onToggleQr: (token: string) => void;
}

export default function ApprovalPanel({
  templateId,
  approvalMode,
  onModeChange,
  approvalBusy,
  approvalMsg,
  myApprovals,
  approvalQr,
  onCreate,
  onRefresh,
  onApply,
  onCopyLink,
  onToggleQr,
}: ApprovalPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] text-gray-600 leading-relaxed">
        Отправьте контрагенту ссылку — он заполнит поля прямо на сайте (7 дней). Изменения будут отмечены в форме.
      </p>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-[11px] text-gray-600 cursor-pointer">
          <input
            type="radio"
            name="approvalMode"
            className="w-3.5 h-3.5 accent-brand-600"
            checked={approvalMode === "fill"}
            onChange={() => onModeChange("fill")}
          />
          Только поля
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-gray-600 cursor-pointer">
          <input
            type="radio"
            name="approvalMode"
            className="w-3.5 h-3.5 accent-brand-600"
            checked={approvalMode === "edit"}
            onChange={() => onModeChange("edit")}
          />
          Поля + условия
        </label>
      </div>
      <button
        onClick={onCreate}
        disabled={approvalBusy}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100 disabled:opacity-60 transition-colors"
      >
        {approvalBusy ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Link2 className="w-3.5 h-3.5" />
        )}
        Создать ссылку для согласования
      </button>
      {approvalMsg && (
        <p className="text-[10px] font-medium text-brand-700 bg-brand-50 rounded-lg px-2.5 py-1.5">
          {approvalMsg}
        </p>
      )}
      {myApprovals.filter((a) => a.template_id === templateId).length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
              Ссылки по этому шаблону
            </span>
            <button
              onClick={onRefresh}
              className="text-[10px] text-brand-600 hover:text-brand-700"
            >
              Обновить
            </button>
          </div>
          {myApprovals
            .filter((a) => a.template_id === templateId)
            .slice(0, 3)
            .map((a) => {
              const active = new Date(a.expires_at).getTime() > Date.now();
              const days = Math.max(0, Math.ceil((new Date(a.expires_at).getTime() - Date.now()) / 86400000));
              return (
                <div key={a.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {active ? `Активна ${days} дн.` : "Истекла"}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      открыто {a.opened_count || 0} раз
                    </span>
                  </div>
                  {a.changed ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 rounded-lg px-2 py-1">
                        <AlertTriangle className="w-3 h-3" />
                        Контрагент внёс изменения
                      </span>
                      <button
                        onClick={() => onApply(a)}
                        className="ml-auto text-[10px] font-medium text-brand-600 hover:text-brand-700 bg-white rounded-lg px-2 py-1 border border-brand-100"
                      >
                        Применить
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-600">
                      Изменений ещё нет
                    </p>
                  )}
                  <div className="flex items-center gap-1.5">
                    <input
                      readOnly
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/approve/${a.token}`}
                      onFocus={(e) => e.target.select()}
                      className="flex-1 min-w-0 px-2 py-1.5 text-[10px] text-gray-600 bg-white border border-gray-200 rounded-lg focus:outline-none"
                    />
                    <button
                      onClick={() => onCopyLink(a)}
                      className="p-1.5 text-gray-600 hover:text-brand-600 transition-colors shrink-0"
                      title="Скопировать ссылку"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleQr(a.token)}
                      className={`p-1.5 rounded-md transition-colors shrink-0 ${
                        approvalQr?.token === a.token
                          ? "text-brand-600 bg-brand-50"
                          : "text-gray-600 hover:text-brand-600"
                      }`}
                      title="Показать QR-код"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {approvalQr?.token === a.token && approvalQr.svg && (
                    <div className="flex flex-col items-center gap-1 pt-1">
                      {/* QR — data:image/svg+xml URI, next/image неприменим */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(approvalQr.svg)}`}
                        alt="QR-код ссылки для согласования"
                        className="w-28 h-28 bg-white rounded-lg border border-gray-100 p-1.5"
                      />
                      <span className="text-[9px] text-gray-600">
                        Отсканируйте для открытия на устройстве
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
