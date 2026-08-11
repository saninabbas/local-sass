import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message = 'We encountered an error while loading your data. Please try again.',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-danger mb-4">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
      <p className="text-secondary text-sm max-w-sm mx-auto mb-6">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
