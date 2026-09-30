import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/**
 * Граница ошибок.
 *
 * Раньше её не было вообще: любая ошибка при разборе файла (битый PDF,
 * нехватка памяти, отказ доступа к canvas) приводила к белому экрану без
 * объяснений. Для инструмента, которому доверяют личные документы, это
 * особенно плохо: пользователь не понимает, потерял ли он файл или
 * сломался интерфейс.
 *
 * Важно: текст не упоминает содержимое документа — фрагмент ошибки может
 * содержать технические детали, поэтому показываем только название.
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Логируем только название: полный текст ошибки может содержать
    // фрагменты обрабатываемых данных.
    console.error('[offgrid] ошибка интерфейса:', error.name, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="min-h-screen grid place-items-center p-6" style={{ background: '#f7f8f4', color: '#23281f' }}>
        <div style={{ maxWidth: 520 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>Что-то пошло не так</h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 16px', opacity: 0.8 }}>
            Интерфейс не смог обработать этот документ. Ваш файл не был никуда отправлен —
            вся обработка локальная, и данные никуда не ушли.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.6, margin: '0 0 20px', opacity: 0.65 }}>
            Попробуйте открыть другой файл: очень большой или повреждённый документ
            может не помещаться в память вкладки.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            style={{
              padding: '10px 18px', borderRadius: 12, border: 'none',
              background: '#385d45', color: '#f1f3e9', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }
}
