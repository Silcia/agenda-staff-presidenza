import React, { ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Could not clear localStorage', e);
    }
    window.location.reload();
  };

  private handleSoftRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="bg-slate-900 border-2 border-red-500/50 rounded-3xl p-8 max-w-xl w-full shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-2xl flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-white">
                Si è verificato un errore di visualizzazione
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                L'applicazione ha rilevato uno stato imprevisto. Puoi riprovare o ripristinare la memoria locale.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-black/50 border border-slate-800 rounded-xl p-3 text-left overflow-auto max-h-32 text-xs font-mono text-red-300">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleSoftRetry}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Riprova Caricamento
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-3 rounded-xl bg-[#E63946] hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ripristina Dati & Ricarica</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
