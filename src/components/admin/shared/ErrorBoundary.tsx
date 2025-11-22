import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component to catch and handle React errors gracefully.
 * Prevents the entire app from crashing when a component encounters an error.
 *
 * Usage:
 * <ErrorBoundary componentName="MyComponent">
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(
      `[ErrorBoundary${this.props.componentName ? ` - ${this.props.componentName}` : ""}] Caught error:`,
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-boundary">
            <div className="error-boundary-content">
              <h2>⚠️ Something went wrong</h2>
              <p>
                {this.props.componentName
                  ? `The ${this.props.componentName} component encountered an error.`
                  : "A component encountered an error."}
              </p>
              <details>
                <summary>Error details</summary>
                <pre>{this.state.error?.message || "Unknown error"}</pre>
                <pre>{this.state.error?.stack}</pre>
              </details>
              <button
                onClick={() => window.location.reload()}
                className="error-boundary-reload"
              >
                Reload page
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
