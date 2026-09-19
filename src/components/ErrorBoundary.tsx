import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-xs m-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-bold text-primary mb-1">
            {this.props.fallbackTitle || 'Something went wrong loading this view'}
          </h2>
          <p className="text-xs text-secondary max-w-md mx-auto mb-6 leading-relaxed">
            {this.state.error?.message || 'An unexpected error occurred while rendering the interface.'}
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-xs font-semibold"
            >
              <RefreshCw size={13} className="mr-1.5" />
              <span>Reload Page</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/dashboard';
              }}
              className="bg-primary-accent hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <Home size={13} className="mr-1.5" />
              <span>Go to Overview</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
