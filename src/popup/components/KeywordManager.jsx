import { useState, useEffect } from 'react'
import { getKeywords, addKeyword, removeKeyword } from '../../utils/storage'

export default function KeywordManager() {
  const [keywords, setKeywords] = useState([])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getKeywords().then(setKeywords)
  }, [])

  const handleAdd = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    if (keywords.includes(trimmed.toLowerCase())) {
      setError('Ce mot-clé existe déjà')
      return
    }

    const updated = await addKeyword(trimmed)
    setKeywords(updated)
    setInput('')
    setError('')
  }

  const handleRemove = async (keyword) => {
    const updated = await removeKeyword(keyword)
    setKeywords(updated)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError('')
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ex: Breaking Bad, One Piece..."
          className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 outline-none focus:border-red-500 transition-colors"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          Ajouter
        </button>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {keywords.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-4">
          Aucun mot-clé. Ajoute un mot-clé à bloquer.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-sm text-white"
            >
              {kw}
              <button
                onClick={() => handleRemove(kw)}
                className="text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}