import { useState } from 'react'
import { REGION_CODES } from '../services/api'

export default function UidForm({ onSearch, loading }) {
  const [uid, setUid] = useState('')
  const [region, setRegion] = useState('BD')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = uid.trim()
    if (trimmed && /^\d{5,}$/.test(trimmed)) {
      onSearch(trimmed, region)
    }
  }

  return (
    <form className="uid-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div className="logo-icon">
          <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
            <circle cx="24" cy="24" r="22" fill="#ff6b35" stroke="#fff" strokeWidth="2"/>
            <path d="M16 20c0-4 3-8 8-8s8 4 8 8-3 8-8 8-8-4-8-8z" fill="#fff"/>
            <path d="M20 28l4 8 4-8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1>Free Fire PlayerInfo</h1>
        <p className="subtitle">Look up any Free Fire account by UID</p>
      </div>

      <div className="input-group">
        <label htmlFor="region">Region</label>
        <select
          id="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="region-select"
        >
          {Object.entries(REGION_CODES).map(([code, name]) => (
            <option key={code} value={code}>{code} - {name}</option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="uid">Player UID</label>
        <div className="uid-input-wrapper">
          <input
            id="uid"
            type="text"
            inputMode="numeric"
            placeholder="Enter UID (e.g., 10150623094)"
            value={uid}
            onChange={(e) => setUid(e.target.value.replace(/\D/g, ''))}
            pattern="\d{5,}"
            required
            className="uid-input"
          />
        </div>
      </div>

      <button
        type="submit"
        className="search-btn"
        disabled={loading || !/^\d{5,}$/.test(uid.trim())}
      >
        {loading ? (
          <span className="btn-loading">
            <span className="spinner" />
            Fetching Data...
          </span>
        ) : (
          'Get Account Info'
        )}
      </button>
    </form>
  )
}