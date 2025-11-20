import React from 'react'

interface SeoProps {
  title?: string
  description?: string
  canonical?: string
  noindex?: boolean
}

const Seo: React.FC<SeoProps> = ({ title, description, canonical, noindex }) => {
  React.useEffect(() => {
    if (title) document.title = title

    const ensureTag = (selector: string, create: () => HTMLElement): HTMLElement => {
      let el = document.head.querySelector(selector) as HTMLElement | null
      if (!el) {
        el = create()
        document.head.appendChild(el)
      }
      return el
    }

    if (description !== undefined) {
      const metaDesc = ensureTag('meta[name="description"]', () => {
        const m = document.createElement('meta')
        m.setAttribute('name', 'description')
        return m
      }) as HTMLMetaElement
      metaDesc.setAttribute('content', description || '')
    }

    if (canonical) {
      const linkCanonical = ensureTag('link[rel="canonical"]', () => {
        const l = document.createElement('link')
        l.setAttribute('rel', 'canonical')
        return l
      }) as HTMLLinkElement
      linkCanonical.setAttribute('href', canonical)
    }

    const robots = ensureTag('meta[name="robots"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'robots')
      return m
    }) as HTMLMetaElement
    robots.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow')

    // Open Graph basic tags for social sharing
    const ogTitle = ensureTag('meta[property="og:title"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('property', 'og:title')
      return m
    }) as HTMLMetaElement
    ogTitle.setAttribute('content', title || 'Local ToTo')

    const ogDesc = ensureTag('meta[property="og:description"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('property', 'og:description')
      return m
    }) as HTMLMetaElement
    ogDesc.setAttribute('content', description || '')

    const ogType = ensureTag('meta[property="og:type"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('property', 'og:type')
      return m
    }) as HTMLMetaElement
    ogType.setAttribute('content', 'website')

    return () => {}
  }, [title, description, canonical, noindex])

  return null
}

export default Seo


