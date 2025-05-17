import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { generateSlug} from '../src/utils/slugify.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, '..', 'src', 'content', 'blog');
const templatePath = path.join(__dirname, 'post-template.md');

async function createNewPost() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise(resolve => rl.question(query, resolve));

  try {
    const title = await question('Enter post title: ');
    if (!title.trim()) {
      console.log('Title cannot be empty. Aborting.');
      rl.close();
      return;
    }

    const description = await question('Enter a short description (optional): ');
    const tagsInput = await question('Enter tags (comma-separated, optional): ');
    const seriesInput = await question('Enter series name (optional, leave blank if none): ');

    const slug = generateSlug(title);
    const fileName = `${slug}.md`;
    const filePath = path.join(postsDir, fileName);
    const pubDate = new Date().toISOString().split('T')[0];

    const titleValue = title.replace(/"/g, '\\"');
    const descriptionValue = description.replace(/"/g, '\\"');

    const tagsLine = tagsInput.trim()
      ? `tags: [${tagsInput.split(',').map(tag => `"${tag.trim().replace(/"/g, '\\"')}"`).join(', ')}]`
      : '# tags: []';

    const seriesLine = seriesInput.trim()
      ? `series: "${seriesInput.trim().replace(/"/g, '\\"')}"`
      : '# series: ""';

    let templateContent;
    try {
      templateContent = await fs.readFile(templatePath, 'utf-8');
    } catch (readError) {
      console.error(`Error reading template file at ${templatePath}:`, readError);
      console.error("Please ensure 'scripts/post-template.md' exists in the same directory as this script.");
      rl.close();
      return;
    }

    templateContent = templateContent
      .replace('{{TITLE}}', titleValue)
      .replace('{{PUB_DATE}}', pubDate)
      .replace('{{DESCRIPTION}}', descriptionValue)
      .replace('{{TAGS_LINE_PLACEHOLDER}}', tagsLine)
      .replace('{{SERIES_LINE_PLACEHOLDER}}', seriesLine);

    try {
      await fs.access(filePath);
      const overwrite = await question(`File "${fileName}" already exists in src/content/blog/. Overwrite? (yes/no): `);
      if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
        console.log('Operation cancelled. File not overwritten.');
        rl.close();
        return;
      }
    } catch (e) {
      // File does not exist, proceed
    }

    await fs.writeFile(filePath, templateContent);
    console.log(`\nNew post created: src/content/blog/${fileName}`);
    console.log("Remember to change 'draft: true' to 'draft: false' when ready to publish!");

  } catch (error) {
    console.error('\nError creating new post:', error);
  } finally {
    rl.close();
  }
}

fs.mkdir(postsDir, { recursive: true })
  .then(createNewPost)
  .catch(err => {
    console.error("Could not create posts directory:", err);
    // Close readline interface if it was opened and an error occurs early
    // This check is tricky because rl might not be defined if mkdir fails before createNewPost is called.
    // For simplicity, we rely on the finally block in createNewPost.
  });
