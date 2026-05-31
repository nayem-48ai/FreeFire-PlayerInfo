const API_BASE = 'https://freefire-api-six.vercel.app'
const FALLBACK_URL = 'https://freefireinfo.in/get-free-fire-account-information-via-uid/'

const REGION_CODES = {
  BD: 'Bangladesh', IND: 'India', SG: 'Singapore', MY: 'Malaysia',
  ID: 'Indonesia', TH: 'Thailand', VN: 'Vietnam', PH: 'Philippines',
  BR: 'Brazil', RU: 'Russia', US: 'USA', PK: 'Pakistan',
  TW: 'Taiwan', ME: 'Middle East', CIS: 'CIS'
}

async function fetchPlayerInfo(uid, region) {
  const url = `${API_BASE}/get_player_personal_show?server=${region}&uid=${uid}`

  const response = await fetch(url, { timeout: 15000 })
  if (!response.ok) throw new Error(`Server responded with ${response.status}`)

  const data = await response.json()

  if (data.status === 'error' || data.error) {
    throw new Error(data.message || data.error || 'Failed to fetch player data')
  }

  return parsePlayerData(data, region)
}

function parsePlayerData(raw, region) {
  const basic = raw.basicInfo || {}
  const profile = raw.profileInfo || {}
  const social = raw.socialInfo || {}
  const clan = raw.clanBasicInfo || {}
  const captain = raw.captainBasicInfo || {}
  const pet = raw.petInfo || {}
  const credit = raw.creditScoreInfo || {}

  const formatTime = (ts) => {
    if (!ts) return 'N/A'
    const d = new Date(Number(ts) * 1000)
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const formatRank = (rank) => {
    if (!rank || rank === 0) return 'Unranked'
    const ranks = ['', 'Bronze I', 'Bronze II', 'Bronze III', 'Silver I', 'Silver II',
      'Silver III', 'Gold I', 'Gold II', 'Gold III', 'Platinum I', 'Platinum II',
      'Platinum III', 'Diamond I', 'Diamond II', 'Diamond III', 'Heroic',
      'Grandmaster', 'Elite Heroic', 'Elite Master', 'Elite Grandmaster']
    return ranks[rank] || `Rank ${rank}`
  }

  const getBooyahPass = (historyEp) => {
    if (!historyEp || !Array.isArray(historyEp)) return null
    const latest = historyEp[0]
    if (!latest) return null
    return {
      active: latest.ownedPass || false,
      level: latest.maxLevel || 0,
      badge: latest.epBadge || 'N/A'
    }
  }

  const getEquippedItems = (clothes) => {
    if (!clothes || !Array.isArray(clothes)) return []
    return clothes.map(item => ({
      id: item,
      icon: `https://freefiremobile-a.akamaihd.net/common/Local/PK/FF_UI_Icon/Icon_avatar_male_cos_${item}.png`
    }))
  }

  return {
    player: {
      uid: basic.accountId || uid,
      name: basic.nickname || 'Unknown',
      level: basic.level || 0,
      exp: basic.exp || 0,
      likes: basic.liked || 0,
      region: region,
      regionName: REGION_CODES[region] || region,
      honorScore: credit.creditScore || 100,
      bio: social.signature || '',
      language: (social.language || '').replace('Language_', ''),
      preferMode: (social.modePrefer || '').replace('ModePrefer_', ''),
      lastLogin: formatTime(basic.lastLoginAt),
      createDate: formatTime(basic.createAt),
      releaseVersion: basic.releaseVersion || '',
    },
    rank: {
      br: {
        rank: basic.rank || 0,
        rankName: formatRank(basic.rank),
        points: basic.rankingPoints || 0,
      },
      cs: {
        rank: basic.csRank || 0,
        rankName: formatRank(basic.csRank),
        points: basic.csRankingPoints || 0,
      },
    },
    guild: clan.clanId ? {
      id: clan.clanId,
      name: clan.clanName || 'Unknown',
      level: clan.clanLevel || 0,
      members: clan.memberNum || 0,
      capacity: clan.capacity || 0,
    } : null,
    guildLeader: captain.accountId ? {
      uid: captain.accountId,
      name: captain.nickname || 'Unknown',
      level: captain.level || 0,
      likes: captain.liked || 0,
      exp: captain.exp || 0,
      region: captain.region || region,
      rank: formatRank(captain.rank),
      rankPoints: captain.rankingPoints || 0,
      lastLogin: formatTime(captain.lastLoginAt),
      createDate: formatTime(captain.createAt),
    } : null,
    pet: pet.id ? {
      name: pet.name || 'Unknown',
      level: pet.level || 0,
      exp: pet.exp || 0,
      selected: pet.isSelected || false,
    } : null,
    booyahPass: getBooyahPass(raw.historyEpInfo),
    outfits: getEquippedItems(profile.clothes),
    raw: raw,
  }
}

export { fetchPlayerInfo, REGION_CODES, FALLBACK_URL }
export default { fetchPlayerInfo, REGION_CODES, FALLBACK_URL }