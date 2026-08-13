const CHECKLIST_ITEMS = [
  "ПТС и СТС в порядке",
  "Нет ограничений на регистрацию",
  "Расписка о получении денег",
  "Страховка ОСАГО оформлена",
  "Акт приёма-передачи подписан",
];

interface ChecklistPanelProps {
  checklist: Record<string, boolean>;
  onChange: (item: string, checked: boolean) => void;
}

export default function ChecklistPanel({ checklist, onChange }: ChecklistPanelProps) {
  return (
    <div className="space-y-2">
      {CHECKLIST_ITEMS.map((item) => (
        <label
          key={item}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <input
            type="checkbox"
            checked={!!checklist[item]}
            onChange={() => onChange(item, !checklist[item])}
            className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-xs text-gray-700">{item}</span>
        </label>
      ))}
    </div>
  );
}
