// src/utils/content.test.ts
import { describe, it, expect } from 'vitest';
import { extractPreviewContent } from './content';

describe('extractPreviewContent', () => {
  it('should return the description if available', () => {
    const post = {
      data: { description: 'This is a description.' },
      body: '<p>This is the body.</p>',
    };
    expect(extractPreviewContent(post)).toBe('This is a description.');
  });

  it('should extract the first HTML paragraph if no description and body has HTML', () => {
    const post = {
      data: {},
      body: '<p>First paragraph.</p><p>Second paragraph.</p>',
    };
    expect(extractPreviewContent(post)).toBe('<p>First paragraph.</p>');
  });

  it('should extract the first line of plain text if no description and body has plain text', () => {
    const post = {
      data: {},
      body: `First line of text.

Second line of text.`,
    };
    expect(extractPreviewContent(post)).toBe('First line of text.');
  });

  it('should prioritize description over body content', () => {
    const post = {
      data: { description: 'Preferred description.' },
      body: 'Some body text.',
    };
    expect(extractPreviewContent(post)).toBe('Preferred description.');
  });

  it('should return an empty string if no description and no body', () => {
    const post = {
      data: {},
    };
    expect(extractPreviewContent(post)).toBe('');
  });

  it('should handle body with HTML content not starting with a <p> tag (falls back to plain text extraction)', () => {
    const post = {
      data: {},
      body: `<div>Not a p-tag.</div>

Next line.`,
    };
    expect(extractPreviewContent(post)).toBe('<div>Not a p-tag.</div>');
  });

  it('should handle body with mixed HTML and text, extracting first <p> if present', () => {
    const post = {
      data: {},
      body: '<h2>Title</h2><p>This is the <em>first</em> paragraph.</p>Another line.',
    };
    expect(extractPreviewContent(post)).toBe('<p>This is the <em>first</em> paragraph.</p>');
  });
});
