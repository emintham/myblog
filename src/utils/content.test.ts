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

  it('should return an empty string if description is undefined and body is empty string', () => {
    const post = {
      data: {},
      body: '',
    };
    expect(extractPreviewContent(post)).toBe('');
  });

  it('should return an empty string if description is empty string and body is empty string', () => {
    const post = {
      data: { description: '' }, // Explicitly empty description
      body: '',
    };
    // The function prioritizes description, so if it's an empty string, it should return that.
    expect(extractPreviewContent(post)).toBe('');
  });

  it('should handle body with only a <p> tag', () => {
    const post = {
      data: {},
      body: '<p>A single paragraph.</p>',
    };
    expect(extractPreviewContent(post)).toBe('<p>A single paragraph.</p>');
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

  it('should return empty string for an empty post object', () => {
    const post = { data: {} }; // Technically, data should be there.
    expect(extractPreviewContent(post)).toBe('');
  });

  it('should handle post with data but undefined description and undefined body', () => {
    const post = {
      data: { title: 'Test Post' } as any, // Cast to any to simulate missing optional fields
    };
    expect(extractPreviewContent(post)).toBe('');
  });

  it('should correctly extract from plain text body if no <p> tags are found', () => {
    const post = {
      data: {},
      body: `This is simple text.
No p tags here.`,
    };
    expect(extractPreviewContent(post)).toBe(`This is simple text.
No p tags here.`);
  });

  it('should correctly extract the first paragraph even with attributes on the p tag', () => {
    const post = {
      data: {},
      body: '<p class="foo" id="bar">Paragraph with attributes.</p><p>Next one.</p>',
    };
    expect(extractPreviewContent(post)).toBe('<p class="foo" id="bar">Paragraph with attributes.</p>');
  });
});
