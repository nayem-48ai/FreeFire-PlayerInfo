import { useState, useCallback } from 'react'
import { Browser } from '@capacitor/browser'
import { fetchPlayerInfo, REGION_CODES, FALLBACK_URL } from './services/api'
import UidForm from './components/UidForm'
import PlayerInfo from './components/PlayerInfo'
import PetInfo from './components/PetInfo'
import GuildInfo from './components/GuildInfo'
import { Loading, ErrorView } from './components/StatusViews'
import './App.css'

function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [playerData, setPlayerData] = useState(null)
  const [searchedUid, setSearchedUid] = useState(null)
  const [mode, setMode] = useState('form')

  const handleSearch = useCallback(async (uid, region) => {
    setLoading(true)
    setError(null)
    setPlayerData(null)
    setSearchedUid(uid)

    try {
      const data = await fetchPlayerInfo(uid, region)
      setPlayerData(data)
      setMode('result')
    } catch (err) {
      setError(err.message || 'API unavailable.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleOpenBrowser = useCallback(async (uid) => {
    try {
      await Browser.open({ url: FALLBACK_URL, presentationStyle: 'fullscreen' })
    } catch {
      window.open(FALLBACK_URL, '_system')
    }
  }, [])

  const handleDirectBrowse = useCallback(() => {
    handleOpenBrowser()
  }, [handleOpenBrowser])

  const handleReset = useCallback(() => {
    setPlayerData(null)
    setError(null)
    setMode('form')
  }, [])

  return (
    <div className="app">
      <div className="app-container">
        {mode === 'result' && playerData ? (
          <div className="results-container">
            <div className="results-toolbar">
              <button className="back-btn" onClick={handleReset}>
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                New Search
              </button>
              <button className="browse-btn" onClick={handleDirectBrowse}>
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                Open Site
              </button>
            </div>
            <PlayerInfo data={playerData} />
            <PetInfo pet={playerData.pet} />
            <GuildInfo guild={playerData.guild} guildLeader={playerData.guildLeader} />
          </div>
        ) : (
          <>
            <UidForm onSearch={handleSearch} loading={loading} />

            {loading && <Loading />}

            {error && (
              <ErrorView
                message={error}
                onRetry={() => searchedUid && handleSearch(searchedUid, 'BD')}
                onOpenBrowser={() => handleOpenBrowser(searchedUid)}
              />
            )}

            <div className="quick-access">
              <button className="quick-browse-btn" onClick={handleDirectBrowse}>
                <span className="quick-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </span>
                <span className="quick-text">
                  <strong>Browse FreeFire Info</strong>
                  <small>Open website directly to look up any player</small>
                </span>
                <span className="quick-arrow">→</span>
              </button>
            </div>
          </>
        )}

        {!playerData && !loading && !error && (
          <div className="features-section">
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <span className="feature-text">Look up any Free Fire player by UID</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span className="feature-text">View rank, level, guild & pet info</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👕</span>
              <span className="feature-text">See equipped outfit & items</span>
            </div>
          </div>
        )}

        <footer className="app-footer">
          <p>Free Fire PlayerInfo v1.0.0</p>
          <p className="disclaimer">Not affiliated with Garena.</p>
        </footer>
      </div>
    </div>
  )
}

export default App