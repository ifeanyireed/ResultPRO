export class SlugHelper {
  /**
   * Convert string to URL-friendly slug
   * @param text Text to convert
   * @returns Slug string
   */
  static generate(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
  }

  /**
   * Generate unique slug by appending random string
   * @param baseSlug Base slug
   * @returns Unique slug
   */
  static generateUnique(baseSlug: string): string {
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${randomString}`;
  }

  /**
   * Validate if string is valid slug format
   * @param slug Slug to validate
   * @returns boolean
   */
  static isValid(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  }
}
