import { Link, Navigate, useParams } from 'react-router-dom'
import Markdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { common } from 'lowlight'
import haskell from 'highlight.js/lib/languages/haskell'
import x86asm from 'highlight.js/lib/languages/x86asm'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'
import { formatDate, getPost, resolveAsset } from '../lib/posts'
import './Articles.css'

// rehype-highlight only ships the common grammars; add the extra ones the posts use.
const highlightOptions = {
  languages: { ...common, haskell, x86asm },
  aliases: { x86asm: ['asm'] },
};

export const Article = () => {
  const { slug } = useParams();
  const post = slug ? getPost(slug) : undefined;

  if (!post) return <Navigate to='/articles' replace />;

  return (
    <article className="container">
      <Link to='/articles' className="post-back">← All articles</Link>
      <h1>{post.title}</h1>
      <div className="post-meta">
        {post.date && !post.dateInBody && <time dateTime={post.date}>{formatDate(post.date)}</time>}
        {post.tags?.map((tag) => <span key={tag} className="post-tag">#{tag}</span>)}
      </div>
      <div className="post-body">
        <Markdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex, [rehypeHighlight, highlightOptions]]}
          urlTransform={(url) => defaultUrlTransform(resolveAsset(post.slug, url))}
        >
          {post.content}
        </Markdown>
      </div>
    </article>
  );
}
