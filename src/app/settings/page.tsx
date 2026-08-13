import { Suspense } from "react";
import SettingsHub from "./SettingsHub";

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Suspense
        fallback={
          <div className="py-16 text-center text-sm text-gray-400">
            Загрузка настроек…
          </div>
        }
      >
        <SettingsHub />
      </Suspense>
    </div>
  );
}