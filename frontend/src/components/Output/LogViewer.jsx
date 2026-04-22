import React from 'react';

function LogViewer({ logs, error }) {
  if (!logs && !error) return null;

  return (
    <div className="log-viewer">
      <h2>ORE Execution Log</h2>
      <div className={`log-content ${error ? 'has-error' : ''}`}>
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
        <pre>{logs || 'No logs available'}</pre>
      </div>
    </div>
  );
}

export default LogViewer;
