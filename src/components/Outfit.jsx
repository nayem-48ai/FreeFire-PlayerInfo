export default function Outfit({ outfits }) {
  if (!outfits || outfits.length === 0) return null

  return (
    <div className="section-card outfit-info">
      <div className="section-header">
        <div className="section-icon">
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
            <path d="M6 3h12l2 5-4 3v8H8v-8l-4-3 2-5z" stroke="#ff6b35" strokeWidth="2" fill="none" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3>Equipped Outfit</h3>
      </div>
      <div className="outfit-grid">
        {outfits.map((item, i) => (
          <div className="outfit-item" key={i}>
            <div className="outfit-icon-wrapper">
              <img
                src={item.icon}
                alt={`Outfit ${i + 1}`}
                className="outfit-icon"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="%23333" rx="8"/><text x="24" y="28" text-anchor="middle" fill="%23888" font-size="20">?</text></svg>'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}