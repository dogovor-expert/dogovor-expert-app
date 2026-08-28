// Бывший Jivo-виджет заменён на единый SupportLauncher (src/components/support/SupportLauncher.tsx),
// который объединяет чат с поддержкой (Telegram-мост) и форму «Сообщить о проблеме».
// Оставляем openChat() для обратной совместимости (help/page.tsx и др.).

export { openChat } from "@/components/support/SupportLauncher";

export default function ChatWidget() {
  return null;
}
