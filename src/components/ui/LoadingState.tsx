interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading dashboard...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-500">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="text-secondary font-medium text-sm">{message}</p>
    </div>
  );
}
