import { useState, useEffect } from 'react'
import { getSettings, saveSetting } from '../../utils/storage'

const DISPLAY_STYLES = [
  { value: 'block', label: 'Couleur pleine' },
  { value: 'blur', label: 'Flou' },
]

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
]

export default function Settings() {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const handleChange = async (key, value) => {
    const updated = await saveSetting(key, value)
    setSettings(updated)
  }

  if (!settings) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Couleur du spoil */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-zinc-300">Couleur du masquage</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={settings.spoilColor}
            onChange={(e) => handleChange('spoilColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
          />
          <span className="text-xs text-zinc-500 font-mono">{settings.spoilColor}</span>
        </div>
      </div>

      {/* Style d'affichage */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-300">Style de masquage</label>
        <div className="flex gap-2">
          {DISPLAY_STYLES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleChange('displayStyle', value)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                settings.displayStyle === value
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Langue */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-300">Langue</label>
        <div className="flex gap-2">
          {LANGUAGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleChange('language', value)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                settings.language === value
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}