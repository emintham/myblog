/**
 * Utility to load and parse prompts from YAML file
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export interface Prompt {
  id: string;
  label: string;
  prompt: string;
  contextMode: "current" | "withRAG" | "none";
  allowCustom?: boolean;
}

export interface PromptsData {
  prompts: Prompt[];
}

/**
 * Load prompts from YAML file (server-side only)
 */
export function loadPrompts(): Prompt[] {
  try {
    const promptsPath = path.join(process.cwd(), "src/data/prompts.yaml");
    const fileContents = fs.readFileSync(promptsPath, "utf8");
    const data = yaml.load(fileContents) as PromptsData;

    return data.prompts || [];
  } catch (error) {
    console.error("Failed to load prompts:", error);
    return [];
  }
}
