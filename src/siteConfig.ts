// Site configuration with environment variable overrides
// Set these in .env to override defaults (see .env.example)
export const SITE_TITLE = import.meta.env.SITE_TITLE || "Your Awesome Blog Name";
export const SITE_DESCRIPTION = import.meta.env.SITE_DESCRIPTION || "A thoughtful space for [your topics here].";
export const AUTHOR_NAME = import.meta.env.AUTHOR_NAME || "Your Name";
export const PUBLIC_SITE_URL = import.meta.env.PUBLIC_SITE_URL || "";
export const REMARK42_HOST = import.meta.env.REMARK42_HOST || "https://YOUR_REMARK42_SERVER_DOMAIN.com";
export const REMARK42_SITE_ID = import.meta.env.REMARK42_SITE_ID || "remark";
export const ADMIN_PATH_PREFIX = "/admin";
