import { useState, useEffect, useRef } from 'react'
import { DEFAULT_CATEGORIES } from '../data/catalogConfig'
import { loadRemoteCatalog, rememberSlice, pushRemoteCatalog } from '../utils/remoteStore'

const STORAGE_KEY = 'eleeme_categories_v1'

// Limpia la lista: strings no vacíos, sin duplicados, sin 'Todos' (se antepone aparte)
function sanitize(list) {
  const seen = new Set()
  const out = []
  for (const raw of list || []) {
    const name = String(raw || '').trim()
    if (!name) continue
    if (name.toLowerCase() === 'todos') continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(name)
  }
  return out
}

// Carga las categorías guardadas; si no hay nada, usa los defaults.
function loadCategories() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      const clean = sanitize(parsed)
      if (clean.length) return clean
    }
  } catch {}
  return [...DEFAULT_CATEGORIES]
}

export function useCategories() {
  const [categories, setCategories] = useState(loadCategories)
  // Igual que en useProducts: no dejar que la respuesta (vieja y lenta) del fetch
  // a la nube pise una edición local ya guardada.
  const localEdited = useRef(false)

  // Traer las categorías publicadas en la nube (si hay backend configurado).
  useEffect(() => {
    rememberSlice('categories', categories)
    let alive = true
    loadRemoteCatalog().then((remote) => {
      if (!alive || localEdited.current) return
      if (!remote || !Array.isArray(remote.categories)) return
      const clean = sanitize(remote.categories)
      if (!clean.length) return
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(clean)) } catch {}
      rememberSlice('categories', clean)
      setCategories(clean)
    })
    return () => { alive = false }
  }, [])

  const saveCategories = (next) => {
    localEdited.current = true
    const clean = sanitize(next)
    const final = clean.length ? clean : [...DEFAULT_CATEGORIES]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(final))
    setCategories(final)
    rememberSlice('categories', final)
    pushRemoteCatalog()
  }

  const resetCategories = () => {
    localStorage.removeItem(STORAGE_KEY)
    setCategories([...DEFAULT_CATEGORIES])
  }

  return { categories, saveCategories, resetCategories }
}
