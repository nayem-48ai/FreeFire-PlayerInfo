// Change this to your deployed Render URL
const API_BASE = 'https://freefire-api-six.vercel.app'
const FALLBACK_URL = 'https://freefireinfo.in/get-free-fire-account-information-via-uid/'

const REGION_CODES = {
  BD: 'Bangladesh', IND: 'India', SG: 'Singapore', MY: 'Malaysia',
  ID: 'Indonesia', TH: 'Thailand', VN: 'Vietnam', PH: 'Philippines',
  BR: 'Brazil', RU: 'Russia', US: 'USA', PK: 'Pakistan',
  TW: 'Taiwan', ME: 'Middle East', CIS: 'CIS'
}

async function fetchPlayerInfo(uid, region) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const url = `${API_BASE}/get_player_personal_show?server=${region}&uid=${uid}`
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data.status === 'error' || data.error) {
      throw new Error(data.message || data.error || 'No data')
    }
    return parsePlayerData(data, region)
  } finally {
    clearTimeout(timeout)
  }
}

function parsePlayerData(raw, region) {
  const basic = raw.basicInfo || {}
  const profile = raw.profileInfo || {}
  const social = raw.socialInfo || {}
  const clan = raw.clanBasicInfo || {}
  const captain = raw.captainBasicInfo || {}
  const pet = raw.petInfo || {}
  const credit = raw.creditScoreInfo || {}

  const fmtTime = (ts) => {
    if (!ts || ts === '0') return 'N/A'
    const d = new Date(Number(ts) * 1000)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const fmtRank = (r) => {
    if (!r || r === 0) return 'Unranked'
    const tiers = ['', 'Bronze I', 'Bronze II', 'Bronze III', 'Silver I', 'Silver II',
      'Silver III', 'Gold I', 'Gold II', 'Gold III', 'Platinum I', 'Platinum II',
      'Platinum III', 'Diamond I', 'Diamond II', 'Diamond III', 'Heroic',
      'Grandmaster', 'Elite Heroic', 'Elite Master', 'Elite Grandmaster']
    return tiers[r] || `Rank ${r}`
  }

  const getBp = (ep) => {
    if (!ep?.length) return null
    const latest = ep[0]
    return { active: latest.ownedPass || false, level: latest.maxLevel || 0 }
  }

  return {
    player: {
      uid: basic.accountId || uid,
      name: basic.nickname || 'Unknown',
      level: basic.level || 0,
      exp: basic.exp || 0,
      likes: basic.liked || 0,
      region, regionName: REGION_CODES[region] || region,
      honorScore: credit.creditScore ?? 100,
      bio: social.signature || '',
      language: (social.language || '').replace('Language_', ''),
      preferMode: (social.modePrefer || '').replace('ModePrefer_', ''),
      lastLogin: fmtTime(basic.lastLoginAt),
      createDate: fmtTime(basic.createAt),
      releaseVersion: basic.releaseVersion || '',
    },
    rank: {
      br: { rank: basic.rank || 0, rankName: fmtRank(basic.rank), points: basic.rankingPoints || 0 },
      cs: { rank: basic.csRank || 0, rankName: fmtRank(basic.csRank), points: basic.csRankingPoints || 0 },
    },
    guild: clan.clanId ? {
      id: clan.clanId, name: clan.clanName || '', level: clan.clanLevel || 0,
      members: clan.memberNum || 0, capacity: clan.capacity || 0,
    } : null,
    guildLeader: captain.accountId ? {
      uid: captain.accountId, name: captain.nickname || '', level: captain.level || 0,
      likes: captain.liked || 0, rank: fmtRank(captain.rank), region: captain.region || region,
      lastLogin: fmtTime(captain.lastLoginAt), createDate: fmtTime(captain.createAt),
    } : null,
    pet: pet.id ? {
      name: pet.name || '', level: pet.level || 0, exp: pet.exp || 0, selected: pet.isSelected || false,
    } : null,
    booyahPass: getBp(raw.historyEpInfo),
  }
}

export { fetchPlayerInfo, REGION_CODES, FALLBACK_URL }