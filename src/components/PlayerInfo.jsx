const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value">{value || 'N/A'}</span>
  </div>
)

const Badge = ({ label, value, color }) => (
  <div className="badge" style={{ borderColor: color || '#ff6b35' }}>
    <span className="badge-value">{value}</span>
    <span className="badge-label">{label}</span>
  </div>
)

export default function PlayerInfo({ data }) {
  const { player, rank, booyahPass } = data

  return (
    <div className="section-card player-info">
      <div className="section-header">
        <div className="section-icon">
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
            <circle cx="12" cy="8" r="4" stroke="#ff6b35" strokeWidth="2" fill="none"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#ff6b35" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        <h3>Player Profile</h3>
      </div>

      <div className="player-name-header">
        <h2 className="player-name">{player.name}</h2>
        <span className="player-uid">UID: {player.uid}</span>
      </div>

      <div className="badges-row">
        <Badge label="Level" value={player.level} color="#ff6b35" />
        <Badge label="Likes" value={player.likes?.toLocaleString()} color="#e74c8b" />
        <Badge label="EXP" value={player.exp?.toLocaleString()} color="#ffc107" />
        {booyahPass && (
          <Badge
            label={booyahPass.active ? 'BP Active' : 'BP'}
            value={booyahPass.level}
            color={booyahPass.active ? '#00e676' : '#888'}
          />
        )}
      </div>

      <div className="rank-section">
        <div className="rank-card br-rank">
          <span className="rank-label">BR Rank</span>
          <span className="rank-value">{rank.br.rankName}</span>
          <span className="rank-points">{rank.br.points} pts</span>
        </div>
        <div className="rank-card cs-rank">
          <span className="rank-label">CS Rank</span>
          <span className="rank-value">{rank.cs.rankName}</span>
          <span className="rank-points">{rank.cs.points} pts</span>
        </div>
      </div>

      <div className="info-grid">
        <InfoRow label="Region" value={`${player.regionName} (${player.region})`} />
        <InfoRow label="Honor Score" value={player.honorScore} />
        <InfoRow label="Language" value={player.language} />
        <InfoRow label="Preferred Mode" value={player.preferMode} />
        <InfoRow label="Account Created" value={player.createDate} />
        <InfoRow label="Last Login" value={player.lastLogin} />
        <InfoRow label="Version" value={player.releaseVersion} />
        {player.bio && <InfoRow label="Bio" value={player.bio} />}
      </div>
    </div>
  )
}