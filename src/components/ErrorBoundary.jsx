import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('salon_queue_master_state_v1');
    } catch (e) {
      console.warn(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 text-neutral-900 font-sans">
          <div className="max-w-md w-full bg-white border border-neutral-300 rounded-2xl p-8 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-300 mx-auto flex items-center justify-center mb-4">
              <span className="font-serif text-xl font-bold">!</span>
            </div>
            <h1 className="font-serif text-2xl font-normal text-neutral-950 mb-2">
              Something went wrong
            </h1>
            <p className="text-xs text-neutral-600 leading-relaxed mb-6 font-light">
              An unexpected display error occurred. You can reload the page or reset the cached salon data.
            </p>
            {this.state.error?.message && (
              <pre className="text-[11px] font-mono text-left bg-neutral-100 p-3 rounded-lg overflow-x-auto text-neutral-700 mb-6 max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 transition-all"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-medium border border-neutral-300 hover:border-black text-neutral-800 transition-all"
              >
                Reset Queue Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
