// src/utils/adminApiHelpers.test.ts
import { describe, it, expect } from 'vitest';
import { generatePostFileContent } from './adminApiHelpers';
import type { FrontmatterObject } from '../types/admin'; // Assuming this type is correctly exported

describe('generatePostFileContent', () => {
  const baseFrontmatter: FrontmatterObject = {
    title: 'Test Post',
    pubDate: new Date('2023-01-01T12:00:00Z'),
    author: 'Test Author',
    postType: 'blog',
    draft: false,
  };

  it('should generate content with frontmatter and body', () => {
    const bodyContent = 'This is the main content.';
    const result = generatePostFileContent(baseFrontmatter, bodyContent, 'blog', true);
    expect(result).toContain('title: Test Post');
    expect(result).toContain('pubDate: 2023-01-01T12:00:00.000Z'); // Default Date.toISOString() format
    expect(result).toContain('author: Test Author');
    expect(result).toContain('postType: blog');
    expect(result).toContain('draft: false');
    expect(result).toContain('\n---\n\nThis is the main content.\n');
  });

  it('should add placeholder for new, non-fleeting posts with empty body', () => {
    const result = generatePostFileContent(baseFrontmatter, '', 'blog', true);
    expect(result).toContain('\n---\n\n## Start Writing Here\n\nReplace this with your content.\n');
  });

  it('should not add placeholder for fleeting posts with empty body', () => {
    const fleetingFrontmatter = { ...baseFrontmatter, postType: 'fleeting' };
    const result = generatePostFileContent(fleetingFrontmatter, '', 'fleeting', true);
    // Expecting YAML frontmatter ending with \n--- and then two newlines for an empty body
    expect(result.endsWith('\n---\n\n')).toBe(true);
    expect(result).not.toContain('## Start Writing Here');
  });

  it('should not add placeholder when updating a post with empty body', () => {
    const result = generatePostFileContent(baseFrontmatter, '', 'blog', false); // isNewPost = false
    // Expecting YAML frontmatter ending with \n--- and then two newlines for an empty body
    expect(result.endsWith('\n---\n\n')).toBe(true);
    expect(result).not.toContain('## Start Writing Here');
  });

  it('should correctly format YAML frontmatter', () => {
    const result = generatePostFileContent(baseFrontmatter, 'Body', 'blog', true);
    const frontmatterPart = result.split('---')[1]; // Get content between ---
    expect(frontmatterPart).toMatchSnapshot(); // Using snapshot for complex structure
  });

  it('should ensure a final newline character', () => {
    const result = generatePostFileContent(baseFrontmatter, 'Some content', 'blog', true);
    expect(result.endsWith('\n')).toBe(true);
  });

  it('should ensure a final newline even if body is empty and no placeholder is added', () => {
    const result = generatePostFileContent(baseFrontmatter, '', 'blog', false); // isNewPost = false
    expect(result.endsWith('\n')).toBe(true);
  });

  it('should handle frontmatter with optional fields', () => {
    const fullFrontmatter: FrontmatterObject = {
      ...baseFrontmatter,
      description: 'A test description.',
      tags: ['test', 'sample'],
      series: 'Test Series',
    };
    const result = generatePostFileContent(fullFrontmatter, 'Body', 'blog', true);
    expect(result).toContain('description: A test description.');
    expect(result).toContain('tags:');
    expect(result).toContain('- test');
    expect(result).toContain('- sample');
    expect(result).toContain('series: Test Series');
    const frontmatterPart = result.split('---')[1];
    expect(frontmatterPart).toMatchSnapshot();
  });

  it('should handle empty body content correctly (trimmed)', () => {
    const bodyContent = '   '; // Only spaces
    const result = generatePostFileContent(baseFrontmatter, bodyContent, 'blog', false); // isNewPost = false (update)
    // Expecting that a body with only whitespace is treated as empty
    // So, YAML frontmatter ending with \n--- and then two newlines
    expect(result.endsWith('\n---\n\n')).toBe(true);
    expect(result.trim().endsWith('---')).toBe(true); // After trimming all newlines, should end with '---'
  });

  it('should correctly serialize date objects in frontmatter', () => {
    const date = new Date(2024, 0, 15, 10, 30, 0); // Jan 15, 2024, 10:30:00
    const fmWithDate: FrontmatterObject = { ...baseFrontmatter, pubDate: date };
    const result = generatePostFileContent(fmWithDate, 'Body', 'blog', true);
    // js-yaml typically serializes dates in ISO 8601 format, often including milliseconds
    expect(result).toContain(`pubDate: ${date.toISOString()}`);
  });
});
