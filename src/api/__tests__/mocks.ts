import { vi } from "vitest";

// Mock astro:content module
vi.mock("astro:content", () => ({
  getCollection: vi.fn().mockResolvedValue([]),
  getEntry: vi.fn().mockResolvedValue(null),
  getEntryBySlug: vi.fn().mockResolvedValue(null),
}));

// Mock fs module
export const mockFs = {
  access: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
  mkdir: vi.fn(),
  readFile: vi.fn(),
};
vi.mock("node:fs/promises", () => ({
  default: mockFs,
  // For some reason, Astro/Vite needs named exports for internal node modules sometimes.
  // Let's ensure they are there if needed, though default should be primary.
  access: mockFs.access,
  writeFile: mockFs.writeFile,
  unlink: mockFs.unlink,
  mkdir: mockFs.mkdir,
  readFile: mockFs.readFile,
}));

// Mock js-yaml
export const mockJsYaml = {
  dump: vi.fn(),
};
vi.mock("js-yaml", () => ({
  default: mockJsYaml,
  dump: mockJsYaml.dump, // If it's used as a named import anywhere
}));

// Mock gray-matter
export const mockMatter = vi.fn(() => ({
  data: {},
  content: "",
}));
vi.mock("gray-matter", () => ({
  default: mockMatter,
}));

// Mock slugify
// In the original tests, generateSlug was defined slightly differently for create vs update.
// Using a common one now. If specific behavior is needed, tests can override the mock implementation per test.
export const mockGenerateSlug = vi.fn(
  (title: string) =>
    title.toLowerCase().replace(/\s+/g, "-").replace(/[?'"]/g, "") // More generic slugify
);
vi.mock("../../../utils/slugify", () => ({
  generateSlug: mockGenerateSlug,
}));

// Mock adminApiHelpers
export const mockTransformApiPayloadToFrontmatter = vi.fn(async (payload) => ({
  ...payload,
})); // Simplified, actual was Promise.resolve
export const mockGeneratePostFileContent = vi.fn(
  (frontmatter, body) => `---
${JSON.stringify(frontmatter)}
---
${body}`
);

vi.mock("../../../utils/adminApiHelpers", () => ({
  transformApiPayloadToFrontmatter: mockTransformApiPayloadToFrontmatter,
  generatePostFileContent: mockGeneratePostFileContent,
}));

// Mock RAG service
vi.mock("../../../services/rag/index", () => ({
  getRAGService: vi.fn().mockResolvedValue({
    upsertPost: vi.fn().mockResolvedValue(undefined),
    deletePost: vi.fn().mockResolvedValue(undefined),
    upsertQuotes: vi.fn().mockResolvedValue(undefined),
    deleteQuotes: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue([]),
    rebuild: vi.fn().mockResolvedValue({
      postsProcessed: 0,
      paragraphsIndexed: 0,
      quotesIndexed: 0,
      timeMs: 0,
    }),
    getStats: vi.fn().mockResolvedValue(null),
    initialize: vi.fn().mockResolvedValue(undefined),
    optimize: vi.fn().mockResolvedValue(undefined),
  }),
  RAGService: vi.fn().mockImplementation(() => ({
    upsertPost: vi.fn().mockResolvedValue(undefined),
    deletePost: vi.fn().mockResolvedValue(undefined),
    upsertQuotes: vi.fn().mockResolvedValue(undefined),
    deleteQuotes: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue([]),
    rebuild: vi.fn().mockResolvedValue({
      postsProcessed: 0,
      paragraphsIndexed: 0,
      quotesIndexed: 0,
      timeMs: 0,
    }),
    getStats: vi.fn().mockResolvedValue(null),
    initialize: vi.fn().mockResolvedValue(undefined),
    optimize: vi.fn().mockResolvedValue(undefined),
  })),
}));
