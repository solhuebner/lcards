import DefaultTheme from 'vitepress/theme'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import { onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import mediumZoom from 'medium-zoom'
import './style.css'

// ── Mermaid SVG lightbox ───────────────────────────────────────────────────
// medium-zoom only works with real <img> elements in document flow.
// For inline SVGs we use a native <dialog> lightbox instead.

let lightboxEl: HTMLDialogElement | null = null

function getLightbox(): HTMLDialogElement {
  if (lightboxEl) return lightboxEl
  lightboxEl = document.createElement('dialog')
  lightboxEl.className = 'mz-svg-lightbox'
  lightboxEl.innerHTML = '<div class="mz-svg-inner"></div>'
  document.body.appendChild(lightboxEl)
  // Close on backdrop click
  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl) lightboxEl!.close()
  })
  return lightboxEl
}

function openSvgLightbox(svgEl: SVGSVGElement) {
  const lb    = getLightbox()
  const inner = lb.querySelector('.mz-svg-inner')!
  // Clone so the original stays in the page
  const clone = svgEl.cloneNode(true) as SVGSVGElement
  // Ensure it fills the lightbox
  clone.removeAttribute('width')
  clone.removeAttribute('height')
  clone.style.cssText = 'width:100%;height:100%;max-height:80vh;'
  inner.innerHTML = ''
  inner.appendChild(clone)
  lb.showModal()
}

// ── Theme setup ───────────────────────────────────────────────────────────

export default {
  ...DefaultTheme,

  enhanceApp({ app }: { app: any }) {
    enhanceAppWithTabs(app)
  },

  setup() {
    const route = useRoute()

    // Images — medium-zoom works natively here
    const initImageZoom = () => {
      mediumZoom('.vp-doc img:not([data-mz]):not(.VPImage)', {
        background: 'var(--mz-bg, #0d1117e6)',
        margin: 24,
      })
      document.querySelectorAll('.vp-doc img:not(.VPImage)').forEach(el => el.setAttribute('data-mz', '1'))
    }

    // Delegated click for mermaid diagrams — no timing issues
    const handleMermaidClick = (e: MouseEvent) => {
      const mermaidDiv = (e.target as Element).closest?.('.vp-doc .mermaid')
      if (!mermaidDiv) return
      const svg = mermaidDiv.querySelector('svg')
      if (svg) openSvgLightbox(svg as SVGSVGElement)
    }

    onMounted(() => {
      initImageZoom()
      document.addEventListener('click', handleMermaidClick)
    })
    onUnmounted(() => document.removeEventListener('click', handleMermaidClick))
    watch(() => route.path, () => nextTick(initImageZoom))
  },
}

