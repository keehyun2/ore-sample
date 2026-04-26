import React from 'react';

function LogViewer({ logs, error }) {
  if (!logs && !error) return null;

  return (
    <div className="mb-8">
      <h2 className="m-0 mb-4 text-2xl text-text-primary">ORE Execution Log</h2>
      <div className={`bg-[#1e293b] rounded-xl py-6 px-6 overflow-x-auto ${error ? 'border-2 border-error-color' : ''}`}>
        {error && (
          <div className="bg-[#fee2e2] text-[#991b1b] py-4 px-4 rounded-lg mb-4">
            <strong className="block mb-2">Error:</strong> {error}
          </div>
        )}
        <pre className="m-0 font-mono text-sm leading-[1.6] text-[#e2e8f0] whitespace-pre-wrap break-words">
          {logs || 'No logs available'}
        </pre>
      </div>
    </div>
  );
}

export default LogViewer;
