import { describe, expect, it } from 'vitest'
import { markdownToHtml } from '../../app/utils/markdown'

describe('markdownToHtml', () => {
  it('should handle empty input', () => {
    expect(markdownToHtml('')).toBe('')
  })

  it('should convert headers', () => {
    expect(markdownToHtml('# Header 1')).toBe('<h1 style="margin-top: 3rem; margin-bottom: 1.5rem;">Header 1</h1>')
    expect(markdownToHtml('## Header 2')).toBe('<h2 style="margin-top: 3rem; margin-bottom: 1.5rem; color: var(--color-primary); font-weight: 700;">Header 2</h2>')
    expect(markdownToHtml('### Header 3')).toBe('<h3 style="margin-top: 2.5rem; margin-bottom: 1.25rem; color: var(--color-highlighted); font-weight: 700;">Header 3</h3>')
  })

  it('should convert paragraphs', () => {
    expect(markdownToHtml('Simple paragraph')).toBe('<p style="margin-bottom: 2rem; margin-top: 0;">Simple paragraph</p>')
    expect(markdownToHtml('Line 1\nLine 2')).toBe('<p style="margin-bottom: 2rem; margin-top: 0;">Line 1<br>Line 2</p>')
  })

  it('should convert lists', () => {
    const markdown = `- Item 1
- Item 2`
    expect(markdownToHtml(markdown)).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>')
  })

  it('should handle inline formatting', () => {
    expect(markdownToHtml('**Bold**')).toBe('<p style="margin-bottom: 2rem; margin-top: 0;"><strong>Bold</strong></p>')
    expect(markdownToHtml('*Italic*')).toBe('<p style="margin-bottom: 2rem; margin-top: 0;"><em>Italic</em></p>')
    expect(markdownToHtml('`Code`')).toBe('<p style="margin-bottom: 2rem; margin-top: 0;"><code>Code</code></p>')
  })

  it('should convert links', () => {
    expect(markdownToHtml('[Link](https://example.com)')).toBe('<p style="margin-bottom: 2rem; margin-top: 0;"><a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a></p>')
  })

  it('should handle mixed content', () => {
    const markdown = `# Title

Paragraph with **bold** text.

- List item 1
- List item 2`

    const expected = '<h1 style="margin-top: 3rem; margin-bottom: 1.5rem;">Title</h1><p style="margin-bottom: 2rem; margin-top: 0;">Paragraph with <strong>bold</strong> text.</p><ul><li>List item 1</li><li>List item 2</li></ul>'
    expect(markdownToHtml(markdown)).toBe(expected)
  })
})
