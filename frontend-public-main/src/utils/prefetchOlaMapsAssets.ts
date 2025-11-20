const spriteSuffixes = ['sprite', 'sprite@2x']
const glyphRanges = ['0-255', '256-511']

let prefetchPromise: Promise<void> | null = null

const safeFetch = async (url: string, opts?: RequestInit) => {
  try {
    await fetch(url, { mode: 'cors', cache: 'reload', ...opts })
  } catch (err) {
    // Ignore network failures; we only attempt to warm caches.
    console.debug('Ola maps prefetch failed', url, err)
  }
}

export const prefetchOlaMapsAssets = (apiKey: string, backendOrigin: string) => {
  if (!apiKey) return Promise.resolve()
  if (prefetchPromise) return prefetchPromise

  prefetchPromise = (async () => {
    const styleName = 'default-light-standard'
    const directBase = `https://api.olamaps.io/tiles/vector/v1/styles/${styleName}`
    const proxyBase = `${backendOrigin}/api/bookings/tiles`

    await Promise.all([
      safeFetch(`${directBase}/style.json?api_key=${apiKey}`),
      safeFetch(`${proxyBase}/style.json?styleName=${styleName}`)
    ])

    await Promise.all(spriteSuffixes.map((suffix) => {
      const direct = `${directBase}/${suffix}.json?api_key=${apiKey}`
      const directPng = `${directBase}/${suffix}.png?api_key=${apiKey}`
      const proxy = `${proxyBase}/sprite?styleName=${styleName}&scale=${suffix === 'sprite@2x' ? 2 : 1}`
      return Promise.all([
        safeFetch(direct),
        safeFetch(directPng),
        safeFetch(`${proxy}&type=json`),
        safeFetch(`${proxy}&type=png`)
      ])
    }))

    await Promise.all(glyphRanges.map((range) => {
      const direct = `${directBase}/glyphs/Arial%20UnicodeMS/${range}.pbf?api_key=${apiKey}`
      const proxy = `${proxyBase}/glyphs/${styleName}/${range}.pbf`
      return Promise.all([
        safeFetch(direct),
        safeFetch(proxy)
      ])
    }))
  })()

  return prefetchPromise
}

export default prefetchOlaMapsAssets

