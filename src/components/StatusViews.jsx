export function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="loading-text">Fetching player information...</p>
    </div>
  )
}

export function ErrorView({ message, onRetry, onOpenBrowser }) {
  return (
    <div className="error-container">
      <div className="error-icon">
        <svg viewBox="0 0 24 24" fill="none" width="44" height="44">
          <circle cx="12" cy="12" r="10" stroke="#e74c8b" strokeWidth="2"/>
          <path d="M12 8v4M12 16h.01" stroke="#e74c8b" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h3 className="error-title">Unable to Fetch Data</h3>
      <p className="error-message">{message}</p>
      <div className="error-actions">
        {onRetry && (
          <button className="btn btn-primary" onClick={onRetry}>Try Again</button>
        )}
        {onOpenBrowser && (
          <button className="btn btn-secondary" onClick={onOpenBrowser}>
            Open Website Instead
          </button>
        )}
      </div>
    </div>
  )
}