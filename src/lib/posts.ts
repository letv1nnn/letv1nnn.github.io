import { parse } from 'yaml'

export interface Post {
    slug: string,
    title: string,
    date: string,
    description?: string,
    tags?: string[],
    // True when the date was read from the body's `*dd/mm/yyyy ...*` line, which is already rendered.
    dateInBody: boolean,
    content: string,
}

// Every .md file in src/posts is bundled at build time; the filename becomes the slug.
const files = import.meta.glob('../posts/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>;

// Images live next to their post, in src/posts/<slug>/, and are linked relatively
// from the markdown (`![](<slug>/photo.jpg)`). Vite bundles them and gives each a URL.
const assets = import.meta.glob('../posts/*/*.{png,jpg,jpeg,gif,webp,svg}', {
    query: '?url',
    import: 'default',
    eager: true,
}) as Record<string, string>;

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const HEADING = /^\s*# (.+)\r?\n?/;
const BODY_DATE = /^\s*\*(\d{1,2})\/(\d{1,2})\/(\d{4})\b/;

const parsePost = (path: string, raw: string): Post => {
    const slug = path.split('/').pop()!.replace(/\.md$/, '');
    const match = raw.match(FRONTMATTER);
    const meta = match ? (parse(match[1]) ?? {}) : {};
    let content = match ? raw.slice(match[0].length) : raw;

    // Without a frontmatter title, use the leading `# ` heading and drop it from the body
    // (the article page renders the title itself).
    let title: string | undefined = meta.title;
    const heading = content.match(HEADING);
    if (!title && heading) {
        title = heading[1].trim();
        content = content.slice(heading[0].length);
    }

    // YAML turns unquoted dates into Date objects; normalise to YYYY-MM-DD.
    let date = meta.date instanceof Date
        ? meta.date.toISOString().slice(0, 10)
        : String(meta.date ?? '');

    // Otherwise fall back to a leading `*dd/mm/yyyy · ...*` line in the body.
    const bodyDate = content.match(BODY_DATE);
    const dateInBody = !date && !!bodyDate;
    if (dateInBody) {
        const [, day, month, year] = bodyDate!;
        date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return {
        slug,
        title: title ?? slug,
        date,
        description: meta.description,
        tags: meta.tags,
        dateInBody,
        content,
    };
};

const posts: Post[] = Object.entries(files)
    .map(([path, raw]) => parsePost(path, raw))
    .sort((a, b) => b.date.localeCompare(a.date));

export const getAllPosts = (): Post[] => posts;

export const getPost = (slug: string): Post | undefined =>
    posts.find((post) => post.slug === slug);

// Map a relative markdown link to its bundled URL; anything else passes through unchanged.
export const resolveAsset = (url: string): string =>
    assets[`../posts/${url.replace(/^\.\//, '')}`] ?? url;

export const formatDate = (date: string): string => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};
