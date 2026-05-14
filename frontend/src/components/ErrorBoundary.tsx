import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Error boundaries require a class component
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card padding="lg" className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-lg font-semibold text-slate-900">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-600">
            An unexpected error occurred. Please reload the page to continue.
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Reload
          </Button>
        </Card>
      </div>
    );
  }
}
