// Frontend/src/components/ErrorBoundary.jsx
import React from "react";
import { analytics } from '../utils/analytics';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    analytics.trackError(error, {
      componentStack: errorInfo.componentStack
    });
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>😔 Something went wrong</h2>
            <p>We're sorry for the inconvenience. Please try refreshing the page.</p>

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-retry">
                Try Again
              </button>
              <button onClick={this.handleReload} className="btn-reload">
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre>{this.state.error && this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack || "No component stack available"}</pre>

              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;