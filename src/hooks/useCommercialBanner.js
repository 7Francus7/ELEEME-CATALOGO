import { useState } from 'react'
import { DEFAULT_COMMERCIAL_BANNER } from '../data/catalogConfig'

const STORAGE_KEY = 'eleeme_commercial_banner_v1'

function cleanList(list, fallback) {
  const seen = new Set()
  const clean = []

  for (const raw of list || []) {
    const value = String(raw || '').trim()
    if (!value) continue
    const key = value.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    clean.push(value)
  }

  return clean.length ? clean : [...fallback]
}

function sanitizeBannerConfig(config) {
  const next = config || {}

  return {
    enabled: next.enabled !== false,
    badge: String(next.badge || DEFAULT_COMMERCIAL_BANNER.badge).trim() || DEFAULT_COMMERCIAL_BANNER.badge,
    title: String(next.title || DEFAULT_COMMERCIAL_BANNER.title).trim() || DEFAULT_COMMERCIAL_BANNER.title,
    description:
      String(next.description || DEFAULT_COMMERCIAL_BANNER.description).trim() ||
      DEFAULT_COMMERCIAL_BANNER.description,
    note: String(next.note || DEFAULT_COMMERCIAL_BANNER.note).trim() || DEFAULT_COMMERCIAL_BANNER.note,
    cards: cleanList(next.cards, DEFAULT_COMMERCIAL_BANNER.cards),
    perks: cleanList(next.perks, DEFAULT_COMMERCIAL_BANNER.perks),
  }
}

function loadBannerConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return sanitizeBannerConfig(JSON.parse(stored))
  } catch {}

  return sanitizeBannerConfig(DEFAULT_COMMERCIAL_BANNER)
}

export function useCommercialBanner() {
  const [bannerConfig, setBannerConfig] = useState(loadBannerConfig)

  const saveBannerConfig = (next) => {
    const clean = sanitizeBannerConfig(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
    setBannerConfig(clean)
  }

  const resetBannerConfig = () => {
    const defaults = sanitizeBannerConfig(DEFAULT_COMMERCIAL_BANNER)
    localStorage.removeItem(STORAGE_KEY)
    setBannerConfig(defaults)
  }

  return { bannerConfig, saveBannerConfig, resetBannerConfig }
}
