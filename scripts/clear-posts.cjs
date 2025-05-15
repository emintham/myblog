const fs = require('fs').promises; // Use promises API for async/await
const path = require('path');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const postsDir = path.join(__dirname, '..', 'src', 'content', 'blog');

async function clearPosts() {
  try {
    const files = await fs.readdir(postsDir);
    const markdownFiles = files.filter(
      (file) => file.endsWith('.md') || file.endsWith('.mdx')
    );

    if (markdownFiles.length === 0) {
      console.log('No posts found in src/content/blog/ to delete.');
      readline.close();
      return;
    }

    console.log('Found the following posts to delete:');
    markdownFiles.forEach((file) => console.log(`- ${file}`));

    readline.question('Are you sure you want to delete these posts? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        for (const file of markdownFiles) {
          await fs.unlink(path.join(postsDir, file));
          console.log(`Deleted ${file}`);
        }
        console.log('All example posts cleared.');
      } else {
        console.log('Operation cancelled. No posts were deleted.');
      }
      readline.close();
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('src/content/blog/ directory not found. No posts to delete.');
    } else {
      console.error('Error clearing posts:', error);
    }
    readline.close();
  }
}

clearPosts();
