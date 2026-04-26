import PropTypes from 'prop-types'

function LogViewer({ logs, error }) {
  if (!logs && !error) return null

  return (
    <div className="mb-8">
      <h2 className="m-0 mb-4 text-2xl text-text-primary">ORE Execution Log</h2>
      <div
        className={`overflow-x-auto rounded-xl bg-text-primary p-6 ${error ? 'border-error-color border-2' : ''}`}
      >
        {error && (
          <div className="mb-4 rounded-lg bg-[#fee2e2] p-4 text-[#991b1b]">
            <strong className="mb-2 block">Error:</strong> {error}
          </div>
        )}
        <pre className="m-0 whitespace-pre-wrap break-words font-mono text-sm leading-[1.6] text-border-color">
          {logs || 'No logs available'}
        </pre>
      </div>
    </div>
  )
}

LogViewer.propTypes = {
  logs: PropTypes.string,
  error: PropTypes.string,
}

export default LogViewer
