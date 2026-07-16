interface ErrorMessageProps {
  message: string | null;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onDismiss, className = "" }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <div className={`flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-red-500 text-lg">⚠</span>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-500 hover:text-red-700 ml-2 cursor-pointer">&times;</button>
      )}
    </div>
  );
}
