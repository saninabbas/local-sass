import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Telemetry Error', 
  message = 'We encountered an error while loading the requested data module.',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-10 h-10 rounded-full bg-[#faf9f5] border border-[#c64545]/30 flex items-center justify-center text-[#c64545] mb-3">
        <AlertCircle size={20} />
      </div>
      <h3 className="text-lg font-serif font-medium text-[#141413] mb-1">{title}</h3>
      <p className="text-[#6c6a64] font-sans text-xs max-w-sm mx-auto mb-5">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="bg-[#faf9f5] border-[#e6dfd8] text-xs text-[#141413]">
          Retry Request
        </Button>
      )}
    </div>
  );
}
