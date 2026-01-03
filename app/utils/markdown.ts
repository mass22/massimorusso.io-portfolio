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
    const line = lines[i]

    // Empty line - close paragraph or list
    if (!line || line.trim() === '') {
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
      const headerText = line.substring(4)
      result.push(`<h3 style="margin-top: 2.5rem; margin-bottom: 1.25rem; color: var(--color-highlighted); font-weight: 700;">${processInline(headerText)}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      if (inParagraph) result.push('</p>')
      if (inList) result.push('</ul>')
      inParagraph = false
      inList = false
      const headerText = line.substring(3)
      result.push(`<h2 style="margin-top: 3rem; margin-bottom: 1.5rem; color: var(--color-primary); font-weight: 700;">${processInline(headerText)}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      if (inParagraph) result.push('</p>')
      if (inList) result.push('</ul>')
      inParagraph = false
      inList = false
      const headerText = line.substring(2)
      result.push(`<h1 style="margin-top: 3rem; margin-bottom: 1.5rem;">${processInline(headerText)}</h1>`)
      continue
    }

    const trimmedLine = line.trim()

    // Horizontal rule (---) - can be standalone
    if (trimmedLine === '---') {
      if (inParagraph) {
        result.push('</p>')
        inParagraph = false
      }
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      // Skip horizontal rules - they add unwanted visual separation
      continue
    }

    // Check if line contains --- separator (even if embedded in text)
    // Split on --- and process each part separately
    if (line.includes('---')) {
      const parts = line.split('---')
      for (let j = 0; j < parts.length; j++) {
        const part = parts[j]?.trim()
        if (!part) {
          // This is a separator, close current paragraph and continue
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

        // Process the text part
        if (inList) {
          result.push('</ul>')
          inList = false
        }
        if (!inParagraph) {
          result.push('<p style="margin-bottom: 2rem; margin-top: 0;">')
          inParagraph = true
        } else if (j > 0) {
          // If not the first part, close previous paragraph and start new one
          result.push('</p><p style="margin-bottom: 2rem; margin-top: 0;">')
        } else {
          result.push('<br>')
        }
        result.push(processInline(part))
      }
      continue
    }

    // Lists
    if (trimmedLine.startsWith('- ')) {
      if (inParagraph) {
        result.push('</p>')
        inParagraph = false
      }
      if (!inList) {
        result.push('<ul>')
        inList = true
      }
      const listItemText = trimmedLine.substring(2)
      result.push(`<li>${processInline(listItemText)}</li>`)
      continue
    }

    // Regular paragraph
    if (inList) {
      result.push('</ul>')
      inList = false
    }
    if (!inParagraph) {
      result.push('<p style="margin-bottom: 2rem; margin-top: 0;">')
      inParagraph = true
    } else {
      // Convert line breaks to <br> tags
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
