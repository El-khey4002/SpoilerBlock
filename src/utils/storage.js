const STORAGE_KEYS = {
  KEYWORDS: 'keywords',
  SETTINGS: 'settings',
}

const DEFAULT_SETTINGS = {
  theme: 'dark',
  spoilColor: '#e74c3c',
  displayStyle: 'block', // 'block' | 'blur'
  language: 'fr',
}

export async function getKeywords() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEYS.KEYWORDS, (data) => {
      resolve(data[STORAGE_KEYS.KEYWORDS] || [])
    })
  })
}

export async function saveKeywords(keywords) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.KEYWORDS]: keywords }, resolve)
  })
}
// De base dans le storage de chrome on a un objet vide : {}
// chrome.storage.sync.set({ [STORAGE_KEYS.KEYWORDS]: ["anime"]
// est équivalent à :
// chrome.storage.sync.set({ keywords: ["anime"]
// Chrome voit ca :
// {
//   keywords: [...], 
// }


export async function addKeyword(keyword) {
  const keywords = await getKeywords()
  const trimmed = keyword.trim().toLowerCase()
  if (!trimmed || keywords.includes(trimmed)) return keywords
  const updated = [...keywords, trimmed]
  await saveKeywords(updated)
  return updated
}

export async function removeKeyword(keyword) {
  const keywords = await getKeywords()
  const updated = keywords.filter((k) => k !== keyword)
  await saveKeywords(updated)
  return updated
}

export async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEYS.SETTINGS, (data) => {
      resolve({ ...DEFAULT_SETTINGS, ...data[STORAGE_KEYS.SETTINGS] })
    })
  })
}

export async function saveSetting(key, value) {
  const settings = await getSettings()
  const updated = { ...settings, [key]: value }
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: updated }, () => resolve(updated))
  })
}