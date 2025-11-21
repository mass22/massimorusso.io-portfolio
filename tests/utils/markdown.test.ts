import { describe, expect, it } from 'vitest'
import { markdownToHtml } from '../../app/utils/markdown'

describe('markdownToHtml', () => {
  it('should handle empty input', () => {
    expect(markdownToHtml('')).toBe('')
  })

  it('should convert headers', () => {
    expect(markdownToHtml('# Header 1')).toBe('<h1>Header 1</h1>')
    expect(markdownToHtml('## Header 2')).toBe('<h2>Header 2</h2>')
    expect(markdownToHtml('### Header 3')).toBe('<h3>Header 3</h3>')
  })

  it('should convert paragraphs', () => {
    expect(markdownToHtml('Simple paragraph')).toBe('<p>Simple paragraph</p>')
    expect(markdownToHtml('Line 1\nLine 2')).toBe('<p>Line 1<br>Line 2</p>')
  })

  it('should convert lists', () => {
    const markdown = `- Item 1
- Item 2`
    expect(markdownToHtml(markdown)).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>')
  })

  it('should handle inline formatting', () => {
    expect(markdownToHtml('**Bold**')).toBe('<p><strong>Bold</strong></p>')
    expect(markdownToHtml('*Italic*')).toBe('<p><em>Italic</em></p>')
    expect(markdownToHtml('`Code`')).toBe('<p><code>Code</code></p>')
  })

  it('should convert links', () => {
    expect(markdownToHtml('[Link](https://example.com)')).toBe('<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a></p>')
  })

  it('should handle mixed content', () => {
    const markdown = `# Title

Paragraph with **bold** text.

- List item 1
- List item 2`

    const expected = '<h1>Title</h1><p>Paragraph with <strong>bold</strong> text.</p><ul><li>List item 1</li><li>List item 2</li></ul>'
    expect(markdownToHtml(markdown)).toBe(expected)
  })
})
