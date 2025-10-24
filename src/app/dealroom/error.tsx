"use client";

import { useEffect } from "react";
import { Header } from "@/components/Header";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dealroom error:', error);
  }, [error]);

  return (
    <main>
      <Header />
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px'
      }}>
        <h1 style={{ color: '#dc2626', fontSize: '24px' }}>
          Fehler beim Laden der Dealroom-Daten
        </h1>
        <p style={{ color: '#666', textAlign: 'center', maxWidth: '500px' }}>
          Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={reset}
            style={{
              background: '#2c5a78',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Erneut versuchen
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Zur Startseite
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details style={{ marginTop: '20px', maxWidth: '600px' }}>
            <summary style={{ cursor: 'pointer', color: '#666' }}>
              Technische Details (Development)
            </summary>
            <pre style={{
              background: '#f3f4f6',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto',
              marginTop: '10px'
            }}>
              {error.message}
              {error.stack && `\n\nStack trace:\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}
