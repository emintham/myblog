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

  it('should trim leading and trailing spaces', () => {
    expect(generateSlug('  Hello World  ')).toBe('hello-world');
  });

  it('should handle multiple consecutive spaces', () => {
    expect(generateSlug('Hello   World')).toBe('hello-world');
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

  it('should not create slugs starting or ending with hyphens from valid characters', () => {
    expect(generateSlug('a-b-c')).toBe('a-b-c');
    expect(generateSlug('-a-b-c-')).toBe('a-b-c'); // This is covered by "remove leading and trailing hyphens"
  });

  it('should handle unicode characters (though current function removes them)', () => {
    expect(generateSlug('Привет Мир')).toBe('untitled-post'); // Current function removes these
    // If the desired behavior is to transliterate or preserve, this test would change.
    // Given the current implementation, it removes non-ASCII.
    // If it becomes empty, it should be 'untitled-post'
    expect(generateSlug('你好世界')).toBe('untitled-post'); // Assuming these are removed and result is empty
  });

    it('should handle strings with numbers', () => {
        expect(generateSlug('My 1st Post')).toBe('my-1st-post');
    });

    it('should handle strings that are already slugs', () => {
        expect(generateSlug('already-a-slug')).toBe('already-a-slug');
    });

    it('should handle very long strings (no explicit length limit in function)', () => {
        const longString = 'a'.repeat(200);
        expect(generateSlug(longString)).toBe(longString);
    });
     it('should handle input that is all special characters resulting in "untitled-post"', () => {
        expect(generateSlug('!!! --- !!!')).toBe('untitled-post');
    });
});
