import slugify from "slugify";

export function generateSlug(text: string): string {
    if (!text) return "";
    const slug = slugify(text, {
        lower: true,
        strict: true,
        trim: true,
    });
    // Add random suffix to ensure uniqueness if needed, but for now we trust the title.
    // In a real app, we would check DB for collision and append number.
    return slug;
}
