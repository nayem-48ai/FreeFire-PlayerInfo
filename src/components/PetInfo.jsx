export default function PetInfo({ pet }) {
  if (!pet) return null
  return (
    <div className="section-card pet-info">
      <div className="section-header">
        <div className="section-icon">
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
            <path d="M12 4c-3 0-5 2-5 5 0 2 1 4 3 5l-1 3h6l-1-3c2-1 3-3 3-5 0-3-2-5-5-5z" stroke="#ff6b35" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        <h3>Pet Info</h3>
      </div>
      <div className="pet-details">
        <div className="pet-name-section">
          <span className="pet-name">{pet.name}</span>
          {pet.selected && <span className="pet-selected-badge">Selected</span>}
        </div>
        <div className="info-grid">
          <InfoRow label="Level" value={pet.level} />
          <InfoRow label="EXP" value={pet.exp?.toLocaleString()} />
          <InfoRow label="Status" value={pet.selected ? 'Active' : 'Inactive'} />
        </div>
      </div>
    </div>
  )
}

const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value">{value || 'N/A'}</span>
  </div>
)