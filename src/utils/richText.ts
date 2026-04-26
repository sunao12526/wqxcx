import { getEnvBaseUrl } from '.'

export interface RichTextVideoItem {
  src: string
  poster?: string
}

function getRichTextBaseUrl() {
  return getEnvBaseUrl().replace('/api', '')
}

function normalizeMediaUrl(path?: string) {
  if (!path) {
    return ''
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  if (path.startsWith('/')) {
    return `${getRichTextBaseUrl()}${path}`
  }

  return path
}

function getTagAttribute(attrs: string, name: string) {
  const match = attrs.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'))
  return match?.[1] || ''
}

export function processRichTextImages(html: string): string {
  if (!html) {
    return ''
  }

  const baseUrl = getRichTextBaseUrl()
  let processedHtml = html.replace(/src=["'](\/[^"']+)["']/g, (match, path) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return match
    }
    return `src="${baseUrl}${path}"`
  })

  processedHtml = processedHtml.replace(/<img([^>]*)>/gi, (match, attrs) => {
    const imageStyle = 'max-width:100%;width:100%;height:auto;display:block;margin:0 auto 16px;border-radius:6px;'
    if (attrs.includes('style=')) {
      return match.replace(/style=["']([^"']*)["']/i, (_styleMatch: string, styleValue: string) => {
        return `style="${styleValue};${imageStyle}"`
      })
    }
    return `<img${attrs} style="${imageStyle}">`
  })

  const textTags = ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th', 'a', 'strong', 'b', 'em', 'i']
  const fontStyle = 'font-size:16px;color:#1A1A1A;letter-spacing:0;text-align:justify;line-height:24px;font-weight:400;'

  textTags.forEach((tag) => {
    const regex = new RegExp(`<${tag}([^>]*)>`, 'gi')
    processedHtml = processedHtml.replace(regex, (match, attrs) => {
      if (attrs.includes('style=')) {
        return match.replace(/style=["']([^"']*)["']/i, (_styleMatch: string, styleValue: string) => {
          return `style="${styleValue};${fontStyle}"`
        })
      }
      return `<${tag}${attrs} style="${fontStyle}">`
    })
  })

  return processedHtml
}

export function extractRichTextVideos(html: string): RichTextVideoItem[] {
  if (!html) {
    return []
  }

  const videos: RichTextVideoItem[] = []

  html.replace(/<video\b([^>]*)>([\s\S]*?)<\/video>/gi, (_match, attrs: string, content: string) => {
    const src = normalizeMediaUrl(getTagAttribute(attrs, 'src')) || normalizeMediaUrl(getTagAttribute(content, 'src'))
    const poster = normalizeMediaUrl(getTagAttribute(attrs, 'poster'))

    if (src) {
      videos.push({
        src,
        poster: poster || undefined,
      })
    }

    return ''
  })

  return videos
}

export function stripRichTextVideos(html: string): string {
  if (!html) {
    return ''
  }

  return html
    .replace(/<video\b[\s\S]*?<\/video>/gi, '')
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
}
