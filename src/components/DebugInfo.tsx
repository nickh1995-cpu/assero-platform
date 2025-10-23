"use client";

import { useEffect, useState } from 'react';

export function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const info = {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        localStorage: Object.keys(localStorage),
        sessionStorage: Object.keys(sessionStorage),
        cookies: document.cookie,
        windowSize: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screenSize: {
          width: screen.width,
          height: screen.height
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        onLine: navigator.onLine
      };
      setDebugInfo(info);
    }
  }, []);

  if (process.env.NODE_ENV !== 'development' || !debugInfo) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <details>
        <summary style={{ cursor: 'pointer' }}>🐛 Debug Info</summary>
        <pre style={{ 
          fontSize: '10px', 
          overflow: 'auto', 
          maxHeight: '200px',
          marginTop: '5px'
        }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>
    </div>
  );
}
