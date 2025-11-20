/**
 * Simple markdown to HTML converter
 * Supports: headers, bold, italic, links, lists, paragraphs, code blocks
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return ''

  // Split into lines for better processing
  const lines = markdown.split('\n')
  const result: string[] = []
  let inList = false
  let inParagraph = false

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Empty line - close paragraph or list
    if (line.trim() === '') {
      if (inParagraph) {
        result.push('</p>')
        inParagraph = false
      }
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      continue
    }

    // Headers
    if (line.startsWith('### ')) {
      if (inParagraph) result.push('</p>')
      if (inList) result.push('</ul>')
      inParagraph = false
      inList = false
      result.push(`<h3>${processInline(line.substring(4))}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      if (inParagraph) result.push('</p>')
      if (inList) result.push('</ul>')
      inParagraph = false
      inList = false
      result.push(`<h2>${processInline(line.substring(3))}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      if (inParagraph) result.push('</p>')
      if (inList) result.push('</ul>')
      inParagraph = false
      inList = false
      result.push(`<h1>${processInline(line.substring(2))}</h1>`)
      continue
    }

    // Lists
    if (line.trim().startsWith('- ')) {
      if (inParagraph) {
        result.push('</p>')
        inParagraph = false
      }
      if (!inList) {
        result.push('<ul>')
        inList = true
      }
      result.push(`<li>${processInline(line.trim().substring(2))}</li>`)
      continue
    }

    // Regular paragraph
    if (inList) {
      result.push('</ul>')
      inList = false
    }
    if (!inParagraph) {
      result.push('<p>')
      inParagraph = true
    } else {
      result.push('<br>')
    }
    result.push(processInline(line))
  }

  // Close any open tags
  if (inParagraph) result.push('</p>')
  if (inList) result.push('</ul>')

  return result.join('')
}

/**
 * Process inline markdown (bold, italic, links)
 */
function processInline(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Code inline
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

