import { useState, useCallback } from 'react'
import { fetchPlayerInfo, FALLBACK_URL } from './services/api'
import UidForm from './components/UidForm'
import PlayerInfo from './components/PlayerInfo'
import PetInfo from './components/PetInfo'
import GuildInfo from './components/GuildInfo'
import Outfit from './components/Outfit'
import { Loading, ErrorView } from './components/StatusViews'
import './App.css'

function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [playerData, setPlayerData] = useState(null)
  const [searchedUid, setSearchedUid] = useState(null)

  const handleSearch = useCallback(async (uid, region) => {
    setLoading(true)
    setError(null)
    setPlayerData(null)
    setSearchedUid(uid)

    try {
      const data = await fetchPlayerInfo(uid, region)
      setPlayerData(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch player data.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleOpenBrowser = useCallback(() => {
    const url = `${FALLBACK_URL}?success=1`
    if (window.Capacitor?.Plugins?.Browser) {
      window.Capacitor.Plugins.Browser.open({ url })
    } else {
      window.open(url, '_blank')
    }
  }, [])

  return (
    <div className="app">
      <div className="app-container">
        {!playerData && !loading && (
          <UidForm onSearch={handleSearch} loading={loading} />
        )}

        {loading && <Loading />}

        {error && (
          <ErrorView
            message={error}
            onRetry={() => searchedUid && handleSearch(searchedUid, 'BD')}
            onOpenBrowser={handleOpenBrowser}
          />
        )}

        {playerData && !loading && (
          <div className="results-container">
            <button
              className="back-btn"
              onClick={() => { setPlayerData(null); setError(null); }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Search Another
            </button>

            <PlayerInfo data={playerData} />
            <PetInfo pet={playerData.pet} />
            <GuildInfo guild={playerData.guild} guildLeader={playerData.guildLeader} />
            <Outfit outfits={playerData.outfits} />
          </div>
        )}

        <footer className="app-footer">
          <p>Free Fire PlayerInfo &copy; 2026</p>
          <p className="disclaimer">
            Not affiliated with Garena. Free Fire is a trademark of Garena International.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App