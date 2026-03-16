/**
 * Feeder Embed Script
 *
 * Self-contained vanilla TypeScript widget that renders social posts
 * directly into the host page DOM using Shadow DOM for style isolation.
 * The expanded modal is appended to document.body for full-page overlay.
 *
 * Usage:
 *   <script src="https://YOUR_DOMAIN/embed.js" data-widget="WIDGET_ID"></script>
 */

;(function () {
  // ── Types ──────────────────────────────────────────────────────────────

  interface Post {
    id: string
    author_name: string
    author_avatar_url: string | null
    content: string
    media_url: string | null
    media_type: string | null
    post_url: string
    like_count: number
    comment_count: number
    share_count: number
    published_at: string
  }

  interface WidgetConfig {
    id: string
    name: string
    layout: string
    config: {
      autoRotate?: boolean
      rotationSpeed?: number
      postsVisible?: number
      columns?: number
      maxPosts?: number
      shadow?: boolean
      borderRadius?: string
      theme?: 'light' | 'dark'
      accentColor?: string
    }
  }

  interface WidgetData {
    widget: WidgetConfig
    posts: Post[]
    demo?: boolean
  }

  // ── SVG Icons ──────────────────────────────────────────────────────────

  const icons = {
    chevronLeft:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    chevronRight:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6 6"/></svg>',
    externalLink:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    thumbsUp:
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>',
    messageCircle:
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
    share:
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>',
  }

  // ── CSS ────────────────────────────────────────────────────────────────

  function getWidgetCSS(cfg: WidgetConfig['config']): string {
    const isDark = cfg.theme === 'dark'
    const bg = isDark ? '#1f2937' : '#ffffff'
    const text = isDark ? '#f3f4f6' : '#111827'
    const subtext = isDark ? '#9ca3af' : '#6b7280'
    const border = isDark ? '#374151' : '#e5e7eb'
    const accent = cfg.accentColor || '#2563eb'
    const radius = cfg.borderRadius || '0.75rem'
    const shadowVal = cfg.shadow !== false ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : 'none'

    return `
      :host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      .feeder-carousel { position: relative; }
      .feeder-carousel-track-wrapper { overflow: hidden; margin: 0 1rem; }
      .feeder-carousel-track {
        display: flex;
        transition: transform 0.5s ease-in-out;
      }
      .feeder-carousel-slide { flex-shrink: 0; padding: 0 0.5rem; }

      .feeder-nav-btn {
        position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
        background: rgba(255,255,255,0.9); border: none; border-radius: 50%;
        width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
        cursor: pointer; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        color: #374151; transition: background 0.2s;
      }
      .feeder-nav-btn:hover { background: #ffffff; }
      .feeder-nav-prev { left: 0; margin-left: -0.75rem; }
      .feeder-nav-next { right: 0; margin-right: -0.75rem; }

      .feeder-dots { display: flex; justify-content: center; gap: 0.5rem; margin-top: 1rem; }
      .feeder-dot {
        width: 10px; height: 10px; border-radius: 50%; border: none;
        cursor: pointer; transition: background 0.2s; background: #d1d5db;
      }
      .feeder-dot.active { background: ${accent}; }
      .feeder-dot:hover { background: #9ca3af; }
      .feeder-dot.active:hover { background: ${accent}; }

      /* Card */
      .feeder-card {
        background: ${bg}; border: 1px solid ${border}; border-radius: ${radius};
        overflow: hidden; display: flex; flex-direction: column;
        box-shadow: ${shadowVal}; transition: box-shadow 0.2s;
      }
      .feeder-card.fixed-height { height: 380px; }

      .feeder-card-header { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1rem 0.5rem; }
      .feeder-card-avatar {
        width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0;
      }
      .feeder-card-avatar-placeholder {
        width: 40px; height: 40px; border-radius: 50%;
        background: ${accent}; color: #fff; font-weight: 600; font-size: 0.875rem;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .feeder-card-author { flex: 1; min-width: 0; }
      .feeder-card-author-name {
        font-weight: 600; font-size: 0.875rem; color: ${text};
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .feeder-card-author-date { font-size: 0.75rem; color: ${subtext}; }
      .feeder-card-link {
        color: ${accent}; flex-shrink: 0; display: flex; align-items: center;
        text-decoration: none;
      }
      .feeder-card-link:hover { opacity: 0.8; }

      .feeder-card-body { flex: 1; min-height: 0; }
      .feeder-card-body.fixed-height { overflow: hidden; }
      .feeder-card-content {
        padding: 0 1rem 0.75rem; font-size: 0.875rem; color: ${text};
        line-height: 1.625; white-space: pre-line;
      }
      .feeder-card-content.clamped {
        display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
      }
      .feeder-card-media {
        padding: 0 1rem 0.75rem;
      }
      .feeder-card-media img {
        width: 100%; border-radius: 0.5rem; object-fit: cover;
      }
      .feeder-card-media img.fixed-height { max-height: 160px; }
      .feeder-card-media img.full-height { max-height: 320px; }

      .feeder-read-more {
        background: none; border: none; color: ${accent}; cursor: pointer;
        font-size: 0.875rem; font-weight: 500; padding: 0 1rem 0.5rem;
      }
      .feeder-read-more:hover { text-decoration: underline; }

      .feeder-card-footer {
        display: flex; align-items: center; gap: 1rem;
        padding: 0.75rem 1rem; border-top: 1px solid ${border}; margin-top: auto;
      }
      .feeder-stat {
        display: flex; align-items: center; gap: 0.25rem;
        font-size: 0.75rem; color: ${subtext};
      }

      /* Grid layout */
      .feeder-grid {
        display: grid; gap: 1rem;
      }

      /* List layout */
      .feeder-list { display: flex; flex-direction: column; gap: 1rem; }

      /* Masonry layout */
      .feeder-masonry { columns: 3; column-gap: 1rem; }
      .feeder-masonry > * { break-inside: avoid; margin-bottom: 1rem; }

      @media (max-width: 1023px) {
        .feeder-masonry { columns: 2; }
      }
      @media (max-width: 639px) {
        .feeder-masonry { columns: 1; }
      }
    `
  }


  // ── Helpers ────────────────────────────────────────────────────────────

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString()
    } catch {
      return iso
    }
  }

  function el(tag: string, attrs?: Record<string, string>, html?: string): HTMLElement {
    const e = document.createElement(tag)
    if (attrs) Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v))
    if (html !== undefined) e.innerHTML = html
    return e
  }

  // ── Card Rendering ────────────────────────────────────────────────────

  function renderCard(
    post: Post,
    opts: { fixedHeight?: boolean }
  ): HTMLElement {
    const cls = ['feeder-card']
    if (opts.fixedHeight) cls.push('fixed-height')

    const card = el('div', { class: cls.join(' ') })

    // Header
    const header = el('div', { class: 'feeder-card-header' })
    if (post.author_avatar_url) {
      header.appendChild(el('img', {
        class: 'feeder-card-avatar',
        src: post.author_avatar_url,
        alt: post.author_name,
      }))
    } else {
      header.appendChild(el('div', { class: 'feeder-card-avatar-placeholder' }, post.author_name.charAt(0).toUpperCase()))
    }

    const author = el('div', { class: 'feeder-card-author' })
    author.appendChild(el('div', { class: 'feeder-card-author-name' }, post.author_name))
    author.appendChild(el('div', { class: 'feeder-card-author-date' }, formatDate(post.published_at)))
    header.appendChild(author)

    const link = el('a', {
      class: 'feeder-card-link',
      href: post.post_url,
      target: '_blank',
      rel: 'noopener noreferrer',
      title: 'View original post',
    }, icons.externalLink)
    header.appendChild(link)

    card.appendChild(header)

    // Body
    const bodyEl = el('div')
    bodyEl.className = opts.fixedHeight ? 'feeder-card-body fixed-height' : 'feeder-card-body'

    const contentCls = opts.fixedHeight ? 'feeder-card-content clamped' : 'feeder-card-content'
    const content = el('div', { class: contentCls })
    content.textContent = post.content
    bodyEl.appendChild(content)

    if (post.media_url) {
      const media = el('div', { class: 'feeder-card-media' })
      const img = el('img', {
        src: post.media_url,
        alt: 'Post media',
        class: opts.fixedHeight ? 'fixed-height' : 'full-height',
      })
      media.appendChild(img)
      bodyEl.appendChild(media)
    }
    card.appendChild(bodyEl)

    // Footer
    const footer = el('div', { class: 'feeder-card-footer' })
    footer.appendChild(el('span', { class: 'feeder-stat' }, `${icons.thumbsUp} ${post.like_count}`))
    footer.appendChild(el('span', { class: 'feeder-stat' }, `${icons.messageCircle} ${post.comment_count}`))
    footer.appendChild(el('span', { class: 'feeder-stat' }, `${icons.share} ${post.share_count}`))
    card.appendChild(footer)

    return card
  }

  // ── Carousel Layout ────────────────────────────────────────────────────

  function renderCarousel(root: ShadowRoot, data: WidgetData): void {
    const { posts, widget } = data
    const cfg = widget.config
    const maxPosts = cfg.maxPosts || 30
    const visiblePosts = posts.slice(0, maxPosts)
    const autoRotate = cfg.autoRotate !== false
    const rotationSpeed = (cfg.rotationSpeed || 5) * 1000
    const desktopVisible = cfg.postsVisible || 3

    if (visiblePosts.length === 0) return

    function getVisibleCount(): number {
      const w = window.innerWidth
      if (w < 640) return 1
      if (w < 1024) return Math.min(2, desktopVisible)
      return desktopVisible
    }

    let visibleCount = getVisibleCount()
    let currentIndex = 0
    let isHovered = false
    let timer: ReturnType<typeof setInterval> | null = null

    const wrapper = el('div', { class: 'feeder-carousel' })

    // Nav buttons
    const prevBtn = el('button', { class: 'feeder-nav-btn feeder-nav-prev', 'aria-label': 'Previous' }, icons.chevronLeft)
    const nextBtn = el('button', { class: 'feeder-nav-btn feeder-nav-next', 'aria-label': 'Next' }, icons.chevronRight)

    // Track
    const trackWrapper = el('div', { class: 'feeder-carousel-track-wrapper' })
    const track = el('div', { class: 'feeder-carousel-track' })

    visiblePosts.forEach((post) => {
      const slide = el('div', { class: 'feeder-carousel-slide' })
      const card = renderCard(post, { fixedHeight: true })
      slide.appendChild(card)
      track.appendChild(slide)
    })
    trackWrapper.appendChild(track)

    // Dots
    const dotsContainer = el('div', { class: 'feeder-dots' })

    function getMaxIndex() {
      return Math.max(0, visiblePosts.length - visibleCount)
    }

    function update() {
      const maxIdx = getMaxIndex()
      if (currentIndex > maxIdx) currentIndex = maxIdx

      // Update slide widths
      const slides = track.querySelectorAll('.feeder-carousel-slide') as NodeListOf<HTMLElement>
      slides.forEach((s) => {
        s.style.width = `${100 / visibleCount}%`
      })

      // Update transform
      track.style.transform = `translateX(-${currentIndex * (100 / visibleCount)}%)`

      // Show/hide nav
      const showNav = visiblePosts.length > visibleCount
      prevBtn.style.display = showNav ? '' : 'none'
      nextBtn.style.display = showNav ? '' : 'none'
      dotsContainer.style.display = showNav ? '' : 'none'

      // Update dots
      dotsContainer.innerHTML = ''
      if (showNav) {
        const dotCount = maxIdx + 1
        for (let i = 0; i < dotCount; i++) {
          const dot = el('button', {
            class: `feeder-dot${i === currentIndex ? ' active' : ''}`,
            'aria-label': `Go to slide ${i + 1}`,
          })
          dot.addEventListener('click', () => {
            currentIndex = i
            update()
            restartTimer()
          })
          dotsContainer.appendChild(dot)
        }
      }
    }

    function goNext() {
      const maxIdx = getMaxIndex()
      currentIndex = currentIndex >= maxIdx ? 0 : currentIndex + 1
      update()
    }

    function goPrev() {
      const maxIdx = getMaxIndex()
      currentIndex = currentIndex <= 0 ? maxIdx : currentIndex - 1
      update()
    }

    function startTimer() {
      if (!autoRotate || visiblePosts.length <= visibleCount) return
      timer = setInterval(() => {
        if (!isHovered) goNext()
      }, rotationSpeed)
    }

    function restartTimer() {
      if (timer) clearInterval(timer)
      startTimer()
    }

    prevBtn.addEventListener('click', () => { goPrev(); restartTimer() })
    nextBtn.addEventListener('click', () => { goNext(); restartTimer() })

    wrapper.addEventListener('mouseenter', () => { isHovered = true })
    wrapper.addEventListener('mouseleave', () => { isHovered = false })

    // Touch swipe support
    let touchStartX = 0
    let touchStartY = 0
    trackWrapper.addEventListener('touchstart', (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }, { passive: true })
    trackWrapper.addEventListener('touchmove', (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - touchStartX)
      const dy = Math.abs(e.touches[0].clientY - touchStartY)
      if (dx > dy && dx > 10) {
        e.preventDefault()
      }
    }, { passive: false })
    trackWrapper.addEventListener('touchend', (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY)
      if (Math.abs(dx) > 50 && Math.abs(dx) > dy) {
        if (dx < 0) goNext()
        else goPrev()
        restartTimer()
      }
    }, { passive: true })

    wrapper.appendChild(prevBtn)
    wrapper.appendChild(nextBtn)
    wrapper.appendChild(trackWrapper)
    wrapper.appendChild(dotsContainer)

    root.appendChild(wrapper)

    update()
    startTimer()

    // Handle resize
    window.addEventListener('resize', () => {
      const newCount = getVisibleCount()
      if (newCount !== visibleCount) {
        visibleCount = newCount
        update()
        restartTimer()
      }
    })
  }

  // ── Grid Layout ────────────────────────────────────────────────────────

  function renderGrid(root: ShadowRoot, data: WidgetData): void {
    const { posts, widget } = data
    const cfg = widget.config
    const maxPosts = cfg.maxPosts || 30
    const columns = cfg.columns || 3
    const visiblePosts = posts.slice(0, maxPosts)

    const grid = el('div', { class: 'feeder-grid' })
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
    visiblePosts.forEach((post) => {
      grid.appendChild(renderCard(post, { fixedHeight: false }))
    })
    root.appendChild(grid)
  }

  // ── List Layout ────────────────────────────────────────────────────────

  function renderList(root: ShadowRoot, data: WidgetData): void {
    const { posts, widget } = data
    const cfg = widget.config
    const maxPosts = cfg.maxPosts || 30
    const visiblePosts = posts.slice(0, maxPosts)

    const list = el('div', { class: 'feeder-list' })
    visiblePosts.forEach((post) => {
      list.appendChild(renderCard(post, { fixedHeight: false }))
    })
    root.appendChild(list)
  }

  // ── Masonry Layout ────────────────────────────────────────────────────

  function renderMasonry(root: ShadowRoot, data: WidgetData): void {
    const { posts, widget } = data
    const cfg = widget.config
    const maxPosts = cfg.maxPosts || 30
    const visiblePosts = posts.slice(0, maxPosts)

    const masonry = el('div', { class: 'feeder-masonry' })
    visiblePosts.forEach((post) => {
      masonry.appendChild(renderCard(post, { fixedHeight: false }))
    })
    root.appendChild(masonry)
  }

  // ── Init ───────────────────────────────────────────────────────────────

  function detectBaseUrl(): string {
    const scripts = document.querySelectorAll('script[src]')
    for (let i = scripts.length - 1; i >= 0; i--) {
      const src = (scripts[i] as HTMLScriptElement).src
      if (src.includes('embed.js')) {
        try {
          const url = new URL(src)
          return url.origin
        } catch {
          // fall through
        }
      }
    }
    return window.location.origin
  }

  async function initWidget(scriptEl: HTMLScriptElement): Promise<void> {
    const widgetId = scriptEl.getAttribute('data-widget')
    if (!widgetId) return

    const baseUrl = detectBaseUrl()

    // Create container after the script tag
    const container = document.createElement('div')
    container.setAttribute('data-feeder-widget', widgetId)
    scriptEl.parentNode!.insertBefore(container, scriptEl.nextSibling)

    // Attach shadow DOM
    const shadow = container.attachShadow({ mode: 'open' })

    // Fetch data
    let data: WidgetData
    try {
      const res = await fetch(`${baseUrl}/api/widget/${widgetId}`)
      if (!res.ok) {
        shadow.innerHTML = `<p style="color:#ef4444;font-family:sans-serif;font-size:0.875rem;">Failed to load widget</p>`
        return
      }
      data = await res.json()
    } catch (err) {
      shadow.innerHTML = `<p style="color:#ef4444;font-family:sans-serif;font-size:0.875rem;">Failed to load widget</p>`
      return
    }

    // Inject styles into shadow DOM
    const style = document.createElement('style')
    style.textContent = getWidgetCSS(data.widget.config)
    shadow.appendChild(style)

    // Render the appropriate layout
    const layout = data.widget.layout
    switch (layout) {
      case 'carousel':
        renderCarousel(shadow, data)
        break
      case 'grid':
        renderGrid(shadow, data)
        break
      case 'list':
        renderList(shadow, data)
        break
      case 'masonry':
        renderMasonry(shadow, data)
        break
      default:
        renderList(shadow, data)
    }
  }

  // Find all embed script tags and init widgets
  function init() {
    const scripts = document.querySelectorAll<HTMLScriptElement>('script[data-widget]')
    scripts.forEach((s) => {
      // Avoid double-init
      if (s.getAttribute('data-feeder-initialized')) return
      s.setAttribute('data-feeder-initialized', 'true')
      initWidget(s)
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
