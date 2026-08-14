interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading telemetry...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-300">
      <div className="relative w-8 h-8 mb-3">
        <div className="absolute inset-0 rounded-full border-2 border-[#e6dfd8]"></div>
        <div className="absolute inset-0 rounded-full border-2 border-[#cc785c] border-t-transparent animate-spin"></div>
      </div>
      <p className="text-[#6c6a64] font-sans text-xs">{message}</p>
    </div>
  );
}
