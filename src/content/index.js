import { getKeywords, getSettings } from '../utils/storage.js'

const ANTISPOIL_CLASS = 'antispoil-block'
const ANTISPOIL_OVERLAY_CLASS = 'antispoil-overlay'

// ─── Injection du CSS dans la page ───────────────────────────────────────────

function injectStyles(color, displayStyle) {
  const existing = document.getElementById('antispoil-styles')
  if (existing) existing.remove()

  const style = document.createElement('style')
  style.id = 'antispoil-styles'
  style.textContent = `
    .${ANTISPOIL_CLASS} {
      position: relative;
      display: inline-block;
      border-radius: 4px;
      cursor: pointer;
      vertical-align: middle;
    }

    .${ANTISPOIL_CLASS}--block span.antispoil-text {
      background-color: ${color};
      color: transparent;
      border-radius: 4px;
      padding: 0 4px;
      user-select: none;
    }

    .${ANTISPOIL_CLASS}--blur span.antispoil-text {
      filter: blur(6px);
      border-radius: 4px;
      padding: 0 4px;
      user-select: none;
    }

    .${ANTISPOIL_CLASS} .antispoil-badge {
      position: absolute;
      top: -18px;
      left: 0;
      background-color: ${color};
      color: white;
      font-size: 10px;
      font-weight: bold;
      padding: 1px 5px;
      border-radius: 3px;
      white-space: nowrap;
      pointer-events: none;
      font-family: sans-serif;
      z-index: 99999;
    }

    .${ANTISPOIL_OVERLAY_CLASS} {
      position: relative;
      display: inline-block;
      cursor: pointer;
    }

    .${ANTISPOIL_OVERLAY_CLASS}__cover {
      position: absolute;
      inset: 0;
      background-color: ${color};
      border-radius: 4px;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .${ANTISPOIL_OVERLAY_CLASS}__cover--blur {
      backdrop-filter: blur(12px);
      background-color: transparent;
    }

    .${ANTISPOIL_OVERLAY_CLASS}__badge {
      color: white;
      font-size: 11px;
      font-weight: bold;
      font-family: sans-serif;
      background-color: rgba(0,0,0,0.4);
      padding: 2px 8px;
      border-radius: 3px;
    }
  `
  document.head.appendChild(style)
}

// ─── Masquage du texte ────────────────────────────────────────────────────────

function maskTextNode(textNode, keyword, displayStyle) {
  const text = textNode.textContent
  const lowerText = text.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()

  if (!lowerText.includes(lowerKeyword)) return false

  const parts = text.split(new RegExp(`(${keyword})`, 'gi'))
  const wrapper = document.createElement('span')

  parts.forEach((part) => {
    if (part.toLowerCase() === lowerKeyword) {
      const block = document.createElement('span')
      block.className = `${ANTISPOIL_CLASS} ${ANTISPOIL_CLASS}--${displayStyle}`

      const badge = document.createElement('span')
      badge.className = 'antispoil-badge'
      badge.textContent = `🚫 ${keyword}`

      const maskedText = document.createElement('span')
      maskedText.className = 'antispoil-text'
      maskedText.textContent = part

      block.appendChild(badge)
      block.appendChild(maskedText)

      // clic pour révéler
      block.addEventListener('click', () => {
        block.replaceWith(document.createTextNode(part))
      })

      wrapper.appendChild(block)
    } else {
      wrapper.appendChild(document.createTextNode(part))
    }
  })

  textNode.replaceWith(wrapper)
  return true
}

// ─── Masquage des images ──────────────────────────────────────────────────────

function maskImage(img, keyword, displayStyle) {
  if (img.dataset.antispoilDone) return
  img.dataset.antispoilDone = 'true'

  const parent = img.parentElement
  const wrapper = document.createElement('span')
  wrapper.className = ANTISPOIL_OVERLAY_CLASS
  wrapper.style.display = 'inline-block'

  parent.insertBefore(wrapper, img)
  wrapper.appendChild(img)

  const cover = document.createElement('span')
  cover.className = `${ANTISPOIL_OVERLAY_CLASS}__cover${displayStyle === 'blur' ? ` ${ANTISPOIL_OVERLAY_CLASS}__cover--blur` : ''}`

  const badge = document.createElement('span')
  badge.className = `${ANTISPOIL_OVERLAY_CLASS}__badge`
  badge.textContent = `🚫 ${keyword}`

  cover.appendChild(badge)
  wrapper.appendChild(cover)

  // clic pour révéler
  cover.addEventListener('click', () => cover.remove())
}

// ─── Scan du DOM ──────────────────────────────────────────────────────────────

function getImageContext(img) {
  const alt = img.alt || ''
  const title = img.title || ''
  const src = img.src || ''
  const parentText = img.closest('a, div, article, li')?.textContent || ''
  return `${alt} ${title} ${src} ${parentText}`.toLowerCase()
}

function scanDOM(keywords, displayStyle) {
  if (!keywords.length) return

  // Scan texte
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement
        if (!parent) return NodeFilter.FILTER_REJECT
        const tag = parent.tagName
        if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT'].includes(tag)) {
          return NodeFilter.FILTER_REJECT
        }
        if (parent.classList.contains(ANTISPOIL_CLASS)) {
          return NodeFilter.FILTER_REJECT
        }
        return NodeFilter.FILTER_ACCEPT
      },
    }
  )

  const textNodes = []
  let node
  while ((node = walker.nextNode())) textNodes.push(node)

  textNodes.forEach((textNode) => {
    keywords.forEach((keyword) => {
      maskTextNode(textNode, keyword, displayStyle)
    })
  })

  // Scan images
  document.querySelectorAll('img').forEach((img) => {
    const context = getImageContext(img)
    keywords.forEach((keyword) => {
      if (context.includes(keyword.toLowerCase())) {
        maskImage(img, keyword, displayStyle)
      }
    })
  })
}

// ─── MutationObserver (pages dynamiques) ─────────────────────────────────────

function observeDOM(keywords, displayStyle) {
  const observer = new MutationObserver(() => {
    scanDOM(keywords, displayStyle)
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  const keywords = await getKeywords()
  const settings = await getSettings()
  const { spoilColor, displayStyle } = settings

  if (!keywords.length) return

  injectStyles(spoilColor, displayStyle)
  scanDOM(keywords, displayStyle)
  observeDOM(keywords, displayStyle)
}

init()