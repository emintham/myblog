// src/utils/slugify.test.ts
import { describe, it, expect } from 'vitest';
import { generateSlug } from './slugify';

describe('generateSlug', () => {
  it('should convert basic strings with spaces to slugs', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(generateSlug('Hello World! 123?')).toBe('hello-world-123');
  });

  it('should remove leading and trailing hyphens after processing', () => {
    expect(generateSlug('---Hello World---')).toBe('hello-world');
    expect(generateSlug('!Hello World!')).toBe('hello-world');
  });

  it('should handle strings that become empty after processing', () => {
    expect(generateSlug('!@#$%^&*()_+')).toBe('_');
  });

  it('should convert strings to lowercase', () => {
    expect(generateSlug('HelloWorld')).toBe('helloworld');
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('should return "untitled-post" for an empty input string', () => {
    // Based on the function's current behavior, though the comment suggests
    // it expects non-empty text due to API route pre-validation.
    // Let's test its actual behavior with empty string.
    expect(generateSlug('')).toBe('untitled-post');
  });

  it('should handle mixed case and special characters', () => {
    expect(generateSlug('My Awesome Post Title!!!')).toBe('my-awesome-post-title');
  });

  it('should replace multiple hyphens with a single one', () => {
    expect(generateSlug('hello--world')).toBe('hello-world');
    expect(generateSlug('hello---world')).toBe('hello-world');
  });

  it('should handle strings with numbers', () => {
    expect(generateSlug('My 1st Post')).toBe('my-1st-post');
  });
});
