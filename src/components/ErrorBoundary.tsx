"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2>Etwas ist schiefgelaufen</h2>
          <p>Ein unerwarteter Fehler ist aufgetreten.</p>
          {this.state.error && (
            <details style={{ marginTop: '10px', textAlign: 'left' }}>
              <summary>Fehlerdetails</summary>
              <pre style={{ 
                backgroundColor: '#f1f3f4', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {this.state.error.message}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button 
            onClick={this.resetError}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Erneut versuchen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback component for better UX
export function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      backgroundColor: '#fff',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      margin: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>
        ⚠️ Anwendungsfehler
      </h2>
      <p style={{ marginBottom: '20px', color: '#6c757d' }}>
        Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.
      </p>
      <button 
        onClick={resetError}
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500'
        }}
      >
        Seite neu laden
      </button>
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: '20px', textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer', color: '#6c757d' }}>
            Entwickler-Details
          </summary>
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '12px',
            border: '1px solid #e9ecef',
            marginTop: '10px'
          }}>
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
