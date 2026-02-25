import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    /** Rendered instead of the generic error UI when provided */
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * React class-based Error Boundary.
 *
 * Catches any unhandled JS errors in its child tree and displays a friendly
 * recovery UI instead of letting the whole app go blank.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeHeavyComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: { componentStack: string }): void {
        // Logging hook — swap for Sentry / DataDog in production
        console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="error-boundary-wrap fade-in">
                    <div className="error-boundary-card glass-panel">
                        <AlertTriangle size={36} className="error-boundary-icon" />
                        <h2>Something went wrong</h2>
                        <p className="error-boundary-msg">
                            {this.state.error?.message ?? 'An unexpected error occurred in this section.'}
                        </p>
                        <div className="error-boundary-actions">
                            <button className="btn-primary" onClick={this.handleReset}>
                                <RefreshCw size={15} /> Try Again
                            </button>
                            <button className="btn-secondary" onClick={() => window.location.reload()}>
                                Reload Page
                            </button>
                        </div>
                        {import.meta.env.DEV && this.state.error?.stack && (
                            <details className="error-boundary-stack">
                                <summary>Stack trace (dev only)</summary>
                                <pre>{this.state.error.stack}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
