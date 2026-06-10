import { useState } from 'react'
import KeywordManager from './components/KeywordManager'
import Settings from './components/Settings'

const TABS = [
  { id: 'keywords', label: '🚫 Mots-clés' },
  { id: 'settings', label: '⚙️ Paramètres' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('keywords')

  return (
    <div className="w-[380px] min-h-[400px] bg-zinc-900 text-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-zinc-800">
        <h1 className="text-lg font-bold">
          🛡️ Anti<span className="text-red-500">Spoil</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Bloque les spoils selon tes mots-clés
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === id
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'keywords' && <KeywordManager />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  )
}