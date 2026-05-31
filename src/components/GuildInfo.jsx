const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value">{value || 'N/A'}</span>
  </div>
)

export default function GuildInfo({ guild, guildLeader }) {
  if (!guild) return null

  return (
    <>
      <div className="section-card guild-info">
        <div className="section-header">
          <div className="section-icon">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="#ff6b35" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 3.13a4 4 0 010 7.75" stroke="#ff6b35" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3>Guild Info</h3>
        </div>
        <div className="info-grid">
          <InfoRow label="Name" value={guild.name} />
          <InfoRow label="Level" value={guild.level} />
          <InfoRow label="Members" value={`${guild.members}/${guild.capacity}`} />
          <InfoRow label="Guild ID" value={guild.id} />
        </div>
      </div>

      {guildLeader && (
        <div className="section-card leader-info">
          <div className="section-header">
            <div className="section-icon">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" stroke="#ffc107" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h3>Guild Leader</h3>
          </div>
          <div className="leader-name-header">
            <span className="leader-name">{guildLeader.name}</span>
            <span className="leader-uid">UID: {guildLeader.uid}</span>
          </div>
          <div className="info-grid">
            <InfoRow label="Level" value={guildLeader.level} />
            <InfoRow label="Likes" value={guildLeader.likes?.toLocaleString()} />
            <InfoRow label="EXP" value={guildLeader.exp?.toLocaleString()} />
            <InfoRow label="Region" value={guildLeader.region} />
            <InfoRow label="BR Rank" value={guildLeader.rank} />
            <InfoRow label="Rank Points" value={guildLeader.rankPoints} />
            <InfoRow label="Created" value={guildLeader.createDate} />
            <InfoRow label="Last Login" value={guildLeader.lastLogin} />
          </div>
        </div>
      )}
    </>
  )
}