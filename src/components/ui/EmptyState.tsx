import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-400 mb-4 shadow-sm border border-gray-100">
        <Inbox size={24} />
      </div>
      <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
      <p className="text-secondary text-sm max-w-sm mx-auto mb-6">
        {message}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}
