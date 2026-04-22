export function Toast({ message, type, onClose }) {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }[type] || 'bg-gray-500';

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }[type] || '•';

  return (
    <div
      className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between gap-4 animate-slide-in`}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold">{icon}</span>
        <span className="font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="hover:opacity-75 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}
